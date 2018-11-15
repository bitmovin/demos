let availableRepresentations = [];

function onVideoAdaptationHandler(param) {
  const suggestedRep = availableRepresentations.filter((rep) => rep.id === param.suggested)[0];
  if (suggestedRep) {
    console.log('Suggested representation: ' + availableRepresentations[i].bitrate / 1000 + 'kbps');
  }
}

const conf = {
  key: '<YOUR PLAYER KEY>',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg',
  },
  adaptation: {
    desktop: {
      onVideoAdaptation: onVideoAdaptationHandler,
    },
    mobile: {
      onVideoAdaptation: onVideoAdaptationHandler,
    },
  },
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(conf.source).then(function () {
  availableRepresentations = player.getAvailableVideoQualities();
});
