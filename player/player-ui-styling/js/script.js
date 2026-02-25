var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'player-ui-styling'
  },
  playback: {
    muted: true
  },
  ui: false
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
};

var currentUiManager;
var isSmallscreen = false;
var showWatermark = false;
var bigSeekEnabled = false;
var seekbarBackdropColor = null;
var bufferLevelColor = null;

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  rebuildUi();
});


document.getElementById('smallscreen').addEventListener('click', function() {
  isSmallscreen = !isSmallscreen;
  rebuildUi();
});


document.getElementById('watermark').addEventListener('click', function() {
  showWatermark = !showWatermark;
  rebuildUi();
});


document.getElementById('bigseek').addEventListener('click', function() {
  bigSeekEnabled = !bigSeekEnabled;
  applySeekbarStyles();
});

document.getElementById('color2').addEventListener('click', function() {
  seekbarBackdropColor = seekbarBackdropColor === 'green' ? null : 'green';
  applySeekbarStyles();
});

document.getElementById('color1').addEventListener('click', function() {
  seekbarBackdropColor = seekbarBackdropColor === 'orange' ? null : 'orange';
  applySeekbarStyles();
});

document.getElementById('redbuffer').addEventListener('click', function() {
  bufferLevelColor = bufferLevelColor === 'red' ? null : 'red';
  applySeekbarStyles();
});

function rebuildUi() {
  if (currentUiManager) {
    currentUiManager.release();
  }

  var uiConfig = { includeWatermark: showWatermark };
  currentUiManager = isSmallscreen
    ? bitmovin.playerui.UIFactory.buildSmallScreenUI(player, uiConfig)
    : bitmovin.playerui.UIFactory.buildUI(player, uiConfig);

  applySeekbarStyles();
}

function applySeekbarStyles() {
  var wrappers = document.querySelectorAll('.bmpui-ui-seekbar');
  for (var i = 0; i < wrappers.length; i++) {// TODO: use for-each
    var wrapper = wrappers[i];
    wrapper.classList.toggle('bigseek', bigSeekEnabled);

    var backdrops = wrapper.querySelectorAll('.bmpui-seekbar-backdrop');
    setColorClass(backdrops, seekbarBackdropColor, ['orange', 'green']);

    var bufferLevels = wrapper.querySelectorAll('.bmpui-seekbar-bufferlevel');
    setColorClass(bufferLevels, bufferLevelColor, ['red']);
  }
}

function setColorClass(elements, activeClass, availableClasses) {
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    for (var c = 0; c < availableClasses.length; c++) {
      element.classList.remove(availableClasses[c]);
    }
    if (activeClass) {
      element.classList.add(activeClass);
    }
  }
}
