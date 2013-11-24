!function () {

	// add default values
	//$('#code').html('CLOAD 0\nSTORE 2\nLOAD 2\nMULT 2\nSTORE 3\nLOAD 1\nSUB 3\nIf c0 = 0 GOTO 12\nLOAD 2\nCADD 1\nGOTO 2\nEND')

	$('#code').html('LOAD 1\nIF C0 = 0 GOTO 11\nSUB 3\nSTORE 2\nLOAD 3\nCADD 1\nSTORE 3\nLOAD 2\nSUB 3\nGOTO 2\nLOAD 3\nSTORE 1\nEND')

	// run register machine
	$('#run').on('click', function () {

		var mem,
			logger,
			index,
			code = $('#code').val(),
			memoryInput = $('#memory input').val().split(/[\s,;]+/),
			sequence = []

		$('.output').css('display', 'inline-block')
		$('#output').html('')
		$('#function tbody').html('')

		logger = function (data) {

			if (data.type == 'step') {
				$('#output')
					.append('<tr>' +
						'<td>' + data.step + '</td>' +
						'<td>' + data.line + '</td>' +
						'<td>' + data.instruction + '</td>' +
						'<td>' + JSON.stringify(data.c) + '</td>' +
						'</tr>'
					)
			}
			else {
				$('#output')
					.append('<tr>' +
						'<td class="' + data.type + '" colspan=4>' + data.message + '</td>' +
						'</tr>'
					)
			}
		}

		RegM.run(code, memoryInput.slice(0), logger)


		index = Number($('#iterator').val().substr(1)) + 1

		mem = memoryInput.slice(0)

		for (var i = 0; i < 100; i++) {
			!function () {

				var value

				mem[index] = i

				// Replace undefined with 0
				for(var j = 0; j < mem.length; j++){
					if(mem[j] === undefined)
						mem[j] = 0
				}

				console.log(mem)

				value = RegM.run(code, mem, false)

				$('#function tbody')
					.append('<tr>' +
						'<td>' + mem + '</td>' +
						'<td>' + value + '</td>' +
						'<td>' + value[index] + '</td>' +
						'</tr>'
					)

				sequence.push(value[index])
			}()
		}

		$('#sequence p').text(sequence.join(', '))
		$('#sequence a').attr('href', 'http://oeis.org/search?q=' + sequence)

	})
}()