vec4 packFloat(float value) {
	if (value == 0.0) return vec4(0.0, 0.0, 0.0, 0.0);

	float mag = abs(value);
	
	float exponent = floor(log2(mag));
	exponent += float(exp2(exponent) <= mag / 2.0);
	exponent -= float(exp2(exponent) > mag);

	float mantissa = (exponent > 100.0)
		? mag / 1024.0 / exp2(exponent - 10.0) - 1.0
		: mag / float(exp2(exponent)) - 1.0;

	float r = exponent + 127.0;
	mantissa *= 256.0;

	float g = floor(mantissa);
	mantissa -= g;
	mantissa *= 256.0;

	float b = floor(mantissa);
	mantissa -= b;
	mantissa *= 128.0;

	float a = floor(mantissa) * 2.0 + float(value < 0.0);

	return vec4(r, g, b, a) / 255.0;
}