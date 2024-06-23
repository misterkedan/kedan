import { Matrix4 } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

class CenteredTextGeometry extends TextGeometry {
  constructor(char, options) {
    super(char, options);

    this.computeBoundingBox();
    const { min, max } = this.boundingBox;
    const x = -(max.x - min.x) * 0.5;
    const y = -(max.y - min.y) * 0.5;
    const z = -(max.z - min.z) * 0.5;
    const matrix = new Matrix4().makeTranslation(x, y, z);
    this.applyMatrix4(matrix);
  }
}

export { CenteredTextGeometry };
