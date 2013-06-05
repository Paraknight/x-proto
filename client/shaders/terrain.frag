#ifdef GL_ES
precision highp float;
#endif

uniform float terrainHeight;

uniform sampler2D texture0;
uniform sampler2D texture1;

uniform float tex0Scale;
uniform float tex1Scale;

varying vec4 worldCoord;

const vec4 waterCol = vec4(0.5, 0.5, 0.0, 1.0);
const vec4 sandCol = vec4(1.0, 1.0, 0.0, 1.0);
const vec4 grassCol = vec4(0.0, 1.0, 0.0, 1.0);
const vec4 forestCol = vec4(0.0, 0.5, 0.0, 1.0);
const vec4 mountainCol = vec4(0.3, 0.25, 0.25, 1.0);

vec2 calculateAlpha() {
	if (worldCoord.y < 0.245*64.0) {
		/* Sand */ 
		return vec2(1.0, 0.0);
	} else if (worldCoord.y < 0.255*64.0) {
		/* Sand-Grass */
		float fade = ((worldCoord.y/64.0)-0.245)*100.0;
		return vec2(1.0-fade, fade);
	} else {
		/* Grass */
		return vec2(0.0, 1.0);
	}

	//return vec2((64.0 - worldCoord.y)/64.0, worldCoord.y/64.0);
}

vec4 calculateColor() {
	if (worldCoord.y < 0.2*64.0) { //TODO: Scale as an attribute (check Water too).
		/* Water */
		return waterCol;
	} else if (worldCoord.y < 0.25*64.0) {
		/* Sand */
		return sandCol;
	} else if (worldCoord.y < 0.4*64.0) {
		/* Grass */
		return grassCol;
	} else if (worldCoord.y < 0.5*64.0) {
		/*Forest*/
		return forestCol;
	} else {
		/* Mountain */
		return mountainCol;
	}
}

void main() {
	if (worldCoord.y > 0.008 * 64.0) {
		vec2 alpha = calculateAlpha();
		
		gl_FragColor = vec4((alpha.x*texture2D(texture0,  worldCoord.xz/tex0Scale/*(gl_TexCoord[0].st)/tex0Scale*/)
						+ alpha.y*texture2D(texture1,  worldCoord.xz/tex1Scale/*(gl_TexCoord[0].st)/tex1Scale*/)).rgb, 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}