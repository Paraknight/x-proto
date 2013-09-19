GAME.utils.noise = {
	perlin2D: function (seed, x, y) {
		var gain = 0.25;//0.707106781;
		var octaves = 6;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			var frequency = Math.pow(2, i)/20.0;
			var amplitude = Math.pow(gain, i);
			total += GAME.utils.noise.biLerpedSmoothNoise(seed, x*frequency, y*frequency)*amplitude;
		}
		return total;
	},

	perlin3D: function (seed, x, y, z) {
		var gain = 0.25;//0.707106781;
		var octaves = 4;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			var frequency = Math.pow(2, i);
			var amplitude = Math.pow(gain, i);
			total += GAME.utils.noise.triLerpedSmoothNoise(seed, x*frequency, y*frequency, z*frequency)*amplitude;
		}
		return total;
	},

	fBm: function (seed, x, y, z) {
		var gain = 0.5;
		var lacunarity = 2;
		var frequency = 1.0;
		var amplitude = 10;
		var octaves = 4;
		var total = 0;
		for (var i = 0; i < octaves; i++) {
			total += GAME.utils.noise.triLerpedSmoothNoise(seed, x*frequency, y*frequency, z*frequency)*amplitude;
			frequency *= lacunarity;
			amplitude *= gain;
		}
		return total;
	},

	biLerpedSmoothNoise: function (seed, x, y) {
		var xi = Math.floor(x);
		var yi = Math.floor(y);
		var muX = x-xi;
		var muY = y-yi;
		var context = GAME.utils.noise;
		return context.biLerp(context.smooth2D(seed, xi, yi), context.smooth2D(seed, xi+1, yi), context.smooth2D(seed, xi, yi+1), context.smooth2D(seed, xi+1, yi+1), muX, muY);
	},

	triLerpedSmoothNoise: function (seed, x, y, z) {
		var xi = Math.floor(x);
		var yi = Math.floor(y);
		var zi = Math.floor(z);
		var muX = x-xi;
		var muY = y-yi;
		var muZ = z-zi;
		var context = GAME.utils.noise;
		return context.lerp(context.biLerp(context.smooth3D(seed, xi, yi, zi), context.smooth3D(seed, xi+1, yi, zi), context.smooth3D(seed, xi, yi+1, zi), context.smooth3D(seed, xi+1, yi+1, zi), muX, muY),
				context.biLerp(context.smooth3D(seed, xi, yi, zi+1), context.smooth3D(seed, xi+1, yi, zi+1), context.smooth3D(seed, xi, yi+1, zi+1), context.smooth3D(seed, xi+1, yi+1, zi+1), muX, muY), muZ);
	},

	triLerp: function (cs, muX, muY, muZ) {
		var context = GAME.utils.noise;
		return context.lerp(context.biLerp(cs[0][0][0], cs[1][0][0], cs[0][1][0], cs[1][1][0], muX, muY),
				context.biLerp(cs[0][0][1], cs[1][0][1], cs[0][1][1], cs[1][1][1], muX, muY), muZ);
	},

	biLerp: function (c00, c10, c01, c11, muX, muY) {
		var context = GAME.utils.noise;
		return context.lerp(context.lerp(c00, c10, muX), context.lerp(c01, c11, muX), muY);
	},

	lerp: function (x0, x1, mu) {
		return x0+(x1-x0)*mu;
	},

	smooth2D: function (seed, x, y) {
		var context = GAME.utils.noise;
		var corners = (context.noise(seed,x-1,y-1,0)+context.noise(seed,x+1,y-1,0)+context.noise(seed,x-1,y+1,0)+context.noise(seed,x+1,y+1,0))/16;
		var sides = (context.noise(seed,x-1,y,0)+context.noise(seed,x+1,y,0)+context.noise(seed,x,y-1,0)+context.noise(seed,x,y+1,0))/8;
		return corners + sides + context.noise(seed,x,y,0)/4;
	},

	smooth3D: function (seed, x, y, z) {
		var context = GAME.utils.noise;
		var edges = (context.noise(seed,x-1,y-1,z)+context.noise(seed,x+1,y-1,z)+context.noise(seed,x-1,y+1,z)+context.noise(seed,x+1,y+1,z)
				+context.noise(seed,x,y-1,z-1)+context.noise(seed,x-1,y,z-1)+context.noise(seed,x+1,y,z-1)+context.noise(seed,x,y+1,z-1)
				+context.noise(seed,x,y-1,z+1)+context.noise(seed,x-1,y,z+1)+context.noise(seed,x+1,y,z+1)+context.noise(seed,x,y+1,z+1))/16;
		var corners = (context.noise(seed,x-1,y-1,z-1)+context.noise(seed,x+1,y-1,z-1)+context.noise(seed,x-1,y+1,z-1)+context.noise(seed,x+1,y+1,z-1)
				+context.noise(seed,x-1,y-1,z+1)+context.noise(seed,x+1,y-1,z+1)+context.noise(seed,x-1,y+1,z+1)+context.noise(seed,x+1,y+1,z+1))/32;
		var sides = (context.noise(seed,x,y-1,z)+context.noise(seed,x-1,y,z)+context.noise(seed,x+1,y,z)+context.noise(seed,x,y+1,z)+context.noise(seed,x,y,z-1)+context.noise(seed,x,y,z+1))/8;
		return edges + corners + sides + context.noise(seed,x,y,z)/4;
	},

	
	/**
	 * Generate a linearly congruent random number in the range [-1.0, 1.0) implicitly.
	 */
	// TODO: Design an thoroughly test a fast noise algorithm and investigate how fast % is vs &.
	noise: function (seed, x, y, z) {
		// FIXME: This would obviously create patterns very quickly.
		var n = x + y * 89 + z * 4173 + seed * 110133;
		n = (n >> 13) ^ n;
		return 1.0 - (((n * (n * n * 60493 + 19990303) + 1376312589) % 0x7FFFFFFF) / 1073741824.0);
		//return ((seed*717815713 ^ x* 862079717 ^ y*809893709 ^ z*743349007)&0x3FFFFFFF)/536870911 - 1;
	}
};