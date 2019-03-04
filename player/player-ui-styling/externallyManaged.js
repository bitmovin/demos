var config = {
  key: '<YOUR PLAYER KEY HERE>',
  ui: false
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var currentUiManager, isSmallscreen = false;
var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  currentUiManager = bitmovin.playerui.UIManager.Factory.buildDefaultUI(player);
});

function toggleSmallScreenUI() {
  currentUiManager.release();
  if (!isSmallscreen) {
    currentUiManager = bitmovin.playerui.UIManager.Factory.buildModernSmallScreenUI(player);
  } else {
    currentUiManager = bitmovin.playerui.UIManager.Factory.buildDefaultUI(player);
  }
  isSmallscreen = !isSmallscreen;
}