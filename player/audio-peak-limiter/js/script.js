var slider = document.querySelector('#targetDecibelsSlider');
var targetDecibelsDisplay = document.querySelector('#targetDecibels');
var toggleLimiter = document.getElementById('toggle-limiter');

var audioCtx, video, audioSource, peakLimiterNode;

var isPeakLimiterSetup = false;
var isPeakLimiterOn = true;
var targetDecibels = -15;

toggleLimiter.classList.add('on');
toggleLimiter.checked = true;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'audio-peak-limiter'
  },
  events: {
    play: function () {
      if (isPeakLimiterOn && !isPeakLimiterSetup) {
        setupPeakLimiter();

        audioSource.connect(peakLimiterNode._input);
        peakLimiterNode.connect(audioCtx.destination);

        changeThreshold(targetDecibels);
      }
    }
  }
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  progressive: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
  poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  player.load(source)
}

var updateTargetDecibels = function () {
  targetDecibelsDisplay.innerText = slider.value + 'dB';
  targetDecibels = Number(slider.value);

  if (peakLimiterNode != null) {
    changeThreshold(targetDecibels);
  }
};

slider.oninput = updateTargetDecibels;
slider.value = String(targetDecibels);

function changeThreshold(decibels) {
  peakLimiterNode.threshold = utilities.dB2lin(decibels);
}

function togglePeakLimiter() {
  isPeakLimiterOn = !isPeakLimiterOn;

  if (isPeakLimiterOn) {
    if (!isPeakLimiterSetup) {
      setupPeakLimiter();
    } else {
      audioSource.disconnect(audioCtx.destination);
    }

    audioSource.connect(peakLimiterNode._input);
    peakLimiterNode.connect(audioCtx.destination);
  } else if (!isPeakLimiterOn && isPeakLimiterSetup) {
    audioSource.disconnect(peakLimiterNode._input);
    peakLimiterNode.disconnect(audioCtx.destination);

    audioSource.connect(audioCtx.destination);
  }
}

function setupPeakLimiter() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  video = document.getElementById('bitmovinplayer-video-player-container');

  audioSource = audioCtx.createMediaElementSource(video);

  peakLimiterNode = new PeakLimiterNode(audioCtx, 2);

  isPeakLimiterSetup = true;
}

function toggleLimiterButton() {
  if (!toggleLimiter.checked) {
    toggleLimiter.classList.add('on');
    toggleLimiter.checked = true;
    slider.disabled = false;
  } else {
    toggleLimiter.classList.remove('on');
    toggleLimiter.checked = false;
    slider.disabled = true;
  }

  togglePeakLimiter();
}

$(document).ready(function () {
  toggleLimiter.addEventListener('click', function () {
    toggleLimiterButton();
  });

  loadPlayer();
});
