var pageLoadedTime;

var preloadConf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  adaptation: {
    desktop: {
      preload: true
    },
    mobile: {
      preload: true
    }
  },
  playback: {
    muted: true
  }
};

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  adaptation: {
    desktop: {
      preload: false
    },
    mobile: {
      preload: false
    }
  },
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var playerPreloadContainer = document.getElementById('player-container-preload');
var playerPreload = new bitmovin.player.Player(playerPreloadContainer, preloadConf);

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  playerPreload.load(source).then(function() {
    document.getElementById('startup').innerHTML = Date.now() - pageLoadedTime + 'ms';
    var bufferRate = document.getElementById('buffer');
    setInterval(function() {
      if (playerPreload && !playerPreload.isPaused()) {
        bufferRate.innerHTML = Math.round(playerPreload.getVideoBufferLength() * 100) / 100 + 's';
      }
    }, 50);
  });

  player.load(source);
}

$(document).ready(function() {
  pageLoadedTime = Date.now();
  loadPlayer();
});
