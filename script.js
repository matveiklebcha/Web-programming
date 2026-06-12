document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hero__burger');
  const navList = document.querySelector('.hero__nav-list');
  const navLinks = document.querySelectorAll('.hero__nav-link');
  const giftsetTabs = document.querySelectorAll('.giftset__tab');

  if (burger && navList) {
    burger.addEventListener('click', () => {
      navList.classList.toggle('is-open');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('is-open');
    });
  });

  giftsetTabs.forEach((tab) => {
    tab.setAttribute(
      'aria-pressed',
      String(tab.classList.contains('giftset__tab--active')),
    );

    tab.addEventListener('click', () => {
      giftsetTabs.forEach((item) => {
        const isActive = item === tab;

        item.classList.toggle('giftset__tab--active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    });
  });
});
