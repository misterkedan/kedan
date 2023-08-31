import { Color, Uniform, Vector2 } from 'three';
import {
  Background,
  getVector3,
  GLSL_bayerDither,
  GLSL_simplex3D,
} from 'kedan';

const fragmentShader = /*glsl*/ `
uniform bool uDither;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

uniform vec2 uStop1;
uniform vec2 uStop2;
uniform vec2 uStop3;
uniform vec2 uStop4;

uniform vec2 uNoiseScale;
uniform float uOffset;

varying vec2 vUv;

${GLSL_simplex3D}
${GLSL_bayerDither}

float getMix(float gradient, vec2 stopA, vec2 stopB) {
	return (gradient - stopA.y) / (stopB.x - stopA.y);
}

void main() {
	float n = 0.5 + 0.5 * simplex3D(
		vUv.x * uNoiseScale.x, 
		vUv.y * uNoiseScale.y, 
		uOffset
	);

	vec3 color = 
		(n < uStop1.y) ? uColor1 :
		(n < uStop2.x) ? mix(uColor1, uColor2, getMix(n, uStop1, uStop2)) :
		(n < uStop2.y) ? uColor2 :
		(n < uStop3.x) ? mix(uColor2, uColor3, getMix(n, uStop2, uStop3)) :
		(n < uStop3.y) ? uColor3 :
		(n < uStop4.x) ? mix(uColor3, uColor4, getMix(n, uStop3, uStop4)) :
		uColor4;

	color = (uDither) ? bayerDither(color) : color;

	gl_FragColor = vec4(color, 1.0);
}
`;

class SimplexGradientBackground extends Background {
  /**
   * Creates a full screen background gradient, mapping a normalized
   * simplex (0 to 1 instead of -1 to 1) to 2, 3 or 4 colors.
   *
   * Stops are ranges of flat color, similar to photoshop gradient color stops.
   * Inside a stop (between its x and y) = flat color
   * Outside stops = gradient between two closest stops
   *
   * Important: stops should be always sorted in increasing order (start of
   * stop2 should always be higher than end of stop1 etc) with no overlap.
   *
   * @param {Object} 	options
   * @param {Color} 	options.color1 	First color
   * @param {Color} 	options.color2 	Second color
   * @param {Color} 	options.color3 	Third color
   * @param {Color} 	options.color4 	Fourth color
   * @param {Vector2} options.stop1
   * Color stop associated with options.color1 (x=start, y=end)
   * @param {Vector2} options.stop2
   * Color stop associated with options.color2 (x=start, y=end)
   * @param {Vector2} options.stop3
   * Color stop associated with options.color3 (x=start, y=end)
   * @param {Vector2} options.stop4
   * Color stop associated with options.color4 (x=start, y=end)
   * @param {Vector2} options.noiseScale
   * Scale of the simplex, the smaller the smoother (xy = 2D axis)
   * @param {Number} 	options.offset
   * Moves the gradient around, can be used as a seed or as an animation progress
   */

  constructor({
    color1 = 0xff0000,
    color2 = 0x0000ff,
    color3, // 0x00ffff
    color4, // 0xffff00

    stop1,
    stop2,
    stop3,
    stop4,

    dither = true,
    noiseScale = 0.5,
  } = {}) {
    const uniforms = {
      uColor1: new Uniform(new Color(color1)),
      uColor2: new Uniform(new Color(color2)),
      uColor3: new Uniform(new Color(color3)),
      uColor4: new Uniform(new Color(color4)),

      uStop1: new Uniform(new Vector2().copy(getVector3(stop1))),
      uStop2: new Uniform(new Vector2().copy(getVector3(stop2))),
      uStop3: new Uniform(new Vector2().copy(getVector3(stop3))),
      uStop4: new Uniform(new Vector2().copy(getVector3(stop4))),

      uDither: new Uniform(dither),
      uNoiseScale: new Uniform(getVector3(noiseScale)),
      uOffset: new Uniform(0),
    };

    super({ fragmentShader, uniforms });

    this._aspect = window.innerWidth / window.innerHeight;
    this.noiseScale = noiseScale;

    if (!stop1 && !stop2 && !stop3 && !stop4) {
      const colorCount = color4 ? 4 : color3 ? 3 : 2;
      this.autoStops(colorCount);
    }
  }

  /**
   * Sets the color stops automatically for an even distribution of colors.
   * @param {Number} colorCount	Either 2, 3 or 4
   */
  autoStops(colorCount) {
    const { uStop1, uStop2, uStop3, uStop4 } = this.material.uniforms;
    const disabled = 1.1; // Gradient map from 0 to 1, 1.1 unreachable

    const presets = {
      2: () => {
        uStop1.value.set(0, 0);
        uStop2.value.set(1, 1);
        uStop3.value.set(disabled, disabled);
        uStop4.value.set(disabled, disabled);
      },

      3: () => {
        uStop1.value.set(0, 0);
        uStop2.value.set(0.5, 0.5);
        uStop3.value.set(1, 1);
        uStop4.value.set(disabled, disabled);
      },

      4: () => {
        uStop1.value.set(0, 0);
        uStop2.value.set(0.33, 0.33);
        uStop3.value.set(0.66, 0.66);
        uStop4.value.set(1, 1);
      },
    };

    const preset = presets[colorCount] || presets[2];
    preset();
  }

  /**
   * Adapts the noiseScale to the canvas aspect
   */
  updateNoiseScale() {
    this.material.uniforms.uNoiseScale.value
      .set(this._noiseScale * this._aspect, this._noiseScale)
      .divideScalar(Math.sqrt(this._aspect));
  }

  /*-------------------------------------------------------------------------/

		Getters & Setters

	/-------------------------------------------------------------------------*/

  get aspect() {
    return this._aspect;
  }

  set aspect(number) {
    this._aspect = number;
    this.updateNoiseScale();
  }

  get dither() {
    return this.material.uniforms.uDither.value;
  }

  set dither(boolean) {
    this.material.uniforms.uDither.value = boolean;
  }

  get noiseScale() {
    return this._noiseScale;
  }

  set noiseScale(number) {
    this._noiseScale = number;
    this.updateNoiseScale();
  }

  get offset() {
    return this.material.uniforms.uOffset.value;
  }

  set offset(value) {
    this.material.uniforms.uOffset.value = value;
  }

  /*-------------------------------------------------------------------------/

		Read-only

	/-------------------------------------------------------------------------*/

  get color1() {
    return this.material.uniforms.uColor1.value;
  }

  get color2() {
    return this.material.uniforms.uColor2.value;
  }

  get color3() {
    return this.material.uniforms.uColor3.value;
  }

  get color4() {
    return this.material.uniforms.uColor4.value;
  }
}

export { SimplexGradientBackground };
