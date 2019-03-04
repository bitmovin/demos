function adjustPlayer() {
    var p1Container = $('#player-container-1');
    var p2Container = $('#player-container-2');

    // extract constants for better readabilty
    var p1LowerEdge = p1Container.offset().top + p1Container.height();
    var p1SwitchToMinPlayerPos = p1LowerEdge - (window.innerHeight / 3) - 100;
    var p1SwitchToMaxPlayerPos = p1Container.offset().top - 400;

    var p2LowerEdge = p2Container.offset().top + p2Container.height();
    var p2SwitchToMinPlayerPos = p2LowerEdge - (window.innerHeight / 3) - 100;
    var p2SwitchToMaxPlayerPos = p2Container.offset().top - 400;

    var currentScrollPos = document.body.scrollTop || document.documentElement.scrollTop;

    p1Timeout = setTimeout(function () {
        if (currentScrollPos <= p1SwitchToMinPlayerPos && currentScrollPos >= p1SwitchToMaxPlayerPos) {
            clearTimeout(p1Timeout);
            p1Timeout = undefined;
            player1.unmute();
        } else {
            clearTimeout(p1Timeout);
            p1Timeout = undefined;
            player1.mute();
        };
    }, 300);

    p2Timeout = setTimeout(function () {
        if (currentScrollPos <= p2SwitchToMinPlayerPos && currentScrollPos >= p2SwitchToMaxPlayerPos) {
            clearTimeout(p2Timeout);
            p2Timeout = undefined;
            player2.unmute();
        } else {
            clearTimeout(p2Timeout);
            p2Timeout = undefined;
            player2.mute();
        };
    }, 300);
};

// listen to scrolling events
window.onscroll = adjustPlayer;
