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

const createProductSnapshot = (product, userId) => ({
  userId,
  productId: product.productId || product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  category: product.category,
  rating: product.rating,
  description: product.description,
  descriptionEn: product.descriptionEn,
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

export const getFavorites = async (userId) => {
  if (!userId) {
    return [];
  }

  const { data } = await request(`/favorites?userId=${encodeURIComponent(userId)}`);

  return data;
};

export const getFavoriteByProductId = async (userId, productId) => {
  const { data } = await request(`/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`);

  return data[0] || null;
};

export const addProductToFavorites = async (product, userId) => {
  const existingFavorite = await getFavoriteByProductId(userId, product.id);

  if (existingFavorite) {
    return { data: existingFavorite, created: false };
  }

  const { data } = await request('/favorites', {
    method: 'POST',
    body: JSON.stringify(createProductSnapshot(product, userId)),
  });

  return { data, created: true };
};

export const removeFavorite = (favoriteId) =>
  request(`/favorites/${favoriteId}`, {
    method: 'DELETE',
  });

export const getCart = async (userId) => {
  if (!userId) {
    return [];
  }

  const { data } = await request(`/cart?userId=${encodeURIComponent(userId)}`);

  return data;
};

export const getCartItemByProductId = async (userId, productId) => {
  const { data } = await request(`/cart?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`);

  return data[0] || null;
};

export const addProductToCart = async (product, userId) => {
  const productId = product.productId || product.id;
  const existingCartItem = await getCartItemByProductId(userId, productId);

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
      ...createProductSnapshot(product, userId),
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

export const clearCart = async (userId) => {
  const cartItems = await getCart(userId);

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

export const updateUser = (userId, values) =>
  request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
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
