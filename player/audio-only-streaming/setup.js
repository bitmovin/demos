var conf = {
  key: '<YOUR PLAYER KEY>',
  ui: false,
};
  
var source = {
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa-audio-only.m3u8'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);
bitmovin.playerui.UIFactory.buildSmallScreenUI(player);

player.load(source);
