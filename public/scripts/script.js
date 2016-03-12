// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
var id,
    time,
    temp,
    index,
    clock,
    ver = 0,
    hor = 0,
    visible = true,
    started = false,
    ref = [37, 38, 39, 40, 67, 69, 90, 81];

addEventListener('DOMContentLoaded', function() {
    window.onkeydown = function() {
        id = document.activeElement.id;
        if(!id[2])
        {
            id = 'c' + id;
        }
        temp = window.event.keyCode;
        switch(temp)
        {
            case 65 : temp = 37; // left, a
                      break;
            case 87 : temp = 38; // up, w
                      break;
            case 68 : temp = 39; // right, d
                      break;
            case 83 : temp = 40; // down, s
                      break;
            default : break;
        }
        index = ref.indexOf(temp);
        if(index > -1)
        {
            if(id.match(/^c?[0-8]{2}$/))
            {
                if(index <= 3)
                {
                    ver = (temp % 2) ? 0 : (temp - 39);
                    hor = (temp % 2) ? (temp - 38) : 0;
                }
                else
                {
                    ver = Math.pow(-1, index);
                    hor = Math.pow(-1, parseInt(index / 2, 10));
                }
                ver = (parseInt(id[1], 10) + ver) % 9;
                hor = (parseInt(id[2], 10) + hor) % 9;
                ver = (ver > -1) ? ver.toString() : '8';
                hor = (hor > -1) ? hor.toString() : '8';
            }
            else
            {
                ver = '0';
                hor = '0';
            }
            id = ver + hor;
            temp = document.getElementById(id);
            try
            {
                document.getElementById('c' + id).focus();
            }
            catch(err)
            {
                document.getElementById(id).focus();
                console.log(document.getElementById(id).style.border);
            }
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
                            console.log('Playing as a guest.');
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
            document.getElementById('game').style.visibility = 'hidden';
            try
            {
                document.getElementById('hide').style.visibility = 'visible';
            }
            catch(err)
            {
                console.log('Playing as a guest.');
            }
            document.getElementById('Wrapper').style.visibility = 'visible';
            clock = $('.clock').FlipClock({clockFace: 'MinuteCounter'});
            document.getElementById('start').innerText = 'QUIT';
            document.getElementById('start').addEventListener('click', function(){
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
