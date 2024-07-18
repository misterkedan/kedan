import { delocalize } from 'kedan';

export const is = {
  array: (object, includeTyped = true) =>
    includeTyped
      ? Array.isArray(object) || is.typedArray(object)
      : Array.isArray(object),
  boolean: (object) => typeof object === 'boolean',
  defined: (object) => typeof object !== 'undefined',
  function: (object) => typeof object === 'function',
  html: (object) => object instanceof HTMLElement,
  number: (object) => typeof object === 'number',
  string: (object) => typeof object === 'string',
  typedArray: (object) =>
    ArrayBuffer.isView(object) &&
    Object.prototype.toString.call(object) !== '[object DataView]',
  undefined: (object) => typeof object === 'undefined',
};

export const getDeviceInfo = (large = 1000) => {
  const largeScreen = Math.max(window.innerWidth, window.innerHeight) > large;
  const touch = !!navigator.maxTouchPoints;
  const phone = !largeScreen && touch;
  return { largeScreen, touch, phone };
};

// TODO: Rename to getKeyboardBinding
export const getKeyboardBinding = (keyboardEvent) => {
  const { key } = keyboardEvent;

  const modifiers = [];
  if (keyboardEvent.ctrlKey) modifiers.push('Ctrl');
  if (keyboardEvent.altKey) modifiers.push('Alt');
  if (keyboardEvent.shiftKey) modifiers.push('Shift');

  const prefix = modifiers.length ? `${modifiers.join(' + ')} + ` : '';
  if (key === ' ') return prefix + 'Space';
  if (key === 'Dead') return prefix + '`';
  if (key.match(/^.$/)) return prefix + key.toUpperCase();
  return prefix + key;
};

export const getKeyByValue = (object, value) =>
  Object.keys(object).find((key) => object[key] === value);

export const logNameTaken = (name) => console.error('Name taken:', name);

export const logInvalidArgument = (argument) =>
  console.error('Invalid argument:', argument);

export const stringToKey = (string) => {
  const notLetterInitials = /^[^a-zA-Z]+/g;
  const initials = /\b\w/g;
  const notAlphanumeric = /[^\w]+/g;
  const toCamelCase = (initial, i) =>
    i === 0 ? initial.toLowerCase() : initial.toUpperCase();
  return delocalize(string)
    .toLowerCase()
    .replace(notLetterInitials, '')
    .replace(initials, toCamelCase)
    .replace(notAlphanumeric, '');
};

export const throttle = (func, wait = 0) => {
  let throttling;
  return function () {
    if (throttling) return;
    func.call(this, ...arguments);
    throttling = true;
    setTimeout(() => (throttling = false), wait);
  };
};

export const trimFloat = (float, decimals = 4, method = Math.round) => {
  const p = Math.pow(10, decimals || 0);
  const n = float * p * (1 + Number.EPSILON);
  return method(n) / p;
};

export const clone = (object) => JSON.parse(JSON.stringify(object));

export const dispose = (object, skip = ['renderer', 'sketch', 'sketchpad']) => {
  if (!is.array(skip)) skip = [];
  Object.entries(object).forEach(([key, value]) => {
    if (!skip.includes(key)) value?.dispose?.();
  });
};
