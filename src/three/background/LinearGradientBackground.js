import { Color, MathUtils, Uniform } from 'three';
import { Background, GLSL_bayerDither, GLSL_linearGradient } from 'kedan';

const fragmentShader = /*glsl*/ `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform bool uDither;
uniform float uRotation;

varying vec2 vUv;

${GLSL_linearGradient}
${GLSL_bayerDither}

void main() {
  const vec2 origin = vec2(0.5, 0.5);
  vec3 color = linearGradient(origin, vUv, uColor1, uColor2, uRotation);
  
  color = (uDither) ? bayerDither(color) : color;

  gl_FragColor = vec4(color, 1.0);
}
`;

class LinearGradientBackground extends Background {
  constructor({
    color1 = 0xffffff,
    color2 = 0x000000,
    dither = true,
    angle = 90,
  } = {}) {
    super({
      fragmentShader,
      uniforms: {
        uColor1: new Uniform(new Color(color1)),
        uColor2: new Uniform(new Color(color2)),
        uDither: new Uniform(dither),
        uRotation: new Uniform(MathUtils.degToRad(angle)),
      },
    });
  }

  /*---------------------------------------------------------------------------/
    Getters & Setters
  /---------------------------------------------------------------------------*/

  get angle() {
    return MathUtils.radToDeg(this.material.uniforms.uRotation.value);
  }

  set angle(number) {
    this.material.uniforms.uRotation.value = MathUtils.degToRad(number);
  }

  get dither() {
    return this.material.uniforms.uDither.value;
  }

  set dither(boolean) {
    this.material.uniforms.uDither.value = boolean;
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

export { LinearGradientBackground };
