var conf = {
  key: "YOUR KEY HERE"
};

var source = {
  dash: "https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
  hls: "https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
  poster: "https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg"
};

var playerContainer = document.getElementById("player-container");
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);