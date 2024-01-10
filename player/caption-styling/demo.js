var conf = {
  key: '<YOUR PLAYER KEY>'
};

var source = {
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);
