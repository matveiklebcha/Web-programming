import { addProductToCart, getProducts } from './api.js';
import {
  initializePageInteractions,
  refreshShopCounters,
} from './interactions.js';
import { getCurrentUser, syncSessionNavigation } from './session.js';
import { getLanguage, t } from './translations.js';
import { formatPrice, getCategoryLabel, showNotice } from './ui.js';

const galleryItems = [
  { image: 'img/products/catalog/card-image-yellow.jpg', audio: 'media/audio/coffee-note-01.wav', title: 'REVO Morning', description: 'Лёгкий цветочный профиль для спокойного начала дня.', descriptionEn: 'A light floral profile for an easy start to the day.' },
  { image: 'img/products/catalog/card-image-orange.jpg', audio: 'media/audio/coffee-note-02.wav', title: 'REVO Origin', description: 'Мягкая сладость и чистая фруктовая кислинка.', descriptionEn: 'Gentle sweetness with a clean fruity acidity.' },
  { image: 'img/products/catalog/card-image-blue.jpg', audio: 'media/audio/coffee-note-03.wav', title: 'REVO Everyday', description: 'Плотный классический вкус для привычного ритма.', descriptionEn: 'A full classic flavor for your daily rhythm.' },
  { image: 'img/products/catalog/card-image-brown.jpg', audio: 'media/audio/coffee-note-04.wav', title: 'REVO Đậm Đà', description: 'Насыщенный кофе с выразительной горчинкой.', descriptionEn: 'Rich coffee with a bold bittersweet finish.' },
  { image: 'img/products/catalog/card-image-red.jpg', audio: 'media/audio/coffee-note-05.wav', title: 'REVO Honey', description: 'Медовая сладость, яблочная кислинка и история Revo.', descriptionEn: 'Honey sweetness, apple acidity, and the Revo story.', video: true },
  { image: 'img/products/catalog/card-image-green.jpg', audio: 'media/audio/coffee-note-06.wav', title: 'REVO Natural', description: 'Ягодные ноты и долгое природное послевкусие.', descriptionEn: 'Berry notes with a long, natural aftertaste.' },
  { image: 'img/products/combo/brown-combo.png', audio: 'media/audio/coffee-note-07.wav', title: 'Combo Đậm Đà', description: 'Крепкий набор для тех, кто любит насыщенный кофе.', descriptionEn: 'A strong set for those who enjoy rich coffee.' },
  { image: 'img/products/combo/blue-combo.png', audio: 'media/audio/coffee-note-08.wav', title: 'Combo Everyday', description: 'Универсальный набор на каждый день.', descriptionEn: 'A versatile coffee set for every day.' },
  { image: 'img/products/combo/red-combo.png', audio: 'media/audio/coffee-note-09.wav', title: 'Combo Honey', description: 'Сладкий кофейный дуэт с фруктовым характером.', descriptionEn: 'A sweet coffee duo with a fruity character.' },
  { image: 'img/products/combo/green-combo.png', audio: 'media/audio/coffee-note-10.wav', title: 'Combo Natural', description: 'Свежий ягодный профиль в подарочном формате.', descriptionEn: 'A fresh berry profile in a gift-ready set.' },
];

const initializeSlider = ({ rootSelector, trackSelector, cardSelector, prevSelector, nextSelector, rows = 1 }) => {
  const root = document.querySelector(rootSelector);
  const track = document.querySelector(trackSelector);
  const cards = [...document.querySelectorAll(cardSelector)];
  const previousButton = document.querySelector(prevSelector);
  const nextButton = document.querySelector(nextSelector);

  if (!root || !track || cards.length < 2 || !previousButton || !nextButton) {
    return;
  }

  let index = 0;
  let timerId;

  const getGap = () => {
    const trackStyles = window.getComputedStyle(track);
    return Number.parseFloat(trackStyles.columnGap || trackStyles.gap || 0);
  };

  const getStep = () => cards[0].getBoundingClientRect().width + getGap();

  const getLastIndex = () => {
    const visibleCards = Math.max(1, Math.floor((root.clientWidth + getGap() + 1) / getStep()));
    const slidesCount = Math.ceil(cards.length / rows);
    return Math.max(0, slidesCount - visibleCards);
  };

  const render = () => {
    index = Math.min(index, getLastIndex());
    track.style.transform = `translate3d(${-index * getStep()}px, 0, 0)`;
    previousButton.disabled = index === 0;
    nextButton.disabled = index === getLastIndex();
  };

  const move = (direction) => {
    const lastIndex = getLastIndex();
    index = direction > 0
      ? (index >= lastIndex ? 0 : index + 1)
      : (index <= 0 ? lastIndex : index - 1);
    render();
  };

  const stopAutoplay = () => window.clearInterval(timerId);
  const startAutoplay = () => {
    stopAutoplay();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timerId = window.setInterval(() => move(1), 4500);
    }
  };

  previousButton.addEventListener('click', () => {
    move(-1);
    startAutoplay();
  });
  nextButton.addEventListener('click', () => {
    move(1);
    startAutoplay();
  });
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);
  window.addEventListener('resize', render);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  render();
  startAutoplay();
};

