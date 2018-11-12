var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'multi-audio-tracks'
  },
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin.com/wp-content/uploads/2016/06/sintel-poster.jpg'
  },
  playback: {
    muted: true
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(conf.source);
