var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'audio-only-streaming'
  }
};

var source = {
  dash: './audio-only-streaming/js/test.mpd'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  player.load(source);
}

$(document).ready(function () {
  loadPlayer();
});
