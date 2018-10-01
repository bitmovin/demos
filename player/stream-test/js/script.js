window.onload = function getURLParams() {
  var manifestParam = getParamsQueryString('manifest');
  var streamFormatParam = getParamsQueryString('format');
  if (manifestParam && streamFormatParam) {
    document.getElementsByName('stream-format').forEach(function (element) {
      if (element.value === streamFormatParam) {
        element.checked = true;
      }
    })
    document.getElementById('manifest-input').value = manifestParam;

    loadPlayerFromControls();
  }
  else {
    setupPlayer('dash', config.source.dash, null, null);
  }
};

var initialTimestamp, bufferChart, bitrateChart;
var updateCount = 0;

var loadManifestButton = document.getElementById('manifest-load');
loadManifestButton.onclick = loadPlayerFromControls;

var setDefaultManifestButton = document.getElementById('default-manifest');
setDefaultManifestButton.onclick = setDefaultManifest;

var scheduleAdButton = document.getElementById('schedule-ad');
scheduleAdButton.onclick = showAd;

var config = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    smooth: 'http://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest',
    poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
  },
  drmSource: {
    dash: 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/m3u8s/11331.m3u8',
    smooth: 'https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest',
    drm: {
      widevine: {
        LA_URL: 'https://widevine-proxy.appspot.com/proxy'
      },
      playready: {
        LA_URL: 'https://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&#038;ContentKey=EAtsIJQPd5pFiRUrV9Layw=='
      }
    }
  },
  cast: {
    enable: true
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

var defaultAdUrl = {
  vast: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Freleasetest.dash-player.com%2Fads%2F&description_url=[description_url]&correlator=[random]',
  vpaid: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/32573358/skippable_ad_unit&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Freleasetest.dash-player.com%2Fads%2F&description_url=[description_url]&correlator=[random]',
  vmap: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator=[random]',
  ima: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=[random]'
};

var analyticsConfig = {
  key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
  videoId: 'stream-test'
};

var analytics = bitmovin.analytics(analyticsConfig);
var player = bitmovin.player('player');
analytics.register(player);

function setURLParameter(format, manifest) {
  var manifestValue = encodeURIComponent(manifest);
  var streamFormatValue = encodeURIComponent(format);
  var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + '?format=' + streamFormatValue + '&manifest=' + manifestValue;
  window.history.pushState({ path: newURL }, '', newURL);
}

function handleKeyPress(keyEvent) {
  if (manifest.value.length > 0) {
    var lowerCaseUrl = manifest.value.toLowerCase();
    if (lowerCaseUrl.indexOf('.mpd') > -1 && lowerCaseUrl.indexOf('.mpd') === lowerCaseUrl.length - 4) {
      streamFormat.value = 'dash';
    } else if (lowerCaseUrl.indexOf('.m3u8') > -1 && lowerCaseUrl.indexOf('.m3u8') === lowerCaseUrl.length - 5) {
      streamFormat.value = 'hls';
    } else if ((lowerCaseUrl.indexOf('.webm') > -1 && lowerCaseUrl.indexOf('.webm') === lowerCaseUrl.length - 5) ||
      (lowerCaseUrl.indexOf('.mp4') > -1 && lowerCaseUrl.indexOf('.mp4') == lowerCaseUrl.length - 4)) {
      streamFormat.value = 'progressive';
    }
  }

  if (keyEvent.keyCode === 13) {
    loadPlayerFromControls();
  }
}

function setupPlayer(manifestType, manifestUrl, drm, licenceUrl) {
  if (!drm) {
    var  drm = 'none';
  };

  if (!licenceUrl) {
    var licenceUrl = '';
  }

  if (player && player.isSetup()) {
    player.destroy();
    player = null;
    clearChart();
    setupChart();
  }

  player = bitmovin.player('player');
  analytics.register(player);

  setPlayerEvents(player);

  // clone config to avoid leftovers from previous calls
  var conf = JSON.parse(JSON.stringify(config));

  if (manifestUrl == null || manifestUrl === '') {
    if (drm === 'none') {
      conf.source = JSON.parse(JSON.stringify(config.source));
    } else {
      conf.source = JSON.parse(JSON.stringify(config.drmSource));
    }
  } else {
    conf.source = {};
    conf.source[manifestType] = manifestUrl;
  }

  if (drm !== 'none') {
    conf.source['drm'] = {};
    conf.source.drm[drm] = { 'LA_URL': licenceUrl };
  }

  if (!conf.source) {
    conf.source = JSON.parse(JSON.stringify(config.source));
  }

  player.setup(conf).then(function () {
    createAdConfig();
  }).catch(function (error) {
    console.log(error);
  });
}

function loadPlayerFromControls() {
  var manifestInput = document.querySelector('#manifest-input').value;
  var licenceInput = document.querySelector('#drm-license').value;
  var drmSystem = document.querySelector('[name="drm-format"]:checked').value;
  var manifestType = document.querySelector('[name="stream-format"]:checked').value;

  if (manifestInput && manifestInput !== '' && !checkIsUrlValid(manifestInput, 'Manifest URL')) {
    return;
  }
  if (licenceInput && licenceInput !== '' && !checkIsUrlValid(licenceInput, 'License URL')) {
    return;
  }

  setupPlayer(manifestType, manifestInput, drmSystem, licenceInput, );
}

function setDefaultManifest() {
  var drmSystem = document.querySelector('[name="drm-format"]:checked').value;
  var manifestType = document.querySelector('[name="stream-format"]:checked').value;

  if (drmSystem === 'none') {
    document.querySelector('#manifest-input').value = config.source[manifestType];
    document.querySelector('#drm-license').value = null;
    setURLParameter(manifestType, config.source[manifestType]);
  }
  else {
    document.querySelector('#manifest-input').value = config.drmSource[manifestType];
    document.querySelector('#drm-license').value = config.drmSource.drm[drmSystem].LA_URL;
    setURLParameter(manifestType, config.drmSource[manifestType]);
  }

  for (i = 1; i < 4; i++) {
    var adType = document.querySelector(`[name="ad${i}-type"]:checked`);

    if (adType) {
      document.querySelector(`#ad${i}-input`).value = defaultAdUrl[adType.value];
    }
  }

}

function createAdConfig() {
  for (i = 1; i < 4; i++) {
    var adBox = document.getElementById(`ad-box-${i}`);

    if (adBox) {
      var adManifestUrl = document.getElementById(`ad${i}-input`).value;
      var adType = document.querySelector(`[name="ad${i}-type"]:checked`).value;
      var adPosition = document.querySelector(`[name="ad${i}-position"]:checked`).value;

      player.scheduleAd(adManifestUrl, adType, {
        persistent: true,
        adMessage: 'Dynamically scheduled ad',
        timeOffset: adPosition
      });
    }
  }
}

function checkIsUrlValid(url, urlPurpose) {
  if (url === null || url == undefined || url === '') {
    console.error(urlPurpose + ' is not defined.');
    return false;
  }
  if (typeof url !== 'string') {
    console.error(urlPurpose + ' is not a string');
    return false;
  }
  // check if url is absolute
  if (!/^https?:\/\/|^\/\//i.test(url)) {
    console.error(urlPurpose + ' has to be absolute');
    return false;
  }
  return true;
}

function getParamsQueryString(key) {
  var querySearch = location.search.substring(1).split('&');
  for (var i = 0; i < querySearch.length; i++) {
    var keyValueParameter = querySearch[i].split('=');
    if (keyValueParameter[0] === key) {
      return decodeURIComponent(keyValueParameter[1]);
    }
  }
  return key === false || key === null ? res : null;
}

function check404(url, callbackFunction) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      xhr.onreadystatechange = null;
      callbackFunction(xhr.status);
    }
  };

  xhr.send('Content-type', 'application/x-www-form-urlencoded');
}

