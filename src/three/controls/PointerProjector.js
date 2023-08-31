import {
  BoxGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Vector2,
} from 'three';

class PointerProjector {
  constructor(
    sketch,
    {
      width = 100,
      height = 100,
      speed = 0,
      cursorSize = 0.1,
      color = 0xff0000,
      opacity = 0.15,
      horizontal = true,
      autoRotate = false,
      enabled = true,
      plane,
      cursor,
    } = {}
  ) {
    if (!plane) {
      plane = new Mesh(
        new PlaneGeometry(width, height),
        new MeshBasicMaterial({
          color,
          opacity,
          transparent: opacity < 1,
        })
      );

      if (horizontal) plane.rotateX(-Math.PI / 2);
    }

    if (!cursor)
      cursor = new Mesh(
        new BoxGeometry(cursorSize, cursorSize, cursorSize),
        new MeshBasicMaterial({ color })
      );

    sketch.add({ projectorPlane: plane });
    sketch.add({ projectorCursor: cursor });
    this.plane = plane;
    this.cursor = cursor;
    this.sketch = sketch;

    this.enabled = enabled;
    this.speed = speed;
    this.autoRotate = autoRotate;

    this.camera = sketch.camera;
    this.xy = new Vector2();
    this.raycaster = new Raycaster();

    if (!sketch.debug) {
      this.plane.visible = false;
      this.cursor.visible = false;
    }
  }

  set(x, y) {
    this.xy.set(x, y);
  }

  dispose() {
    const { projectorCursor, projectorPlane } = this.sketch;

    this.sketch.remove({ projectorCursor, projectorPlane });
    [projectorCursor, projectorPlane].forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }

  tick(delta) {
    if (!this.enabled) return;

    if (this.autoRotate) this.plane.quaternion.copy(this.camera.quaternion);

    this.raycaster.setFromCamera(this.xy, this.camera);
    const intersection = this.raycaster.intersectObject(this.plane)[0];
    if (!intersection?.point) return;

    if (this._speed) {
      const lerpSpeed = MathUtils.clamp(this._speed * delta, 0, 1);
      this.cursor.position.lerp(intersection.point, lerpSpeed);
    } else {
      this.cursor.position.copy(intersection.point);
    }
  }

  get speed() {
    return this._speed * 1000;
  }

  set speed(number) {
    this._speed = number > 0 ? number * 0.001 : 0;
  }
}

export { PointerProjector };
