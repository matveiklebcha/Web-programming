import { createUser, getUsers } from './api.js';
import {
  clearCurrentUser,
  getCurrentUser,
  isAdmin,
  setCurrentUser,
} from './session.js';
import { showNotice } from './ui.js';
import {
  clearFieldError,
  generateNickname,
  generatePassword,
  getLatestAllowedBirthDate,
  getNativeValidationMessage,
  getPasswordIssues,
  hashPassword,
  isAtLeast16,
  isBelarusPhone,
  normalizePhone,
  setFieldError,
} from './validation.js';

const loginTab = document.querySelector('#loginTab');
const registrationTab = document.querySelector('#registrationTab');
const loginPanel = document.querySelector('#loginPanel');
const registrationPanel = document.querySelector('#registrationPanel');
const authWorkspace = document.querySelector('#authWorkspace');
const accountPanel = document.querySelector('#accountPanel');
const accountName = document.querySelector('#accountName');
const accountAdminLink = document.querySelector('#accountAdminLink');
const accountLogout = document.querySelector('#accountLogout');
const loginForm = document.querySelector('#loginForm');
const loginEmail = document.querySelector('#loginEmail');
const loginPassword = document.querySelector('#loginPassword');
const loginError = document.querySelector('#loginError');
const registrationForm = document.querySelector('#registrationForm');
const registerButton = document.querySelector('#registerButton');
const registrationError = document.querySelector('#registrationError');
const lastName = document.querySelector('#lastName');
const firstName = document.querySelector('#firstName');
const patronymic = document.querySelector('#patronymic');
const phone = document.querySelector('#phone');
const email = document.querySelector('#email');
const birthDate = document.querySelector('#birthDate');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');
const confirmPasswordField = document.querySelector('#confirmPasswordField');
const generatePasswordButton = document.querySelector('#generatePasswordButton');
const nickname = document.querySelector('#nickname');
const regenerateNickname = document.querySelector('#regenerateNickname');
const agreementAccepted = document.querySelector('#agreementAccepted');
const openAgreement = document.querySelector('#openAgreement');
const agreementDialog = document.querySelector('#agreementDialog');
const closeAgreement = document.querySelector('#closeAgreement');
const confirmAgreement = document.querySelector('#confirmAgreement');
const notice = document.querySelector('#notice');

const availability = {
  email: false,
  phone: false,
  nickname: false,
};

let nicknameAttempts = 0;
let passwordMode = 'manual';
let agreementWasOpened = false;

const setFormMessage = (element, message = '') => {
  element.textContent = message;
  element.hidden = !message;
};

const getUserByField = async (field, value) => {
  const params = new URLSearchParams({ [field]: value });
  const users = await getUsers(`?${params.toString()}`);
  return users[0] || null;
};

const switchTab = (tabName) => {
  const showLogin = tabName === 'login';

  loginPanel.hidden = !showLogin;
  registrationPanel.hidden = showLogin;
  loginTab.classList.toggle('auth-tabs__button--active', showLogin);
  registrationTab.classList.toggle('auth-tabs__button--active', !showLogin);
  loginTab.setAttribute('aria-selected', String(showLogin));
  registrationTab.setAttribute('aria-selected', String(!showLogin));
};

const renderAccount = () => {
  const currentUser = getCurrentUser();

  authWorkspace.hidden = Boolean(currentUser);
  accountPanel.hidden = !currentUser;
  accountName.textContent = currentUser?.nickname || '';
  accountAdminLink.hidden = !isAdmin(currentUser);
};

const validateTextField = (input) => {
  clearFieldError(input);
  const message = getNativeValidationMessage(input);
  setFieldError(input, message);
  return !message;
};

const validatePhone = () => {
  clearFieldError(phone);

  if (!phone.value.trim()) {
    setFieldError(phone, 'Введите номер телефона.');
  } else if (!isBelarusPhone(phone.value)) {
    setFieldError(phone, 'Введите номер Республики Беларусь в формате +375XXXXXXXXX.');
  }

  return phone.checkValidity();
};

const validateBirthDate = () => {
  clearFieldError(birthDate);

  if (!birthDate.value) {
    setFieldError(birthDate, 'Укажите дату рождения.');
  } else if (!isAtLeast16(birthDate.value)) {
    setFieldError(birthDate, 'Регистрация доступна с 16 лет.');
  }

  return birthDate.checkValidity();
};

const validatePassword = () => {
  clearFieldError(password);
  const issues = getPasswordIssues(password.value);

  if (issues.length > 0) {
    setFieldError(password, `Требования: ${issues.join(', ')}.`);
  }

  return password.checkValidity();
};

