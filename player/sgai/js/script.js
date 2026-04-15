function setupPlayers() {
  players.forEach(({ containerId, source, videoId }) => {
    createPlayer(containerId, source, videoId);
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
  playback: {
    muted: true,
    autoplay: true,
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

var players = [
  { containerId: 'player-linear', source: sources.linear, videoId: 'server-guided-ad-insertion-linear' },
  { containerId: 'player-lshape', source: sources.lshape, videoId: 'server-guided-ad-insertion-lshape' },
  { containerId: 'player-doublebox', source: sources.doublebox, videoId: 'server-guided-ad-insertion-doublebox' },
];

function createPlayer(containerId, source, videoId) {
  var container = document.getElementById(containerId);
  var playerConf = Object.assign({}, conf, {
    analytics: Object.assign({}, conf.analytics, { videoId: videoId }),
  });
  var player = new bitmovin.player.Player(container, playerConf);

  player.on(bitmovin.player.PlayerEvent.PlaybackFinished, function () {
    player.play();
  });

  player.load(source);
  return player;
}

setupPlayers();
