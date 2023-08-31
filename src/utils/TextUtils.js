export function capitalize([first, ...rest], locale = navigator.language) {
  return first.toLocaleUpperCase(locale) + rest.join('').toLocaleLowerCase();
}

export function uncapitalize([first, ...rest], locale = navigator.language) {
  return first.toLocaleLowerCase(locale) + rest.join('');
}

export function delocalize(string) {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
