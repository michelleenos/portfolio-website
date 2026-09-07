const utils = {
	round: (val, pos = 3) => Math.round(val * Math.pow(10, pos)) / Math.pow(10, pos),
	easingVals: function (fn) {
		let p = 0
		let res = []
		while (p <= 1) {
			res.push(this.round(fn(p)))
			p += 0.1
		}
		return res
	},
	el: (tagName = 'div', attributes = {}, text = '') => {
		let el = document.createElement(tagName)
		for (att in attributes) {
			el.setAttribute(att, attributes[att])
		}
		el.innerHTML = text
		return el
	},
}

const ease = {
	inOutSine: function (x) {
		return -(Math.cos(Math.PI * x) - 1) / 2
	},

	inQuad: function (x) {
		return x * x
	},
	inCubic: function (x) {
		return x * x * x
	},
	inQuart: function (x) {
		return x * x * x * x
	},
	inQuint: function (x) {
		return x * x * x * x * x
	},

	inOutQuad: function (x) {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
	},

	inExpo: function (x) {
		return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
	},
	inCirc: function (x) {
		return 1 - Math.sqrt(1 - x * x)
	},

	outExpo: function (x) {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
	},

	inOutExpo: function (x) {
		return x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? Math.pow(2, 20 * x - 10) / 2
					: (2 - Math.pow(2, -20 * x + 10)) / 2
	},

	inOutCirc: function (x) {
		return x < 0.5
			? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
			: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
	},
	inOutQuart: function (x) {
		return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
	},

	inQuadCyc: function (p) {
		if (p < 0.5) {
			return this.inQuad(p * 2)
		} else {
			return 1 - this.inQuad((p - 0.5) * 2)
		}
	},

	inCubicCyc: function (p) {
		if (p < 0.5) {
			return this.inCubic(p * 2)
		} else {
			return 1 - this.inCubic((p - 0.5) * 2)
		}
	},

	inOutQuadCyc: function (p) {
		return p < 0.5 ? this.inOutQuad(p * 2) : 1 - this.inOutQuad((p - 0.5) * 2)
	},
}

const OPTS = [
	{
		title: 'inOutSine(p * 2)',
		id: 'inOutSineX2',
		fn: (p) => ease.inOutSine(p * 2),
	},
	{
		title: 'abs(easeInCubic(p * 2 - 1))',
		id: 'cubicAdjust',
		fn: (p) => Math.abs(ease.inCubic(p * 2 - 1)),
	},
	{
		title: 'abs(easeInQuart(p * 2 - 1)',
		id: 'quartAdjust',
		fn: (p) => Math.abs(ease.inQuart(p * 2 - 1)),
	},
	{
		title: 'abs(easeInQuint(p * 2 - 1))',
		id: 'quintAdjust',
		fn: (p) => Math.abs(ease.inQuint(p * 2 - 1)),
	},
	{
		title: 'abs(easeInCirc(p * 2 - 1))',
		id: 'circAdjust',
		fn: (p) => Math.abs(ease.inCirc(p * 2 - 1)),
	},

	{
		title: 'easeInQuadCyc',
		id: 'easeInQuadCyc',
		fn: (p) => ease.inQuadCyc(p),
	},
	{
		title: 'easeInCubicCyc',
		id: 'easeInCubicCyc',
		fn: (p) => ease.inCubicCyc(p),
	},
	{
		title: 'inOutQuadCyc',
		id: 'inOutQuadCyc',
		fn: (p) => ease.inOutQuadCyc(p),
	},
	{
		title: 'sin(p * PI)',
		id: 'sinPAngle',
		fn: (p) => Math.sin(p * Math.PI),
	},
	{
		title: 'abs(cos(p * PI))',
		subtitle: '(just the opposite of above)',
		id: 'cosPAngle',
		fn: (p) => Math.abs(Math.cos(p * Math.PI)),
	},
	{
		title: 'inOutSine(sin(p * PI))',
		id: 'inOutSineAngle',
		fn: (p) => ease.inOutSine(Math.sin(p * Math.PI)),
	},
	{
		title: 'inOutQuart(sin(p * PI))',
		id: 'inOutQuartAngle',
		fn: (p) => ease.inOutQuart(Math.sin(p * Math.PI)),
	},
	{
		title: 'easeInCubic(sin(p * PI))',
		id: 'inCubicAngle',
		fn: (p) => ease.inCubic(Math.sin(p * Math.PI)),
	},
	{
		title: 'easeInCubic(cos(p * PI))',
		id: 'inCubicAngleCos',
		fn: (p) => ease.inCubic(Math.cos(p * Math.PI)),
	},
]

