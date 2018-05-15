const conf = {
  key: '<YOUR PLAYER KEY>',
  playback: {
    muted: true,
    autoplay: true
  }
};

var player = bitmovin.player('player');
player.setup(conf);