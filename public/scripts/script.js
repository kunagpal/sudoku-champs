// Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
var id,
    temp,
    clock,
    ver = 0,
    hor = 0,
    visible = true,
    started = false,
    ref = ['37', '38', '39', '40'];

var hide = function()
{
    if(started)
    {
        document.getElementById('clock').style.visibility = visible ? 'hidden' : 'visible';
    }
    visible = !visible;
};

var tick = function()
{
    if(!started)
    {
        $(document).ready(function(){
            document.getElementById('Wrapper').style.visibility = "visible";
            clock = $('.clock').FlipClock({clockFace: 'HourlyCounter'});
            started = true;
            $(this).prev("a").attr("start", "end");
            document.getElementById('start').style.visibility = "hidden";
        });
    }
};

window.onbeforeunload = function leave() {
    if(started)
    {
        return 'Leaving / reloading this page whilst a game is in progress could result in a loss.';
    }
};

document.onkeydown = function nav() {
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