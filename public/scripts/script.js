/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 13-02-2015.
 */
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
var init = function()
{
  document.getElementById('start');
};
var uninit = function()
{
    document.getElementById('end');
};
var log = function() {

};