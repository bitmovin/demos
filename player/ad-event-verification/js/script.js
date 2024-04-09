var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'ad-event-verification'
  },
  advertising: {
    adBreaks: [{
      tag: {
        url: '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Freleasetest.dash-player.com%2Fads%2F&description_url=[description_url]&correlator=[random]',
        type: 'vast'
      }
    }]
  },
  playback: {
    muted: true
  }
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
  poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

setPlayerEvents(player);

function loadPlayer() {
  player.load(source);
}

function getTimestamp() {
  var now = new Date();
  var h = checkTime(now.getHours());
  var m = checkTime(now.getMinutes());
  var s = checkTime(now.getSeconds());
  var mm = checkTime(now.getMilliseconds());
  now = h + ":" + m + ":" + s + ":" + mm;
  return '<span class="timestamp">' + now + '</span>';
}

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}

function log(message, data) {
  $('<p class="log-message"></p>').append(getTimestamp() + ' - ').append(message, '&nbsp;', renderjson(data)).prependTo('#logContent');
}

function setPlayerEvents(player) {
  player.on(bitmovin.player.PlayerEvent.AdBreakFinished, function (data) {
    log("Ad Break Finished:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdBreakStarted, function (data) {
    log("Ad Break Started:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdClicked, function (data) {
    log("Ad Clicked:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdError, function (data) {
    log("Ad Error:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdManifestLoaded, function (data) {
    log("Ad Manifest Loaded:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdQuartile, function (data) {
    log("Ad Quartile:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdSkipped, function (data) {
    log("Ad Skipped:", data);
  });

  player.on(bitmovin.player.PlayerEvent.AdStarted, function (data) {
    log("Ad Started:", data);
  });
}

$(document).ready(function () {
  renderjson.set_icons('+ ', '- ');

  loadPlayer();
});
