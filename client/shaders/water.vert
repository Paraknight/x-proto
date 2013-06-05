#ifdef GL_ES
precision highp float;
#endif

uniform float time;

void main() {
	//v.y +=  sin(waveWidth * v.x + waveTime) * cos(waveWidth * v.y + waveTime) * waveHeight;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}