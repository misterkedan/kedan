vec3 radialGradient(vec2 origin, vec2 coord, vec3 color1, vec3 color2,float radius,float aspect) {
	vec2 diff = coord - origin;
	diff.y /= aspect;
	
	float value = length(diff) / radius;

	return mix(color1, color2, value);
}