const validatePasswordConfirmation = () => {
  if (passwordMode === 'automatic') {
    clearFieldError(confirmPassword);
    return true;
  }

  clearFieldError(confirmPassword);

  if (!confirmPassword.value) {
    setFieldError(confirmPassword, 'Повторите пароль.');
  } else if (confirmPassword.value !== password.value) {
    setFieldError(confirmPassword, 'Пароли не совпадают.');
  }

  return confirmPassword.checkValidity();
};

const validateNicknameFormat = () => {
  clearFieldError(nickname);
  let message = '';

  if (!nickname.value.trim()) {
    message = 'Создайте никнейм.';
  } else if (!/^[a-zA-Z][a-zA-Z0-9]{4,23}$/.test(nickname.value.trim())) {
    message = 'Используйте 5–24 латинских букв или цифр, начиная с буквы.';
  }

  setFieldError(nickname, message);
  return !message;
};

const syncRegisterButton = () => {
  const fieldsValid = registrationForm.checkValidity();
  const uniqueValues = availability.email && availability.phone && availability.nickname;
  const agreementValid = agreementWasOpened && agreementAccepted.checked;

  registerButton.disabled = !(fieldsValid && uniqueValues && agreementValid);
};

const checkAvailability = async (input, field, normalizedValue, occupiedMessage) => {
  if (!input.checkValidity()) {
    availability[field] = false;
    syncRegisterButton();
    return false;
  }

  const valueAtRequest = normalizedValue;

  try {
    const existingUser = await getUserByField(field, valueAtRequest);
    let currentValue = input.value.trim();

    if (field === 'phone') {
      currentValue = normalizePhone(input.value);
    }

    if (field === 'email') {
      currentValue = currentValue.toLowerCase();
    }

    if (currentValue !== valueAtRequest) {
      return false;
    }

    availability[field] = !existingUser;
    setFieldError(input, existingUser ? occupiedMessage : '');
  } catch (error) {
    availability[field] = false;
    setFieldError(input, 'Не удалось проверить значение. Попробуйте ещё раз.');
  }

  syncRegisterButton();
  return availability[field];
};

const checkEmail = async () => {
  validateTextField(email);
  return checkAvailability(
    email,
    'email',
    email.value.trim().toLowerCase(),
    'Профиль с таким email уже существует.',
  );
};

const checkPhone = async () => {
  validatePhone();
  return checkAvailability(
    phone,
    'phone',
    normalizePhone(phone.value),
    'Профиль с таким телефоном уже существует.',
  );
};

const checkNickname = async () => {
  validateNicknameFormat();
  return checkAvailability(
    nickname,
    'nickname',
    nickname.value.trim(),
    'Этот никнейм уже занят.',
  );
};

const createAvailableNickname = async () => {
  if (!validateTextField(firstName) || !validateTextField(lastName)) {
    setFieldError(nickname, 'Сначала заполните имя и фамилию.');
    return;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    nickname.value = generateNickname(firstName.value, lastName.value);
    if (await checkNickname()) {
      return;
    }
  }

  setFieldError(nickname, 'Не удалось подобрать свободный никнейм. Введите его вручную.');
  nickname.readOnly = false;
};

const setPasswordMode = (mode) => {
  passwordMode = mode;
  const isAutomatic = mode === 'automatic';

  password.readOnly = isAutomatic;
  password.type = isAutomatic ? 'text' : 'password';
  generatePasswordButton.hidden = !isAutomatic;
  confirmPasswordField.hidden = isAutomatic;
  confirmPassword.required = !isAutomatic;
  password.value = isAutomatic ? generatePassword() : '';
  confirmPassword.value = '';
  clearFieldError(password);
  clearFieldError(confirmPassword);
  validatePassword();
  syncRegisterButton();
};

loginTab.addEventListener('click', () => switchTab('login'));
registrationTab.addEventListener('click', () => switchTab('registration'));

accountLogout.addEventListener('click', () => {
  clearCurrentUser();
  renderAccount();
  switchTab('login');
});

loginForm.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    clearFieldError(event.target);
    setFormMessage(loginError);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setFormMessage(loginError);

  const emailValid = validateTextField(loginEmail);
  const passwordValid = validateTextField(loginPassword);

  if (!emailValid || !passwordValid) {
    return;
  }

  const submitButton = loginForm.querySelector('[type="submit"]');
  submitButton.disabled = true;

  try {
    const user = await getUserByField('email', loginEmail.value.trim().toLowerCase());
    const passwordHash = await hashPassword(loginPassword.value);

    if (!user || user.passwordHash !== passwordHash) {
      setFormMessage(loginError, 'Неверный email или пароль.');
      return;
    }

    setCurrentUser(user);
    renderAccount();
    showNotice(notice, `Добро пожаловать, ${user.nickname}`);
  } catch (error) {
    setFormMessage(loginError, 'Не удалось выполнить вход. Попробуйте ещё раз.');
  } finally {
    submitButton.disabled = false;
  }
});