const createFeaturedProductCard = (product) => {
  const card = document.createElement('article');

  card.className = 'featured-product';
  card.dataset.productId = product.id;
  card.innerHTML = `
    <div class="featured-product__image-wrap">
      <img class="featured-product__image" alt="" />
      <span class="featured-product__rating"></span>
    </div>
    <div class="featured-product__content">
      <p class="featured-product__category"></p>
      <h3 class="featured-product__title"></h3>
      <p class="featured-product__description"></p>
      <div class="featured-product__details">
        <span data-featured-origin></span>
        <span data-featured-intensity></span>
      </div>
      <div class="featured-product__footer">
        <p class="featured-product__price"></p>
        <div class="featured-product__actions">
          <button class="btn btn--primary" type="button" data-featured-cart-id="${product.id}">${t('common.addCart')}</button>
          <button class="btn btn--secondary" type="button" data-product-detail-id="${product.id}">${t('common.details')}</button>
        </div>
      </div>
    </div>
  `;

  const image = card.querySelector('.featured-product__image');
  image.src = product.image;
  image.alt = product.name;
  image.style.filter = product.imageFilter || 'none';
  card.querySelector('.featured-product__rating').textContent = `★ ${Number(product.rating).toFixed(1)}`;
  card.querySelector('.featured-product__category').textContent = getCategoryLabel(product.category);
  card.querySelector('.featured-product__title').textContent = product.name;
  card.querySelector('.featured-product__description').textContent = getLanguage() === 'en'
    ? product.descriptionEn || product.description
    : product.description;
  card.querySelector('[data-featured-origin]').textContent = product.origin;
  card.querySelector('[data-featured-intensity]').textContent = `${t('product.intensity')} ${product.intensity}/5`;
  card.querySelector('.featured-product__price').textContent = formatPrice(product.price);

  return card;
};

const initializeLandingProducts = async () => {
  const track = document.querySelector('#featuredProductsTrack');
  const errorMessage = document.querySelector('#featuredProductsError');
  const notice = document.querySelector('#notice');
  const sliderButtons = document.querySelectorAll('.featured-products__button');

  try {
    const { data: products } = await getProducts('?_sort=rating&_order=desc&_limit=10');
    const productsById = new Map(products.map((product) => [String(product.id), product]));

    if (!products.length) {
      throw new Error('Featured products are empty');
    }

    track.replaceChildren(...products.map(createFeaturedProductCard));
    track.setAttribute('aria-busy', 'false');

    initializeSlider({
      rootSelector: '.featured-products__viewport',
      trackSelector: '.featured-products__track',
      cardSelector: '.featured-product',
      prevSelector: '.featured-products__button--prev',
      nextSelector: '.featured-products__button--next',
    });

    track.addEventListener('click', async (event) => {
      const cartButton = event.target.closest('[data-featured-cart-id]');

      if (!cartButton) {
        return;
      }

      const product = productsById.get(cartButton.dataset.featuredCartId);
      const currentUser = getCurrentUser();

      if (!product) {
        return;
      }

      if (!currentUser) {
        showNotice(notice, t('common.loginRequired'));
        return;
      }

      cartButton.disabled = true;

      try {
        const result = await addProductToCart(product, currentUser.id);
        showNotice(notice, t(result.created ? 'common.addedCart' : 'common.cartIncreased'));
        await refreshShopCounters();
      } catch (error) {
        showNotice(notice, t('common.actionError'));
      } finally {
        cartButton.disabled = false;
      }
    });
  } catch (error) {
    track.setAttribute('aria-busy', 'false');
    errorMessage.hidden = false;
    sliderButtons.forEach((button) => {
      button.hidden = true;
    });
  }
};

