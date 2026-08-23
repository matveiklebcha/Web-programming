import { getCart, getFavorites, getProduct } from './api.js';
import { categoryLabels, formatPrice, roastLabels } from './ui.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const closeMenu = (menu, button, overlay, root) => {
  menu.classList.remove('is-open');
  root.classList.remove('is-menu-open');
  overlay.classList.remove('is-visible');
  button.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

const initializeNavigation = () => {
  const hero = document.querySelector('.hero');
  const shopHeader = document.querySelector('.catalog-header');
  const root = hero || shopHeader;

  if (!root) {
    return;
  }

  const menu = hero
    ? root.querySelector('.hero__nav-list')
    : root.querySelector('.catalog-header__nav');
  let button = hero ? root.querySelector('.hero__burger') : null;

  if (!menu) {
    return;
  }

  if (!menu.id) {
    menu.id = hero ? 'mainNavigation' : 'shopNavigation';
  }

  if (!button) {
    button = document.createElement('button');
    button.className = 'catalog-header__menu-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Открыть меню');
    button.innerHTML = '<span></span><span></span><span></span>';
    root.querySelector('.catalog-header__container')?.insertBefore(button, menu);
  }

  button.type = 'button';
  button.setAttribute('aria-controls', menu.id);
  button.setAttribute('aria-expanded', 'false');

  const overlay = document.createElement('button');
  overlay.className = 'menu-overlay';
  overlay.type = 'button';
  overlay.setAttribute('aria-label', 'Закрыть меню');
  document.body.append(overlay);

  const toggleMenu = () => {
    const willOpen = !menu.classList.contains('is-open');

    if (willOpen) {
      menu.classList.add('is-open');
      root.classList.add('is-menu-open');
      overlay.classList.add('is-visible');
      button.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    } else {
      closeMenu(menu, button, overlay, root);
    }
  };

  button.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', () => closeMenu(menu, button, overlay, root));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMenu(menu, button, overlay, root);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu(menu, button, overlay, root);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMenu(menu, button, overlay, root);
    }
  });
};

const finishPreloader = () => {
  window.setTimeout(() => {
    document.body.classList.add('is-ready');
    document.body.classList.remove('is-loading');
  }, reducedMotion.matches ? 0 : 280);
};

const initializePreloader = () => {
  if (document.readyState === 'complete') {
    finishPreloader();
  } else {
    window.addEventListener('load', finishPreloader, { once: true });
    window.setTimeout(finishPreloader, 2200);
  }
};

const initializeScrollReveal = () => {
  const targets = document.querySelectorAll(
    '.section-header, .features__card, .catalog__product, .giftset__wrapper, .combo__card, .product-card, .admin-card, .feedback-card, .location__content, .media-gallery__stage',
  );

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  targets.forEach((target, index) => {
    target.classList.add('reveal-on-scroll');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
    observer.observe(target);
  });
};

const animateCounter = (element, nextValue) => {
  const startValue = Number(element.dataset.value || 0);
  const duration = reducedMotion.matches ? 0 : 420;
  const startedAt = performance.now();

  element.dataset.value = String(nextValue);

  const render = (now) => {
    const progress = duration ? Math.min((now - startedAt) / duration, 1) : 1;
    const easedProgress = 1 - (1 - progress) ** 3;
    element.textContent = String(Math.round(startValue + (nextValue - startValue) * easedProgress));

    if (progress < 1) {
      window.requestAnimationFrame(render);
    }
  };

  window.requestAnimationFrame(render);
};

const getCounter = (link, kind) => {
  let counter = link.querySelector(`[data-shop-counter="${kind}"]`);

  if (!counter) {
    counter = document.createElement('span');
    counter.className = 'nav-counter';
    counter.dataset.shopCounter = kind;
    counter.dataset.value = '0';
    counter.textContent = '0';
    counter.setAttribute('aria-label', kind === 'cart' ? 'Товаров в корзине' : 'Товаров в избранном');
    link.append(counter);
  }

  return counter;
};

export const refreshShopCounters = async () => {
  try {
    const [favorites, cart] = await Promise.all([getFavorites(), getCart()]);
    const counts = {
      favorites: favorites.length,
      cart: cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    };

    document.querySelectorAll('a[href$="favorites.html"]').forEach((link) => {
      animateCounter(getCounter(link, 'favorites'), counts.favorites);
    });
    document.querySelectorAll('a[href$="cart.html"]').forEach((link) => {
      animateCounter(getCounter(link, 'cart'), counts.cart);
    });
  } catch (error) {
    // Содержимое страниц само сообщит о недоступности данных.
  }
};

const createProductDialog = () => {
  const dialog = document.createElement('dialog');

  dialog.className = 'product-dialog';
  dialog.innerHTML = `
    <article class="product-dialog__card">
      <button class="dialog-close" type="button" data-dialog-close aria-label="Закрыть">×</button>
      <div class="product-dialog__image-wrap"><img class="product-dialog__image" alt="" /></div>
      <div class="product-dialog__content">
        <p class="product-dialog__category"></p>
        <h2 class="product-dialog__title"></h2>
        <p class="product-dialog__description"></p>
        <dl class="product-dialog__specs">
          <div><dt>Обжарка</dt><dd data-product-roast></dd></div>
          <div><dt>Происхождение</dt><dd data-product-origin></dd></div>
          <div><dt>Интенсивность</dt><dd data-product-intensity></dd></div>
          <div><dt>Вес</dt><dd data-product-weight></dd></div>
          <div><dt>Рейтинг</dt><dd data-product-rating></dd></div>
        </dl>
        <p class="product-dialog__price"></p>
      </div>
    </article>
  `;
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  document.body.append(dialog);

  return dialog;
};

export const openProductDetails = (product) => {
  const dialog = document.querySelector('.product-dialog') || createProductDialog();
  const image = dialog.querySelector('.product-dialog__image');

  image.src = product.image;
  image.alt = product.name;
  image.style.filter = product.imageFilter || 'none';
  dialog.querySelector('.product-dialog__category').textContent = categoryLabels[product.category] || product.category;
  dialog.querySelector('.product-dialog__title').textContent = product.name;
  dialog.querySelector('.product-dialog__description').textContent = product.description;
  dialog.querySelector('[data-product-roast]').textContent = roastLabels[product.roast] || product.roast;
  dialog.querySelector('[data-product-origin]').textContent = product.origin;
  dialog.querySelector('[data-product-intensity]').textContent = `${product.intensity}/5`;
  dialog.querySelector('[data-product-weight]').textContent = product.weight;
  dialog.querySelector('[data-product-rating]').textContent = `★ ${Number(product.rating).toFixed(1)}`;
  dialog.querySelector('.product-dialog__price').textContent = formatPrice(product.price);
  dialog.showModal();
};

const initializeProductDetails = () => {
  document.addEventListener('click', async (event) => {
    const explicitButton = event.target.closest('[data-product-detail-id]');
    const productCard = event.target.closest('[data-product-id]');
    const interactiveTarget = event.target.closest('button, a, input, select, textarea');
    const productId = explicitButton?.dataset.productDetailId || (!interactiveTarget && productCard?.dataset.productId);

    if (!productId) {
      return;
    }

    try {
      openProductDetails(await getProduct(productId));
    } catch (error) {
      // Основное действие карточки остаётся доступным, даже если детали не загрузились.
    }
  });
};

export const initializePageInteractions = () => {
  initializePreloader();
  initializeNavigation();
  initializeScrollReveal();
  initializeProductDetails();
  refreshShopCounters();
};
