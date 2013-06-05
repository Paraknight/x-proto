GAME.namespace('shaders').sky = {
	uniforms : {
		skyRadius: { type: 'f', value: 1000.0 },
		time: { type: 'f', value: 0.0 },
		//lookVec: { type: 'v3', value: new THREE.Vector3(0, 0, -1) }
		//starCoords: { type: 'v2v', value: starCoords },
		//starSizes: { type: 'fv1', value: starSizes }
		//starMap: { type: 't', value: THREE.ImageUtils.loadTexture( './images/starmap.png' ) }
	},

	// TODO: Hardcode shader source code in.

	vertexShader: GAME.utils.xhrSyncGet('./shaders/sky.vert'),

	fragmentShader: GAME.utils.xhrSyncGet('./shaders/sky.frag')

};

/*
GAME.shaders.water = {
	uniforms : {
		skyRadius: { type: 'f', value: 1000.0 },
		time: { type: 'f', value: 0.0 },
		//lookVec: { type: 'v3', value: new THREE.Vector3(0, 0, -1) }
		//starCoords: { type: 'v2v', value: starCoords },
		//starSizes: { type: 'fv1', value: starSizes }
		//starMap: { type: 't', value: THREE.ImageUtils.loadTexture( './images/starmap.png' ) }
	},

	// TODO: Hardcode shader source code in.

	vertexShader: GAME.utils.xhrSyncGet('./shaders/water.vert'),

	fragmentShader: GAME.utils.xhrSyncGet('./shaders/water.frag')

};
*/

