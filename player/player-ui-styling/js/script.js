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
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var currentUiManager, isBigSeekbar = false, isSmallscreen = false;

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  currentUiManager = bitmovin.playerui.UIFactory.buildDefaultUI(player);
});


document.getElementById('smallscreen').addEventListener('click', function() {
  currentUiManager.release();
  if (!isSmallscreen) {
    currentUiManager = bitmovin.playerui.UIFactory.buildModernSmallScreenUI(player);
  } else {
    currentUiManager = bitmovin.playerui.UIFactory.buildDefaultUI(player);
  }
  isSmallscreen = !isSmallscreen;
});


document.getElementById('watermark').addEventListener('click', function() {
  $('.bmpui-ui-watermark').toggle();
});


document.getElementById('bigseek').addEventListener('click', function() {
  isBigSeekbar = !isBigSeekbar;

  var seekbar = $('.bmpui-seekbar')[0];
  seekbar.classList.toggle('bigseek');
});

document.getElementById('color2').addEventListener('click', function() {
  toggleColorClass('green', '.bmpui-seekbar-backdrop');
});

document.getElementById('color1').addEventListener('click', function() {
  toggleColorClass('orange', '.bmpui-seekbar-backdrop');
});

document.getElementById('redbuffer').addEventListener('click', function() {
  toggleColorClass('red', '.bmpui-seekbar-bufferlevel')
});

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
