export const capitalize = ([first, ...rest], locale = navigator.language) =>
  first.toLocaleUpperCase(locale) + rest.join('').toLocaleLowerCase();

export const uncapitalize = ([first, ...rest], locale = navigator.language) =>
  first.toLocaleLowerCase(locale) + rest.join('');

export const delocalize = (string) =>
  string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
