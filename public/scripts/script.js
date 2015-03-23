// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
var id,
    time,
    temp,
    clock,
    ver = 0,
    hor = 0,
    visible = true,
    started = false,
    ref = ['37', '38', '39', '40'];

addEventListener('DOMContentLoaded', function() {
    window.onbeforeunload = function() {
        time = Date.now();
        if(started)
        {
            document.getElementById('sudokuBoard').style.visibility = 'hidden';
            setTimeout(function() {
                setTimeout(function() {
                    if(Date.now() - time > 10000)
                    {
                        window.onbeforeunload = null;
                        window.location = '/';
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
    try{
        document.getElementById('hide').addEventListener('click', function () {
            document.getElementById('clock').style.visibility = visible && started ? 'hidden' : 'visible';
            document.getElementById('hide').innerText = visible && started ? 'BRING IT BACK' : 'HIDE';
            visible = !visible;
        });
    }
    catch(err){
        console.log('Playing on a non registered page.');
    }
    document.getElementById('start').addEventListener('click', function () {
        if (!started) {
            document.getElementById('newGameButton').style.visibility = 'visible';
            document.getElementById('newGameButton').click();
            document.getElementById('game').style.visibility = 'hidden';
            try{
                document.getElementById('hide').style.visibility = 'visible';
            }
            catch(err) {
                console.log('Playing on a non registered page.');
            }
            document.getElementById('Wrapper').style.visibility = 'visible';
            clock = $('.clock').FlipClock({clockFace: 'MinuteCounter'});
            document.getElementById('start').innerText = 'Quit';
            document.getElementById('start').addEventListener('click', function(){
                window.location = '/';
            });
            started = true;
        }
    });
    window.onkeydown = function nav() {
        id = document.activeElement.id;
        console.log(id);
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
            document.getElementById((temp[0] + ver).toString() + (temp[1] + hor).toString()).focus();
        }
    };
}, false);