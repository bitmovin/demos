var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'player-ui-styling'
  },
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
  },
  playback: {
    muted: true
  }
};

var currentUiManager, isBigSeekbar = false, isSmallscreen = false;

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(conf.source).then(function () {
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

function toggleWatermark() {
  $('.bmpui-ui-watermark').toggle();
}

function giantSeekBar() {
  $('.bmpui-ui-seekbar').css('font-size', isBigSeekbar ? '1em' : '3em');
  isBigSeekbar = !isBigSeekbar;
}

function toGreen() {
  toggleColorClass('green', '.bmpui-seekbar-backdrop')
}

function toOrange() {
  toggleColorClass('orange', '.bmpui-seekbar-backdrop')
}

function toggleRedBufferLevel() {
  toggleColorClass('red', '.bmpui-seekbar-bufferlevel')
}

function toggleColorClass(colorClassName, elementClass) {
  var allElements = document.querySelectorAll(elementClass);
  for (var i = 0; i < allElements.length; i++) {
    var element = allElements[i];
    var hadClass = element.classList.contains(colorClassName);
    /* IE does not support multiple inputs for classList.remove, thanks IE */
    element.classList.remove('red');
    element.classList.remove('green');
    element.classList.remove('orange');
    if (!hadClass) {
      element.classList.add(colorClassName);
    }
  }
}
