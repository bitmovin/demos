const conf = {
  key: '<YOUR PLAYER KEY>',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png',
  },
  playback: {
    autoplay: true,
    muted: true,
  },
  style: {
    ux: false,
  },
};

const player = bitmovin.player('player');
player.setup(conf);
