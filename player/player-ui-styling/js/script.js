var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
  },
  style: {
    ux: false
  }
};

var currentUiManager, isBigSeekbar = false, isSmallscreen = false;
var player = bitmovin.player('player');

player.setup(conf).then(function (player) {
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
