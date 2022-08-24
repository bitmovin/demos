var conf = {
  key: '<YOUR PLAYER KEY HERE>',
  style: {
    aspectratio: '2:1',
  },
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/mpds/105560.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/m3u8s/105560.m3u8',
  progressive: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/progressive.mp4',
  poster: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/poster.jpg'
  vr: {
    startupMode: '2d',
    startPosition: 180,
  }
};