import { is } from 'kedan';

/*-----------------------------------------------------------------------------/
  CSS
/-----------------------------------------------------------------------------*/

export const toCSS = (object, selector, tab = '  ') =>
  Object.entries(object).reduce((css, [key, value]) => {
    css += `${tab}${key}: ${value};\n`;
    return css;
  }, `${selector}{\n`) + '}';

export const updateCSS = (style, css) => {
  if (style.styleSheet) {
    style.styleSheet.cssText = css; // IE8-
  } else {
    css = document.createTextNode(css);
    style.appendChild(css);
  }
};

export const createCSS = (css) => {
  const style = document.createElement('style');
  if (css) updateCSS(style, css);
  document.head.appendChild(style);
  return style;
};

export const enable = (...elements) =>
  elements.forEach((element) => element?.classList.add('enabled'));

export const disable = (...elements) =>
  elements.forEach((element) => element?.classList.remove('enabled'));

/*-----------------------------------------------------------------------------/
  HTML
/-----------------------------------------------------------------------------*/

export const elementsArrayFrom = (inputs) => {
  if (!is.array(inputs)) inputs = [inputs];

  return inputs.reduce((result, input) => {
    if (input instanceof HTMLElement) result.push(input);
    else if (is.string(input)) {
      const elements = Array.from(document.querySelectorAll(input));
      elements.forEach((element) => result.push(element));
    }

    return result;
  }, []);
};

export const getElement = (input, container = document.body) => {
  if (is.html(input)) return input;

  const inputIsString = is.string(input);

  if (inputIsString) {
    const getById = document.getElementById(input);
    if (is.html(getById)) return getById;
  }

  const div = document.createElement('div');
  if (inputIsString) div.classList.add(input);
  container.appendChild(div);

  return div;
};

export const saveCanvasAsPNG = (canvas, name) => {
  const link = document.createElement('a');
  link.download = `${name}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
