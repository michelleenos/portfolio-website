const Image = require('@11ty/eleventy-img')

async function imageShortcode({
	src,
	alt,
	widths = [550, 1000],
	sizes = '(min-width: 700px) 550w, 100vw',
	style = '',
	classNames = '',
	quality = 80,
	formats = ['webp', 'jpeg'],
}) {
	let metadata = await Image(src, {
		widths: widths,
		outputDir: './_site/img/',
		formats: formats,
		sharpOptions: {
			quality: quality,
		},
	})

	let lowsrc, highsrc
	if (metadata.jpeg) {
		lowsrc = metadata.jpeg[0]
		highsrc = metadata.jpeg[metadata.jpeg.length - 1]
	} else if (metadata.png) {
		lowsrc = metadata.png[0]
		highsrc = metadata.png[metadata.png.length - 1]
	}

	return `<picture style="${style}" class="${classNames}">
	  ${Object.values(metadata)
			.map((imageFormat) => {
				return `<source type="${imageFormat[0].sourceType}" srcset="${imageFormat
					.map((entry) => entry.srcset)
					.join(', ')}" sizes="${sizes}">`
			})
			.join('\n')}
		<img
		  src="${lowsrc.url}"
		  width="${highsrc.width}"
		  height="${highsrc.height}"
		  alt="${alt}"
		  loading="lazy"
		  decoding="async">
	  </picture>`
}

exports.imageShortcode = imageShortcode
