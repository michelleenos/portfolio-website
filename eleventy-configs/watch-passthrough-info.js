let watchTargets = [
	// './src/styles/**/*.scss',
	'./src/scripts',
	'./src/sketches/scripts/**/*.js',
	'./src/sketchesthree/scripts/**/*.js',
]

let passthroughCopy = [
	{
		'./src/images-passthrough': 'images',
	},
	'./src/fonts',
	'./src/scripts',
	'./src/sketches/scripts',
	'./src/sketchesthree/scripts',
]

exports.watchTargets = watchTargets
exports.passthroughCopy = passthroughCopy
