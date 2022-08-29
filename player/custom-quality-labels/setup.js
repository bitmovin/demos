var getQualityLabels = function (data) {
  if (data.height <= 1440) {
    return '1440p HD';
  } else if (data.height <= 2160) {
    return '2160p 4K';
  }
}

var conf = {
    key: '<YOUR PLAYER KEY>'
  };
  
var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png',
  labeling: {
    dash: {
      qualities: getQualityLabels
    },
    hls: {
      qualities: getQualityLabels
    }
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);