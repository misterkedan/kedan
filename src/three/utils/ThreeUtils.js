import {
  AdditiveBlending,
  Color,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
  Vector2,
  Vector3,
  Vector4,
  Uniform,
} from 'three';
import { is, trimFloat } from 'kedan';

/*-----------------------------------------------------------------------------/
  Shaders
/-----------------------------------------------------------------------------*/

export const getShaderBase = () => {
  return {
    blending: NormalBlending,
    transparent: true,
  };
};

export const editShader = (
  shader,
  { fragment, token, before, after, swap } = {}
) => {
  const key = fragment ? 'fragmentShader' : 'vertexShader';
  const newLine = '\n';
  let replacement = '';
  if (before) replacement += before + newLine;
  replacement += swap ? swap : token;
  if (after) replacement += newLine + after;
  shader[key] = shader[key].replace(token, replacement);
  return shader;
};

export const customizeShader = (
  shader,
  { vertexHead, vertexBody, fragmentHead, fragmentBody, debug = false } = {}
) => {
  // THREE tokens (r165)
  const head = '#include <common>';
  const beginVertex = '#include <begin_vertex>';
  const endFragment = '#include <logdepthbuf_fragment>';

  if (vertexHead)
    shader = editShader(shader, { token: head, after: vertexHead });
  if (vertexBody)
    shader = editShader(shader, { token: beginVertex, after: vertexBody });
  if (fragmentHead)
    shader = editShader(shader, {
      fragment: true,
      token: beginVertex,
      after: vertexBody,
    });
  if (fragmentBody)
    shader = editShader(shader, {
      fragment: true,
      token: endFragment,
      before: fragmentBody,
    });

  if (debug) {
    if (vertexHead || vertexBody) console.log(shader.vertexShader);
    if (fragmentHead || fragmentBody) console.log(shader.fragmentShader);
  }
  return shader;
};

/*-----------------------------------------------------------------------------/
  Uniforms
/-----------------------------------------------------------------------------*/

export const getVector = (input = 0, input2, input3, input4) => {
  const fill = input2?.fill || 0;
  let length = input2?.length || 3;

  const arrayToXYZW = (array) =>
    'xyzw'.split().reduce((object, key, index) => {
      object[key] = array[index] || fill;
      return object;
    }, {});
  const numberToXYZW = (number) =>
    Array.from({ length }).reduce((object, _value, index) => {
      object['xyzw'.charAt(index)] = number;
      return object;
    }, {});

  if (is.array(input)) input = arrayToXYZW(input);
  else if (is.number(input) && !is.number(input2)) input = numberToXYZW(input);
  else {
    input = { ...input };
    if (!input.w) {
      const isVector =
        input instanceof Vector2 ||
        input instanceof Vector3 ||
        input instanceof Vector4;
      if (!isVector) {
        const remainingKeys = Object.keys(input).filter(
          (key) => !'xyz'.includes(key)
        );
        if (remainingKeys.length) input.w = input[remainingKeys[0]];
      }
    }
  }

  if (is.number(input)) input = { x: input };
  if (is.number(input2)) input.y = input2;
  if (is.number(input3)) input.z = input3;
  if (is.number(input4)) input.w = input4;

  if (input.w) length = 4;
  else if (input.z) length = Math.max(3, length);
  else if (input.x && input.y && !length) length = 2;

  const x = is.number(input.x) ? input.x : fill;
  const y = is.number(input.y) ? input.y : fill;
  const z = is.number(input.z) ? input.z : length > 2 ? fill : undefined;
  const w = is.number(input.w) ? input.w : length > 3 ? fill : undefined;

  const callbacks = {
    2: () => new Vector2(x, y),
    3: () => new Vector3(x, y, z),
    4: () => new Vector4(x, y, z, w),
  };
  const callback = callbacks[length] || callbacks[3];
  const vector = callback();

  return vector;
};

export const getColor = (input = 0, input2, input3) => {
  if (input2 && input3) return new Color(input, input2, input3);
  if (input.color) return getColor(input.color);
  if (input.r || input.g || input.b) {
    input = { ...input };
    input.r = input.r || 0;
    input.g = input.g || 0;
    input.b = input.b || 0;
    const normalize = input.r > 1 || input.g > 1 || input.b > 1;
    const r = normalize ? input.r / 255 : input.r;
    const g = normalize ? input.g / 255 : input.g;
    const b = normalize ? input.b / 255 : input.b;
    return new Color(r, g, b);
  }
  return new Color(input);
};

