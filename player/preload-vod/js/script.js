var preloadPlayTimestamp, playTimestamp;

var preloadConf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'preload-vod-preloaded'
  },
  adaptation: {
    desktop: {
      preload: true
    },
    mobile: {
      preload: true
    }
  },
  events: {
    play: function(e) {
      preloadPlayTimestamp = e.timestamp;
      player.play();
    },
    playing: function(e) {
      document.getElementById('startup-preload').innerHTML = e.timestamp - preloadPlayTimestamp + 'ms';
    },
    paused: function(e) {
      player.pause();
    }
  },
  playback: {
    muted: true
  }
};

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'preload-vod'
  },
  adaptation: {
    desktop: {
      preload: false
    },
    mobile: {
      preload: false
    }
  },
  events: {
    play: function(e) {
      playTimestamp = e.timestamp;
      playerPreload.play();
    },
    playing: function(e) {
      document.getElementById('startup').innerHTML = e.timestamp - playTimestamp + 'ms';
    },
    paused: function(e) {
      playerPreload.pause();
    }
  },
  playback: {
    muted: true
  }
};

var source = {
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
};

var playerPreloadContainer = document.getElementById('player-container-preload');
var playerPreload = new bitmovin.player.Player(playerPreloadContainer, preloadConf);

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

function loadPlayer() {
  playerPreload.load(source).then(function() {
    var bufferRatePreload = document.getElementById('buffer-preload');
    setInterval(function() {
      if (playerPreload && !playerPreload.isPaused()) {
        bufferRatePreload.innerHTML = Math.round(playerPreload.getVideoBufferLength() * 100) / 100 + 's';
      }
    }, 50);
  });

  player.load(source).then(function() {
    var bufferRate = document.getElementById('buffer');
    setInterval(function() {
      if (player && !player.isPaused()) {
        bufferRate.innerHTML = Math.round(player.getVideoBufferLength() * 100) / 100 + 's';
      }
    }, 50);
  });
}

$(document).ready(function() {
  loadPlayer();
});
