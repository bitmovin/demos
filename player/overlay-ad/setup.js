var conf = {
  key: '<YOUR PLAYER KEY>',
  advertising: {
    adBreaks: [{
      tag: {
        url: adUrl,
        type: adType
      }
    }]
  }
};
  
var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png',
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);