import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

class Effects {
  constructor({ renderer, scene, camera, renderToScreen = true } = {}) {
    this.composer = new EffectComposer(renderer);
    this.composer.renderToScreen = renderToScreen;

    this.passes = {};
    this.add('render', new RenderPass(scene, camera));
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
    pass.dispose?.();
    delete this.passes[name];
  }

  /*-------------------------------------------------------------------------/
		Update
	/-------------------------------------------------------------------------*/

  dispose() {
    Object.values(this.passes).forEach((pass) => {
      pass.fsQuad?.dispose();
      pass.material?.dispose();
      pass.dispose?.();
    });

    Object.values(this).forEach((property) => property.dispose?.());

    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();
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
}

export { Effects };
