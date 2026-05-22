const sass = require('sass')
const path = require('path')

function customFormatScss(eleventyConfig) {
	eleventyConfig.addTemplateFormats('scss')
	eleventyConfig.addExtension('scss', {
		outputFileExtension: 'css',
		// isIncrementalMatch: function (incrementalFilePath) {
		// 	if (incrementalFilePath.endsWith('.scss')) return true
		// },
		compile(content, inputPath) {
			let parsed = path.parse(inputPath)

			if (parsed.name.startsWith('_')) return

			return (data) => {
				console.log('🔮 compiling scss...', inputPath)
				let result = sass.compile(inputPath)

				this.addDependencies(inputPath, result.loadedUrls)

				return result.css
			}
		},
	})
}

module.exports = customFormatScss
