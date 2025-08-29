var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  // key: '89f6ed6c-ab0e-46c2-ac47-5665e60c3c41',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'server-side-ad-insertion',
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

player.load(source).then(function (value) {
  player.on(bitmovin.player.PlayerEvent.TimeChanged, function (data) {
    if (player.getCurrentTime() >= 29.081333 && player.getCurrentTime() < 41.138666) {
      document.getElementsByClassName('bmpui-ui-container bmpui-controlbar-top')[0].style.display = 'none';
      hidden = true;
      played = true;
    } else if (hidden) {
      document.getElementsByClassName('bmpui-ui-container bmpui-controlbar-top')[0].style.display = 'block';
    }
  });
  player.on(bitmovin.player.PlayerEvent.Seek, function (data) {
    if (data.seekTarget > 29 && !played) {
      player.seek(29);
      played = true;
    }
  });
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
