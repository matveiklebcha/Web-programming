import {
  createProduct,
  deleteFeedback,
  deleteProduct,
  getAllProducts,
  getFeedback,
  getUsers,
  replaceProduct,
} from './api.js';
import { isAdmin, syncSessionNavigation } from './session.js';
import { showNotice } from './ui.js';
import { clearFieldError, getNativeValidationMessage, setFieldError } from './validation.js';
import { initializePageInteractions } from './interactions.js';

const adminAccess = document.querySelector('#adminAccess');
const adminWorkspace = document.querySelector('#adminWorkspace');
const productForm = document.querySelector('#productForm');
const adminProductSelect = document.querySelector('#adminProductSelect');
const productSubmit = document.querySelector('#productSubmit');
const productDelete = document.querySelector('#productDelete');
const openCreateProduct = document.querySelector('#openCreateProduct');
const openEditProduct = document.querySelector('#openEditProduct');
const openDeleteProduct = document.querySelector('#openDeleteProduct');
const productEditorDialog = document.querySelector('#productEditorDialog');
const productDeleteDialog = document.querySelector('#productDeleteDialog');
const productEditorTitle = document.querySelector('#productEditorTitle');
const productDeleteText = document.querySelector('#productDeleteText');
const productFormError = document.querySelector('#productFormError');
const adminFeedbackProduct = document.querySelector('#adminFeedbackProduct');
const adminFeedbackUser = document.querySelector('#adminFeedbackUser');
const adminFeedbackList = document.querySelector('#adminFeedbackList');
const adminFeedbackEmpty = document.querySelector('#adminFeedbackEmpty');
const adminFeedbackError = document.querySelector('#adminFeedbackError');
const notice = document.querySelector('#notice');

const fields = {
  name: document.querySelector('#productName'),
  price: document.querySelector('#productPrice'),
  image: document.querySelector('#productImage'),
  category: document.querySelector('#productCategory'),
  rating: document.querySelector('#productRating'),
  description: document.querySelector('#productDescription'),
  roast: document.querySelector('#productRoast'),
  origin: document.querySelector('#productOrigin'),
  intensity: document.querySelector('#productIntensity'),
  weight: document.querySelector('#productWeight'),
  imageFilter: document.querySelector('#productImageFilter'),
};

const currentUser = syncSessionNavigation();
let products = [];
let users = [];
let productsById = new Map();
let usersById = new Map();

const setMessage = (element, message = '') => {
  element.textContent = message;
  element.hidden = !message;
};

const validateField = (input) => {
  clearFieldError(input);
  const message = getNativeValidationMessage(input);
  setFieldError(input, message);
  return !message;
};

const syncProductSubmit = () => {
  productSubmit.disabled = !productForm.checkValidity();
};

const getProductPayload = () => ({
  name: fields.name.value.trim(),
  price: Number(fields.price.value),
  image: fields.image.value.trim(),
  category: fields.category.value,
  rating: Number(fields.rating.value),
  description: fields.description.value.trim(),
  roast: fields.roast.value,
  origin: fields.origin.value.trim(),
  intensity: Number(fields.intensity.value),
  weight: fields.weight.value.trim(),
  imageFilter: fields.imageFilter.value.trim() || 'none',
});

const fillProductForm = (product) => {
  Object.entries(fields).forEach(([field, input]) => {
    input.value = product?.[field] ?? '';
    clearFieldError(input);
  });

  const isNew = !product;
  productEditorTitle.textContent = isNew ? 'Новый товар' : 'Редактирование товара';
  productSubmit.textContent = isNew ? 'Добавить товар' : 'Сохранить изменения';
  setMessage(productFormError);
  syncProductSubmit();
};

const getSelectedProduct = () => productsById.get(Number(adminProductSelect.value));

const syncProductActions = () => {
  const hasSelectedProduct = Boolean(getSelectedProduct());
  openEditProduct.disabled = !hasSelectedProduct;
  openDeleteProduct.disabled = !hasSelectedProduct;
};

const openEditor = (product = null) => {
  fillProductForm(product);
  productEditorDialog.showModal();
  window.setTimeout(() => fields.name.focus(), 0);
};

const closeDialogOnBackdrop = (dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
};

const fillSelect = (select, items, getLabel) => {
  const firstOption = select.options[0];
  select.replaceChildren(firstOption);

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = getLabel(item);
    select.append(option);
  });
};

const loadReferenceData = async () => {
  [products, users] = await Promise.all([getAllProducts(), getUsers()]);
  productsById = new Map(products.map((product) => [product.id, product]));
  usersById = new Map(users.map((user) => [user.id, user]));

  fillSelect(adminProductSelect, products, (product) => product.name);
  fillSelect(adminFeedbackProduct, products, (product) => product.name);
  fillSelect(adminFeedbackUser, users, (user) => `${user.nickname} — ${user.email}`);
  syncProductActions();
};