export const getUniform = (input, input2, input3, input4) => {
  if (is.number(input) && !input2 && !input3 && !input4)
    return new Uniform(input);
  if (!input) return new Uniform(0);
  if (is.string(input) || input.color || input.r)
    return new Uniform(getColor(input));
  return new Uniform(getVector(input, input2, input3, input4));
};

/*-----------------------------------------------------------------------------/
	Float packing

	Functions to encode/decode 32 bit floating point numbers in RGBA8 texels.
 	This allows to store GPU computed data in basic textures, which is less
	convenient than float/half-float textures, but compatible with many more
	devices, especially mobiles.
/-----------------------------------------------------------------------------*/

export function packFloat(data, buffer) {
  if (!buffer) buffer = new Uint8Array(data.length * 4);

  let value, mag, exponent, exp2, mantissa, g, b;
  for (let i = 0, j = 0, l = data.length; i < l; i++) {
    value = data[i];

    if (value !== 0) {
      mag = Math.abs(value);

      exponent = Math.floor(Math.log2(mag));
      exp2 = Math.pow(2, exponent);
      exponent += exp2 <= mag / 2;
      exponent -= exp2 > mag;

      mantissa =
        exponent > 100
          ? mag / 1024 / Math.pow(2, exponent - 10) - 1
          : mag / exp2 - 1;

      buffer[j] = exponent + 127;
      mantissa *= 256;

      g = Math.floor(mantissa);
      buffer[j + 1] = g;
      mantissa = (mantissa - g) * 256;

      b = Math.floor(mantissa);
      buffer[j + 2] = b;
      mantissa = (mantissa - b) * 128;

      buffer[j + 3] = Math.floor(mantissa) * 2 + (value < 0);
    }

    j += 4;
  }

  return buffer;
}

export function unpackFloat(buffer, data) {
  if (!data) data = new Float32Array(buffer.length / 4);

  let r, g, b, a, exponent, sign, mantissa, float;
  for (let i = 0, j = 0, l = buffer.length; i < l; i += 4) {
    r = buffer[i];
    g = buffer[i + 1];
    b = buffer[i + 2];
    a = buffer[i + 3];

    exponent = r - 127;
    sign = 1 - (a % 2) * 2;
    mantissa = (r > 0.0) + g / 256 + b / 65536 + Math.floor(a / 2.0) / 8388608;

    float = sign * mantissa * Math.pow(2, exponent);

    data[j] = float;

    j++;
  }
}

/*-----------------------------------------------------------------------------/
  Deprecated
/-----------------------------------------------------------------------------*/

export const forXYZ = (fn) => ['x', 'y', 'z'].forEach((key) => fn(key));

export const getBlendingsList = ({
  none = true,
  normal = true,
  additive = true,
  substractive = true,
  multiply = true,
  custom = false,
} = {}) => {
  const list = {};
  if (none) list.none = NoBlending;
  if (normal) list.normal = NormalBlending;
  if (additive) list.additive = AdditiveBlending;
  if (substractive) list.subtractive = SubtractiveBlending;
  if (multiply) list.multiply = MultiplyBlending;
  if (custom) list.custom = CustomBlending;
  return list;
};

export const removeDuplicateVertices = (geometry, decimalPlaces = 4) => {
  const positions = geometry.attributes.position.array;
  const separator = '|';
  const stringVertices = [];

  for (let i = 0; i < positions.length; i += 3) {
    const x = trimFloat(positions[i], decimalPlaces);
    const y = trimFloat(positions[i + 1], decimalPlaces);
    const z = trimFloat(positions[i + 2], decimalPlaces);
    stringVertices.push([x, y, z].join(separator));
  }

  const deduped = Array.from(new Set(stringVertices));

  const output = deduped.reduce((array, stringVertex) => {
    const vertex = stringVertex.split(separator);
    vertex.forEach((position) => array.push(Number(position)));
    return array;
  }, []);

  return output;
};
