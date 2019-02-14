var volumeButton = document.getElementById('volume-button');
var volumeInput = document.getElementById('volume-input');
var inputWarning = document.getElementById('input-warning');

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'audio-peak-limiter'
  },
  playback: {
    volume: 20
  }
};

var source = {
  hls: 'https://cdn.bitmovin.com/content/demos/4k/38e843e0-1998-11e9-8a92-c734cd79b4dc/manifest.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  player.load(source);
}

volumeButton.addEventListener('click', function () {
  if (volumeInput.value <= 100 && volumeInput.value >= 0 && volumeInput.value != "") {
    inputWarning.style.display = 'none';
    player.setVolume(volumeInput.value);
  } else {
    inputWarning.style.display = 'inherit';
  }
});

$(document).ready(function () {
  loadPlayer();
});