class EaseDemos {
	constructor(table, demo, options) {
		this.table = table
		this.demo = demo
		this.options = options
		this.current = false

		this.setOptionValues()
		this.setCurrent(0)
		this.addListeners()
	}

	setOptionValues() {
		this.options.forEach((opt, i) => {
			if (opt.vals) return
			opt.vals = utils.easingVals(opt.fn)

			let code = document.getElementById(opt.id)
			if (code) {
				code.remove()
				opt.code = code
			}

			let tr = utils.el('tr', {
				class: 'ease-row',
				'data-id': opt.id,
				'data-i': i,
				'aria-current': 'false',
				tabindex: '0',
			})

			let th = utils.el('th', { scope: 'row' }, opt.title)
			// if (opt.subtitle) th.appendChild(utils.el('div', { class: 'subtitle' }, opt.subtitle))
			tr.appendChild(th)

			tr.appendChild(
				utils.el('td', { class: 'sr-only' }, 'click to see the animation with this easing'),
			)

			for (let i = 0; i < opt.vals.length; i++) {
				tr.appendChild(utils.el('td', {}, opt.vals[i]))
			}

			opt.row = tr
			this.table.appendChild(tr)
		})
	}

	setCurrent(i) {
		if (this.current) {
			this.current.row.setAttribute('aria-current', 'false')
		}

		this.current = this.options[i]
		this.demo.innerHTML = ''
		if (this.current.code) this.demo.appendChild(this.current.code)
		this.current.row.setAttribute('aria-current', 'true')
	}

	addListeners() {
		this.table.addEventListener('click', (e) => {
			let tr = e.target.closest('tr')
			if (!tr || !tr.classList.contains('ease-row')) return
			let index = tr.dataset['i']

			this.setCurrent(index)
		})
	}
}

const table = document.getElementById('ease-table').querySelector('tbody')
const codeDemo = document.getElementById('code-demo')

let demos = new EaseDemos(table, codeDemo, OPTS)

function setup() {
	const canvas = createCanvas(400, 250)
	canvas.parent('#ease-demo')

	createLoop({ duration: 2 })
}

function draw() {
	clear()

	push()
	fill(255, 20, 80)
	noStroke()

	let p = animLoop.progress
	let val = demos.current.fn(p)
	let pos = map(val, 0, 1, height * 0.15, height * 0.7)
	let r = map(val, 0, 1, height * 0.2, height * 0.5)

	translate(315, pos)
	circle(0, 0, r)

	pop()

	chart(p, val)
}

function chart(progress, currentVal) {
	let cs = 250
	let step = cs / 12
	stroke(0)
	noFill()
	push()

	translate(step, step)
	line(0, 0, 0, step * 10)
	line(0, step * 10, step * 10, step * 10)

	textSize(9)
	textAlign(RIGHT)

	let valMax = step * 10
	let p = 0
	let i = 0

	beginShape()
	while ((i <= 10, p <= 1)) {
		let pos = step * i

		stroke(0)
		noFill()
		line(-3, pos, 2, pos)
		line(pos, step * 10, pos, step * 10 + 3)

		let easeVal = demos.current.fn(p)
		let yPos = valMax - easeVal * (step * 10)
		circle(pos, yPos, 2)
		curveVertex(pos, yPos)
		if (i === 0 || i === 10) curveVertex(pos, yPos)

		p += 0.1
		i += 1
	}
	endShape()

	fill(255, 20, 80)
	noStroke()
	circle(progress * valMax, valMax - currentVal * valMax, 8)
}
