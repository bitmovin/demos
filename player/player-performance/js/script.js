var playTimestampV8, playTimestampV7, pageLoadedTimestamp;
var playerV7, playerV8;

var v8Conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'player-performance-v8'
  },
  events: {
    sourceloaded: function (e) {
      document.getElementById('ready-v8').innerHTML = e.timestamp - pageLoadedTimestamp + 'ms';
    },
    play: function (e) {
      playTimestampV8 = e.timestamp;
      playerV7.play();
    },
    playing: function (e) {
      document.getElementById('startup-v8').innerHTML = e.timestamp - playTimestampV8 + 'ms';
    },
    paused: function (e) {
      playerV7.pause();
    }
  },
  playback: {
    muted: true
  }
};

var v7Conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'player-performance-v7'
  },
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
  },
  events: {
    onReady: function (e) {
      document.getElementById('ready-v7').innerHTML = e.timestamp - pageLoadedTimestamp + 'ms';
    },
    onPlay: function (e) {
      playTimestampV7 = e.timestamp;
      playerV8.play();
    },
    onPlaying: function (e) {
      document.getElementById('startup-v7').innerHTML = e.timestamp - playTimestampV7 + 'ms';
    },
    onPaused: function (e) {
      playerV8.pause();
    }
  },
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
}

var playerV8Container = document.getElementById('player-container-v8');
playerV8 = new bitmovinV8.player.Player(playerV8Container, v8Conf);

playerV7 = bitmovinV7.player('player-container-v7');

function loadPlayer() {
  playerV8.load(source);
  playerV7.setup(v7Conf);
};

$(document).ready(function () {
  pageLoadedTimestamp = Date.now();
  loadPlayer();
});
