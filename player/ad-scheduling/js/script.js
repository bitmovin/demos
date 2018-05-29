var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: '//bitmovin-a.akamaihd.net/content/art-of-motion_drm/art-of-motion_poster.jpg'
  },
  advertising: {
    client: 'vpaid',
    schedule: {
      'pre-roll-ad': {
        offset: 'pre',
        tag: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]',
      }
    }
  },
  style: {
    ux: false
  },
  events: {
    onAdError: function (err) {
      document.querySelector('#ad-error').innerHTML = 'Ad-Error:' + err.message;
    },
    onWarning: function (err) {
      document.querySelector('#ad-warning').innerHTML = err.message;
    }
  }
};

document.querySelector('#scheudle-ad-button').addEventListener('click', loadConfig);
document.querySelector('#reset-button').addEventListener('click', removeSchedule);

var player = bitmovin.player('player');
player.setup(conf).then(function (player) {
  bitmovin.playerui.UIManager.Factory.buildModernSmallScreenUI(player);
});

function resetAdError() {
  document.querySelector('#ad-error').innerHTML = '';
}

function loadConfig() {
  resetAdError();
  var adType = document.getElementById('adType').value || 'vast';
  var schedule = document.getElementById('schedule-list').value;
  if (schedule) {
    var manifestUrl = document.getElementById('ad-server-url').value;
    if (!manifestUrl) {
      switch (adType) {
        case 'ima': {
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=[random]';
          break;
        }
        case 'vmap': {
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator=[random]';
          break;
        }
        case 'vpaid': {
          // same as VAST
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Freleasetest.dash-player.com%2Fads%2F&description_url=[description_url]&correlator=[random]';
          break;
        }
        default: {
          // reset to VAST
          manifestUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Freleasetest.dash-player.com%2Fads%2F&description_url=[description_url]&correlator=[random]';
          document.getElementById('adType').value = 'vast';
        }
      }
    }
    // vmap is handled as ima tag
    if (adType === 'vmap') {
      adType = 'ima';
    }
    player.scheduleAd(manifestUrl, adType, {
      'timeOffset': document.getElementById('schedule-list').value,
      'pertistant': true,
      'adMessage': 'Dynamically scheduled ad'
    });
  }
  player.play();
}

function removeSchedule() {
  resetAdError();
  player.destroy();
  player = bitmovin.player('player');
  player.setup({
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    source: {
      dash: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
      hls: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      progressive: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
      poster: '//bitmovin-a.akamaihd.net/content/art-of-motion_drm/art-of-motion_poster.jpg'
    },
    events: {
      onAdError: function (err) {
        document.querySelector('#ad-error').innerHTML = 'Ad-Error:' + err.message;
      },
      onWarning: function (err) {
        document.querySelector('#ad-warning').innerHTML = err.message;
      }
    }
  });
}

(function() {
  if (isAdblockEnabled) {
    var blockerWrapperEl = document.getElementById('blocker-wrapper');
    var blockerInfoEl = document.getElementById('blocker-info');
    blockerInfoEl.innerHTML = '<b>Ad Blocker detected!</b> Ads may be blocked. Click here to see our server side ad insertion solution to bypass ad blockers.';
    blockerWrapperEl.style.display = 'block';
  }
})();
