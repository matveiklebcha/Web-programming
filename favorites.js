import {
  addProductToCart,
  getFavorites,
  getProduct,
  removeFavorite,
} from './api.js';
import {
  createProductCard,
  formatProductsCount,
  showNotice,
} from './ui.js';

const favoritesGrid = document.querySelector('#favoritesGrid');
const favoritesEmpty = document.querySelector('#favoritesEmpty');
const favoritesStatus = document.querySelector('#favoritesStatus');
const favoritesError = document.querySelector('#favoritesError');
const favoritesLoader = document.querySelector('#favoritesLoader');
const notice = document.querySelector('#notice');

const setLoading = (isLoading) => {
  favoritesLoader.hidden = !isLoading;
  favoritesGrid.setAttribute('aria-busy', String(isLoading));
};

const setError = (message = '') => {
  favoritesError.hidden = !message;
  favoritesError.textContent = message;
};

const renderFavorites = async () => {
  setLoading(true);
  setError();

  try {
    const favorites = await getFavorites();

    favoritesGrid.replaceChildren(
      ...favorites.map((favorite) =>
        createProductCard(favorite, {
          showCart: true,
          showRemoveFavorite: true,
        }),
      ),
    );

    favoritesEmpty.hidden = favorites.length > 0;
    favoritesStatus.textContent = `В избранном: ${formatProductsCount(favorites.length)}`;
  } catch (error) {
    favoritesGrid.replaceChildren();
    favoritesEmpty.hidden = true;
    favoritesStatus.textContent = '';
    setError('Не удалось загрузить избранное. Проверьте, что JSON Server запущен.');
  } finally {
    setLoading(false);
  }
};

favoritesGrid.addEventListener('click', async (event) => {
  const removeButton = event.target.closest('[data-remove-favorite-id]');
  const cartButton = event.target.closest('[data-cart-id]');

  if (!removeButton && !cartButton) {
    return;
  }

  try {
    if (removeButton) {
      await removeFavorite(removeButton.dataset.removeFavoriteId);
      showNotice(notice, 'Товар удален из избранного');
      await renderFavorites();
    }

    if (cartButton) {
      const product = await getProduct(cartButton.dataset.cartId);
      const result = await addProductToCart(product);

      showNotice(notice, result.created ? 'Товар добавлен в корзину' : 'Количество в корзине увеличено');
    }
  } catch (error) {
    showNotice(notice, 'Не удалось выполнить действие. Проверьте JSON Server.');
  }
});

renderFavorites();
