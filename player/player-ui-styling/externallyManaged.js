var config = {
  key: '<YOUR PLAYER KEY HERE>',
  ui: false
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
};

var currentUiManager, isSmallscreen = false;
var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  currentUiManager = bitmovin.playerui.UIFactory.buildDefaultUI(player);
});

function toggleSmallScreenUI() {
  currentUiManager.release();
  if (!isSmallscreen) {
    currentUiManager = bitmovin.playerui.UIFactory.buildModernSmallScreenUI(player);
  } else {
    currentUiManager = bitmovin.playerui.UIFactory.buildDefaultUI(player);
  }
  isSmallscreen = !isSmallscreen;
}
