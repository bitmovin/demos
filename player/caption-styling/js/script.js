var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
  }
};

var player = bitmovin.player('player');
player.setup(conf).then(function (value) {
  console.log('Successfully created bitmovin player instance');
}, function (reason) {
  console.log('Error while creating bitmovin player instance');
});
