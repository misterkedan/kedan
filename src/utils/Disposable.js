import { dispose } from 'kedan';

class Disposable {
  constructor() {}

  /**
   * Disposes all ressources used by this instance
   */
  dispose() {
    dispose(this);
  }
}

export { Disposable };
