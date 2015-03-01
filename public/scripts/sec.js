/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 21-02-2015.
 */
window.onbeforeunload = function leave() {
    return confirm('Warning ! Leaving / reloading this page whilst a game is in progress could result in a loss. Do you you still wish to proceed ?');
};