!function () {

	var stepCount = 0,
		b = [],
		c = [], // [B, c0, c1, ...]
		running = true,
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
			if: function (c, op, val, goto, i) {
				var jump = false
				if ((op == '=' || op == '==') && c[1] == parseInt(val)) {
					jump = true
				}
				else if ((op == '!=' || op == '<>') && c[1] != parseInt(val)) {
					jump = true
				}
				else if (op == '>' && c[1] > parseInt(val)) {
					jump = true
				}
				else if (op == '>=' && c[1] >= parseInt(val)) {
					jump = true
				}
				else if (op == '<' && c[1] < parseInt(val)) {
					jump = true
				}
				else if (op == '<=' && c[1] <= parseInt(val)) {
					jump = true
				}

				if (jump) {
					instructions.goto(i)
				}
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
			log({
				type: 'error',
				message: 'Invalid program counter!'
			})
			return
		}


		var line = c[0]
		var instruction = b[line - 1]
		var parts = instruction.split(' ')
		var name = parts[0].toLowerCase()

		if (instructions[name]) {
			c[0]++
			instructions[name].apply( parts.slice(1))

			for (var i = 0; i < c.length; i++) {
				if (c[i] < 0) {
					c[i] = 0
				}
			}

			stepCount++
			log({
				type: 'step',
				step: stepCount,
				line: line,
				instruction: instruction,
				c: c
			})
		} else {
			running = false
			log({
				type: 'error',
				message: 'Invalid instruction: ' + instruction
			})
		}
	}

	function log(object) {
		console.log(JSON.stringify(object))
	}

	window.RegM = {}

	RegM.run = function(code, memory, callback) {

		var i

		if (callback) log = callback

		stepCount = 0
		b = code.match(/[^\r\n]+/g)
		running = true

		if (!b) {
			log({
				type: 'error',
				message: 'No program given!'
			})
			return
		}


		c = memory.split(/[\s,;]+/)

		c.length = c.length < 16 ? 16 : c.length + 1
		c[0] = 1

		for (i = 0; i < c.length; i++)
			c[i] = parseInt(c[i]) | 0

		if (c[0] == 0) c[0] = 1


		log({
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
				log({
					type: 'error',
					message: 'Limit of 1000 steps reached!'
				})
			}
		}
	}
}()