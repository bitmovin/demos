var conf = {
  key: "YOUR KEY HERE"
};

var source = {
  dash: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
  hls: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
  poster: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg"
};

var playerContainer = document.getElementById("player-container");
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);