const initializeGallery = () => {
  const image = document.querySelector('#galleryImage');
  const audio = document.querySelector('#galleryAudio');
  const title = document.querySelector('#galleryTitle');
  const description = document.querySelector('#galleryDescription');
  const status = document.querySelector('#galleryStatus');
  const soundToggle = document.querySelector('#gallerySoundToggle');
  const volume = document.querySelector('#galleryVolume');
  const videoButton = document.querySelector('#galleryVideoButton');
  const randomButtons = document.querySelectorAll('[data-gallery-random]');

  if (!image || !audio) {
    return;
  }

  let currentIndex = 0;

  const syncSoundState = () => {
    const isPlaying = !audio.paused;
    soundToggle.setAttribute('aria-pressed', String(isPlaying));
    soundToggle.textContent = t(isPlaying ? 'gallery.pause' : 'gallery.sound');
    status.textContent = isPlaying
      ? t('gallery.playing', { title: galleryItems[currentIndex].title })
      : t('gallery.paused');
  };

  const playCurrentSound = async () => {
    try {
      await audio.play();
    } catch (error) {
      syncSoundState();
      status.textContent = t('gallery.playHint');
      return;
    }
    syncSoundState();
  };

  const showItem = (nextIndex, playSound = true) => {
    const item = galleryItems[nextIndex];
    currentIndex = nextIndex;
    image.classList.add('is-changing');
    audio.pause();
    audio.src = item.audio;
    title.textContent = item.title;
    description.textContent = getLanguage() === 'en' ? item.descriptionEn || item.description : item.description;
    videoButton.hidden = !item.video;

    window.setTimeout(() => {
      image.src = item.image;
      image.alt = item.title;
      image.classList.remove('is-changing');
    }, 170);

    if (playSound) {
      playCurrentSound();
    } else {
      syncSoundState();
    }
  };

  const showRandomItem = () => {
    let nextIndex = currentIndex;

    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * galleryItems.length);
    }

    showItem(nextIndex);
  };

  randomButtons.forEach((button) => button.addEventListener('click', showRandomItem));
  soundToggle.addEventListener('click', () => {
    if (audio.paused) {
      playCurrentSound();
    } else {
      audio.pause();
    }
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });
  audio.addEventListener('play', syncSoundState);
  audio.addEventListener('pause', syncSoundState);
  audio.addEventListener('ended', syncSoundState);
  audio.volume = Number(volume.value);
  showItem(0, false);
};

const initializeVideoDialog = () => {
  const dialog = document.querySelector('#videoDialog');
  const video = document.querySelector('#coffeeVideo');

  if (!dialog || !video) {
    return;
  }

  const close = () => {
    video.pause();
    dialog.close();
  };

  document.querySelectorAll('[data-open-video]').forEach((button) => {
    button.addEventListener('click', () => {
      dialog.showModal();
      video.play().catch(() => {});
    });
  });
  dialog.querySelector('[data-video-close]').addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      close();
    }
  });
  dialog.addEventListener('close', () => video.pause());
};

const initializeParallax = () => {
  const scene = document.querySelector('[data-parallax-scene]');
  const layers = document.querySelectorAll('[data-parallax-speed]');

  if (!scene || !layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let animationFrame;
  const render = () => {
    const bounds = scene.getBoundingClientRect();
    const centerOffset = bounds.top + bounds.height / 2 - window.innerHeight / 2;

    layers.forEach((layer, index) => {
      const speed = Number(layer.dataset.parallaxSpeed);
      const verticalOffset = Math.max(-190, Math.min(190, centerOffset * speed));
      const horizontalDirection = index % 2 === 0 ? -1 : 1;

      layer.style.setProperty('--parallax-offset', `${verticalOffset}px`);
      layer.style.setProperty('--parallax-x', `${Math.abs(verticalOffset) * 0.16 * horizontalDirection}px`);
    });
    animationFrame = null;
  };

  const requestRender = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  render();
};

document.addEventListener('DOMContentLoaded', () => {
  syncSessionNavigation();
  initializePageInteractions();

  document.querySelectorAll('.giftset__tab').forEach((tab) => {
    tab.setAttribute('aria-pressed', String(tab.classList.contains('giftset__tab--active')));
    tab.addEventListener('click', () => {
      document.querySelectorAll('.giftset__tab').forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('giftset__tab--active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    });
  });

  initializeSlider({ rootSelector: '.combo__viewport', trackSelector: '.combo__track', cardSelector: '.combo__card', prevSelector: '.combo__prev-btn', nextSelector: '.combo__next-btn' });
  initializeLandingProducts();
  initializeGallery();
  initializeVideoDialog();
  initializeParallax();
});
