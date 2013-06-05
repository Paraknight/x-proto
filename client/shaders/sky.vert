#ifdef GL_ES
precision highp float;
#endif

//#define PI_2	1.5707963267948966192313216916398
//#define PI		3.1415926535897932384626433832795
//#define PI2		6.2831853071795864769252867665590

uniform float skyRadius;

//varying vec4 worldCoord;
varying vec2 skyUV;
//varying vec2 angles;

const vec2 fwd = vec2(0.0, -1.0);

void main() {
	//worldCoord = modelMatrix * vec4(position, 1.0);
	skyUV = vec2(1.0 - uv.s, uv.t);

	/*
	vec3 dir = position/skyRadius;

	angles.x = acos(-dir.z/(length(dir.xz)+0.0000001));
	if (dir.x < 0.0) angles.x = PI2 - angles.x;
	angles.x /= PI2;

	angles.y = (PI_2 - acos(dir.y/(length(dir)+0.0000001)))/PI_2;
	*/

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}