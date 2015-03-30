/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 23-03-2015.
 */
addEventListener('load', function(){
    if(document.getElementsByName('email')[0] && document.getElementsByName('confirm')[0])
    {
        if(document.getElementsByName('email')[0].value)
        {
            document.getElementsByName('password')[0].focus();
        }
        else if(document.getElementsByName('name')[0].value)
        {
            document.getElementsByName('email')[0].focus();
        }
        else
        {
            document.getElementsByName('name')[0].focus();
        }
    }
    else
    {
        if(document.getElementsByName('name')[0].value)
        {
            document.getElementsByName('password')[0].focus();
        }
        else
        {
            document.getElementsByName('name')[0].focus();
        }
    }
});