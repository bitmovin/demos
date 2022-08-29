var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'vr-360'
  },
  style: {
    aspectratio: '2:1'
  },
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/mpds/105560.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/m3u8s/105560.m3u8',
  progressive: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/progressive.mp4',
  poster: 'https://cdn.bitmovin.com/content/assets/playhouse-vr/poster.jpg',
  vr: {
    startupMode: '2d',
    startPosition: 180
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);
