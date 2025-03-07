var availableRepresentations = [];

function onVideoAdaptationHandler(param) {
  var suggestedRep = availableRepresentations.filter((rep) => rep.id === param.suggested)[0];
  if (suggestedRep) {
    console.log('Suggested representation: ' + availableRepresentations[i].bitrate / 1000 + 'kbps');
  }
}

var conf = {
  key: '<YOUR PLAYER KEY>',
  adaptation: {
    desktop: {
      onVideoAdaptation: onVideoAdaptationHandler,
    },
    mobile: {
      onVideoAdaptation: onVideoAdaptationHandler,
    },
  },
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
  poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg',
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  availableRepresentations = player.getAvailableVideoQualities();
});
