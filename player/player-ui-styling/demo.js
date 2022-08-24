const conf = {
  key: '<YOUR PLAYER KEY>',
  playback: {
    autoplay: true,
    muted: true,
  },
  ui: false
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/sintel.mpd',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png',
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);
player.load(source);
