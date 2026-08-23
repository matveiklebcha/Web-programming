import {
  addProductToCart,
  addProductToFavorites,
  getAllProducts,
  getProduct,
  getProducts,
} from './api.js';
import {
  categoryLabels,
  createProductCard,
  formatProductsCount,
  setActiveButton,
  showNotice,
} from './ui.js';
import { syncSessionNavigation } from './session.js';
import { initializePageInteractions, refreshShopCounters } from './interactions.js';

const state = {
  query: '',
  category: 'all',
  roast: '',
  origin: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  minIntensity: '',
  sort: 'default',
  page: 1,
  limit: 6,
};

const productsGrid = document.querySelector('#productsGrid');
const emptyState = document.querySelector('#emptyState');
const productsStatus = document.querySelector('#productsStatus');
const productsError = document.querySelector('#productsError');
const productsLoader = document.querySelector('#productsLoader');
const searchInput = document.querySelector('#searchInput');
const sortSelect = document.querySelector('#sortSelect');
const roastSelect = document.querySelector('#roastSelect');
const originSelect = document.querySelector('#originSelect');
const minPriceInput = document.querySelector('#minPriceInput');
const maxPriceInput = document.querySelector('#maxPriceInput');
const ratingSelect = document.querySelector('#ratingSelect');
const intensitySelect = document.querySelector('#intensitySelect');
const limitSelect = document.querySelector('#limitSelect');
const resetFilters = document.querySelector('#resetFilters');
const categoryFilters = document.querySelector('#categoryFilters');
const prevPageButton = document.querySelector('#prevPageButton');
const nextPageButton = document.querySelector('#nextPageButton');
const paginationInfo = document.querySelector('#paginationInfo');
const notice = document.querySelector('#notice');

let latestCatalogRequestId = 0;

const debounce = (callback, delay = 300) => {
  let timerId;

  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => callback(...args), delay);
  };
};

const setLoading = (isLoading) => {
  productsLoader.hidden = !isLoading;
  productsGrid.setAttribute('aria-busy', String(isLoading));
};

const setError = (message = '') => {
  productsError.hidden = !message;
  productsError.textContent = message;
};

const resetPage = () => {
  state.page = 1;
};

const getPriceRangeError = () => {
  if (state.minPrice === '' || state.maxPrice === '') {
    return '';
  }

  if (Number(state.minPrice) > Number(state.maxPrice)) {
    return 'Цена «от» не может быть больше цены «до».';
  }

  return '';
};

const syncCategoryButtons = () => {
  const categoryButtons = categoryFilters.querySelectorAll('[data-category]');

  setActiveButton(categoryButtons, state.category, 'category');
};

const buildProductsQuery = () => {
  const params = new URLSearchParams();

  if (state.query) {
    params.set('q', state.query);
  }

  if (state.category !== 'all') {
    params.set('category', state.category);
  }

  if (state.roast) {
    params.set('roast', state.roast);
  }

  if (state.origin) {
    params.set('origin', state.origin);
  }

  if (state.minPrice) {
    params.set('price_gte', state.minPrice);
  }

  if (state.maxPrice) {
    params.set('price_lte', state.maxPrice);
  }

  if (state.minRating) {
    params.set('rating_gte', state.minRating);
  }

  if (state.minIntensity) {
    params.set('intensity_gte', state.minIntensity);
  }

  switch (state.sort) {
    case 'price-asc':
      params.set('_sort', 'price');
      params.set('_order', 'asc');
      break;
    case 'price-desc':
      params.set('_sort', 'price');
      params.set('_order', 'desc');
      break;
    case 'name-asc':
      params.set('_sort', 'name');
      params.set('_order', 'asc');
      break;
    case 'rating-desc':
      params.set('_sort', 'rating');
      params.set('_order', 'desc');
      break;
    default:
      break;
  }

  params.set('_page', state.page);
  params.set('_limit', state.limit);

  return `?${params.toString()}`;
};

const renderPagination = (total) => {
  const totalPages = Math.max(1, Math.ceil(total / state.limit));

  paginationInfo.textContent = `Страница ${state.page} из ${totalPages}`;
  prevPageButton.disabled = state.page <= 1;
  nextPageButton.disabled = state.page >= totalPages;
};

const renderProducts = (products, total) => {
  productsGrid.replaceChildren(
    ...products.map((product) =>
      createProductCard(product, {
        showFavorite: true,
        showCart: true,
      }),
    ),
  );

  emptyState.hidden = products.length > 0;
  productsStatus.textContent = `Найдено: ${formatProductsCount(total)}`;
  renderPagination(total);
};

