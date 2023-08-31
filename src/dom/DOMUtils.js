export function elementsArrayFrom(inputs) {
  if (!Array.isArray(inputs)) inputs = [inputs];

  return inputs.reduce((result, input) => {
    if (input instanceof HTMLElement) result.push(input);
    else if (typeof input === 'string') {
      const elements = Array.from(document.querySelectorAll(input));
      elements.forEach((element) => result.push(element));
    }

    return result;
  }, []);
}

export function getElement(input, container = document.body) {
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
}

export function saveCanvasAsPNG(canvas, name) {
  const link = document.createElement('a');
  link.download = `${name}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
