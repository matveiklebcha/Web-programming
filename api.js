const API_URL = 'http://localhost:3000';

const buildUrl = (path) => `${API_URL}${path}`;

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
};

export const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return {
    data: await parseResponse(response),
    total: Number(response.headers.get('X-Total-Count') || 0),
  };
};

const createProductSnapshot = (product) => ({
  productId: product.productId || product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  category: product.category,
  rating: product.rating,
  description: product.description,
  roast: product.roast,
  origin: product.origin,
  intensity: product.intensity,
  weight: product.weight,
  imageFilter: product.imageFilter,
});

export const getProducts = (query = '') => request(`/products${query}`);

export const getAllProducts = async () => {
  const { data } = await request('/products');

  return data;
};

export const getProduct = async (productId) => {
  const { data } = await request(`/products/${productId}`);

  return data;
};

export const createProduct = (product) =>
  request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });

export const replaceProduct = (productId, product) =>
  request(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });

export const deleteProduct = (productId) =>
  request(`/products/${productId}`, {
    method: 'DELETE',
  });

export const getFavorites = async () => {
  const { data } = await request('/favorites');

  return data;
};

export const getFavoriteByProductId = async (productId) => {
  const { data } = await request(`/favorites?productId=${productId}`);

  return data[0] || null;
};

export const addProductToFavorites = async (product) => {
  const existingFavorite = await getFavoriteByProductId(product.id);

  if (existingFavorite) {
    return { data: existingFavorite, created: false };
  }

  const { data } = await request('/favorites', {
    method: 'POST',
    body: JSON.stringify(createProductSnapshot(product)),
  });

  return { data, created: true };
};

export const removeFavorite = (favoriteId) =>
  request(`/favorites/${favoriteId}`, {
    method: 'DELETE',
  });

export const getCart = async () => {
  const { data } = await request('/cart');

  return data;
};

export const getCartItemByProductId = async (productId) => {
  const { data } = await request(`/cart?productId=${productId}`);

  return data[0] || null;
};

export const addProductToCart = async (product) => {
  const productId = product.productId || product.id;
  const existingCartItem = await getCartItemByProductId(productId);

  if (existingCartItem) {
    const { data } = await request(`/cart/${existingCartItem.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity: existingCartItem.quantity + 1,
      }),
    });

    return { data, created: false };
  }

  const { data } = await request('/cart', {
    method: 'POST',
    body: JSON.stringify({
      ...createProductSnapshot(product),
      quantity: 1,
    }),
  });

  return { data, created: true };
};

export const updateCartItemQuantity = (cartItem, nextQuantity) => {
  if (nextQuantity <= 0) {
    return request(`/cart/${cartItem.id}`, {
      method: 'DELETE',
    });
  }

  return request(`/cart/${cartItem.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      quantity: nextQuantity,
    }),
  });
};

export const removeCartItem = (cartItemId) =>
  request(`/cart/${cartItemId}`, {
    method: 'DELETE',
  });

export const clearCart = async () => {
  const cartItems = await getCart();

  for (const item of cartItems) {
    await request(`/cart/${item.id}`, {
      method: 'DELETE',
    });
  }
};

export const getUsers = async (query = '') => {
  const { data } = await request(`/users${query}`);

  return data;
};

export const getUser = async (userId) => {
  const { data } = await request(`/users/${userId}`);

  return data;
};

export const createUser = (user) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });

export const getOrders = async (query = '') => {
  const { data } = await request(`/orders${query}`);

  return data;
};

export const createOrder = (order) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });

export const getFeedback = async (query = '') => {
  const { data } = await request(`/feedback${query}`);

  return data;
};

export const createFeedback = (feedback) =>
  request('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });

export const deleteFeedback = (feedbackId) =>
  request(`/feedback/${feedbackId}`, {
    method: 'DELETE',
  });
