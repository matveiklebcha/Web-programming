document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hero__burger');
  const navList = document.querySelector('.hero__nav-list');
  const navLinks = document.querySelectorAll('.hero__nav-link');

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
});
