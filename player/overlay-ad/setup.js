var conf = {
  key: '<YOUR PLAYER KEY>',
  advertising: {
    adBreaks: [{
      tag: {
        url: adUrl,
        type: adType
      }
    }],
    adContainer: function() {
      return document.getElementById('my-element');
    }
  }
};
  
var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
  poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png',
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);