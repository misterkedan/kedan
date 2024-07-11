float loopFloat(float number, float minimum, float amplitude) {
	return minimum + mod(number - minimum, amplitude);
}