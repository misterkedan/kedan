import { ShaderMaterial, Vector2 } from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GLSL_basicVaryingUV_vertex, GLSL_bayerDither } from 'kedan';

const fragmentShader = /*glsl*/ `
uniform sampler2D tDiffuse;
uniform vec2 uOrigin;
uniform vec2 uResolution;
uniform float uStrength;
uniform bool uDither;
varying vec2 vUv;

${GLSL_bayerDither}

float random(vec3 scale, float seed){ 
  return fract(sin(
      dot(gl_FragCoord.xyz + seed, scale) 
  ) * 43758.5453 + seed);
}

void main() {

    vec2 uv = vUv;

    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 toCenter = uOrigin - vUv * uResolution;
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    for(float t=0.0; t <= 40.0; t++){
        float percent = (t + offset) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        vec4 blurSample = texture2D(
            tDiffuse, 
            vUv + toCenter * percent * uStrength / uResolution
        );
        blurSample.rgb *= blurSample.a;
        color += blurSample * weight;
        total += weight;
    }
    color /= total;

    color.xyz = (uDither) ? bayerDither(color.xyz) : color.xyz;

    gl_FragColor = color;

}
`;

class RadialBlurPass extends ShaderPass {
  constructor({
    origin = new Vector2(window.innerWidth / 2, window.innerHeight / 2),
    resolution = new Vector2(window.innerWidth, window.innerHeight),
    strength = 0.2,
    dither = true,
    enabled = true,
  } = {}) {
    super(
      new ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          uOrigin: { value: origin },
          uResolution: { value: resolution },
          uStrength: { value: strength },
          uDither: { value: dither },
        },
        vertexShader: GLSL_basicVaryingUV_vertex,
        fragmentShader,
      })
    );

    this.enabled = enabled;
  }

  setSize(width, height, devicePixelRatio = 1) {
    if (devicePixelRatio > 1) {
      width /= devicePixelRatio;
      height /= devicePixelRatio;
    }

    this.material.uniforms.uResolution.value.set(width, height);
    this.material.uniforms.uOrigin.value.set(width / 2, height / 2);
  }

  /*---------------------------------------------------------------------------/
		Getters & Setters
	/---------------------------------------------------------------------------*/

  get strength() {
    return this.material.uniforms.uStrength.value;
  }

  set strength(number) {
    this.material.uniforms.uStrength.value = number;
  }

  get dither() {
    return this.material.uniforms.uDither.value;
  }

  set dither(boolean) {
    this.material.uniforms.uDither.value = boolean;
  }

  get x() {
    return this.material.uniforms.uOrigin.value.x;
  }

  set x(number) {
    this.material.uniforms.uOrigin.value.x = number;
  }

  get y() {
    return this.material.uniforms.uOrigin.value.y;
  }

  set y(number) {
    this.material.uniforms.uOrigin.value.y = number;
  }
}

export { RadialBlurPass };
