// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
var id,
    time,
    temp,
    clock,
    ver = 0,
    hor = 0,
    eVer = 0,
    eHor = 0,
    visible = true,
    started = false,
    ref = [37, 38, 39, 40];

addEventListener('DOMContentLoaded', function() {
    while(!document.getElementById('c' + eVer.toString() + eHor.toString()))
    {
        ++eHor;
        if(eHor == 9)
        {
            eHor = 0;
            ++eVer;
        }
    }
    eVer = eVer.toString();
    eHor = eHor.toString();
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
        if(ref.indexOf(temp) > -1)
        {
            if(id.match(/^c?[0-8]{2}$/))
            {
                ver = (temp % 2) ? 0 : (temp - 39);
                hor = (temp % 2) ? (temp - 38) : 0;
                ver = (parseInt(id[1]) + ver) % 9;
                hor = (parseInt(id[2]) + hor) % 9;
                ver = (ver > -1) ? ver.toString() : '8';
                hor = (hor > -1) ? hor.toString() : '8';
            }
            else
            {
                ver = eVer;
                hor = eHor;
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
            }
        }
    };
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
            document.getElementById('start').innerText = 'QUIT';
            document.getElementById('start').addEventListener('click', function(){
                window.location = '/';
            });
            started = true;
        }
    });
}, false);