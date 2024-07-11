/**
 * Float-packed three.js GPGPU
 *
 * Based on:
 * https://threejs.org/examples/?q=gpgpu#webgl_gpgpu_birds
 * https://github.com/mrdoob/three.js/blob/dev/examples/jsm/misc/GPUComputationRenderer.js
 *
 * Basic usage :
 * GPGPU.init(renderer);
 * const gpgpu = new GPGPU(1337);
 * gpgpu.addVariable(name, options); // See GPGPUVariable for options
 * gpgpu.addConstant(name, data);
 */

import {
  Camera,
  ClampToEdgeWrapping,
  DataTexture,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  Mesh,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  UnsignedByteType,
  WebGLRenderTarget,
} from 'three';
import { forXYZ, GPGPUConstant, GPGPUVariable, logNameTaken } from 'kedan';

class GPGPU {
  /**
   * Creates a GPGPU object to regroup GPGPU variables and constants.
   * @param {Object} options Option object, containing either a count or
   * a texture size.
   * @param {Number} options.count Total number of objects to be computed
   * (the required texture size will be computed automatically).
   * @param {Number} options.textureSize A texture size (power of 2) that will
   * be applied by default to all constants/variables assigned to this instance.
   * One pixel can store one value, so for example a texture size of 64px will
   * allow the computation of 64 x 64 = 4094 values.
   */
  constructor({ count, textureSize = 512 } = {}) {
    this._textureSize = count ? GPGPU.getTextureSize(count) : textureSize;
    this.constants = {};
    this.variables = {};
  }

  /**
   * Adds a GPGPUConstant.
   * The constant will be accessible via instance.constants.name.
   * The constant's output (texture uniform) will be accessible via instance.name.
   * @param {String} name A constant name, must be unique per instance.
   * @param {Array|ShaderMaterial|String} input Can be either an array
   * of numbers to encode in texture form, a ShaderMaterial to render once,
   * or a fragment shader as a String.
   * @param {Object} options GPGPUConstant options.
   * @returns {GPGPUConstant} The created GPGPUConstant.
   */
  addConstant(name, input, options) {
    if (this.constants[name] || this[name]) return logNameTaken(name);

    const { textureSize } = this;
    const constant = new GPGPUConstant(input, {
      ...options,
      name,
      textureSize,
    });
    this.constants[name] = constant;
    this[name] = constant.output;

    return constant;
  }

  /**
   * Adds a GPGPUVariable.
   * The variable will be accessible via instance.variables.name.
   * The variable's output (texture uniform) will be accessible via instance.name.
   * @param {String} name A variable name, must be unique per instance.
   * @param {Object} options GPGPUVariable options.
   * @returns {GPGPUVariable} The created GPGPUVariable.
   */
  addVariable(name, options) {
    if (this.variables[name] || this[name]) return logNameTaken(name);

    const { textureSize } = this;
    const variable = new GPGPUVariable({
      ...options,
      name,
      textureSize,
    });
    this.variables[name] = variable;
    this[name] = variable.output;

    return variable;
  }

  /**
   * Assign one of this instance's constant/variable texture uniform output
   * to another variable's uniforms. This allows to read the data in the shader
   * of the target variable.
   * Use the same names provided by addVariable(name) and addConstant(name).
   * Can assign multiple sources at once, for example assign('x', 'y', 'z')
   * will assign both y and z to x.
   * @param {String} targetKey The name of one of this GPGPU instance's
   * variables, that will be assigned the uniforms.
   * @param {String} sourceKeys One or more of this GPGPU instance's
   * constant or variables, which outputs will be assigned to the target
   * variable.
   */
  assign(targetKey, ...sourceKeys) {
    const target = this.variables[targetKey];
    if (!target) return console.warn('Target not found:', targetKey);

    sourceKeys.forEach((sourceKey) => {
      const source = this.variables[sourceKey] || this.constants[sourceKey];

      if (source) target.uniforms[source.name] = source.output;
      else console.warn('Source not found:', sourceKey);
    });
  }

  /**
   * Assign x, y and z variables to each other (requires having those defined
   * first). This is helpful in a lot of situations, since GPGPU is commonly
   * used to compute particles positions, motion etc.
   */
  assignXYZ() {
    const x = 'x';
    const y = 'y';
    const z = 'z';
    this.assign(x, y, z);
    this.assign(y, x, z);
    this.assign(z, x, y);
  }

