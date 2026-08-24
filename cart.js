import {
  clearCart,
  createOrder,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from './api.js';
import {
  createCartItem,
  formatPrice,
  formatProductsCount,
  showNotice,
} from './ui.js';
import { getCurrentUser, syncSessionNavigation } from './session.js';
import { initializePageInteractions, refreshShopCounters } from './interactions.js';
import { t } from './translations.js';

const cartList = document.querySelector('#cartList');
const cartEmpty = document.querySelector('#cartEmpty');
const cartStatus = document.querySelector('#cartStatus');
const cartError = document.querySelector('#cartError');
const cartLoader = document.querySelector('#cartLoader');
const cartSummary = document.querySelector('#cartSummary');
const cartTotal = document.querySelector('#cartTotal');
const checkoutButton = document.querySelector('#checkoutButton');
const notice = document.querySelector('#notice');

let cartItems = [];

const setLoading = (isLoading) => {
  cartLoader.hidden = !isLoading;
  cartList.setAttribute('aria-busy', String(isLoading));
};

const setError = (message = '') => {
  cartError.hidden = !message;
  cartError.textContent = message;
};

const getTotalPrice = () =>
  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

const renderCart = async () => {
  setLoading(true);
  setError();

  try {
    const currentUser = getCurrentUser();
    cartItems = await getCart(currentUser?.id);

    cartList.replaceChildren(...cartItems.map(createCartItem));

    const isEmpty = cartItems.length === 0;

    cartEmpty.hidden = !isEmpty;
    cartSummary.hidden = isEmpty;
    cartStatus.textContent = currentUser
      ? t('cart.count', { count: formatProductsCount(cartItems.length) })
      : t('common.loginRequired');
    cartTotal.textContent = formatPrice(getTotalPrice());
  } catch (error) {
    cartItems = [];
    cartList.replaceChildren();
    cartEmpty.hidden = true;
    cartSummary.hidden = true;
    cartStatus.textContent = '';
    setError(t('cart.error'));
  } finally {
    setLoading(false);
  }
};

cartList.addEventListener('click', async (event) => {
  const increaseButton = event.target.closest('[data-cart-increase]');
  const decreaseButton = event.target.closest('[data-cart-decrease]');
  const removeButton = event.target.closest('[data-cart-remove]');
  const targetButton = increaseButton || decreaseButton || removeButton;

  if (!targetButton) {
    return;
  }

  const cartItemId = Number(
    targetButton.dataset.cartIncrease ||
      targetButton.dataset.cartDecrease ||
      targetButton.dataset.cartRemove,
  );
  const cartItem = cartItems.find((item) => item.id === cartItemId);

  if (!cartItem) {
    return;
  }

  try {
    if (increaseButton) {
      await updateCartItemQuantity(cartItem, cartItem.quantity + 1);
    }

    if (decreaseButton) {
      await updateCartItemQuantity(cartItem, cartItem.quantity - 1);
    }

    if (removeButton) {
      await removeCartItem(cartItem.id);
    }

    await renderCart();
    await refreshShopCounters();
  } catch (error) {
    showNotice(notice, t('cart.changeError'));
  }
});

checkoutButton.addEventListener('click', async () => {
  if (cartItems.length === 0) {
    return;
  }

  const currentUser = getCurrentUser();

  if (!currentUser) {
    showNotice(notice, t('common.loginRequired'));
    window.setTimeout(() => {
      window.location.href = 'auth.html';
    }, 900);
    return;
  }

  checkoutButton.disabled = true;

  try {
    await createOrder({
      userId: currentUser.id,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: getTotalPrice(),
      status: 'created',
      createdAt: new Date().toISOString(),
    });
    await clearCart(currentUser.id);
    showNotice(notice, t('cart.success'));
    await renderCart();
    await refreshShopCounters();
  } catch (error) {
    showNotice(notice, t('common.actionError'));
  } finally {
    checkoutButton.disabled = false;
  }
});

syncSessionNavigation();
initializePageInteractions();
renderCart();
