var player1, player2, p1Timeout, p2Timeout;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'audio-api'
  },
  events: {
    play: function () {
      player1.play();
      player2.play();
    },
    paused: function () {
      player1.pause();
      player2.pause();
    }
  },
  playback: {
    muted: true
  }
};

var source1 = {
 hls: 'https://cdn.bitmovin.com/content/assets/blender-4k/38e843e0-1998-11e9-8a92-c734cd79b4dc/manifest.m3u8'
};

var source2 = {
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
};

var playerContainer1 = document.getElementById('player-container-1');
player1 = new bitmovin.player.Player(playerContainer1, conf);

var playerContainer2 = document.getElementById('player-container-2');
player2 = new bitmovin.player.Player(playerContainer2, conf);

function loadPlayer() {
  player1.load(source1);
  player2.load(source2);
}

function adjustPlayer() {
  var p1Container = $('#player-container-1');
  var p2Container = $('#player-container-2');

  // extract constants for better readabilty
  var p1LowerEdge = p1Container.offset().top + p1Container.height();
  var p1SwitchToMinPlayerPos = p1LowerEdge - (window.innerHeight / 3);
  var p1SwitchToMaxPlayerPos = p1Container.offset().top - 400;

  var p2LowerEdge = p2Container.offset().top + p2Container.height();
  var p2SwitchToMinPlayerPos = p2LowerEdge - (window.innerHeight / 3);
  var p2SwitchToMaxPlayerPos = p2Container.offset().top - 500;

  setInterval(function () {
    var currentScrollPos = document.body.scrollTop || document.documentElement.scrollTop;

    if (currentScrollPos <= p1SwitchToMinPlayerPos && currentScrollPos >= p1SwitchToMaxPlayerPos) {
      player1.unmute();
    } else {
      player1.mute();
    };

    if (currentScrollPos <= p2SwitchToMinPlayerPos && currentScrollPos >= p2SwitchToMaxPlayerPos) {
      player2.unmute();
    } else {
      player2.mute();
    };
  }, 50);
};

$(document).ready(function () {
  loadPlayer();
  adjustPlayer();
});
