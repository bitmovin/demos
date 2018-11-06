const config = {
  ...,
  ui: false
};

var currentUiManager, isSmallscreen = false;
var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(conf.source).then(function () {
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