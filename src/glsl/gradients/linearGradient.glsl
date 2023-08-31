vec3 linearGradient( vec2 origin, vec2 coord, vec3 color1, vec3 color2, float rotation) {
	vec2 diff = coord - origin;
	
	float radius = length(diff);
	float theta = atan(diff.y, diff.x);
	float value = origin.x + radius * cos(theta + rotation);

	return mix(color1, color2, value);
}