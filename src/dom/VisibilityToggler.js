import { StyleToggler } from 'kedan';

class VisibilityToggler extends StyleToggler {
  constructor(elements = [], enabled = true) {
    super(elements, { visibility: ['hidden', 'visible'] }, enabled);
  }
}

export { VisibilityToggler };
