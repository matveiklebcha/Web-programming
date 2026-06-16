const coffeeProducts = [
  {
    id: 1,
    name: 'REVO Morning Amber',
    price: 99000,
    image: 'img/products/catalog/card-image-yellow.jpg',
    category: 'Classic',
    rating: 4.6,
    description: 'Сбалансированный утренний кофе с мягкой горчинкой и ароматом ореха.',
    roast: 'Medium',
    origin: 'Lam Dong',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(0deg) saturate(1.05)',
  },
  {
    id: 2,
    name: 'REVO Origin Citrus',
    price: 139000,
    image: 'img/products/catalog/card-image-orange.jpg',
    category: 'Fruity',
    rating: 4.8,
    description: 'Яркий сорт с цитрусовой кислинкой, медовым послевкусием и легким телом.',
    roast: 'Light',
    origin: 'Cau Dat',
    intensity: 2,
    weight: '250 г',
    imageFilter: 'hue-rotate(-8deg) saturate(1.18)',
  },
  {
    id: 3,
    name: 'REVO Everyday Blue',
    price: 85000,
    image: 'img/products/catalog/card-image-blue.jpg',
    category: 'Classic',
    rating: 4.5,
    description: 'Повседневная смесь Robusta и Arabica с плотным вкусом и шоколадной нотой.',
    roast: 'Medium',
    origin: 'Dak Lak',
    intensity: 4,
    weight: '250 г',
    imageFilter: 'hue-rotate(0deg) saturate(1.08)',
  },
  {
    id: 4,
    name: 'REVO Dark Brown',
    price: 75000,
    image: 'img/products/catalog/card-image-brown.jpg',
    category: 'Strong',
    rating: 4.4,
    description: 'Крепкий темный кофе с выраженной горчинкой и плотным сливочным телом.',
    roast: 'Dark',
    origin: 'Buon Ma Thuot',
    intensity: 5,
    weight: '250 г',
    imageFilter: 'brightness(0.92) contrast(1.08) saturate(1.08)',
  },
  {
    id: 5,
    name: 'REVO Honey Red',
    price: 195000,
    image: 'img/products/catalog/card-image-red.jpg',
    category: 'Sweet',
    rating: 4.9,
    description: 'Сладкий honey-процесс с нотами карамели, яблока и мягкой ягодности.',
    roast: 'Medium',
    origin: 'Da Lat',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(0deg) saturate(1.15)',
  },
  {
    id: 6,
    name: 'REVO Natural Green',
    price: 169000,
    image: 'img/products/catalog/card-image-green.jpg',
    category: 'Fruity',
    rating: 4.7,
    description: 'Натуральная обработка с ароматом цветов, спелых ягод и мягкой кислотностью.',
    roast: 'Light',
    origin: 'Son La',
    intensity: 2,
    weight: '250 г',
    imageFilter: 'hue-rotate(4deg) saturate(1.12)',
  },
  {
    id: 7,
    name: 'REVO Golden Crema',
    price: 125000,
    image: 'img/products/catalog/card-image-yellow.jpg',
    category: 'Sweet',
    rating: 4.7,
    description: 'Золотая смесь для молочных напитков с нотами печенья и сливочной карамели.',
    roast: 'Medium',
    origin: 'Lam Ha',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(12deg) brightness(1.06) saturate(1.22)',
  },
  {
    id: 8,
    name: 'REVO Orange Bloom',
    price: 149000,
    image: 'img/products/catalog/card-image-orange.jpg',
    category: 'Fruity',
    rating: 4.8,
    description: 'Легкий кофе с ароматом апельсинового цвета, абрикоса и тростникового сахара.',
    roast: 'Light',
    origin: 'Cau Dat',
    intensity: 2,
    weight: '250 г',
    imageFilter: 'hue-rotate(18deg) brightness(1.04) saturate(1.2)',
  },
  {
    id: 9,
    name: 'REVO Blue Velvet',
    price: 118000,
    image: 'img/products/catalog/card-image-blue.jpg',
    category: 'Classic',
    rating: 4.6,
    description: 'Мягкий кофейный профиль с какао, ореховой пастой и чистым послевкусием.',
    roast: 'Medium',
    origin: 'Dak Nong',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(20deg) saturate(1.16) brightness(1.02)',
  },
  {
    id: 10,
    name: 'REVO Espresso Brown',
    price: 132000,
    image: 'img/products/catalog/card-image-brown.jpg',
    category: 'Strong',
    rating: 4.9,
    description: 'Эспрессо-смесь с густой крема, темным шоколадом и долгим сухим финишем.',
    roast: 'Dark',
    origin: 'Gia Lai',
    intensity: 5,
    weight: '250 г',
    imageFilter: 'hue-rotate(-10deg) contrast(1.15) saturate(1.18)',
  },
  {
    id: 11,
    name: 'REVO Red Berry',
    price: 182000,
    image: 'img/products/catalog/card-image-red.jpg',
    category: 'Fruity',
    rating: 4.8,
    description: 'Фруктовый профиль с красной смородиной, какао и легкой винной кислотностью.',
    roast: 'Light',
    origin: 'Da Lat',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(14deg) brightness(1.03) saturate(1.25)',
  },
  {
    id: 12,
    name: 'REVO Green Garden',
    price: 158000,
    image: 'img/products/catalog/card-image-green.jpg',
    category: 'Sweet',
    rating: 4.7,
    description: 'Сладкий кофе с цветочным ароматом, медом, зеленым яблоком и мягким телом.',
    roast: 'Medium',
    origin: 'Son La',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(22deg) brightness(1.05) saturate(1.18)',
  },
  {
    id: 13,
    name: 'REVO Morning Strong',
    price: 109000,
    image: 'img/products/catalog/card-image-yellow.jpg',
    category: 'Strong',
    rating: 4.5,
    description: 'Бодрая утренняя смесь с повышенной интенсивностью, какао и жареным орехом.',
    roast: 'Dark',
    origin: 'Buon Ma Thuot',
    intensity: 5,
    weight: '250 г',
    imageFilter: 'hue-rotate(-18deg) contrast(1.12) saturate(1.12)',
  },
  {
    id: 14,
    name: 'REVO Caramel Orange',
    price: 172000,
    image: 'img/products/catalog/card-image-orange.jpg',
    category: 'Sweet',
    rating: 4.9,
    description: 'Сладкий профиль с карамелью, цедрой апельсина и бархатным послевкусием.',
    roast: 'Medium',
    origin: 'Lam Dong',
    intensity: 3,
    weight: '250 г',
    imageFilter: 'hue-rotate(28deg) brightness(1.07) saturate(1.26)',
  },
  {
    id: 15,
    name: 'REVO Midnight Blue',
    price: 145000,
    image: 'img/products/catalog/card-image-blue.jpg',
    category: 'Strong',
    rating: 4.6,
    description: 'Темная смесь для насыщенного фильтра с горьким шоколадом и пряным финишем.',
    roast: 'Dark',
    origin: 'Dak Lak',
    intensity: 5,
    weight: '250 г',
    imageFilter: 'hue-rotate(-28deg) brightness(0.88) contrast(1.18) saturate(1.2)',
  },
];

