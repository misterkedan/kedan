import { ShaderMaterial, Uniform, Vector2 } from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLSL_bayerDither } from 'kedan';

/**
 * Dither edit by Kedan
 *
 * Original UnrealBloomPass class from:
 * https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/UnrealBloomPass.js
 */

/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */

class BloomPass extends UnrealBloomPass {
  constructor({
    strength = 0.6,
    radius = 1.0,
    threshold = 0.3,
    dither = true,
    enabled = true,
  } = {}) {
    super(new Vector2(), strength, radius, threshold);

    this.compositeMaterial.uniforms.uDither = new Uniform(dither);
    this.enabled = enabled;
  }
  /*---------------------------------------------------------------------------/
		Overrides
	/---------------------------------------------------------------------------*/

  getCompositeMaterial(nMips) {
    return new ShaderMaterial({
      defines: {
        NUM_MIPS: nMips,
      },
      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        dirtTexture: { value: null },
        bloomStrength: { value: 1.0 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0.0 },
      },
      vertexShader: /*glsl*/ `
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
      fragmentShader: /*glsl*/ `
				varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform sampler2D dirtTexture;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];
				uniform bool uDither;

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				${GLSL_bayerDither}

				void main() {
					vec4 color = bloomStrength * (
						lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv)
					);

					color.rgb = (uDither) ? bayerDither(color.rgb) : color.rgb;

					gl_FragColor = color;
				}
			`,
    });
  }

  dispose() {
    super.dispose();

    Object.values(this).forEach((property) => property.dispose?.());
  }

  /*---------------------------------------------------------------------------/
		Getters & Setters
	/---------------------------------------------------------------------------*/

  get dither() {
    return this.compositeMaterial.uniforms.uDither.value;
  }

  set dither(boolean) {
    this.compositeMaterial.uniforms.uDither.value = boolean;
  }
}

export { BloomPass };