function showAd() {
  var adBox1 = document.getElementById('ad-box-1');
  var adBox2 = document.getElementById('ad-box-2');
  var adBox3 = document.getElementById('ad-box-3');

  if (!adBox1) {
    createAdBox(1);
  }
  else if (!adBox2) {
    createAdBox(2);
  }
  else if (!adBox3) {
    createAdBox(3);
  }
}

function hideAd(elementId) {
  document.getElementById(elementId).remove();
}

function createAdBox(number) {
  $(`<div class="demo-input-box ad-box" id="ad-box-${number}">
  <div class="demo-drm-header">
      <div>AD ${number}</div>
      <input id="delete-ad${number}" class="btn btn-outline-primary active" type="delete-ad" value="Delete" onclick="hideAd('ad-box-${number}')">
  </div>
  <div class="demo-stream-type-input">
      <div class="type-header">AD Type</div>
      <div class="input-type">
          <input id="ad${number}-type" type="radio" name="ad${number}-type" value="vast" checked> VAST
      </div>
      <div class="input-type">
          <input id="ad${number}-type" type="radio" name="ad${number}-type" value="vpaid"> VPAID
      </div>
      <div class="input-type">
          <input id="ad${number}-type" type="radio" name="ad${number}-type" value="vmap"> VMAP
      </div>
      <div class="input-type">
          <input id="ad${number}-type" type="radio" name="ad${number}-type" value="ima"> IMA
      </div>
  </div>
  <div class="demo-stream-type-input">
      <div class="type-header">AD Position</div>
      <div class="input-type">
          <input id="ad${number}-position" type="radio" name="ad${number}-position" value="pre" checked> Pre-Roll
      </div>
      <div class="input-type">
          <input id="ad${number}-position" type="radio" name="ad${number}-position" value="50%"> Mid-Roll
      </div>
      <div class="input-type">
          <input id="ad${number}-position" type="radio" name="ad${number}-position" value="post"> Post-Roll
      </div>
  </div>
  <input id="ad${number}-input" class="form-control" name="ad${number}-input" type="text" placeholder="AD Source URL">
</div>`).appendTo('#ad-box-wrapper');
}