registrationForm.addEventListener('input', (event) => {
  const input = event.target;

  if (!input.matches('input')) {
    return;
  }

  clearFieldError(input);
  setFormMessage(registrationError);

  if (input === email) {
    availability.email = false;
  }
  if (input === phone) {
    availability.phone = false;
  }
  if (input === nickname) {
    availability.nickname = false;
  }
  if (input === password) {
    validatePassword();
    validatePasswordConfirmation();
  }
  if (input === confirmPassword) {
    validatePasswordConfirmation();
  }

  syncRegisterButton();
});

[lastName, firstName, patronymic].forEach((input) => {
  input.addEventListener('blur', () => validateTextField(input));
});

[lastName, firstName].forEach((input) => {
  input.addEventListener('blur', async () => {
    if (!nickname.value && firstName.value.trim() && lastName.value.trim()) {
      await createAvailableNickname();
    }
  });
});

email.addEventListener('blur', checkEmail);
phone.addEventListener('blur', checkPhone);
birthDate.addEventListener('blur', () => {
  validateBirthDate();
  syncRegisterButton();
});
nickname.addEventListener('blur', checkNickname);

registrationForm.querySelectorAll('[name="passwordMode"]').forEach((radio) => {
  radio.addEventListener('change', () => setPasswordMode(radio.value));
});

confirmPassword.addEventListener('paste', (event) => {
  event.preventDefault();
  setFieldError(confirmPassword, 'Введите пароль повторно вручную.');
  syncRegisterButton();
});

generatePasswordButton.addEventListener('click', () => {
  password.value = generatePassword();
  validatePassword();
  syncRegisterButton();
});

regenerateNickname.addEventListener('click', async () => {
  if (nicknameAttempts >= 5) {
    nickname.readOnly = false;
    nickname.focus();
    return;
  }

  nicknameAttempts += 1;
  await createAvailableNickname();

  if (nicknameAttempts >= 5) {
    nickname.readOnly = false;
    regenerateNickname.textContent = 'Ввести самостоятельно';
  }
});

openAgreement.addEventListener('click', () => {
  agreementDialog.showModal();
});

closeAgreement.addEventListener('click', () => {
  agreementDialog.close();
});

confirmAgreement.addEventListener('click', () => {
  agreementWasOpened = true;
  agreementAccepted.disabled = false;
  agreementDialog.close();
  agreementAccepted.focus();
  syncRegisterButton();
});

agreementAccepted.addEventListener('change', () => {
  clearFieldError(agreementAccepted);
  syncRegisterButton();
});

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setFormMessage(registrationError);

  const validationResults = [
    ...[lastName, firstName, patronymic, email].map(validateTextField),
    validatePhone(),
    validateBirthDate(),
    validatePassword(),
    validatePasswordConfirmation(),
    validateNicknameFormat(),
    agreementWasOpened && agreementAccepted.checked,
  ];
  const formValid = validationResults.every(Boolean);

  if (!agreementWasOpened || !agreementAccepted.checked) {
    setFieldError(agreementAccepted, 'Ознакомьтесь с соглашением и примите его условия.');
  }

  if (!formValid) {
    syncRegisterButton();
    return;
  }

  registerButton.disabled = true;

  try {
    const uniqueValues = await Promise.all([checkEmail(), checkPhone(), checkNickname()]);

    if (uniqueValues.some((isAvailable) => !isAvailable)) {
      return;
    }

    const { data: user } = await createUser({
      phone: normalizePhone(phone.value),
      email: email.value.trim().toLowerCase(),
      birthDate: birthDate.value,
      lastName: lastName.value.trim(),
      firstName: firstName.value.trim(),
      patronymic: patronymic.value.trim(),
      nickname: nickname.value.trim(),
      passwordHash: await hashPassword(password.value),
      role: 'customer',
      createdAt: new Date().toISOString(),
    });

    setCurrentUser(user);
    renderAccount();
    showNotice(notice, 'Профиль успешно создан');
  } catch (error) {
    setFormMessage(registrationError, 'Не удалось создать профиль. Попробуйте ещё раз.');
  } finally {
    syncRegisterButton();
  }
});

birthDate.max = getLatestAllowedBirthDate();
renderAccount();
