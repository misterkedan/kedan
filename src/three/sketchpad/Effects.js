import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { Disposable, dispose } from 'kedan';

class Effects extends Disposable {
  constructor({ renderer, renderToScreen = true } = {}) {
    super();
    this.composer = new EffectComposer(renderer);
    this.composer.renderToScreen = renderToScreen;
    this.passes = {};
  }

  /*-------------------------------------------------------------------------/
		Add / remove
	/-------------------------------------------------------------------------*/

  add(name, pass) {
    this.passes[name] = pass;
    this.composer.addPass(pass);
  }

  remove(name) {
    const pass = this.passes[name];
    if (!pass) return;
    this.composer.removePass(pass);
    if (pass.dispose) pass.dispose();
    else dispose(pass);
    delete this.passes[name];
  }

  /*-------------------------------------------------------------------------/
		Update
	/-------------------------------------------------------------------------*/

  dispose() {
    Object.values(this.passes).forEach((pass) => dispose(pass));
    dispose(this.passes);
    dispose(this.composer);
    this.composer.dispose();
    super.dispose();
  }

  resize(width, height, pixelRatio) {
    this.composer.setSize(width, height);
    Object.values(this.passes).forEach((pass) =>
      pass.setSize?.(width, height, pixelRatio)
    );
  }

  tick() {
    this.composer.render();
  }

  /*---------------------------------------------------------------------------/
    Getters & Setters
  /---------------------------------------------------------------------------*/

  get length() {
    return this.composer.passes.length;
  }
}

export { Effects };
