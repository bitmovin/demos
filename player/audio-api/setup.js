
var conf = {
    key: '<YOUR PLAYER KEY>'
};

var source1 = {
    hls: 'https://cdn.bitmovin.com/content/demos/4k/38e843e0-1998-11e9-8a92-c734cd79b4dc/manifest.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var source2 = {
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
};

var playerContainer1 = document.getElementById('player-container-1');
var player1 = new bitmovin.player.Player(playerContainer1, conf);

var playerContainer2 = document.getElementById('player-container-2');
var player2 = new bitmovin.player.Player(playerContainer2, conf);

player1.load(source1);
player2.load(source2)