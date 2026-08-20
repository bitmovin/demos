// Fresh session GUID on every page load; sent as CMCD sid and analytics customData2
const sessionGuid = crypto.randomUUID();

const MAX_LOG_ENTRIES = 100;
const loggedUrls = new Set();

function setupPlayerWithCmcd() {
  const playerConfig = {
    key: '910f0c4a-1556-4148-b0f0-b21840c569eb',
    playback: {
      muted: true,
    },
    analytics: {
      key: '23c016d2-f127-4c02-bdd2-9724a2774903',
      customUserId: '1111-111111-111111-11111',
      videoId: 'art-of-motion',
      title: 'Art of Motion',
      customData1: 'art-of-motion',
      customData2: sessionGuid,
    },
  };

  const cmcdConfig = {
    useQueryArgs: true,
    sessionId: sessionGuid,
    contentId: 'art-of-motion',
  };

  const cmcdIntegration = new window.bitmovin.player.integration.Cmcd.CmcdIntegration(cmcdConfig);

  playerConfig.network = {
    preprocessHttpRequest: cmcdIntegration.preprocessHttpRequest,
    preprocessHttpResponse: cmcdIntegration.preprocessHttpResponse,
  };
  playerConfig.adaptation = {
    desktop: {
      onVideoAdaptation: cmcdIntegration.onVideoAdaptation,
      onAudioAdaptation: cmcdIntegration.onAudioAdaptation,
    },
    mobile: {
      onVideoAdaptation: cmcdIntegration.onVideoAdaptation,
      onAudioAdaptation: cmcdIntegration.onAudioAdaptation,
    },
  };

  const player = new bitmovin.player.Player(
    document.querySelector('#playerContainer'),
    playerConfig,
  );

  cmcdIntegration.setPlayer(player);

  const source = {
    hls: 'https://democmcd.cdb-staging.cdn.orange.com/bitmovin/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg',
    thumbnailTrack: {
      url: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/thumbnails/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.vtt',
    },
  };

  // The stream is only loaded (and requests only start) when the user presses play
  const playOverlay = document.getElementById('playOverlay');
  playOverlay.addEventListener('click', () => {
    playOverlay.classList.add('hidden');
    player.load(source).then(() => player.play());
  }, { once: true });
}

// Live log of outgoing requests carrying CMCD data
function logCmcdRequest(url) {
  if (loggedUrls.has(url)) return;
  loggedUrls.add(url);

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return;
  }
  const cmcd = parsed.searchParams.get('CMCD');
  if (!cmcd) return;

  // Split on commas that are not inside quoted values (e.g. nor="...")
  const pairs = cmcd.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  const keysHtml = pairs.map(pair => {
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? 'true' : pair.slice(eq + 1);
    return '<span class="cmcd-key"><b>' + key + '</b>=' + value.replace(/</g, '&lt;') + '</span>';
  }).join('');

  const requestLog = document.getElementById('requestLog');
  const entry = document.createElement('div');
  entry.className = 'req-entry';
  entry.innerHTML =
    '<div><span class="req-time">' + new Date().toLocaleTimeString() + '</span>' +
    '<span class="req-file">' + parsed.origin + parsed.pathname + '</span></div>' +
    '<div class="cmcd-keys">' + keysHtml + '</div>';
  requestLog.prepend(entry);

  while (requestLog.children.length > MAX_LOG_ENTRIES) {
    requestLog.removeChild(requestLog.lastChild);
  }
}

function startRequestObserver() {
  new PerformanceObserver(list => {
    list.getEntries().forEach(e => logCmcdRequest(e.name));
  }).observe({ type: 'resource', buffered: true });
}

function init() {
  setupPlayerWithCmcd();
  startRequestObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
