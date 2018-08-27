var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin.com/wp-content/uploads/2016/06/sintel-poster.jpg'
  }
};

var analyticsConfig = {
  key: '0972b1c2-cc94-47f9-a145-43186617c05e',
  videoId: 'multi-audio-tracks'
};

var analytics = bitmovin.analytics(analyticsConfig);
var player = bitmovin.player('player');

analytics.register(player);
player.setup(conf);
