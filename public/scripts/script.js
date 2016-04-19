// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
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
    visible = true,
    started = false,
    ref = [37, 38, 39, 40];

addEventListener('DOMContentLoaded', function() {
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
            document.getElementById('sudokuBoard').style.visibility = 'hidden';
            setTimeout(function() {
                setTimeout(function() {
                    if(Date.now() - time > 10000)
                    {
                        window.onbeforeunload = null;

					  	try
                        {
                            document.getElementsByName('loss')[0].value = 1;
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

    document.getElementById('start').addEventListener('click', function () {
        if (!started)
        {
            document.getElementById('newGameButton').style.visibility = 'visible';
            document.getElementById('newGameButton').click();
            // start counter
            document.getElementById('start').innerText = 'QUIT';
            document.getElementById('start').addEventListener('click', function() {
                window.location = '/';
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

}, false);
