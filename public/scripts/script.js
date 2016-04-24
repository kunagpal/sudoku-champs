var cell,
    time,
    temp,
    index,
    clock,
    ver = 0,
    hor = 0,
	arrow =
	{
	  65: 37,
	  87: 38,
	  68: 39,
	  83: 40
	},
	hFlag = 1,
	dFlag = 1,
    visible = true,
    started = false,
    ref = [37, 38, 39, 40],
	day = document.createElement('h1'),
	sep = document.createElement('h1'),
	hour = document.createElement('h1'),
	min = document.getElementById('min'),
	sec = document.getElementById('sec'),
	tick = document.getElementById('clock');

window.onkeydown = function() {
	ver = hor = '0';
	cell = document.activeElement.name || '';
	temp = arrow[window.event.keyCode] || window.event.keyCode;

	if(ref.indexOf(temp) > -1)
	{
		if(cell.match(/^[0-8]{2}$/))
		{
			ver = (temp % 2) ? 0 : (temp - 39);
			hor = (temp % 2) ? (temp - 38) : 0;
			ver = (parseInt(cell[0], 10) + ver) % 9;
			hor = (parseInt(cell[1], 10) + hor) % 9;
			ver = (ver > -1) ? ver.toString() : '8';
			hor = (hor > -1) ? hor.toString() : '8';
		}

		document.getElementsByName(ver + hor)[0].focus();
	}
};

window.onbeforeunload = function()
{
	if(started)
	{
		time = Date.now();
		setTimeout(function() {
			setTimeout(function() {
				if(Date.now() - time > 10000)
				{
					window.onbeforeunload = null;

					try
					{
						document.getElementById('hidden').click();
					}
					catch(err)
					{
						window.location = document.activeElement.href;
					}
				}
				else
				{
					document.getElementById('sudokuBoard').style.visibility = 'visible';
				}
			}, 0);
		},0);

		return "This action will result in a loss. (The game will be lost automatically in ten seconds.)";
	}
};

function check(arg)
{
	return (arg < 9 ? '0' : '') + ++arg;
}

function counter()
{
	sep.innerText = ':';
	day.innerText = hour.InnerText = min.innerText = sec.innerText = '00';

	clock = setInterval(function() {
		sec.innerText = check(sec.innerText);

		if (sec.innerText === '60')
		{
			sec.innerText = '00';
			min.innerText = check(min.innerText);

			if (min.innerText === '60')
			{
				if (hFlag)
				{
					hFlag = 0;
					tick.insertBefore(sep, tick.firstChild);
					tick.insertBefore(hour, tick.firstChild);
				}

				min.innerText = '00';
				hour.innerText = check(hour.innerText);

				if (hour.innerText === '24')
				{
					if(dFlag)
					{
						dFlag = 0;
						sep = document.createElement('h1');
						sep.innerText = ':';
						tick.insertBefore(sep, tick.firstChild);
						tick.insertBefore(day, tick.firstChild);
					}

					hour.innerText = '00';
					day.innerText = check(day.innerText);
				}
			}
		}
	}, 1000);
}

document.getElementById('start').addEventListener('click', function () {
	if (!started)
	{
		document.getElementById('new').style.display = 'block';
		document.getElementById('end').style.display = 'block';
		document.getElementById('select').style.display = 'none';
		document.getElementById('start').innerText = 'QUIT';

		counter();

		document.getElementById('start').addEventListener('click', function() {
			window.location = '/home'; // to be adjusted
		});

		started = true;
	}
});

try
{
	document.getElementById('hide').addEventListener('click', function () {
		document.getElementById('clock').style.visibility = visible && started ? 'hidden' : 'visible';
		document.getElementById('hide').innerText = visible && started ? 'BRING IT BACK' : 'HIDE';
		visible = !visible;
	});
}
catch(err)
{
	console.log('Playing as a guest.');
}