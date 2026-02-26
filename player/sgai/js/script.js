var url, sessionId;

// Dynamically load the advertising module because the demo framework throws an error otherwise
function loadAdvertisingModule() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.bitmovin.com/player/web/8.195.0-beta.2/modules/bitmovinplayer-advertising-bitmovin.js';
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
};

var source = {
  hls:
    'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/adblendr-hls-interstitials/playlist.m3u8',
};

var hidden = false;
var played = false;

var playerContainer = document.getElementById('player-container');

function buildUiManager(player) {
  if (!bitmovin.playerui || !bitmovin.playerui.UIFactory) {
    throw new Error('bitmovin.playerui.UIFactory is not available');
  }

  if (typeof bitmovin.playerui.UIFactory.buildUI === 'function') {
    return bitmovin.playerui.UIFactory.buildUI(player);
  }

  // Fallback for older UI bundles that still expose the old method name.
  if (typeof bitmovin.playerui.UIFactory.buildDefaultUI === 'function') {
    return bitmovin.playerui.UIFactory.buildDefaultUI(player);
  }

  throw new Error('No compatible UIFactory build method found');
}

// Load advertising module and then initialize player
loadAdvertisingModule()
  .then(() => {
    bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
    bitmovin.player.Player.addModule(bitmovin.player['advertising-bitmovin'].default);
    var player = new bitmovin.player.Player(playerContainer, conf);
    buildUiManager(player);

    player.load(source);
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