function clearChart() {
  bufferChart.destroy();
  bitrateChart.destroy();
}

function addNewData(videoBuffer, audioBuffer, bitrate) {
  var currentTimeDiff = (Date.now() - initialTimestamp) / 1000;

  addChartData(bufferChart, 0, currentTimeDiff, videoBuffer);
  addChartData(bufferChart, 1, currentTimeDiff, audioBuffer);
  addChartData(bitrateChart, 0, currentTimeDiff, bitrate / 1000000);
}

function updateCharts(player) {
  addNewData(player.getVideoBufferLength(), player.getAudioBufferLength(), player.getDownloadedVideoData().bitrate);
}

function addChartData (chart, seriesIndex, xAxis, yAxis) {
  chart.series[seriesIndex].addPoint([xAxis, yAxis], true, false);
}

function setupChart() {
  initialTimestamp = Date.now();

  bufferChart = Highcharts.chart(document.getElementById("buffer-chart"), {

    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    title: {
      text: 'Buffer Levels'
    },
    xAxis: {
      title: {
        text: 'time',
        align: 'low'
      },
      min: 0
    },
    yAxis: {
      title: {
        text: 'sec',
        align: 'high'
      },
      min: 0
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom'
    },
    series: [{
      name: 'Video',
      data: [[0,0]],
      marker: {
        enabled: true,
        fillColor: '#ffffff',
        lineWidth: 2,
        lineColor: null,
        symbol: 'circle'
      },
      color: '#1FAAE2'
    }, {
      name: 'Audio',
      data: [[0,0]],
      marker: {
        enabled: true,
        fillColor: '#ffffff',
        lineWidth: 2,
        lineColor: null,
        symbol: 'circle'
      },
      color: '#F49D1D'
    }],

    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  });

  bitrateChart = Highcharts.chart(document.getElementById("bitrate-chart"), {

    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    title: {
      text: 'Buffer Levels'
    },
    xAxis: {
      title: {
        text: 'time',
        align: 'low'
      },
      min: 0
    },
    yAxis: {
      title: {
        text: 'sec',
        align: 'high'
      },
      min: 0
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom'
    },
    series: [{
      name: 'Video',
      data: [[0,0]],
      marker: {
        enabled: true,
        fillColor: '#ffffff',
        lineWidth: 2,
        lineColor: null,
        symbol: 'circle'
      },
      color: '#1FAAE2'
    }],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  });
};

function trimInput(input) {
  if ($.trim(input) !== '') {
    return input
  } else {
    return 0;
  }
}

function setPlayerEvents(player) {

  player.addEventHandler(player.EVENT.ON_AUDIO_PLAYBACK_QUALITY_CHANGED, function (data) {
    log("On Audio Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_VIDEO_PLAYBACK_QUALITY_CHANGED, function (data) {
    log("On Video Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_STALL_STARTED, function (data) {
    log("On Buffering Started: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_STALL_ENDED, function (data) {
    log("On Buffering Ended: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_PLAYING, function (data) {
    log("On Playing: " + JSON.stringify(data))
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_PAUSE, function (data) {
    log("On Pause: " + JSON.stringify(data))
  });

  player.addEventHandler(player.EVENT.ON_PAUSED, function (data) {
    log("On Paused: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_PLAY, function (data) {
    log("On Play: " + JSON.stringify(data))
  });

  player.addEventHandler(player.EVENT.ON_METADATA_PARSED, function (data) {
    log("On Metadata Parsed: " + JSON.stringify(data))
  });

  player.addEventHandler(player.EVENT.ON_READY, function (data) {
    log("On Ready: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_SOURCE_LOADED, function (data) {
    log("On Loaded: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_STOPPED, function (data) {
    log("On Stopped: " + JSON.stringify(data));
  });

  player.addEventHandler(player.EVENT.ON_ERROR, function (data) {
    log("On Error: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_SEEK, function (data) {
    log("On Seek Started: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_SEEKED, function (data) {
    log("On Seek Finished: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler('onTimeChanged', function () {
    updateCount++;

    if (updateCount % 4 == 1) {
      updateCharts(player);
    }
  });
}


function log(message) {
  $('<p class="log-message"></p>').append(getTimestamp() + ' - ').append(message).appendTo('#logContent');
}
function checkTime(i) {
  return (i < 10) ? "0" + i : i;
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

setupChart();
