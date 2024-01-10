var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'ad-scheduling'
  },
  advertising: {},
  playback: {
    muted: true
  },
  events: {
    aderror: function (err) {
      var errorMessage = 'Ad-Error: ' + err.message;
      if (err.data && err.data.message) {
        errorMessage = errorMessage + ': ' + err.data.message;
      }
      document.querySelector('#ad-error').innerHTML = errorMessage;
    },
    warning: function (err) {
      document.querySelector('#ad-warning').innerHTML = err.message;
    }
  }
};

var source = {
  hls: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  dash: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
  progressive: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
  poster: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
};

document.querySelector('#scheudle-ad-button').addEventListener('click', loadConfig);
document.querySelector('#reset-button').addEventListener('click', removeSchedule);

var playerContainer = document.getElementById('player-container');
bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source);

function resetAdError() {
  document.querySelector('#ad-error').innerHTML = '';
}

function loadConfig() {
  resetAdError();
  var adType = document.getElementById('adType').value || 'vast';
  var adTagType = adType;

  var schedule = document.getElementById('schedule-list').value;
  if (schedule) {
    var manifestUrl = document.getElementById('ad-server-url').value;
    if (!manifestUrl) {
      switch (adType) {
        case 'vmap': {
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator=[random]';
          adTagType = 'vmap';
          break;
        }
        case 'vpaid': {
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinearvpaid2js&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=[random]';
          adTagType = 'vast';
          break;
        }
        default: {
          // reset to VAST
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=[random]';
          adTagType = 'vast';
          document.getElementById('adType').value = 'vast';
        }
      }
    }

    player.ads.schedule({
      tag: {
        url: manifestUrl,
        type: adTagType
      },
      id: 'Ad',
      position: document.getElementById('schedule-list').value
    });
  }
  player.play();
}

function removeSchedule() {
  resetAdError();

  if (player.ads) {
    var activeAd = player.ads.getActiveAdBreak();
    var adArray = player.ads.list();

    if (adArray.length != 0) {
      adArray.forEach(function (element) {
        player.ads.discardAdBreak(element.id);
      });
    }

    if (activeAd) {
      player.ads.discardAdBreak(activeAd.id);
    }
  }

  player = new bitmovin.player.Player(playerContainer, conf);
  player.load({
    hls: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    dash: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    progressive: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: '//cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
  });
}

(function () {
  if (isAdblockEnabled) {
    var blockerWrapperEl = document.getElementById('blocker-wrapper');
    var blockerInfoEl = document.getElementById('blocker-info');
    blockerInfoEl.innerHTML = '<b>Ad Blocker detected!</b> Ads may be blocked. Click here to see our server side ad insertion solution to bypass ad blockers.';
    blockerWrapperEl.style.display = 'block';
  }
})();
