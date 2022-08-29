var adTag = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=' + Date.now();
var conf = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    playback: {
        muted: true
    },
    advertising: {
        adBreaks: [{
            tag: {
                url: adTag,
                type: 'vast'
            },
            position: 'pre',
        }],
        withCredentials: false,
        trackers: {
            omSdk: assembleOmSdkTrackerConfig(),
        }
    },
};
var source = {
    dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
};
var player;

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

/**
 * Used by the OM SDK validation script to log tracking events
 */
window.log = function(message, data) {
    $('<p class="log-message"></p>').append(getTimestamp() + ' - ').append(message, '&nbsp;', renderjson(data)).prependTo('#logContent');
}

function clearEventLog() {
  var log = document.querySelector('#logContent');

  while (log.firstChild) {
      log.removeChild(log.lastChild);
  }
}

function displayError(message) {
  document.querySelector('#error-wrapper').classList.remove('d-none');
  document.querySelector('#error').innerHTML = message;
}

function clearError(message) {
  document.querySelector('#error-wrapper').classList.add('d-none');
  document.querySelector('#error').innerHTML = '';
}

$('#validationscripturl-input').on('input', function(e) {
    if (e.target.value) {
        $('#event-log-row').hide();
    } else {
        $('#event-log-row').show();
    }
});

$('#apply-settings-btn').on('click', function(e) {
    var recreate = function() {
        conf.advertising.trackers.omSdk = assembleOmSdkTrackerConfig();
        player = setupPlayer(conf, source);
    };

    if (player) {
        player.destroy().then(function() {
          recreate();
          clearEventLog();
        });
    } else {
        recreate();
        clearEventLog();
    }

    clearError();
});

function getPartnerName() {
    const input = document.querySelector('#partnername-input');
    return input.value || input.placeholder;
}

function getPartnerVersion() {
    const input = document.querySelector('#partnerversion-input');
    return input.value || input.placeholder;
}

function getValidationScriptUrl() {
    var demoValidationScript = 'https://cdn.bitmovin.com/content/player-web/lib/omsdk/omid-validation-verification-script-v1-player-demo.js';
    return document.querySelector('#validationscripturl-input').value || demoValidationScript;
}

function getVendorKey() {
    return document.querySelector('#vendorkey-input').value;
}

function getParams() {
    return document.querySelector('#params-input').value;
}

function assembleVerificationResourceConfig() {
    var verificationResource = {
        validationScriptUrl: getValidationScriptUrl(),
    };
    var vendorKey = getVendorKey();
    if (vendorKey) {
        verificationResource.vendorKey = vendorKey;
    }
    var params = getParams();
    if (params) {
        verificationResource.params = params;
    }
    return verificationResource;
}

function assembleOmSdkTrackerConfig() {
    return {
        partnerName: getPartnerName(),
        partnerVersion: getPartnerVersion(),
        verificationResources: [
            assembleVerificationResourceConfig()
        ],
    };
}

function setupPlayer(conf, source) {
    var playerContainer = document.querySelector('#player-container');
    var player = new bitmovin.player.Player(playerContainer, conf);

    player.on('error', function(e) {
        displayError('Error: ' + e.code + '/' + e.name);
    });

    player.on('aderror', function(e) {
        displayError('Ad Error: ' + e.message + ' (potentially caused by ad blocker)');
        console.warn(e);
    });

    player.load(source);
    return player;
}

function injectScript(src) {
  return new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', resolve);
      script.addEventListener('error', function(e) {
        reject(e.error)
      });
      document.head.appendChild(script);
  });
}

function isIe() {
  return /MSIE|Trident/.test(navigator.userAgent);
}

function isEdgeLegacy() {
  return /Edge\/18/.test(navigator.userAgent);
}

$(document).ready(function() {
    renderjson.set_icons('+ ', '- ');

    if (isIe() || isEdgeLegacy()) {
      displayError('Sorry! This demo is not supported on Internet Explorer and Edge Legacy web browsers.');
      document.querySelector('#player-row').classList.add('d-none')
      document.querySelector('#event-log-row').classList.add('d-none')
      return;
    }

    Promise.all([
        injectScript('https://cdn.bitmovin.com/player/web/8/modules/bitmovinplayer-advertising-bitmovin.js'),
        injectScript('https://cdn.bitmovin.com/player/web/8/modules/bitmovinplayer-advertising-omsdk.js')
    ]).then(function() {
        bitmovin.player.Player.addModule(bitmovin.player['advertising-bitmovin'].default);
        bitmovin.player.Player.addModule(bitmovin.player['advertising-omsdk'].default);
        player = setupPlayer(conf, source);
    });
});
