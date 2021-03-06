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
	nue = document.getElementById('new'),
	hour = document.createElement('h1'),
	min = document.getElementById('min'),
	sec = document.getElementById('sec'),
	tick = document.getElementById('clock'),
	submit = document.getElementById('submit'),
	select = document.getElementById('select'),
	control = document.getElementById('start'),
	board = document.getElementsByClassName('three-fourth')[0];

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
					window.location = '/' + (window.location.pathname === '/guest' ? '' : 'home');
				}
				else
				{
					board.style.visibility = 'visible';
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

	tick.style.display = 'block';

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
		nue.style.display = 'block';
		submit.style.display = 'block';
		select.style.display = 'none';
		control.id = 'quit';
		control.innerText = 'QUIT';

		counter();

		control.addEventListener('click', function() {
			window.onbeforeunload = null;
			window.location = '/' + (window.location.pathname === '/guest' ? '' : 'home');
		});

		started = true;
	}
});