GAME.shaders.terrain = {
	uniforms: {
		'diffuse' : { type: 'c', value: new THREE.Color( 0xeeeeee ) },
		'opacity' : { type: 'f', value: 1.0 },

		'map' : { type: 't', value: null },
		'offsetRepeat' : { type: 'v4', value: new THREE.Vector4( 0, 0, 1, 1 ) },

		'lightMap' : { type: 't', value: null },
		'specularMap' : { type: 't', value: null },

		'envMap' : { type: 't', value: null },
		'flipEnvMap' : { type: 'f', value: -1 },
		'useRefract' : { type: 'i', value: 0 },
		'reflectivity' : { type: 'f', value: 1.0 },
		'refractionRatio' : { type: 'f', value: 0.98 },
		'combine' : { type: 'i', value: 0 },

		'morphTargetInfluences' : { type: 'f', value: 0 },


		'bumpMap' : { type: 't', value: null },
		'bumpScale' : { type: 'f', value: 1 },


		'normalMap' : { type: 't', value: null },
		'normalScale' : { type: 'v2', value: new THREE.Vector2( 1, 1 ) },


		'fogDensity' : { type: 'f', value: 0.00025 },
		'fogNear' : { type: 'f', value: 1 },
		'fogFar' : { type: 'f', value: 2000 },
		'fogColor' : { type: 'c', value: new THREE.Color( 0xffffff ) },


		'ambientLightColor' : { type: 'fv', value: [] },

		'directionalLightDirection' : { type: 'fv', value: [] },
		'directionalLightColor' : { type: 'fv', value: [] },

		'hemisphereLightDirection' : { type: 'fv', value: [] },
		'hemisphereLightSkyColor' : { type: 'fv', value: [] },
		'hemisphereLightGroundColor' : { type: 'fv', value: [] },

		'pointLightColor' : { type: 'fv', value: [] },
		'pointLightPosition' : { type: 'fv', value: [] },
		'pointLightDistance' : { type: 'fv1', value: [] },

		'spotLightColor' : { type: 'fv', value: [] },
		'spotLightPosition' : { type: 'fv', value: [] },
		'spotLightDirection' : { type: 'fv', value: [] },
		'spotLightDistance' : { type: 'fv1', value: [] },
		'spotLightAngleCos' : { type: 'fv1', value: [] },
		'spotLightExponent' : { type: 'fv1', value: [] },


		'shadowMap': { type: 'tv', value: [] },
		'shadowMapSize': { type: 'v2v', value: [] },

		'shadowBias' : { type: 'fv1', value: [] },
		'shadowDarkness': { type: 'fv1', value: [] },

		'shadowMatrix' : { type: 'm4v', value: [] },


		'ambient'  : { type: 'c', value: new THREE.Color( 0xffffff ) },
		'emissive' : { type: 'c', value: new THREE.Color( 0x000000 ) },
		'specular' : { type: 'c', value: new THREE.Color( 0x111111 ) },
		'shininess': { type: 'f', value: 30 },
		'wrapRGB'  : { type: 'v3', value: new THREE.Vector3( 1, 1, 1 ) },


		'terrainHeight': { type: 'f', value: 64.0 },
		'texture0': { type: 't', value: THREE.ImageUtils.loadTexture('./images/tempsand.png', undefined, function(texture){
			texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
		}) },
		'texture1': { type: 't', value: THREE.ImageUtils.loadTexture('./images/grassdark.png', undefined, function(texture){
			texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
		}) },
		'tex0Scale': { type: 'f', value: 2.0 },
		'tex1Scale': { type: 'f', value: 4.0 },
	},

	vertexShader: [
		'#define PHONG',

		'varying vec3 vViewPosition;',
		'varying vec3 vNormal;',
		'varying vec4 worldCoord;',

		THREE.ShaderChunk['map_pars_vertex'],
		THREE.ShaderChunk['lightmap_pars_vertex'],
		THREE.ShaderChunk['envmap_pars_vertex'],
		THREE.ShaderChunk['lights_phong_pars_vertex'],
		THREE.ShaderChunk['color_pars_vertex'],
		THREE.ShaderChunk['morphtarget_pars_vertex'],
		THREE.ShaderChunk['skinning_pars_vertex'],
		THREE.ShaderChunk['shadowmap_pars_vertex'],

		'void main() {',
			'worldCoord = modelMatrix * vec4(position, 1.0);',
			THREE.ShaderChunk['map_vertex'],
			THREE.ShaderChunk['lightmap_vertex'],
			THREE.ShaderChunk['color_vertex'],

			THREE.ShaderChunk['morphnormal_vertex'],
			THREE.ShaderChunk['skinbase_vertex'],
			THREE.ShaderChunk['skinnormal_vertex'],
			THREE.ShaderChunk['defaultnormal_vertex'],

			'vNormal = normalize(transformedNormal);',

			THREE.ShaderChunk['morphtarget_vertex'],
			THREE.ShaderChunk['skinning_vertex'],
			THREE.ShaderChunk['default_vertex'],

			'vViewPosition = -mvPosition.xyz;',

			THREE.ShaderChunk['worldpos_vertex'],
			THREE.ShaderChunk['envmap_vertex'],
			THREE.ShaderChunk['lights_phong_vertex'],
			THREE.ShaderChunk['shadowmap_vertex'],
		'}'
	].join('\n'),

	fragmentShader: [
		'uniform vec3 diffuse;',
		'uniform float opacity;',

		'uniform vec3 ambient;',
		'uniform vec3 emissive;',
		'uniform vec3 specular;',
		'uniform float shininess;',


		'uniform int isDaytime;',
		'uniform float terrainHeight;',

		'uniform sampler2D texture0;',
		'uniform sampler2D texture1;',

		'uniform float tex0Scale;',
		'uniform float tex1Scale;',

		'varying vec4 worldCoord;',

		'const vec4 waterCol = vec4(0.5, 0.5, 0.0, 1.0);',
		'const vec4 sandCol = vec4(1.0, 1.0, 0.0, 1.0);',
		'const vec4 grassCol = vec4(0.0, 1.0, 0.0, 1.0);',
		'const vec4 forestCol = vec4(0.0, 0.5, 0.0, 1.0);',
		'const vec4 mountainCol = vec4(0.3, 0.25, 0.25, 1.0);',


		THREE.ShaderChunk['color_pars_fragment'],
		THREE.ShaderChunk['map_pars_fragment'],
		THREE.ShaderChunk['lightmap_pars_fragment'],
		THREE.ShaderChunk['envmap_pars_fragment'],
		THREE.ShaderChunk['fog_pars_fragment'],
		THREE.ShaderChunk['lights_phong_pars_fragment'],
		THREE.ShaderChunk['shadowmap_pars_fragment'],
		THREE.ShaderChunk['bumpmap_pars_fragment'],
		THREE.ShaderChunk['normalmap_pars_fragment'],
		THREE.ShaderChunk['specularmap_pars_fragment'],


		'vec2 calculateAlpha() {',
			'if (worldCoord.y < 0.245*64.0) {',
				'/* Sand */ ',
				'return vec2(1.0, 0.0);',
			'} else if (worldCoord.y < 0.255*64.0) {',
				'/* Sand-Grass */',
				'float fade = ((worldCoord.y/64.0)-0.245)*100.0;',
				'return vec2(1.0-fade, fade);',
			'} else {',
				'/* Grass */',
				'return vec2(0.0, 1.0);',
			'}',

			'//return vec2((64.0 - worldCoord.y)/64.0, worldCoord.y/64.0);',
		'}',

		'vec4 calculateColor() {',
			'if (worldCoord.y < 0.2*64.0) { //TODO: Scale as an attribute (check Water too).',
				'/* Water */',
				'return waterCol;',
			'} else if (worldCoord.y < 0.25*64.0) {',
				'/* Sand */',
				'return sandCol;',
			'} else if (worldCoord.y < 0.4*64.0) {',
				'/* Grass */',
				'return grassCol;',
			'} else if (worldCoord.y < 0.5*64.0) {',
				'/*Forest*/',
				'return forestCol;',
			'} else {',
				'/* Mountain */',
				'return mountainCol;',
			'}',
		'}',


		'void main() {',
			'if (worldCoord.y > 0.008 * 64.0) {',
				'vec2 alpha = calculateAlpha();',
				
				'gl_FragColor = vec4((alpha.x*texture2D(texture0, worldCoord.xz/tex0Scale)',
								'+ alpha.y*texture2D(texture1, worldCoord.xz/tex1Scale)).rgb, opacity);',
			'} else {',
				'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);',
			'}',

			THREE.ShaderChunk['map_fragment'],
			THREE.ShaderChunk['alphatest_fragment'],
			THREE.ShaderChunk['specularmap_fragment'],

			THREE.ShaderChunk['lights_phong_fragment'],

			THREE.ShaderChunk['lightmap_fragment'],
			THREE.ShaderChunk['color_fragment'],
			THREE.ShaderChunk['envmap_fragment'],
			THREE.ShaderChunk['shadowmap_fragment'],

			THREE.ShaderChunk['linear_to_gamma_fragment'],

			THREE.ShaderChunk['fog_fragment'],
		'}'
	].join('\n')

};