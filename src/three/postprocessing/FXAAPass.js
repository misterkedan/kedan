import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

// https://threejs.org/examples/?q=post#webgl_postprocessing_fxaa

class FXAAPass extends ShaderPass {
  constructor({ enabled = true } = {}) {
    super(FXAAShader);

    this.enabled = enabled;
  }

  setSize(width = window.innerWidth, height = window.innerHeight) {
    const resolution = this.material.uniforms['resolution'].value;
    resolution.x = 1 / width;
    resolution.y = 1 / height;
  }
}

export { FXAAPass };
