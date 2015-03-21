// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
var id,
    temp,
    clock,
    ver = 0,
    hor = 0,
    exit = false,
    visible = true,
    started = false,
    ref = ['37', '38', '39', '40'];

addEventListener('DOMContentLoaded', function() {

    window.onpagehide  = function() {
        if(started)
        {
            document.getElementById('sudokuBoard').style.visibility = 'hidden';
            return 'This action will result in the current game being lost.';
        }
    };
    document.getElementById('hide').addEventListener('click', function () {
        document.getElementById('clock').style.visibility = visible && started ? 'hidden' : 'visible';
        document.getElementById('hide').innerText = visible && started ? 'Bring it back' : 'Hide';
        visible = !visible;
    });
    document.getElementById('start').addEventListener('click', function () {
        if (!started) {
            document.getElementById('newGameButton').style.visibility = 'visible';
            document.getElementById('newGameButton').click();
            document.getElementById('game').style.visibility = 'hidden';
            document.getElementById('Wrapper').style.visibility = 'visible';
            clock = $('.clock').FlipClock({clockFace: 'MinuteCounter'});
            document.getElementById('start').innerText = 'Quit';
            document.getElementById('start').id = 'quit';
            document.getElementById('quit').addEventListener('click', function () {
                document.getElementById('quit').href = '/';
            });
            started = true;
        }
    });
    window.onkeydown = function nav() {
        id = document.activeElement.id;
        if(id.match(/^[0-8]{2}$/))
        {
            temp = window.event.keyCode;
            if(ref.indexOf(temp) > -1)
            {
                if(temp % 2)
                {
                    hor = temp - 38;
                    ver = 0;
                }
                else
                {
                    ver = 39 - temp;
                    hor = 0;
                }
            }
            ver = ver.toString();
            hor = hor.toString();
            document.getElementById((temp[0] + ver).toString() + (temp[1] + hor).toString()).parentElement.focus();
        }
    };
}, false);