var pageLoadedTime;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  player.load(source).then(function() {
    document.getElementById('startup').innerHTML = Date.now() - pageLoadedTime + 'ms';
  });
}

$(document).ready(function() {
  pageLoadedTime = Date.now();
  loadPlayer();
});
