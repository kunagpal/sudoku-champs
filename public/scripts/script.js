/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
 */
var visible = true;
var started = false;
var rand = function(arg)
{
    if(arg)
    {
        return Math.round((Math.random() * 10000000000000000) % arg);
    }
    else
    {
        return Math.random();
    }
};
var hide = function()
{
    document.getElementById('clock').style.visibility = visible ? 'hidden' : 'visible';
    document.getElementById('clock').text = visible ? 'Bring it back' : 'Hide';
    visible = !visible;
};

var tick = function()
{
    var clock;
    if(!started)
    {
        $(document).ready(function () {
            clock = $('.clock').FlipClock({clockFace: 'HourlyCounter'});
        });
        $(document).ready(function(){
                $('.start').text('Retire')}
        );
        started = true;
        $(this).prev("a").attr("start", "end");
    }
};

var log = function()
{

};
