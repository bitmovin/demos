var conf = {
  key: '<YOUR PLAYER KEY>',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/manifest.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/498364_fcb0257026d0bd3ee0ba3aad95674188/poster.jpg'
  }
};

var hidden = false;
var played = false;

var player = bitmovin.player('player');

player.setup(conf).then(function () {
  player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, function (data) {
    if (player.getCurrentTime() >= 29.081333 && player.getCurrentTime() < 41.138666) {
      document.getElementsByClassName('bmpui-ui-container bmpui-controlbar-top')[0].style.display = 'none';
      hidden = true;
      played = true;
    } else if (hidden) {
      document.getElementsByClassName('bmpui-ui-container bmpui-controlbar-top')[0].style.display = 'block';
    }
  });

  player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, function (data) {
    if (data.seekTarget > 29 && !played
    ) {
      player.seek(29);
      played = true;
    }
  });
});
