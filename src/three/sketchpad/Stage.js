import { Camera, Color, Fog, PerspectiveCamera, Scene } from 'three';
import {
  LinearGradientBackground,
  RadialGradientBackground,
  SimplexGradientBackground,
  getVector3,
} from 'kedan';

class Stage {
  constructor({ camera, background, fog } = {}) {
    this.scene = new Scene();

    this.initCamera(camera);
    this.initBackground(background);

    if (fog) this.initFog(fog);
  }

  initCamera(input = {}) {
    if (input instanceof Camera) return (this.camera = input);

    const { fov, aspect, near, far } = input;
    this.camera = new PerspectiveCamera(fov, aspect, near, far);

    this.camera.position.copy(getVector3(input.start, 2));
    this.camera.lookAt(getVector3(input.lookAt));
  }

  initBackground(options) {
    if (!options) return;

    const isGradient = options.color1 && options.color2;

    if (!isGradient) {
      this.background = new Color(options);
      this.scene.background = this.background;
      return;
    }

    const gradients = {
      linear: LinearGradientBackground,
      radial: RadialGradientBackground,
      simplex: SimplexGradientBackground,
    };
    const Gradient = gradients[options.type] || gradients.linear;
    this.background = new Gradient(options);
    this.add(this.background);
  }

  initFog(options) {
    const { color, near, far } = options;
    this.scene.fog = new Fog(color, near, far);
  }

  /*---------------------------------------------------------------------------/
		Scene
	/---------------------------------------------------------------------------*/

  add(object3D) {
    this.scene.add(object3D);
  }

  remove(object3D) {
    this.scene.remove(object3D);
  }

  /*---------------------------------------------------------------------------/
		Update
	/---------------------------------------------------------------------------*/

  dispose() {
    this.background?.dispose?.();

    this.scene.children.forEach((child) => {
      child.dispose?.();
      child.geometry?.dispose();
      child.material?.dispose();
    });

    this.scene.clear();
  }

  resize(width, height) {
    const aspect = width / height;

    if (this.background) this.background.aspect = aspect;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}

export { Stage };
