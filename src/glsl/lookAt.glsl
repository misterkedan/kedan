// GLSL port of three.js Object3D.lookAt
mat4 lookAt(vec3 direction, vec3 up) {
	vec3 z = direction;
	z.z = (length(z) == 0.0) ? 1.0 : z.z;
	z = normalize(z);

	vec3 x = cross(up, z);
	x = (length(x) == 0.0) ? cross(up, z + vec3(0.0001)) : x;
	x = normalize(x);

	vec3 y = cross(z, x);

	return mat4(
		x.x, y.x, z.x, 0.0,
		x.y, y.y, z.y, 0.0,
		x.z, y.z, z.z, 0.0,
		0.0, 0.0, 0.0, 1.0
	);
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up) {
	vec3 z = eye - target;
	return lookAt(z, up);
}

// Simplified version of the above, assuming that we always use
// the default up vector, and the direction was computed beforehand
// for other purposes.
mat4 lookAt(vec3 direction) {
	const vec3 up = vec3(0.0, 1.0, 0.0);
	return lookAt(direction, up);
}