const createAdminFeedbackCard = (item) => {
  const article = document.createElement('article');
  const product = productsById.get(item.productId);
  const user = usersById.get(item.userId);
  const date = new Date(item.createdAt).toLocaleDateString('ru-RU');

  article.className = 'feedback-card feedback-card--admin';
  article.innerHTML = `
    <div class="feedback-card__header">
      <div><h3 class="feedback-card__title"></h3><p class="feedback-card__author"></p></div>
      <span class="feedback-card__rating" aria-label="Оценка ${item.rating} из 5">★ ${item.rating}</span>
    </div>
    <p class="feedback-card__text"></p>
    <div class="feedback-card__footer">
      <time class="feedback-card__date" datetime="${item.createdAt}">${date}</time>
      <button class="btn btn--danger btn--compact" type="button" data-delete-feedback="${item.id}">Удалить</button>
    </div>
  `;
  article.querySelector('.feedback-card__title').textContent = product?.name || 'Товар удалён';
  article.querySelector('.feedback-card__author').textContent = user
    ? `${user.nickname} · ${user.email}`
    : 'Пользователь удалён';
  article.querySelector('.feedback-card__text').textContent = item.text;

  return article;
};

const renderAdminFeedback = async () => {
  setMessage(adminFeedbackError);
  const params = new URLSearchParams({ _sort: 'createdAt', _order: 'desc' });

  if (adminFeedbackProduct.value) {
    params.set('productId', adminFeedbackProduct.value);
  }
  if (adminFeedbackUser.value) {
    params.set('userId', adminFeedbackUser.value);
  }

  try {
    const feedback = await getFeedback(`?${params.toString()}`);
    adminFeedbackList.replaceChildren(...feedback.map(createAdminFeedbackCard));
    adminFeedbackEmpty.hidden = feedback.length > 0;
  } catch (error) {
    setMessage(adminFeedbackError, 'Не удалось загрузить отзывы. Попробуйте ещё раз.');
  }
};

const initializeAdmin = async () => {
  if (!isAdmin(currentUser)) {
    adminAccess.hidden = false;
    return;
  }

  adminWorkspace.hidden = false;

  try {
    await loadReferenceData();
    await renderAdminFeedback();
  } catch (error) {
    showNotice(notice, 'Не удалось загрузить данные магазина. Обновите страницу.');
  }
};

productForm.addEventListener('input', (event) => {
  if (event.target.matches('input, select, textarea')) {
    clearFieldError(event.target);
    setMessage(productFormError);
    syncProductSubmit();
  }
});

productForm.addEventListener('change', syncProductSubmit);

adminProductSelect.addEventListener('change', syncProductActions);

openCreateProduct.addEventListener('click', () => {
  adminProductSelect.value = 'new';
  syncProductActions();
  openEditor();
});

openEditProduct.addEventListener('click', () => {
  const product = getSelectedProduct();

  if (product) {
    openEditor(product);
  }
});

openDeleteProduct.addEventListener('click', () => {
  const product = getSelectedProduct();

  if (product) {
    productDeleteText.textContent = `«${product.name}» будет удалён из каталога.`;
    productDeleteDialog.showModal();
  }
});

document.querySelectorAll('[data-product-editor-close]').forEach((button) => {
  button.addEventListener('click', () => productEditorDialog.close());
});
document.querySelector('[data-product-delete-close]').addEventListener('click', () => productDeleteDialog.close());
closeDialogOnBackdrop(productEditorDialog);
closeDialogOnBackdrop(productDeleteDialog);

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(productFormError);

  if (!Object.values(fields).map(validateField).every(Boolean)) {
    syncProductSubmit();
    return;
  }

  productSubmit.disabled = true;
  const selectedId = Number(adminProductSelect.value);

  try {
    if (selectedId) {
      await replaceProduct(selectedId, { id: selectedId, ...getProductPayload() });
      showNotice(notice, 'Изменения сохранены');
    } else {
      await createProduct(getProductPayload());
      showNotice(notice, 'Товар добавлен в каталог');
    }

    await loadReferenceData();
    adminProductSelect.value = 'new';
    syncProductActions();
    productEditorDialog.close();
    await renderAdminFeedback();
  } catch (error) {
    setMessage(productFormError, 'Не удалось сохранить товар. Попробуйте ещё раз.');
  } finally {
    syncProductSubmit();
  }
});

productDelete.addEventListener('click', async () => {
  const productId = Number(adminProductSelect.value);
  const product = productsById.get(productId);

  if (!product) {
    return;
  }

  productDelete.disabled = true;

  try {
    await deleteProduct(productId);
    showNotice(notice, 'Товар удалён');
    await loadReferenceData();
    adminProductSelect.value = 'new';
    syncProductActions();
    productDeleteDialog.close();
    await renderAdminFeedback();
  } catch (error) {
    setMessage(productFormError, 'Не удалось удалить товар. Попробуйте ещё раз.');
  } finally {
    productDelete.disabled = false;
  }
});

[adminFeedbackProduct, adminFeedbackUser].forEach((select) => {
  select.addEventListener('change', renderAdminFeedback);
});

adminFeedbackList.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-feedback]');

  if (!deleteButton) {
    return;
  }

  deleteButton.disabled = true;

  try {
    await deleteFeedback(deleteButton.dataset.deleteFeedback);
    showNotice(notice, 'Отзыв удалён');
    await renderAdminFeedback();
  } catch (error) {
    setMessage(adminFeedbackError, 'Не удалось удалить отзыв. Попробуйте ещё раз.');
    deleteButton.disabled = false;
  }
});

initializePageInteractions();
initializeAdmin();
