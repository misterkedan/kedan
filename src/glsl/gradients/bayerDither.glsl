/*
	https://en.wikipedia.org/wiki/Ordered_dithering

	Those are pre-computed values of bayer matrix numbers: 
	n => (n / 256) / 32 - (1 / 128)

	There are cleaner ways to implement this using arrays, but it doesn't work 
	on old devices (OpenGL ES < 3). This ternary fiesta looks silly but seems
	to be the most performant and compatible implementation.
*/
vec3 bayerDither(vec3 color) {
	int index = int(mod(gl_FragCoord.x - 0.5, 8.0)) + int(mod(gl_FragCoord.y - 0.5, 8.0) * 8.0);
	
	float dither = 0.00781;						        //  0
	dither = (index == 1) ? 0.01172 :	dither; // 32
	dither = (index == 2) ? 0.00879 :	dither; //  8
	dither = (index == 3) ? 0.0127  :	dither; // 40
	dither = (index == 4) ? 0.00806 :	dither; //  2
	dither = (index == 5) ? 0.01196 :	dither; // 34
	dither = (index == 6) ? 0.00903 :	dither; // 10
	dither = (index == 7) ? 0.01294 : dither; // 42

	dither = (index == 8) ? 0.01367  : dither; // 48
	dither = (index == 9) ? 0.00977  : dither; // 16
	dither = (index == 10) ? 0.01465 : dither; // 56
	dither = (index == 11) ? 0.01074 : dither; // 24
	dither = (index == 12) ? 0.01392 : dither; // 50
	dither = (index == 13) ? 0.01001 : dither; // 18
	dither = (index == 14) ? 0.01489 : dither; // 58
	dither = (index == 15) ? 0.01099 : dither; // 26
		
	dither = (index == 16) ? 0.00928 : dither; // 12
	dither = (index == 17) ? 0.01318 : dither; // 44
	dither = (index == 18) ? 0.0083  : dither; //  4
	dither = (index == 19) ? 0.01221 : dither; // 36
	dither = (index == 20) ? 0.00952 : dither; // 14
	dither = (index == 21) ? 0.01367 : dither; // 46
	dither = (index == 22) ? 0.00854 : dither; //  6
	dither = (index == 23) ? 0.01245 : dither; // 38
		
	dither = (index == 24) ? 0.01514 : dither; // 60
	dither = (index == 25) ? 0.01123 : dither; // 28
	dither = (index == 26) ? 0.01416 : dither; // 52
	dither = (index == 27) ? 0.01025 : dither; // 20
	dither = (index == 28) ? 0.01538 : dither; // 62
	dither = (index == 29) ? 0.01147 : dither; // 30
	dither = (index == 30) ? 0.0144  : dither; // 54
	dither = (index == 31) ? 0.0105  : dither; // 22
	
	dither = (index == 32) ? 0.00818 : dither; //  3
	dither = (index == 33) ? 0.01208 : dither; // 35
	dither = (index == 34) ? 0.00916 : dither; // 11
	dither = (index == 35) ? 0.01306 : dither; // 43
	dither = (index == 36) ? 0.00793 : dither; //  1
	dither = (index == 37) ? 0.01184 : dither; // 33
	dither = (index == 38) ? 0.00891 : dither; //  9
	dither = (index == 39) ? 0.01282 : dither; // 41

	dither = (index == 40) ? 0.01404 : dither; // 51
	dither = (index == 41) ? 0.01013 : dither; // 19
	dither = (index == 42) ? 0.01501 : dither; // 59
	dither = (index == 43) ? 0.01111 : dither; // 27
	dither = (index == 44) ? 0.01379 : dither; // 49
	dither = (index == 45) ? 0.00989 : dither; // 17
	dither = (index == 46) ? 0.01477 : dither; // 57
	dither = (index == 47) ? 0.01086 : dither; // 25
	
	dither = (index == 48) ? 0.00964 : dither; // 15
	dither = (index == 49) ? 0.01355 : dither; // 47
	dither = (index == 50) ? 0.00867 : dither; //  7
	dither = (index == 51) ? 0.01257 : dither; // 39
	dither = (index == 52) ? 0.0094  : dither; // 13
	dither = (index == 53) ? 0.01331 : dither; // 45
	dither = (index == 54) ? 0.00842 : dither; //  5
	dither = (index == 55) ? 0.01233 : dither; // 37
	
	dither = (index == 56) ? 0.0155  : dither; // 63
	dither = (index == 57) ? 0.0116  : dither; // 31
	dither = (index == 58) ? 0.01453 : dither; // 55
	dither = (index == 59) ? 0.01062 : dither; // 23
	dither = (index == 60) ? 0.01526 : dither; // 61
	dither = (index == 61) ? 0.01135 : dither; // 29
	dither = (index == 62) ? 0.01428 : dither; // 53
	dither = (index == 63) ? 0.01038 : dither; // 21

	return color - dither;
}