// const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import { imageShortcode } from './eleventy-configs/image-shortcode.js'
import { collections } from './eleventy-configs/collections.js'
import { filters } from './eleventy-configs/filters.js'
import { customFormatScss } from './eleventy-configs/scss-format.js'
import { watchTargets, passthroughCopy } from './eleventy-configs/watch-passthrough-info.js'
import { markdownSetup } from './eleventy-configs/markdown.js'
// const { imageShortcode } = require('./eleventy-configs/image-shortcode')
// const collections = require('./eleventy-configs/collections')
// const filters = require('./eleventy-configs/filters')
// const customFormatScss = require('./eleventy-configs/scss-format')
// const { watchTargets, passthroughCopy } = require('./eleventy-configs/watch-passthrough-info')
// const markdownSetup = require('./eleventy-configs/markdown')

export default async function (eleventyConfig) {
	customFormatScss(eleventyConfig)
	markdownSetup(eleventyConfig)

	watchTargets.forEach((item) => eleventyConfig.addWatchTarget(item))
	passthroughCopy.forEach((item) => eleventyConfig.addPassthroughCopy(item))
	collections.forEach(({ name, fn }) => eleventyConfig.addCollection(name, fn))
	filters.forEach(({ name, fn }) => eleventyConfig.addFilter(name, fn))

	eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode)

	eleventyConfig.addNunjucksShortcode('imgCaption', function ({ src, alt, caption }) {
		return `<figure>
		<img src="${src}" alt="${alt}" />
		<figcaption>${caption}</figcaption>
		</figure>`
	})

	eleventyConfig.addNunjucksShortcode(
		'imgStyle',
		function (src, alt, style = '', className = '') {
			return `<img src="${src}" alt="${alt}" style="${style}" />`
		},
	)

	eleventyConfig.addPlugin(syntaxHighlight)
	eleventyConfig.setServerPassthroughCopyBehavior('passthrough')

	return {
		dir: {
			input: 'src',
			output: '_site',
			layouts: 'views/layouts',
			includes: 'views',
		},
		markdownTemplateEngine: 'njk',
	}
}
