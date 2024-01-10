var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'server-side-ad-insertion'
  },
  playback: {
    muted: true
  }
};

var source = {
  hls: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/playlist.m3u8',
  dash: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/manifest.mpd',
  poster: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/poster.jpg',
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

(function() {
  if (isAdblockEnabled) {
    var blockerWrapperEl = document.getElementById('blocker-wrapper');
    var blockerInfoEl = document.getElementById('blocker-info');
    blockerInfoEl.innerHTML = '<b>Ad Blocker detected!</b> However, ads will still play, since they are inserted already on the server side.';
    blockerWrapperEl.style.display = 'block';
  }
})();
