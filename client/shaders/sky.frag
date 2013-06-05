#ifdef GL_ES
precision highp float;
#endif

#define PI_2	1.5707963267948966192313216916398
#define PI2		6.2831853071795864769252867665590
#define BLNDEXP	0.4

//uniform mat4 modelViewMatrix;

uniform float time;

//varying vec4 worldCoord;

uniform sampler2D starMap;
varying vec2 skyUV;
//varying vec2 angles;

/*
float lerp(float x0, float x1, float mu) {
	return x0+(x1-x0)*mu;
}
*/

const vec4 BLACK		= vec4(0.0, 0.0, 0.0, 0.0);
const vec4 WHITE		= vec4(1.0, 1.0, 1.0, 1.0);
const vec4 SKY_BLUE		= vec4(0.5, 0.8, 1.0, 1.0);
const vec4 DARK_BLUE	= vec4(0.0, 0.0, 0.5, 1.0);
const vec4 BLACK_BLUE	= vec4(0.0, 0.0, 0.2, 1.0);
const vec4 DARK_ORANGE	= vec4(0.75, 0.4, 0.0, 1.0);

vec4 calcSkyCol() {
	vec4 col;
	float mu = skyUV.y<0.5?0.0:pow(((skyUV.y*2.0)-1.0), BLNDEXP);
	if (time < 0.1) {
		col = mix(mix(DARK_ORANGE, DARK_BLUE, mu), mix(WHITE, SKY_BLUE, mu), 10.0*time);
		col *= 0.5 * min(max(-cos(skyUV.x*PI2), 0.0) * cos(((skyUV.y*2.0)-1.0)*PI_2) + sin(10.0*time*PI_2), 1.0) + 0.5;
	} else if (time < 0.4) {
		col = mix(WHITE, SKY_BLUE, mu);
	} else if (time < 0.5) {
		col = mix(mix(WHITE, SKY_BLUE, mu), mix(DARK_ORANGE, DARK_BLUE, mu), 10.0*time-4.0);
		col *= 0.5 * min(max(cos(skyUV.x*PI2), 0.0) * cos(((skyUV.y*2.0)-1.0)*PI_2) + cos((10.0*time-4.0)*PI_2), 1.0) + 0.5;
	} else if (time < 0.6) {
		col = mix(mix(DARK_ORANGE, DARK_BLUE, mu), mix(BLACK_BLUE, BLACK, mu), 10.0*time-5.0);
		col *= 0.5 * min(max(cos(skyUV.x*PI2), 0.0) * cos(((skyUV.y*2.0)-1.0)*PI_2) + sin((10.0*time-5.0)*PI_2), 1.0) + 0.5;
	} else if (time < 0.9) {
		col = mix(BLACK_BLUE, BLACK, mu);
	} else {
		col = mix(mix(BLACK_BLUE, BLACK, mu), mix(DARK_ORANGE, DARK_BLUE, mu), 10.0*time-9.0);
		col *= 0.5 * min(max(-cos(skyUV.x*PI2), 0.0) * cos(((skyUV.y*2.0)-1.0)*PI_2) + cos((10.0*time-9.0)*PI_2), 1.0) + 0.5;
	}
	return col;
}

void main() {
	gl_FragColor = calcSkyCol();
}