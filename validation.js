import { isCommonPassword } from './common-passwords.js';

const transliterationMap = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

const getErrorElement = (input) =>
  document.querySelector(`[data-error-for="${input.id}"]`);

export const setFieldError = (input, message = '') => {
  const errorElement = getErrorElement(input);

  input.setCustomValidity(message);
  input.classList.toggle('form-control--invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));

  if (errorElement) {
    errorElement.textContent = message;
  }
};

export const clearFieldError = (input) => setFieldError(input);

export const getNativeValidationMessage = (input) => {
  const { validity } = input;

  if (validity.valueMissing) {
    return 'Заполните это поле.';
  }

  if (validity.typeMismatch) {
    return 'Введите корректное значение.';
  }

  if (validity.tooShort) {
    return `Минимальная длина: ${input.minLength} символов.`;
  }

  if (validity.tooLong) {
    return `Максимальная длина: ${input.maxLength} символов.`;
  }

  if (validity.rangeUnderflow) {
    return `Минимальное значение: ${input.min}.`;
  }

  if (validity.rangeOverflow) {
    return `Максимальное значение: ${input.max}.`;
  }

  if (validity.patternMismatch) {
    return input.title || 'Значение не соответствует формату.';
  }

  if (validity.stepMismatch || validity.badInput) {
    return 'Введите допустимое значение.';
  }

  return '';
};

export const validateNativeField = (input) => {
  const customMessage = input.validity.customError ? input.validationMessage : '';
  input.setCustomValidity('');
  const message = getNativeValidationMessage(input) || customMessage;
  setFieldError(input, message);
  return !message;
};

export const normalizePhone = (value) => value.replace(/[\s()-]/g, '');

export const isBelarusPhone = (value) => /^\+375\d{9}$/.test(normalizePhone(value));

export const getLatestAllowedBirthDate = () => {
  const today = new Date();
  const date = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const isAtLeast16 = (value) => Boolean(value) && value <= getLatestAllowedBirthDate();

export const getPasswordIssues = (password) => {
  const issues = [];

  if (password.length < 8 || password.length > 20) {
    issues.push('от 8 до 20 символов');
  }
  if (!/[A-ZА-ЯЁ]/u.test(password)) {
    issues.push('заглавная буква');
  }
  if (!/[a-zа-яё]/u.test(password)) {
    issues.push('строчная буква');
  }
  if (!/\d/.test(password)) {
    issues.push('цифра');
  }
  if (!/[^\p{L}\p{N}\s]/u.test(password)) {
    issues.push('специальный символ');
  }
  if (isCommonPassword(password)) {
    issues.push('пароль не должен быть распространённым');
  }

  return issues;
};

const getSecureIndex = (length) => {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % length;
};

const getRandomCharacter = (characters) => characters[getSecureIndex(characters.length)];

const secureShuffle = (characters) => {
  const result = [...characters];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = getSecureIndex(index + 1);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result.join('');
};

export const generatePassword = () => {
  const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%&*?'];
  const allCharacters = groups.join('');
  let password = groups.map(getRandomCharacter).join('');

  while (password.length < 12) {
    password += getRandomCharacter(allCharacters);
  }

  const result = secureShuffle(password);
  return isCommonPassword(result) ? generatePassword() : result;
};

export const hashPassword = async (password) => {
  const bytes = new TextEncoder().encode(password);
  const hash = await window.crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const transliterate = (value) =>
  value
    .trim()
    .toLowerCase()
    .split('')
    .map((character) => transliterationMap[character] ?? character)
    .join('')
    .replace(/[^a-z0-9]/g, '');

export const generateNickname = (firstName, lastName) => {
  const firstPart = transliterate(firstName).slice(0, 3) || 'user';
  const lastPart = transliterate(lastName).slice(0, 3) || 'revo';
  const number = 10 + getSecureIndex(990);

  return `${firstPart}${lastPart[0].toUpperCase()}${lastPart.slice(1)}${number}`;
};
