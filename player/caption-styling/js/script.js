var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'caption-styling'
  },
  playback: {
    muted: true
  }
};

var source = {
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
};

var playerContainer = document.getElementById('player-container');
bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function (value) {
  console.log('Successfully created bitmovin player instance');
}, function (reason) {
  console.log('Error while creating bitmovin player instance');
});
