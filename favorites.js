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
import { getCurrentUser, syncSessionNavigation } from './session.js';
import { initializePageInteractions, refreshShopCounters } from './interactions.js';
import { t } from './translations.js';

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
    const currentUser = getCurrentUser();
    const favorites = await getFavorites(currentUser?.id);

    favoritesGrid.replaceChildren(
      ...favorites.map((favorite) =>
        createProductCard(favorite, {
          showCart: true,
          showRemoveFavorite: true,
        }),
      ),
    );

    favoritesEmpty.hidden = favorites.length > 0;
    favoritesStatus.textContent = currentUser
      ? t('favorites.count', { count: formatProductsCount(favorites.length) })
      : t('common.loginRequired');
  } catch (error) {
    favoritesGrid.replaceChildren();
    favoritesEmpty.hidden = true;
    favoritesStatus.textContent = '';
    setError(t('favorites.error'));
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

  const currentUser = getCurrentUser();

  if (!currentUser) {
    showNotice(notice, t('common.loginRequired'));
    return;
  }

  try {
    if (removeButton) {
      await removeFavorite(removeButton.dataset.removeFavoriteId);
      showNotice(notice, t('favorites.removed'));
      await renderFavorites();
      await refreshShopCounters();
    }

    if (cartButton) {
      const product = await getProduct(cartButton.dataset.cartId);
      const result = await addProductToCart(product, currentUser.id);

      showNotice(notice, t(result.created ? 'common.addedCart' : 'common.cartIncreased'));
      await refreshShopCounters();
    }
  } catch (error) {
    showNotice(notice, t('common.actionError'));
  }
});

syncSessionNavigation();
initializePageInteractions();
renderFavorites();
