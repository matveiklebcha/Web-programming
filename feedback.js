import { createFeedback, getAllProducts, getFeedback, getOrders } from './api.js';
import { getCurrentUser, isAdmin, syncSessionNavigation } from './session.js';
import { showNotice } from './ui.js';
import { clearFieldError, getNativeValidationMessage, setFieldError } from './validation.js';
import { initializePageInteractions } from './interactions.js';

const feedbackAccess = document.querySelector('#feedbackAccess');
const feedbackAccessTitle = document.querySelector('#feedbackAccessTitle');
const feedbackAccessText = document.querySelector('#feedbackAccessText');
const feedbackAccessLink = document.querySelector('#feedbackAccessLink');
const feedbackWorkspace = document.querySelector('#feedbackWorkspace');
const feedbackForm = document.querySelector('#feedbackForm');
const feedbackProduct = document.querySelector('#feedbackProduct');
const feedbackRating = document.querySelector('#feedbackRating');
const feedbackText = document.querySelector('#feedbackText');
const feedbackCounter = document.querySelector('#feedbackCounter');
const feedbackSubmit = document.querySelector('#feedbackSubmit');
const feedbackError = document.querySelector('#feedbackError');
const feedbackList = document.querySelector('#feedbackList');
const feedbackEmpty = document.querySelector('#feedbackEmpty');
const notice = document.querySelector('#notice');

const currentUser = syncSessionNavigation();
let purchasedProductIds = new Set();
let productsById = new Map();

const setFormError = (message = '') => {
  feedbackError.textContent = message;
  feedbackError.hidden = !message;
};

const createFeedbackCard = (item) => {
  const article = document.createElement('article');
  const product = productsById.get(item.productId);
  const date = new Date(item.createdAt).toLocaleDateString('ru-RU');

  article.className = 'feedback-card';
  article.innerHTML = `
    <div class="feedback-card__header">
      <h3 class="feedback-card__title"></h3>
      <span class="feedback-card__rating" aria-label="Оценка ${item.rating} из 5">★ ${item.rating}</span>
    </div>
    <p class="feedback-card__text"></p>
    <time class="feedback-card__date" datetime="${item.createdAt}">${date}</time>
  `;
  article.querySelector('.feedback-card__title').textContent = product?.name || 'Товар удалён';
  article.querySelector('.feedback-card__text').textContent = item.text;

  return article;
};

const renderOwnFeedback = async () => {
  const params = new URLSearchParams({ userId: currentUser.id, _sort: 'createdAt', _order: 'desc' });
  const items = await getFeedback(`?${params.toString()}`);

  feedbackList.replaceChildren(...items.map(createFeedbackCard));
  feedbackEmpty.hidden = items.length > 0;
};

const syncSubmitButton = () => {
  const selectedProductId = Number(feedbackProduct.value);
  const canReviewProduct = purchasedProductIds.has(selectedProductId);
  feedbackSubmit.disabled = !(feedbackForm.checkValidity() && canReviewProduct);
};

const validateField = (input) => {
  clearFieldError(input);
  const message = getNativeValidationMessage(input);
  setFieldError(input, message);
  return !message;
};

const validateFeedbackText = () => {
  clearFieldError(feedbackText);
  let message = getNativeValidationMessage(feedbackText);

  if (!message && feedbackText.value.trim().length < 30) {
    message = 'Напишите не менее 30 содержательных символов.';
  }

  setFieldError(feedbackText, message);
  return !message;
};

const initializeFeedback = async () => {
  if (!currentUser) {
    feedbackAccess.hidden = false;
    feedbackAccessTitle.textContent = 'Войдите, чтобы оставить отзыв';
    feedbackAccessText.textContent = 'После покупки товара он появится в списке доступных для отзыва.';
    return;
  }

  if (isAdmin(currentUser)) {
    feedbackAccess.hidden = false;
    feedbackAccessTitle.textContent = 'Отзывы доступны покупателям';
    feedbackAccessText.textContent = 'Администратор может просматривать и модерировать отзывы в админ-панели.';
    feedbackAccessLink.href = 'admin.html';
    feedbackAccessLink.textContent = 'Перейти в админ-панель';
    return;
  }

  try {
    const orderParams = new URLSearchParams({ userId: currentUser.id });
    const [orders, products] = await Promise.all([
      getOrders(`?${orderParams.toString()}`),
      getAllProducts(),
    ]);

    purchasedProductIds = new Set(
      orders.flatMap((order) => order.items.map((item) => Number(item.productId))),
    );
    productsById = new Map(products.map((product) => [product.id, product]));

    products
      .filter((product) => purchasedProductIds.has(product.id))
      .forEach((product) => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        feedbackProduct.append(option);
      });

    feedbackWorkspace.hidden = false;

    if (purchasedProductIds.size === 0) {
      feedbackProduct.disabled = true;
      feedbackText.disabled = true;
      feedbackRating.disabled = true;
      setFormError('После оформления заказа здесь появятся товары, о которых можно рассказать.');
    }

    await renderOwnFeedback();
  } catch (error) {
    feedbackAccess.hidden = false;
    feedbackAccessTitle.textContent = 'Отзывы временно недоступны';
    feedbackAccessText.textContent = 'Попробуйте обновить страницу немного позже.';
    feedbackAccessLink.href = 'catalog.html';
    feedbackAccessLink.textContent = 'Перейти в каталог';
  }
};

feedbackForm.addEventListener('input', (event) => {
  if (event.target.matches('select, textarea')) {
    clearFieldError(event.target);
    setFormError();
  }

  feedbackCounter.textContent = `${feedbackText.value.length} / 500`;
  syncSubmitButton();
});

feedbackForm.addEventListener('change', syncSubmitButton);

feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setFormError();

  const formValid = [
    validateField(feedbackProduct),
    validateField(feedbackRating),
    validateFeedbackText(),
  ].every(Boolean);
  const productId = Number(feedbackProduct.value);

  if (!purchasedProductIds.has(productId)) {
    setFieldError(feedbackProduct, 'Выберите товар из истории покупок.');
    return;
  }

  if (!formValid || isAdmin(currentUser)) {
    return;
  }

  feedbackSubmit.disabled = true;

  try {
    await createFeedback({
      userId: currentUser.id,
      productId,
      rating: Number(feedbackRating.value),
      text: feedbackText.value.trim(),
      createdAt: new Date().toISOString(),
    });
    feedbackForm.reset();
    feedbackCounter.textContent = '0 / 500';
    showNotice(notice, 'Отзыв опубликован');
    await renderOwnFeedback();
  } catch (error) {
    setFormError('Не удалось опубликовать отзыв. Попробуйте ещё раз.');
  } finally {
    syncSubmitButton();
  }
});

initializePageInteractions();
initializeFeedback();
