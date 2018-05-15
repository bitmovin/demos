const config = {
  ...,
  style:
    {
      ux: false
    }
};

var currentUiManager, isSmallscreen = false;
var player = bitmovin.player('player');

player.setup(conf).then(function () {
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