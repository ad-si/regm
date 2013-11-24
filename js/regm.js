!function () {

	var stepCount = 0,
		b = [],
		c = [], // [B, c0, c1, ...]
		running = true,
		funcParam = 0,
		instructions = {
			load: function (i) {
				c[1] = getC(i)
			},
			cload: function (i) {
				c[1] = parseInt(i)
			},
			store: function (i) {
				setC(i, c[1])
			},
			add: function (i) {
				c[1] += getC(i)
			},
			cadd: function (i) {
				c[1] += parseInt(i)
			},
			sub: function (i) {
				c[1] -= getC(i)
			},
			csub: function (i) {
				c[1] -= parseInt(i)
			},
			mult: function (i) {
				c[1] *= getC(i)
			},
			cmult: function (i) {
				c[1] *= parseInt(i)
			},
			div: function (i) {
				c[1] = Math.floor(c[1] / getC(i))
			},
			cdiv: function (i) {
				c[1] = Math.floor(c[1] / parseInt(i))
			},
			goto: function (i) {
				c[0] = parseInt(i)
			},
			if: function (irrelevant, op, val, goto, i) {

				var jump = false

				val = parseInt(val)

				if (((op == '=' || op == '==') && c[1] == val) ||
					((op == '!=' || op == '<>') && c[1] != val) ||
					(op == '>' && c[1] > val) ||
					(op == '>=' && c[1] >= val) ||
					(op == '<' && c[1] < val) ||
					(op == '<=' && c[1] <= val))

					jump = true

				if (jump)
					instructions.goto(i)
			},
			end: function () {
				c[0]--
				running = false
			}
		}

	function getC(index) {
		return c[parseInt(index) + 1]
	}

	function setC(index, value) {
		c[parseInt(index) + 1] = value
	}

	function step() {

		if (c[0] > b.length) {
			running = false
			logger({
				type: 'error',
				message: 'Invalid program counter!'
			})
			return
		}

		var line = c[0]
		var instruction = b[line - 1]
		var parts = instruction.split(' ')
		var name = parts[0].toLowerCase()
		var	i

		if (instructions[name]) {
			c[0]++
			instructions[name].apply(null, parts.slice(1))

			for (i = 0; i < c.length; i++) {
				if (c[i] < 0) {
					c[i] = 0
				}
			}

			stepCount++

			logger({
				type: 'step',
				step: stepCount,
				line: line,
				instruction: instruction,
				c: c
			})
		}
		else {
			running = false
			logger({
				type: 'error',
				message: 'Invalid instruction: ' + instruction
			})
		}
	}

	function logger(object) {
		console.log(JSON.stringify(object))
	}

	window.RegM = {}

	RegM.run = function (code, memory, callback) {

		var i

		// Clone Array
		c = memory.slice(0)

		c.length = c.length <= 8 ? 8 : c.length + 1
		c[0] = 1


		for (i = 0; i < c.length; i++)
			c[i] = parseInt(c[i]) | 0

		//console.log(mem)

		if (callback)
			logger = callback

		else if (callback === false)
			logger = function(){}

		stepCount = 0
		b = code.match(/[^\r\n]+/g)
		running = true

		if (!b) {
			logger({
				type: 'error',
				message: 'No program given!'
			})
			return
		}

		logger({
			type: 'step',
			step: stepCount,
			line: '',
			instruction: '',
			c: c
		})

		while (running) {
			step()

			if (stepCount >= 1000) {
				running = false
				logger({
					type: 'error',
					message: 'Limit of 1000 steps reached!'
				})
			}
		}

		return c.slice(0)
	}
}()