const conf = {
  key: '<YOUR PLAYER KEY>',
  playback: {
    muted: true,
    autoplay: true
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);
