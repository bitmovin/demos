const conf = {
  key: '<YOUR PLAYER KEY>',
  ui: false
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png',
};

var player = new bitmovin.player.Player(document.getElementById('player-container'), conf);
var uiManager = new bitmovin.playerui.UIManager(player, [{
  ui: buildUI(),
}]);

player.load(source);
