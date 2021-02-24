var humanizeBitrate = function(bitrate) {
  var mbit = bitrate / 1000000;
  var rounded = mbit < 3 ? Math.round(mbit * 10) / 10 : Math.round(mbit);
  return rounded + 'Mbit';
};

var formatBitrate = function(bitrate) {
  return '(' + humanizeBitrate(bitrate) + ')';
};

var getQualityLabels = function(data) {
  var label;
  if (data.height <= 144) {
    label = '144p';
  } else if (data.height <= 240) {
    label = '240p';
  } else if (data.height <= 360) {
    label = '360p';
  } else if (data.height <= 480) {
    label = 'SD 480p';
  } else if (data.height <= 720) {
    label = 'HD 720p';
  } else if (data.height <= 1080) {
    label = 'HD 1080p';
  } else if (data.height <= 1440) {
    label = 'HD 1440p';
  } else if (data.height <= 2160) {
    label = '4K 2160p';
  } else {
    return '';
  }
  return label + ' ' + formatBitrate(data.bitrate);
};

var conf = {
  key: '<YOUR PLAYER KEY>'
};

var source = {
  hls: 'https://cdn.bitmovin.com/content/demos/4k/38e843e0-1998-11e9-8a92-c734cd79b4dc/manifest.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/poster_tos.jpg',
  labeling: {
    hls: {
      qualities: getQualityLabels
    }
  }
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function() {
  player.setVideoQuality('1600_50128000');
});
