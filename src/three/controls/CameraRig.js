import { MathUtils, Vector3 } from 'three';
import { getVector3 } from 'kedan';

class CameraRig {
  constructor({
    camera,
    enabled = true,
    speed = 2,
    lookAt = { x: 0, y: 0, z: 0 },
    bounds = { x: 5, y: 5, z: 0 },
    intro,
  } = {}) {
    this.camera = camera;
    this.enabled = enabled;
    this.speed = speed;

    this.lookAt = getVector3(lookAt);
    this.bounds = getVector3(bounds);
    this.origin = new Vector3().copy(camera.position);
    this.target = new Vector3();

    if (intro) {
      this.camera.position.copy(getVector3(intro));
      this.camera.lookAt(this.lookAt);
    } else {
      this.set(0.5, 0.5);
      this.camera.position.copy(this.target);
    }
  }

  set(x = 0, y = 0, z = 0) {
    this.target.x = this.origin.x + this.bounds.x * x;
    this.target.y = this.origin.y + this.bounds.y * y;
    this.target.z = this.origin.z + this.bounds.z * z;
  }

  tick(delta) {
    if (!this.enabled) return;

    if (this._speed) {
      const lerpSpeed = MathUtils.clamp(this._speed * delta, 0, 1);
      this.camera.position.lerp(this.target, lerpSpeed);
    } else {
      this.camera.position.copy(this.target);
    }

    this.camera.lookAt(this.lookAt);
  }

  get speed() {
    return this._speed * 1000;
  }

  set speed(number) {
    this._speed = number > 0 ? number * 0.001 : 0;
  }
}

export { CameraRig };
