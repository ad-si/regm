!function () {

	// add default values
	$('#code').html('CLOAD 0\nSTORE 2\nLOAD 2\nMULT 2\nSTORE 3\nLOAD 1\nSUB 3\nIf c0 = 0 GOTO 12\nLOAD 2\nCADD 1\nGOTO 2\nEND')
	$('#memory input').val('1 0 15')

	// run register machine
	$('#run').on('click', function () {

		var code = $('#code').val(),
			memory = $('#memory input').val()

		$('.output').css('display', 'inline-block')
		$('#output').html('')

		RegM.run(code, memory, function (log) {

			if (log.type == 'step') {
				$('#output')
					.append('<tr>' +
						'<td>' + log.step + '</td>' +
						'<td>' + log.line + '</td>' +
						'<td>' + log.instruction + '</td>' +
						'<td>' + JSON.stringify(log.c) + '</td>' +
						'</tr>'
					)
			}
			else {
				$('#output')
					.append('<tr>' +
						'<td class="' + log.type + '" colspan=4>' + log.message + '</td>' +
						'</tr>'
					)
			}
		})
	})
}()