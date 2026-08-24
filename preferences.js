import { t, translatePage } from './translations.js';

const PREFERENCES_KEY = 'revoPreferences';
const DEFAULT_PREFERENCES = Object.freeze({ language: 'ru', theme: 'light' });
const supportedLanguages = new Set(['ru', 'en']);
const supportedThemes = new Set(['light', 'dark']);

export const getPreferences = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY)) || {};

    return {
      language: supportedLanguages.has(saved.language) ? saved.language : DEFAULT_PREFERENCES.language,
      theme: supportedThemes.has(saved.theme) ? saved.theme : DEFAULT_PREFERENCES.theme,
    };
  } catch (error) {
    window.localStorage.removeItem(PREFERENCES_KEY);
    return { ...DEFAULT_PREFERENCES };
  }
};

const savePreferences = (preferences) => {
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

const swapThemeImages = (theme) => {
  document.querySelectorAll('[data-theme-light-src][data-theme-dark-src]').forEach((image) => {
    image.src = theme === 'dark' ? image.dataset.themeDarkSrc : image.dataset.themeLightSrc;
  });
};

const syncControls = (preferences) => {
  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === preferences.language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const themeButton = document.querySelector('[data-theme-toggle]');

  if (themeButton) {
    const darkTheme = preferences.theme === 'dark';
    themeButton.textContent = darkTheme ? '☀' : '☾';
    themeButton.setAttribute('aria-label', t(darkTheme ? 'settings.themeLight' : 'settings.themeDark'));
    themeButton.setAttribute('aria-pressed', String(darkTheme));
  }
};

export const applyPreferences = (preferences = getPreferences()) => {
  document.documentElement.lang = preferences.language;
  document.documentElement.dataset.theme = preferences.theme;
  swapThemeImages(preferences.theme);
  translatePage();
  syncControls(preferences);

  window.dispatchEvent(new CustomEvent('revo:preferences-changed', { detail: preferences }));
  return preferences;
};

const createTools = () => {
  const tools = document.createElement('aside');

  tools.className = 'site-tools';
  tools.setAttribute('aria-label', t('settings.label'));
  tools.dataset.i18nAriaLabel = 'settings.label';
  tools.innerHTML = `
    <div class="site-tools__languages" aria-label="${t('settings.language')}" data-i18n-aria-label="settings.language">
      <button class="site-tools__language" type="button" data-language="ru" aria-pressed="false">RU</button>
      <button class="site-tools__language" type="button" data-language="en" aria-pressed="false">EN</button>
    </div>
    <button class="site-tools__button" type="button" data-theme-toggle></button>
    <button class="site-tools__button" type="button" data-profile-open aria-label="${t('profile.open')}" data-i18n-aria-label="profile.open">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4"></circle>
        <path d="M5.5 20c.45-4.2 2.6-6.3 6.5-6.3s6.05 2.1 6.5 6.3"></path>
      </svg>
    </button>
    <button class="site-tools__button" type="button" data-preferences-reset aria-label="${t('settings.reset')}" data-i18n-aria-label="settings.reset">↺</button>
  `;
  document.body.append(tools);
  return tools;
};

export const initializePreferences = () => {
  if (document.querySelector('.site-tools')) {
    return applyPreferences();
  }

  const tools = createTools();
  let preferences = applyPreferences();

  tools.addEventListener('click', (event) => {
    const languageButton = event.target.closest('[data-language]');
    const themeButton = event.target.closest('[data-theme-toggle]');
    const resetButton = event.target.closest('[data-preferences-reset]');

    if (languageButton && languageButton.dataset.language !== preferences.language) {
      preferences = { ...preferences, language: languageButton.dataset.language };
      savePreferences(preferences);
      applyPreferences(preferences);
      window.location.reload();
      return;
    }

    if (themeButton) {
      preferences = { ...preferences, theme: preferences.theme === 'dark' ? 'light' : 'dark' };
      savePreferences(preferences);
      applyPreferences(preferences);
      return;
    }

    if (resetButton) {
      preferences = { ...DEFAULT_PREFERENCES };
      savePreferences(preferences);
      applyPreferences(preferences);
      window.location.reload();
    }
  });

  return preferences;
};
