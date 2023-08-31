import { ShaderMaterial, Uniform } from 'three';
import { packFloat, is, logInvalidArgument, GPGPU, GPGPUVariable } from 'kedan';

class GPGPUConstant {
  /**
   * Create a float-packed 8bit DataTexture, for values that will never
   * change (ex: starting positions).
   * @param {Array|ShaderMaterial|String} input Can be either an array
   * of numbers to encode in texture form, a ShaderMaterial to render once,
   * or a fragment shader as a String.
   * @param {Object} options Options object.
   * @param {String} options.name Name of the variable (default: 'data').
   * @param {String} options.prefix Prefix for the name of the variable
   * (default: 'GPGPU_').
   * @param {Number} options.textureSize A texture size (power of 2).
   * @param {Object} optinos.uniforms A uniform object (if input is a fragment
   * shader).
   */
  constructor(
    input,
    { name = 'data', prefix = 'GPGPU_', textureSize, uniforms = {} } = {}
  ) {
    this.name = prefix ? prefix + name : name;
    this.output = new Uniform();
    this._textureSize = textureSize;

    if (is.array(input)) {
      if (!textureSize) this._textureSize = GPGPU.getTextureSize(input.length);
      this.computeFromArray(input);
      return this;
    }

    if (is.string(input))
      input = new ShaderMaterial({
        uniforms,
        vertexShader: GPGPUVariable.vertexShader,
        fragmentShader: input,
      });

    if (input instanceof ShaderMaterial) this.computeFromMaterial(input);
    else logInvalidArgument(input);
  }

  /**
   * Sets this instance's output uniform to a float packed 8bit DataTexture.
   * @param {Array} array An array (typed or not) to encode.
   * @param {Number} textureSize A texture size (power of 2).
   */
  computeFromArray(array) {
    this.dispose();

    this.dataTexture = GPGPU.createDataTexture(this.textureSize);

    packFloat(array, this.dataTexture.image.data);

    this.output.value = this.dataTexture;
  }

  /**
   * Sets this instance's output uniform to a GPGPU computed texture.
   * @param {ShaderMaterial} shaderMaterial
   */
  computeFromMaterial(shaderMaterial) {
    this.dispose();

    GPGPU.setResolution(shaderMaterial, this.textureSize);
    this.shaderMaterial = shaderMaterial;

    this.renderTarget = GPGPU.createRenderTarget(this.textureSize);

    GPGPU.render(shaderMaterial, this.renderTarget);

    this.output.value = this.renderTarget.texture;
  }

  /**
   * Disposes all ressources used by this instance.
   */
  dispose() {
    this.dataTexture?.dispose?.();
    this.renderTarget?.dispose?.();
    this.shaderMaterial?.dispose?.();
  }

  /*-------------------------------------------------------------------------/

		Read-only

	/-------------------------------------------------------------------------*/

  get textureSize() {
    return this._textureSize;
  }
}

export { GPGPUConstant };
