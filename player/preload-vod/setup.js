const conf = {
  key: '<YOUR PLAYER KEY>',
  /* Preload is the defalt value */
  adaptation: {
    desktop: {
      preload: true
    },
    mobile: {
      preload: true
    }
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);
