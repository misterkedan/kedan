import {
  AdditiveBlending,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
  Vector3,
} from 'three';
import { is, trimFloat } from 'kedan';

export function customizeShader(
  shader,
  { vertexHead, vertexBody, fragmentHead, fragmentBody, debug = false } = {}
) {
  const NEW_LINE = '\n';
  const TAB = '\t';

  // THREE tokens (r137)
  const common = '#include <common>';
  const beginVertex = '#include <begin_vertex>';
  const logdepthbuf = '#include <logdepthbuf_fragment>';

  if (vertexHead)
    shader.vertexShader = shader.vertexShader.replace(
      common,
      common + NEW_LINE + vertexHead
    );

  if (vertexBody)
    shader.vertexShader = shader.vertexShader.replace(
      beginVertex,
      beginVertex + NEW_LINE + vertexBody
    );

  if (fragmentHead)
    shader.fragmentShader = shader.fragmentShader.replace(
      common,
      common + NEW_LINE + fragmentHead
    );

  if (fragmentBody)
    shader.fragmentShader = shader.fragmentShader.replace(
      logdepthbuf,
      fragmentBody + NEW_LINE + TAB + logdepthbuf
    );

  if (debug) {
    console.log(shader.vertexShader);
    console.log(shader.fragmentShader);
  }

  return shader;
}

export function forXYZ(func) {
  ['x', 'y', 'z'].forEach((key) => func(key));
}

export function getBlendingsList({
  includeNone = true,
  includeNormal = true,
  includeAdditive = true,
  includeSubtractive = true,
  includeMultiply = true,
  includeCustom = false,
} = {}) {
  const list = {};

  if (includeNone) list.none = NoBlending;
  if (includeNormal) list.normal = NormalBlending;
  if (includeAdditive) list.additive = AdditiveBlending;
  if (includeSubtractive) list.subtractive = SubtractiveBlending;
  if (includeMultiply) list.multiply = MultiplyBlending;
  if (includeCustom) list.custom = CustomBlending;

  return list;
}

export function getShaderBase() {
  return {
    blending: NormalBlending,
    transparent: true,
  };
}

export function getVector3(input, defaultValue = 0) {
  if (input instanceof Vector3) return input;

  if (is.number(input)) return new Vector3(input, input, input);

  if (is.array(input)) return new Vector3(input[0], input[1], input[2]);

  const x = is.number(input?.x) ? input.x : defaultValue;
  const y = is.number(input?.y) ? input.y : defaultValue;
  const z = is.number(input?.z) ? input.z : defaultValue;

  return new Vector3(x, y, z);
}

export function removeDuplicateVertices(geometry, decimalPlaces = 4) {
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
}

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
