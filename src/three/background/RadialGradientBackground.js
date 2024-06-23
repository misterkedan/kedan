import { Color, MathUtils, Uniform } from 'three';
import {
  Background,
  getVector3,
  GLSL_bayerDither,
  GLSL_radialGradient,
} from 'kedan';

const fragmentShader = /*glsl*/ `
uniform bool uDither;
uniform float uAspect;
uniform float uRadius;
uniform vec2 uOrigin;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

${GLSL_radialGradient}
${GLSL_bayerDither}

void main() {
  const vec2 origin = vec2(0.5, 0.5);
  vec3 color = radialGradient(origin, vUv, uColor1, uColor2, uRadius, uAspect);
  
  color = (uDither) ? bayerDither(color) : color;

  gl_FragColor = vec4(color, 1.0);
}
`;

class RadialGradientBackground extends Background {
  constructor({
    color1 = 0xffffff,
    color2 = 0x000000,
    dither = true,
    origin = { x: 0.5, y: 0.5 },
    radius = 1,
  } = {}) {
    super({
      fragmentShader,
      uniforms: {
        uAspect: new Uniform(1),
        uColor1: new Uniform(new Color(color1)),
        uColor2: new Uniform(new Color(color2)),
        uDither: new Uniform(dither),
        uOrigin: new Uniform(getVector3(origin)),
        uRadius: new Uniform(radius),
      },
    });

    this._radius = radius;
    this.aspect = window.innerWidth / window.innerHeight;
  }

  updateRadius() {
    this.material.uniforms.uRadius.value = this.radius * this.aspectCorrection;
  }

  /*---------------------------------------------------------------------------/
		Getters & Setters
	/---------------------------------------------------------------------------*/

  get aspect() {
    return this.material.uniforms.uAspect.value;
  }

  set aspect(number) {
    this.material.uniforms.uAspect.value = number;

    const min = 0.618;
    const max = 1.618;
    this.aspectCorrection = MathUtils.clamp(min / number, min, max);
    this.updateRadius();
  }

  get dither() {
    return this.material.uniforms.uDither.value;
  }

  set dither(boolean) {
    this.material.uniforms.uDither.value = boolean;
  }

  get radius() {
    return this._radius;
  }

  set radius(number) {
    this._radius = number;
    this.updateRadius();
  }

  /*---------------------------------------------------------------------------/
		Read-only
	/---------------------------------------------------------------------------*/

  get color1() {
    return this.material.uniforms.uColor1.value;
  }

  get color2() {
    return this.material.uniforms.uColor2.value;
  }
}

export { RadialGradientBackground };