const categoryLabels = {
  Classic: 'Классика',
  Fruity: 'Фруктовый',
  Sweet: 'Сладкий',
  Strong: 'Крепкий',
};

const state = {
  query: '',
  category: 'all',
  method: null,
  sort: 'default',
};

const productsGrid = document.querySelector('#productsGrid');
const emptyState = document.querySelector('#emptyState');
const productsCount = document.querySelector('#productsCount');
const searchInput = document.querySelector('#searchInput');
const sortSelect = document.querySelector('#sortSelect');
const categoryButtons = document.querySelectorAll('[data-category]');
const methodButtons = document.querySelectorAll('[data-method]');

const formatPrice = (price) => `${price.toLocaleString('ru-RU')} VND`;

const normalizeText = (value) => value.toLowerCase().trim();

const getMethodProducts = () => {
  switch (state.method) {
    case 'map':
      return coffeeProducts.map((product) => ({
        ...product,
        salePrice: Math.round(product.price * 0.9),
        badge: 'Скидка 10%',
      }));
    case 'filter':
      return coffeeProducts.filter((product) => product.rating >= 4.7);
    case 'sort':
      return [...coffeeProducts].sort((first, second) => first.price - second.price);
    case 'reduce':
      return Object.values(
        coffeeProducts.reduce((bestByCategory, product) => {
          const current = bestByCategory[product.category];

          if (!current || product.rating > current.rating) {
            bestByCategory[product.category] = product;
          }

          return bestByCategory;
        }, {}),
      );
    case 'find': {
      const product = coffeeProducts.find((item) => item.rating >= 4.9);
      return product ? [product] : [];
    }
    case 'slice':
      return coffeeProducts.slice(0, 6);
    case 'reverse':
      return [...coffeeProducts].reverse();
    case 'flatMap':
      return Object.keys(categoryLabels).flatMap((category) =>
        coffeeProducts.filter((product) => product.category === category).slice(0, 2),
      );
    case 'concat': {
      const baseLine = coffeeProducts.slice(0, 8);
      const limitedLine = coffeeProducts.slice(8);

      return baseLine.concat(limitedLine);
    }
    case 'splice': {
      const productsCopy = [...coffeeProducts];

      return productsCopy.splice(5, 5);
    }
    default:
      return [...coffeeProducts];
  }
};

