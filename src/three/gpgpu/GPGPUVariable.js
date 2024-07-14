import { ShaderMaterial, Uniform } from 'three';
import {
  Disposable,
  GPGPU,
  GLSL_packFloat,
  GLSL_unpackFloat,
  packFloat,
  unpackFloat,
  is,
} from 'kedan';

class GPGPUVariable extends Disposable {
  /**
   * Creates a variable for a set of data (ex: position x of a set of vertices).
   * This variable will be encoded into an 8 bit texture using float packing,
   * for maximum compatibility, and computed in a fragment shader to force
   * computations on the GPU. The output texture can then be used as a uniform
   * sampler2D in another shader, allowing for variable data sets.
   *
   * @param {Object} options Option object.
   * @param {Number} options.length The length of the data set.
   * This will be overridden by options.data.length, and if a textureSize is
   * defined it will be replaced by textureSize squared (default: 256*256).
   * @param {Array}  options.data The starting data.
   * @param {Number} options.textureSize The texture size of the DataTexture.
   * This is not required, but can be set manually to avoid recomputing the
   * texture size several times.
   * @param {String} options.name Name of the variable (default: 'data').
   * @param {String} options.prefix Prefix for the name of the variable
   * (default: 'GPGPU_').
   * @param {Number} options.defaultValue Value to default the data to if
   * the input is a length.
   * @param {String} options.uniforms Uniforms used by the fragmentShader.
   * Note that an uniform will be created automatically, using the prefix+name
   * of the variable, for the data texture current value.
   * @param {String} options.shader The fragmentShader that will be used
   * for GPGPU computations. See GPGPU.fragmentShader for an example/template.
   * @param {String} options.init A fragmentShader that will be ran just
   * once to fill the data texture
   */
  constructor({
    data,
    defaultValue,
    textureSize,
    length = 65536, // 256 x 256
    name = 'data',
    prefix = 'GPGPU_',
    uniforms = {},
    shader = GPGPUVariable.fragmentShader,
    init,
  } = {}) {
    super();

    if (!GPGPU.renderer)
      throw new Error('Use GPGPU.init(renderer) before instancing.');

    // Length & texture size
    if (data) length = data.length;
    else if (textureSize) length = textureSize * textureSize;
    if (!textureSize) textureSize = GPGPU.getTextureSize(length);
    this.textureSize = textureSize;

    // RenderTarget x2
    this.rt1 = GPGPU.createRenderTarget(textureSize);
    this.rt2 = GPGPU.createRenderTarget(textureSize);
    this.renderTarget = this.rt1;

    // DataTexture
    this.dataTexture = GPGPU.createDataTexture(textureSize);
    if (data) {
      this.write(data);
    } else {
      data = this.createDataArray(defaultValue);
      if (defaultValue) this.write(data);
    }

    // Uniforms
    this.output = new Uniform(this.dataTexture);
    this.name = prefix ? prefix + name : name;
    this.uniforms = uniforms;
    this.uniforms[this.name] = this.output;

    // ShaderMaterial
    this.setShader(shader);

    // Init
    if (init) this.computeOnce(init);
  }

  /**
   * Sets this instance's GPGPU shader.
   * @param {String} fragmentShader The GPGPU shader to use.
   */
  setShader(fragmentShader) {
    if (this.material) this.material.dispose();
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: GPGPUVariable.vertexShader,
      fragmentShader,
    });
    GPGPU.setResolution(this.material, this.textureSize);
  }

  /**
   * Process the data in the fragment shader. The result can then be accessed
   * via this.output. Can specify another material, which can be useful to
   * reset the data, for example.
   * @param {ShaderMaterial} material The GPGPU material to compute.
   */
  compute(material = this.material) {
    // Toggling between 2 RenderTargets is required to avoid
    // a framebuffer feedback loop
    this.renderTarget = this.renderTarget === this.rt1 ? this.rt2 : this.rt1;

    GPGPU.render(material, this.renderTarget);
    this.output.value = this.renderTarget.texture;
  }

  /**
   * Computes new values once, using a GPGPU shader or ShaderMaterial.
   * This can be useful for reseting or randomizing values.
   * @param {String|ShaderMaterial} input Either a GPGPU fragment shader as
   * a string, or a premade GPGPU ShaderMaterial.
   * @param {Object} options Options object.
   * @param {Object} options.uniforms	Uniforms used by the shader.
   * @param {Boolean} options.disposeAfter Whether to dispose of the GPGPU
   * ShaderMaterial after computing (default: true).
   * @returns {ShaderMaterial} The used/modified ShaderMaterial.
   */
  computeOnce(input, { uniforms = {}, disposeAfter = true } = {}) {
    if (input instanceof ShaderMaterial === true)
      Object.assign(input.uniforms, uniforms);
    else if (is.string(input))
      input = new ShaderMaterial({
        uniforms,
        vertexShader: GPGPUVariable.vertexShader,
        fragmentShader: input,
      });
    else return logInvalidArgument(input);

    GPGPU.setResolution(input, this.textureSize);
    this.compute(input);
    if (disposeAfter) input.dispose();
  }

  /*-------------------------------------------------------------------------/
		Utils
	/-------------------------------------------------------------------------*/

  /**
   * Creates a data array for this variable.
   * @param {Number} fill A number to fill the data array with.
   * If no value is provided, all numbers will default to 0.
   * @returns {Array} An array of numbers.
   */
  createDataArray(fill) {
    const array = new Float32Array(this.textureSize * this.textureSize);
    if (fill) array.fill(fill);
    return array;
  }

  /**
   * Returns an array with the unpacked current values.
   * Note that this is slow and intended for debugging only.
   * @returns {Array} The current data.
   */
  read() {
    GPGPU.renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.textureSize,
      this.textureSize,
      this.buffer
    );
    const data = this.createDataArray();
    unpackFloat(this.buffer, data);
    return data;
  }

  /**
   * Encode numeric data in this instance's DataTexture.
   * @param {Array} data An array of numbers to encode.
   */
  write(data) {
    packFloat(data, this.buffer);
  }

  /*---------------------------------------------------------------------------/
		Read-only
	/---------------------------------------------------------------------------*/

  get buffer() {
    return this.dataTexture.image.data;
  }
}

/*-----------------------------------------------------------------------------/
	Shaders
/-----------------------------------------------------------------------------*/

GPGPUVariable.vertexShader = /*glsl*/ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

GPGPUVariable.fragmentShader = /*glsl*/ `
uniform sampler2D GPGPU_data;

${GLSL_unpackFloat}
${GLSL_packFloat}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float data = unpackFloat(texture2D(GPGPU_data, uv));

  // Modify data here...

  gl_FragColor = packFloat(data);
}
`;

export { GPGPUVariable };
