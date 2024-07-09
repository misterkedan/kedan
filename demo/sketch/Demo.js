import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three';
import { Sketch } from 'kedan';
import { DemoControls } from './DemoControls';
import { DemoSettings } from './DemoSettings';

class Demo extends Sketch {
  constructor() {
    super(DemoControls, DemoSettings);

    this.rotationSpeed = -0.001;
  }

  preload() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  initScene() {
    const box = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    this.add({ box });
  }

  setBackground(background) {
    this.stage.background = background;

    if (background instanceof Color) {
      this.scene.background = background;
      this.background = background;
      return;
    }

    this.add({ background });
  }

  clearBackground() {
    if (this.background instanceof Color) {
      this.scene.background = null;
      this.stage.background = null;
      return;
    }

    const { background } = this;
    this.remove({ background });

    background.dispose();
  }

  tick(delta) {
    this.box.rotateX(delta * this.rotationSpeed);

    super.tick(delta);
  }
}

export { Demo };
