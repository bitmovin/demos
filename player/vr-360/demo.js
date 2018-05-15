const conf = {
  key: '<YOUR PLAYER KEY HERE>',
  source: {
    dash:
      'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
    hls:
      'https://bitmovin.com/player-content/playhouse-vr/m3u8s/105560.m3u8',
    progressive:
      'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4',
    poster:
      'https://bitmovin-a.akamaihd.net/content/playhouse-vr/poster.jpg',
    vr: {
      startupMode: '2d',
      startPosition: 180,
    },
  },
  style: {
    aspectratio: '2:1',
  },
};