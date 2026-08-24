import { getLanguage, t } from './translations.js';

export const categoryLabels = {
  Classic: 'Классика',
  Fruity: 'Фруктовый',
  Sweet: 'Сладкий',
  Strong: 'Крепкий',
};

export const roastLabels = {
  Light: 'Light',
  Medium: 'Medium',
  Dark: 'Dark',
};

export const getCategoryLabel = (category) => t(`category.${category}`);

export const getRoastLabel = (roast) => t(`roast.${roast}`);

export const formatPrice = (price) => `${Number(price).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'ru-RU')} VND`;

export const formatProductsCount = (count) => {
  if (getLanguage() === 'en') {
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} позиция`;
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} позиции`;
  }

  return `${count} позиций`;
};

export const setActiveButton = (buttons, activeValue, dataKey) => {
  buttons.forEach((button) => {
    const isActive = button.dataset[dataKey] === activeValue;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

export const showNotice = (noticeElement, message) => {
  noticeElement.textContent = message;
  noticeElement.hidden = false;

  window.clearTimeout(showNotice.timerId);
  showNotice.timerId = window.setTimeout(() => {
    noticeElement.hidden = true;
  }, 2600);
};

export const createProductCard = (product, options = {}) => {
  const {
    showFavorite = false,
    showCart = false,
    showRemoveFavorite = false,
  } = options;
  const card = document.createElement('article');
  const productId = product.productId || product.id;
  const actions = [];

  actions.push(
    `<button class="btn btn--secondary product-card__button" type="button" data-product-detail-id="${productId}">${t('common.details')}</button>`,
  );

  if (showFavorite) {
    actions.push(
      `<button class="btn btn--secondary product-card__button" type="button" data-favorite-id="${productId}">${t('common.addFavorite')}</button>`,
    );
  }

  if (showCart) {
    actions.push(
      `<button class="btn btn--primary product-card__button" type="button" data-cart-id="${productId}">${t('common.addCart')}</button>`,
    );
  }

  if (showRemoveFavorite) {
    actions.push(
      `<button class="btn btn--secondary product-card__button" type="button" data-remove-favorite-id="${product.id}">${t('common.remove')}</button>`,
    );
  }

  card.className = 'product-card';
  card.dataset.productId = productId;
  card.style.setProperty('--product-filter', product.imageFilter);
  card.innerHTML = `
    <div class="product-card__image-wrap">
      <img class="product-card__image" src="${product.image}" alt="${product.name}" />
    </div>
    <div class="product-card__body">
      <div class="product-card__top">
        <span class="product-card__category">${getCategoryLabel(product.category)}</span>
        <span class="product-card__rating">★ ${Number(product.rating).toFixed(1)}</span>
      </div>
      <h2 class="product-card__title">${product.name}</h2>
      <p class="product-card__description">${getLanguage() === 'en' ? product.descriptionEn || product.description : product.description}</p>
      <div class="product-card__meta">
        <span>${getRoastLabel(product.roast)}</span>
        <span>${product.origin}</span>
        <span>${product.intensity}/5</span>
        <span>${product.weight}</span>
      </div>
      <div class="product-card__footer">
        <div class="product-card__price">
          <span>${formatPrice(product.price)}</span>
        </div>
        <div class="product-card__actions">
          ${actions.join('')}
        </div>
      </div>
    </div>
  `;

  return card;
};

export const createCartItem = (item) => {
  const row = document.createElement('article');

  row.className = 'cart-item';
  row.style.setProperty('--product-filter', item.imageFilter);
  row.innerHTML = `
    <img class="cart-item__image" src="${item.image}" alt="${item.name}" />
    <div class="cart-item__content">
      <p class="cart-item__category">${getCategoryLabel(item.category)}</p>
      <h2 class="cart-item__title">${item.name}</h2>
      <p class="cart-item__price">${formatPrice(item.price)}</p>
    </div>
    <div class="cart-item__quantity" aria-label="${t('product.quantity')}">
      <button class="cart-item__quantity-button" type="button" data-cart-decrease="${item.id}" aria-label="${t('product.decrease')}">−</button>
      <span>${item.quantity}</span>
      <button class="cart-item__quantity-button" type="button" data-cart-increase="${item.id}" aria-label="${t('product.increase')}">+</button>
    </div>
    <p class="cart-item__sum">${formatPrice(item.price * item.quantity)}</p>
    <button class="cart-item__remove" type="button" data-cart-remove="${item.id}">${t('common.remove')}</button>
  `;

  return row;
};
