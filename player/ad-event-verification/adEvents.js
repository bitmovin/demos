player.on(bitmovin.player.PlayerEvent.AdStarted, function (data) {
    console.log("On Ad Started: " + JSON.stringify(data));
});

player.on(bitmovin.player.PlayerEvent.AdQuartile, function (data) {
    console.log("On Ad Quartile: " + JSON.stringify(data));
});

player.on(bitmovin.player.PlayerEvent.AdError, function (data) {
    console.log("On Ad Error: " + JSON.stringify(data));
});

player.on(bitmovin.player.PlayerEvent.AdBreakFinished, function (data) {
    console.log("On Ad Break Finished: " + JSON.stringify(data));
});