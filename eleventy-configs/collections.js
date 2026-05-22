let collections = [
	{
		name: 'tagList',
		fn: function (collections) {
			let tagset = new Set()
			let filter = ['all', 'post', 'page', 'work']
			collections.getAll().forEach((item) => {
				;(item.data.tags || []).forEach((tag) => {
					if (!filter.some((item) => item == tag)) tagset.add(tag)
				})
			})

			return [...tagset]
		},
	},
	{
		name: 'work',
		fn: function (collections) {
			let work = collections.getFilteredByTag('work')
			return work.sort(function (a, b) {
				return b.data.order - a.data.order
			})
		},
	},
	{
		name: 'post',
		fn: function (collections) {
			let notes = collections.getFilteredByTag('post')
			notes = notes.filter((note) => !note.data.draft)
			return notes.sort(function (a, b) {
				return b.data.order - a.data.order
			})
		},
	},
]

module.exports = collections
