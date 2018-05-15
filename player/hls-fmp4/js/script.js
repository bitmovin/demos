var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s-fmp4/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/art-of-motion_poster.jpg'
  }
};

bitmovin.player('player').setup(conf);
