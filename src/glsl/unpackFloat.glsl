float unpackFloat(vec4 value) {
	float r = floor(value.r * 255.0 + 0.5);
	float g = floor(value.g * 255.0 + 0.5);
	float b = floor(value.b * 255.0 + 0.5);
	float a = floor(value.a * 255.0 + 0.5);

	float exponent = r - 127.0;
	float sign = 1.0 - mod(a, 2.0) * 2.0;
	float mantissa = float(r > 0.0) + g / 256.0 + b / 65536.0
		+ floor(a / 2.0) / 8388608.0;
	return sign * mantissa * exp2(exponent);
}