const applySearch = (products) => {
  const query = normalizeText(state.query);

  if (!query) {
    return products;
  }

  return products.filter((product) => {
    const searchableText = normalizeText(`${product.name} ${product.description}`);

    return searchableText.includes(query);
  });
};

const applyCategory = (products) => {
  if (state.category === 'all') {
    return products;
  }

  return products.filter((product) => product.category === state.category);
};

const applySort = (products) => {
  const sortedProducts = [...products];

  switch (state.sort) {
    case 'price-asc':
      return sortedProducts.sort((first, second) => first.price - second.price);
    case 'price-desc':
      return sortedProducts.sort((first, second) => second.price - first.price);
    case 'name-asc':
      return sortedProducts.sort((first, second) =>
        first.name.localeCompare(second.name, 'ru'),
      );
    case 'rating-desc':
      return sortedProducts.sort((first, second) => second.rating - first.rating);
    default:
      return sortedProducts;
  }
};

const createProductCard = (product) => {
  const card = document.createElement('article');
  const currentPrice = product.salePrice || product.price;
  const oldPrice = product.salePrice ? product.price : null;

  card.className = 'product-card';
  card.style.setProperty('--product-filter', product.imageFilter);
  card.innerHTML = `
    <div class="product-card__image-wrap">
      <img class="product-card__image" src="${product.image}" alt="${product.name}" />
      ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
    </div>
    <div class="product-card__body">
      <div class="product-card__top">
        <span class="product-card__category">${categoryLabels[product.category]}</span>
        <span class="product-card__rating">★ ${product.rating.toFixed(1)}</span>
      </div>
      <h2 class="product-card__title">${product.name}</h2>
      <p class="product-card__description">${product.description}</p>
      <div class="product-card__meta">
        <span>${product.roast}</span>
        <span>${product.origin}</span>
        <span>${product.intensity}/5</span>
        <span>${product.weight}</span>
      </div>
      <div class="product-card__footer">
        <div class="product-card__price">
          <span>${formatPrice(currentPrice)}</span>
          ${oldPrice ? `<del>${formatPrice(oldPrice)}</del>` : ''}
        </div>
        <button class="btn btn--primary product-card__button" type="button">В корзину</button>
      </div>
    </div>
  `;

  return card;
};

const setActiveButton = (buttons, activeValue, dataKey) => {
  buttons.forEach((button) => {
    const isActive = button.dataset[dataKey] === activeValue;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const renderProducts = () => {
  const methodProducts = getMethodProducts();
  const searchedProducts = applySearch(methodProducts);
  const categoryProducts = applyCategory(searchedProducts);
  const visibleProducts = applySort(categoryProducts);

  productsGrid.replaceChildren(...visibleProducts.map(createProductCard));
  emptyState.hidden = visibleProducts.length > 0;
  productsCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'позиция' : 'позиций'}`;
};

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderProducts();
});

sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderProducts();
});

categoryButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));

  button.addEventListener('click', () => {
    state.category = button.dataset.category;
    setActiveButton(categoryButtons, state.category, 'category');
    renderProducts();
  });
});

methodButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));

  button.addEventListener('click', () => {
    state.method = state.method === button.dataset.method ? null : button.dataset.method;
    setActiveButton(methodButtons, state.method, 'method');
    renderProducts();
  });
});

renderProducts();
