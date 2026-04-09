// Dynamically load the advertising module because the demo framework throws an error otherwise
function loadAdvertisingModule() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.bitmovin.com/player/web/8/modules/bitmovinplayer-advertising-bitmovin.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'server-guided-ad-insertion',
  },
  logs: {
    level: 'debug',
  },
  tweaks: {
    enable_sgai_handling: true,
  },
  playback: {
    muted: true,
    autoplay: true,
  },
  advertising: {
    withCredentials: false,
  },
  ui: false,
  adaptation: {
    desktop: {
      limitToPlayerSize: true,
    },
    mobile: {
      limitToPlayerSize: true,
    },
  },
};

var sources = {
  linear: {
    hls: 'https://cdn.bitmovin.com/content/internal/demos/sgai/aip-recordings/linear/manifest.m3u8',
  },
  lshape: {
    hls: 'https://cdn.bitmovin.com/content/internal/demos/sgai/aip-recordings/l-bar/manifest.m3u8',
  },
  doublebox: {
    hls: 'https://cdn.bitmovin.com/content/internal/demos/sgai/aip-recordings/double-box/manifest.m3u8',
  },
};

var playerIds = ['player-linear', 'player-lshape', 'player-doublebox'];
var sourceKeys = ['linear', 'lshape', 'doublebox'];

function createPlayer(containerId, source) {
  var container = document.getElementById(containerId);
  var player = new bitmovin.player.Player(container, conf);

  player.on(bitmovin.player.PlayerEvent.PlaybackFinished, function () {
    player.play();
  });

  player.load(source);
  return player;
}

loadAdvertisingModule()
  .then(() => {
    bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
    bitmovin.player.Player.addModule(bitmovin.player['advertising-bitmovin'].default);

    playerIds.forEach((playerId, index) => {
      createPlayer(playerId, sources[sourceKeys[index]]);
    });
  })
  .catch((error) => {
    console.error('Failed to load advertising module:', error);
  });

(function () {
  if (isAdblockEnabled) {
    var blockerWrapperEl = document.getElementById('blocker-wrapper');
    var blockerInfoEl = document.getElementById('blocker-info');
    blockerInfoEl.innerHTML =
      '<b>Ad Blocker detected!</b> However, ads will still play, since they are inserted already on the server side.';
    blockerWrapperEl.style.display = 'block';
  }
})();
