const util = require('util')

let filters = [
	{
		name: 'filterTags',
		fn: function (tags) {
			return (tags || []).filter((tag) => ['all', 'nav', 'post', 'posts'].indexOf(tag) === -1)
		},
	},
	{
		name: 'console',
		fn: function (value, level = 2) {
			return util.inspect(value, { depth: level })
		},
	},
	{
		name: 'keys',
		fn: function (value) {
			return Object.keys(value)
		},
	},
	{
		name: 'round',
		fn: function (val, pos = 2) {
			return Math.round(val * 10 * pos) / (10 * pos)
		},
	},
	{
		name: 'dateString',
		fn: function (d) {
			if (d) {
				let notUTCDate = d.toISOString().slice(0, -1)
				return new Date(notUTCDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
			}
		},
	},
	{
		name: 'head',
		fn: function (array, n) {
			if (!Array.isArray(array) || array.length === 0) {
				return []
			}
			if (n < 0) {
				return array.slice(n)
			}

			return array.slice(0, n)
		},
	},
]

module.exports = filters
