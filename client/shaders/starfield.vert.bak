#ifdef GL_ES
precision highp float;
#endif

//varying vec4 worldCoords;

void main() {
    //worldCoords = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}