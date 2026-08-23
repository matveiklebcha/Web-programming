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
    cartItems = await getCart();

    cartList.replaceChildren(...cartItems.map(createCartItem));

    const isEmpty = cartItems.length === 0;

    cartEmpty.hidden = !isEmpty;
    cartSummary.hidden = isEmpty;
    cartStatus.textContent = `В корзине: ${formatProductsCount(cartItems.length)}`;
    cartTotal.textContent = formatPrice(getTotalPrice());
  } catch (error) {
    cartItems = [];
    cartList.replaceChildren();
    cartEmpty.hidden = true;
    cartSummary.hidden = true;
    cartStatus.textContent = '';
    setError('Корзина временно недоступна. Попробуйте обновить страницу.');
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
    showNotice(notice, 'Не удалось изменить корзину. Попробуйте еще раз.');
  }
});

checkoutButton.addEventListener('click', async () => {
  if (cartItems.length === 0) {
    return;
  }

  const currentUser = getCurrentUser();

  if (!currentUser) {
    showNotice(notice, 'Войдите в профиль, чтобы оформить заказ');
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
    await clearCart();
    showNotice(notice, 'Покупка успешно оформлена');
    await renderCart();
    await refreshShopCounters();
  } catch (error) {
    showNotice(notice, 'Не удалось оформить покупку. Попробуйте еще раз.');
  } finally {
    checkoutButton.disabled = false;
  }
});

syncSessionNavigation();
initializePageInteractions();
renderCart();