const renderCatalog = async () => {
  const requestId = ++latestCatalogRequestId;

  setLoading(true);
  setError();

  const priceRangeError = getPriceRangeError();

  if (priceRangeError) {
    productsGrid.replaceChildren();
    emptyState.hidden = true;
    productsStatus.textContent = '';
    paginationInfo.textContent = '';
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    setError(priceRangeError);
    setLoading(false);
    return;
  }

  try {
    const query = buildProductsQuery();
    const { data, total } = await getProducts(query);

    if (requestId !== latestCatalogRequestId) {
      return;
    }

    renderProducts(data, total);
  } catch (error) {
    if (requestId !== latestCatalogRequestId) {
      return;
    }

    productsGrid.replaceChildren();
    emptyState.hidden = true;
    productsStatus.textContent = '';
    paginationInfo.textContent = '';
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    setError('Каталог временно недоступен. Попробуйте обновить страницу.');
  } finally {
    if (requestId === latestCatalogRequestId) {
      setLoading(false);
    }
  }
};

const createCategoryButton = (category) => {
  const button = document.createElement('button');

  button.className = 'products__chip';
  button.type = 'button';
  button.dataset.category = category;
  button.textContent = category === 'all' ? 'Все' : categoryLabels[category] || category;
  button.setAttribute('aria-pressed', String(category === state.category));

  return button;
};

const renderFilterOptions = async () => {
  const products = await getAllProducts();
  const categories = new Set(products.map((product) => product.category));
  const origins = new Set(products.map((product) => product.origin));

  categoryFilters.replaceChildren(
    createCategoryButton('all'),
    ...[...categories].map(createCategoryButton),
  );
  syncCategoryButtons();

  origins.forEach((origin) => {
    const option = document.createElement('option');

    option.value = origin;
    option.textContent = origin;
    originSelect.append(option);
  });
};

const resetFiltersState = () => {
  state.query = '';
  state.category = 'all';
  state.roast = '';
  state.origin = '';
  state.minPrice = '';
  state.maxPrice = '';
  state.minRating = '';
  state.minIntensity = '';
  state.sort = 'default';
  state.page = 1;
  state.limit = Number(limitSelect.value);

  searchInput.value = '';
  sortSelect.value = state.sort;
  roastSelect.value = state.roast;
  originSelect.value = state.origin;
  minPriceInput.value = '';
  maxPriceInput.value = '';
  ratingSelect.value = '';
  intensitySelect.value = '';
  syncCategoryButtons();
};

searchInput.addEventListener(
  'input',
  debounce((event) => {
    state.query = event.target.value.trim();
    resetPage();
    renderCatalog();
  }),
);

sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  resetPage();
  renderCatalog();
});

roastSelect.addEventListener('change', (event) => {
  state.roast = event.target.value;
  resetPage();
  renderCatalog();
});

originSelect.addEventListener('change', (event) => {
  state.origin = event.target.value;
  resetPage();
  renderCatalog();
});

minPriceInput.addEventListener(
  'input',
  debounce((event) => {
    state.minPrice = event.target.value;
    resetPage();
    renderCatalog();
  }),
);

maxPriceInput.addEventListener(
  'input',
  debounce((event) => {
    state.maxPrice = event.target.value;
    resetPage();
    renderCatalog();
  }),
);

ratingSelect.addEventListener('change', (event) => {
  state.minRating = event.target.value;
  resetPage();
  renderCatalog();
});

intensitySelect.addEventListener('change', (event) => {
  state.minIntensity = event.target.value;
  resetPage();
  renderCatalog();
});

limitSelect.addEventListener('change', (event) => {
  state.limit = Number(event.target.value);
  resetPage();
  renderCatalog();
});

resetFilters.addEventListener('click', () => {
  resetFiltersState();
  renderCatalog();
});

categoryFilters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');

  if (!button) {
    return;
  }

  state.category = button.dataset.category;
  resetPage();
  syncCategoryButtons();
  renderCatalog();
});

prevPageButton.addEventListener('click', () => {
  state.page -= 1;
  renderCatalog();
});

nextPageButton.addEventListener('click', () => {
  state.page += 1;
  renderCatalog();
});

productsGrid.addEventListener('click', async (event) => {
  const favoriteButton = event.target.closest('[data-favorite-id]');
  const cartButton = event.target.closest('[data-cart-id]');

  if (!favoriteButton && !cartButton) {
    return;
  }

  try {
    if (favoriteButton) {
      const product = await getProduct(favoriteButton.dataset.favoriteId);
      const result = await addProductToFavorites(product);

      showNotice(notice, result.created ? 'Товар добавлен в избранное' : 'Товар уже есть в избранном');
      await refreshShopCounters();
    }

    if (cartButton) {
      const product = await getProduct(cartButton.dataset.cartId);
      const result = await addProductToCart(product);

      showNotice(notice, result.created ? 'Товар добавлен в корзину' : 'Количество в корзине увеличено');
      await refreshShopCounters();
    }
  } catch (error) {
    showNotice(notice, 'Не удалось добавить товар. Попробуйте еще раз.');
  }
});

syncSessionNavigation();
initializePageInteractions();

try {
  await renderFilterOptions();
  await renderCatalog();
} catch (error) {
  setError('Каталог временно недоступен. Попробуйте обновить страницу.');
  setLoading(false);
}
