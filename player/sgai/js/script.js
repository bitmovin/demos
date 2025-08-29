var url, sessionId;

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
  },
  network: {
    preprocessHttpResponse: (type, response) => {
      if (type === 'manifest/hls/master') {
        const lines = response.body.split('\n');

        const hostRegex = /^#EXT-X-DEFINE:NAME="host",VALUE="([^"]+)"/;
        const sessionIdRegex = /^#EXT-X-DEFINE:NAME="sessionId",VALUE="([^"]+)"/;

        lines.forEach((line) => {
          const trimmedLine = line.trim();

          const hostMatch = trimmedLine.match(hostRegex);
          if (hostMatch) {
            url = hostMatch[1];
          }

          const sessionMatch = trimmedLine.match(sessionIdRegex);
          if (sessionMatch) {
            sessionId = sessionMatch[1];
          }
        });

        console.warn('YOLO-> Extracted URL', url);
        console.warn('YOLO-> Extracted session ID', sessionId);
      }

      if (type === 'manifest/hls/variant') {
        console.warn('Replacing DEFINE tags in variant');
        response.body = response.body.replaceAll('{$host}', url);
        response.body = response.body.replaceAll('{$sessionId}', sessionId);
      }

      return Promise.resolve(response);
    },
  },
  location: {
    ui: 'https://cdn.bitmovin.com/player/web/8/bitmovinplayer-ui.js',
    ui_css: 'https://cdn.bitmovin.com/player/web/8/bitmovinplayer-ui.css',
  },
};

var source = {
  hls:
    'https://csm-e-yopoc2-live-usw2-eb.bln1.yospace.com/csm/sgai/extlive/lefort01,tennis-interstitial-dual.m3u8?yo.t.jt=1000',
};

var hidden = false;
var played = false;

var playerContainer = document.getElementById('player-container');
bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);

(function () {
  if (isAdblockEnabled) {
    var blockerWrapperEl = document.getElementById('blocker-wrapper');
    var blockerInfoEl = document.getElementById('blocker-info');
    blockerInfoEl.innerHTML =
      '<b>Ad Blocker detected!</b> However, ads will still play, since they are inserted already on the server side.';
    blockerWrapperEl.style.display = 'block';
  }
})();