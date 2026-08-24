import { getUser, getUsers, updateUser } from './api.js';
import { clearCurrentUser, getCurrentUser, setCurrentUser } from './session.js';
import { t, translatePage } from './translations.js';
import { isBelarusPhone, normalizePhone } from './validation.js';

const createProfileDialog = () => {
  const dialog = document.createElement('dialog');

  dialog.className = 'profile-dialog';
  dialog.innerHTML = `
    <form class="profile-dialog__card" data-profile-form>
      <button class="dialog-close" type="button" data-profile-close data-i18n-aria-label="profile.close">×</button>
      <div class="profile-dialog__header">
        <p class="section-header__slogan">Revo Coffee</p>
        <h2 class="profile-dialog__title" data-i18n="profile.title"></h2>
        <p class="profile-dialog__hint" data-i18n="profile.hint"></p>
      </div>
      <div class="profile-dialog__grid">
        <label class="form-field"><span class="form-field__label" data-i18n="profile.lastName"></span><input class="form-control" name="lastName" minlength="2" maxlength="40" required /></label>
        <label class="form-field"><span class="form-field__label" data-i18n="profile.firstName"></span><input class="form-control" name="firstName" minlength="2" maxlength="40" required /></label>
        <label class="form-field"><span class="form-field__label" data-i18n="profile.patronymic"></span><input class="form-control" name="patronymic" maxlength="40" /></label>
        <label class="form-field"><span class="form-field__label" data-i18n="profile.phone"></span><input class="form-control" name="phone" type="tel" required /></label>
        <label class="form-field"><span class="form-field__label" data-i18n="profile.email"></span><input class="form-control" name="email" type="email" required /></label>
        <label class="form-field"><span class="form-field__label" data-i18n="profile.birthDate"></span><input class="form-control" name="birthDate" type="date" required /></label>
        <label class="form-field profile-dialog__wide"><span class="form-field__label" data-i18n="profile.nickname"></span><input class="form-control" name="nickname" pattern="[a-zA-Z][a-zA-Z0-9]{4,23}" required /></label>
      </div>
      <p class="form-message form-message--error" data-profile-error role="alert" hidden></p>
      <p class="form-message form-message--success" data-profile-success role="status" hidden></p>
      <div class="profile-dialog__actions">
        <button class="btn btn--secondary" type="button" data-profile-logout data-i18n="profile.logout"></button>
        <button class="btn btn--primary" type="submit" data-i18n="profile.save"></button>
      </div>
    </form>
  `;
  document.body.append(dialog);
  translatePage();
  return dialog;
};

const fillProfileForm = (form, user) => {
  ['lastName', 'firstName', 'patronymic', 'phone', 'email', 'birthDate', 'nickname'].forEach((field) => {
    form.elements[field].value = user[field] || '';
  });
};

const setMessage = (element, message = '') => {
  element.textContent = message;
  element.hidden = !message;
};

const hasDuplicateProfileValue = async (currentUserId, field, value) => {
  const params = new URLSearchParams({ [field]: value });
  const users = await getUsers(`?${params.toString()}`);
  return users.some((user) => Number(user.id) !== Number(currentUserId));
};

export const initializeProfile = () => {
  const openButton = document.querySelector('[data-profile-open]');

  if (!openButton || openButton.dataset.profileReady === 'true') {
    return;
  }

  openButton.dataset.profileReady = 'true';
  const dialog = createProfileDialog();
  const form = dialog.querySelector('[data-profile-form]');
  const errorMessage = dialog.querySelector('[data-profile-error]');
  const successMessage = dialog.querySelector('[data-profile-success]');

  const syncButton = () => {
    openButton.setAttribute('aria-label', t(getCurrentUser() ? 'profile.open' : 'profile.signIn'));
  };

  openButton.addEventListener('click', async () => {
    const sessionUser = getCurrentUser();

    if (!sessionUser) {
      window.location.href = 'auth.html';
      return;
    }

    setMessage(errorMessage);
    setMessage(successMessage);

    try {
      const user = await getUser(sessionUser.id);
      setCurrentUser(user);
      fillProfileForm(form, user);
      dialog.showModal();
    } catch (error) {
      window.location.href = 'auth.html';
    }
  });

  dialog.querySelector('[data-profile-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.querySelector('[data-profile-logout]').addEventListener('click', () => {
    clearCurrentUser();
    dialog.close();
    window.location.href = 'auth.html';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(errorMessage);
    setMessage(successMessage);

    const currentUser = getCurrentUser();
    const values = Object.fromEntries(new FormData(form));
    values.phone = normalizePhone(values.phone);
    values.email = values.email.trim().toLowerCase();
    values.nickname = values.nickname.trim();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!isBelarusPhone(values.phone)) {
      setMessage(errorMessage, t('profile.invalidPhone'));
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;

    try {
      const checks = await Promise.all([
        hasDuplicateProfileValue(currentUser.id, 'email', values.email),
        hasDuplicateProfileValue(currentUser.id, 'phone', values.phone),
        hasDuplicateProfileValue(currentUser.id, 'nickname', values.nickname),
      ]);

      if (checks.some(Boolean)) {
        setMessage(errorMessage, t('profile.duplicate'));
        return;
      }

      const { data: updatedUser } = await updateUser(currentUser.id, values);
      setCurrentUser(updatedUser);
      fillProfileForm(form, updatedUser);
      setMessage(successMessage, t('profile.saved'));
      syncButton();
    } catch (error) {
      setMessage(errorMessage, t('profile.error'));
    } finally {
      submitButton.disabled = false;
    }
  });

  window.addEventListener('revo:session-changed', syncButton);
  window.addEventListener('revo:preferences-changed', () => {
    translatePage();
    syncButton();
  });
  syncButton();
};
