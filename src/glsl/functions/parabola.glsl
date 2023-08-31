float parabola(float x, float power) {
	// https://www.iquilezles.org/www/articles/functions/functions.htm
	return pow(4.0 * x * (1.0 - x), power);
}