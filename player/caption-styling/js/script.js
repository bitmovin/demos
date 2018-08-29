var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
  }
};

var analyticsConfig = {
  key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
  videoId: 'caption-styling'
};

var analytics = bitmovin.analytics(analyticsConfig);
var player = bitmovin.player('player');

analytics.register(player);
player.setup(conf).then(function (value) {
  console.log('Successfully created bitmovin player instance');
}, function (reason) {
  console.log('Error while creating bitmovin player instance');
});
