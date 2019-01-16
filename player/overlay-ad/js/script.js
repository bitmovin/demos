var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  advertising: {
    adBreaks: [{
      tag: {
        url: 'https://pubads.g.doubleclick.net/gampad/ads?sz=480x70&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dnonlinear&correlator=',
        type: 'vast'
      }
    }]
  },
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
  hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  poster: 'https://bitmovin-a.akamaihd.net/content/sintel/poster.png'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);
