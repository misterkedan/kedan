import { dispose } from 'kedan';

class Disposable {
  /**
   * Disposes all ressources used by this instance
   */
  dispose(skip) {
    dispose(this, skip);
  }
}

export { Disposable };