  /**
   * Creates x y and z variables, and optionally assigns them to each other.
   * @param {Object} options Shared GPGPUVariable options.
   * @param {Boolean} autoAssign Whether to call assignXYZ (default: true).
   */
  addXYZ(options, autoAssign = true) {
    forXYZ((variable) => this.addVariable(variable, options));
    if (autoAssign) this.assignXYZ();
  }

  /**
   * Calls GPGPU.createTexelAttribute with this instance's textureSize.
   * @param {Object} options Options object.
   * @param {BufferGeometry} options.geometry A geometry to automatically assign
   * the attribute to.
   * @param {Number} options.count The amount of items to compute. By default, it
   * will equal the texture size squared of the GPGPU instance, and it can't
   * exceed this value.
   * @param {String} options.name The name of the vec2 attribute to declare in
   * the final material (default: GPGPU_texel).
   * @param {Boolean} options.instanced Whether to build an InstancedBufferAttribute.
   * If false, the function will build a Float32BufferAttribute (default: false).
   * @param {Number} options.vertices The number of vertices to assign a single
   * GPGPU texel to. Ex: 1 for particles, 24 for BoxGeometry instances etc
   * (default: 1).
   * @returns {InstancedBufferAttribute, Float32BufferAttribute} The created
   * attribute, depending on the instanced option.
   */
  createTexelAttribute({ geometry, count, name, instanced, vertices } = {}) {
    const { textureSize } = this;

    return GPGPU.createTexelAttribute({
      geometry,
      count,
      textureSize,
      name,
      instanced,
      vertices,
    });
  }

  /*---------------------------------------------------------------------------/
		Batch utilities
	/---------------------------------------------------------------------------*/

  /**
   * Executes a function for each of this instance's constants.
   * @param {Function} func A function to execute for every constant.
   */
  forEachConstant(func) {
    Object.values(this.constants).forEach(func);
  }

  /**
   * Executes a function for each of this instance's variable.
   * @param {Function} func A function to execute for every variable.
   */
  forEachVariable(func) {
    Object.values(this.variables).forEach(func);
  }

  /**
   * Executes a function for each of this instance's constants & variable.
   * @param {Function} func A function to execute for every constant & variable.
   */
  forEach(func) {
    Object.values(this.constants).forEach(func);
    Object.values(this.variables).forEach(func);
  }

  /**
   * Adds all constants & variables texture output uniforms to a target uniform
   * object. This is useful for adding GPGPU textures to the final material
   * shaders.
   * @param {Object} uniforms The uniform object to add uniforms to.
   */
  bindTo(uniforms) {
    this.forEach((property) => (uniforms[property.name] = property.output));
  }

  /**
   * Disposes all ressources used by this instance and its constants and variables.
   * Textures, ShaderMaterials, WebGLRenderTargets...
   */
  dispose() {
    Object.entries(this).forEach(([key, value]) => {
      value.value?.dispose?.();
      value.dispose?.();
      this[key] = null;
    });

    this.constants = {};
    this.variables = {};
  }

  /**
   * Computes all variables.
   */
  tick() {
    this.forEachVariable((variable) => variable.compute());
  }

  /*---------------------------------------------------------------------------/
		Read-only
	/---------------------------------------------------------------------------*/

  get textureSize() {
    return this._textureSize;
  }
}

/*-----------------------------------------------------------------------------/
	Static
/-----------------------------------------------------------------------------*/

/**
 * Initiates the GPGPU class with a three.js renderer. This needs to be done
 * (once only) before creating any GPGPUVariable instance.
 * @param {WebGLRenderer}	renderer A WebGLRenderer instance.
 */
GPGPU.init = (renderer) => {
  if (GPGPU.renderer) return;

  GPGPU.renderer = renderer;

  const checkHardware = () => {
    GPGPU.isSupported = true;

    if (!GPGPU.renderer.capabilities.maxVertexTextures) {
      console.warn('No support for vertex textures');
      GPGPU.isSupported = false;
    }

    if (!GPGPU.isSupported) window.alert('Incompatible hardware');

    return GPGPU.isSupported;
  };

  if (!checkHardware()) return;

  GPGPU.renderer = renderer;
  GPGPU.scene = new Scene();
  GPGPU.camera = new Camera();
  GPGPU.mesh = new Mesh(new PlaneGeometry(2, 2));
  GPGPU.scene.add(GPGPU.mesh);
};

/**
 * Calculates the minimum power of two texture size required to compute
 * the specified number of elements.
 * Ex:
 * - 32x32 texture (1024 pixels total) for 1000 particules
 * - 64x64 texture (4096 pixels total) for 1100 particules
 * @param {Number} count The number of elements to compute.
 * @param {Number} maxSize The maximum size, in pixels (default: 65536).
 * @returns {Number} The texture size required, in pixels.
 */
