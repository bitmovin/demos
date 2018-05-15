var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
    hls: 'https://bitmovin.com/player-content/playhouse-vr/m3u8s/105560.m3u8',
    progressive: 'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4',
    poster: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/poster.jpg',
    vr: {
      startupMode: '2d',
      startPosition: 180
    }
  },
  style: {
    aspectratio: '2:1',
    ux: false
  }
};

bitmovin.player('player').setup(conf).then(function (player) {
  bitmovin.playerui.UIManager.Factory.buildModernSmallScreenUI(player);
});
