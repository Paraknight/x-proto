#ifdef GL_ES
precision highp float;
#endif

varying vec4 worldCoord;

void main() {
	worldCoord = modelMatrix * vec4(position, 1.0);

	//gl_FrontColor = gl_Color;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}