GPGPU.getTextureSize = (count, maxSize = 65536) => {
  if (isNaN(count) || !isFinite(count) || !Number.isInteger(count) || count < 1)
    throw new RangeError('Count must be uint');

  let n = 1;
  let size = 2;
  while (size < maxSize && size * size < count) {
    size = Math.pow(2, n);
    n++;
  }

  return size;
};

/*-----------------------------------------------------------------------------/
	Static utils
/-----------------------------------------------------------------------------*/

/**
 * Creates a DataTexture for GPGPU use.
 * @param {Number} size A texture size (power of 2).
 * @returns {DataTexture}
 */
GPGPU.createDataTexture = (size) => {
  const dataTexture = new DataTexture(
    new Uint8Array(size * size * 4), // data
    size, // width
    size, // height
    RGBAFormat, // format
    UnsignedByteType // type
  );

  dataTexture.needsUpdate = true;

  return dataTexture;
};

/**
 * Creates a WebGLRenderTarget for GPGPU use.
 * @param {Number} size A texture size (power of 2).
 * @returns {WebGLRenderTarget}
 */
GPGPU.createRenderTarget = (size) =>
  new WebGLRenderTarget(
    size, // width
    size, // height
    {
      // options
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
      format: RGBAFormat,
      type: UnsignedByteType,
    }
  );

/**
 * Renders a ShaderMaterial on a WebGLRenderTarget once.
 * @param {ShaderMaterial} material A GPGPU ShaderMaterial.
 * @param {WebGLRenderTarget} renderTarget The WebGLRenderTarget to render on.
 */
GPGPU.render = (material, renderTarget) => {
  GPGPU.mesh.material = material;
  GPGPU.renderer.setRenderTarget(renderTarget);
  GPGPU.renderer.render(GPGPU.scene, GPGPU.camera);
  GPGPU.renderer.setRenderTarget(null);
};

/**
 * Sets the resolution definition to match a texture size.
 * @param {ShaderMaterial} material A GPGPU ShaderMaterial.
 * @param {Number} size A texture size (power of 2).
 */
GPGPU.setResolution = (material, size) => {
  const fixedSize = size.toFixed(1);
  material.defines.resolution = `vec2(${fixedSize}, ${fixedSize})`;
};

/**
 * Creates a BufferAttribute pointing towards a GPGPU texel. This is needed
 * to associate the final vertices to different values. Complex geometries
 * might require a custom function to build this attribute, but this method
 * will make the process much easier for particles, simple instanced geometries
 * etc.
 * @param {Object} options Options object.
 * @param {BufferGeometry} options.geometry A geometry to automatically assign
 * the attribute to.
 * @param {Number} options.count The amount of items to compute. By default, it
 * will equal textureSize squared, and it can't exceed this value.
 * @param {Number} options.textureSize The size of the GPGPU texture.
 * @param {String} options.name The name of the vec2 attribute to declare in
 * the final material (default: GPGPU_texel).
 * @param {Boolean} options.instanced Whether to build an InstancedBufferAttribute.
 * If false, the function will build a Float32BufferAttribute (default: false).
 * @param {Number} options.vertices The number of vertices to assign a single
 * GPGPU texel to. Ex: 1 for particles, 24 for BoxGeometry instances etc
 * (default: 1).
 * @returns {InstancedBufferAttribute, Float32BufferAttribute} The created
 * attribute, depending on the instanced option.
 */
GPGPU.createTexelAttribute = ({
  geometry,
  count,
  textureSize,
  name = 'GPGPU_texel',
  instanced = false,
  vertices = 1,
} = {}) => {
  const texelCount = textureSize * textureSize;
  count = count ? Math.min(count, texelCount) : texelCount;
  const length = count * vertices;
  const texels = new Float32Array(length * 2);

  for (let i = 0, j = 0; i < length; i++) {
    const s = (i % textureSize) / textureSize;
    const t = ~~(i / textureSize) / textureSize;

    for (let vertex = 0; vertex < vertices; vertex++) {
      texels[j++] = s;
      texels[j++] = t;
    }
  }

  const attribute = instanced
    ? new InstancedBufferAttribute(texels, 2)
    : new Float32BufferAttribute(texels, 2);
  if (geometry) geometry.setAttribute(name, attribute);

  return attribute;
};

export { GPGPU };
