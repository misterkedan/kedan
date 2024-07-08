import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { GLSL_vUv_vertex } from 'kedan';

class Background extends Mesh {
  constructor(shader) {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      vertexShader: GLSL_vUv_vertex,
      depthWrite: false,
      depthTest: false,
      ...shader,
    });

    super(geometry, material);

    this.frustumCulled = false;
    this.renderOrder = -1;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export { Background };
