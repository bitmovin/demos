window.onload = function getURLParams() {
  var manifestParam = getParamsQueryString('manifest');
  var streamFormatParam = getParamsQueryString('format');
  var licenseParam = getParamsQueryString('license');
  var drmFormatParam = getParamsQueryString('drm');
  if (manifestParam && streamFormatParam) {
    document.getElementsByName('stream-format').forEach(function (element) {
      if (element.value === streamFormatParam) {
        element.checked = true;
      }
    })
    document.getElementById('manifest-input').value = manifestParam;

    if (drmFormatParam && licenseParam) {
      document.getElementsByName('drm-format').forEach(function (element) {
        if (element.value === drmFormatParam) {
          element.checked = true;
        }
      })

      document.getElementById('drm-license').value = licenseParam;
    }

    loadPlayerFromControls();
  }
  else {
    setupPlayer('dash', config.source.dash);
  }
};

var config = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'stream-test'
  },
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
    progressive: '',
    drm: {
      none: '',
      widevine: 'https://widevine-proxy.appspot.com/proxy',
      playready: 'https://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&#038;ContentKey=EAtsIJQPd5pFiRUrV9Layw=='
    }
  },
  style: {
    aspectratio: '16:9'
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

var initialTimestamp, bufferChart, bitrateChart;
var updateCount = 0;

var playerContainer = document.getElementById('player');
var player = new bitmovin.player.Player(playerContainer, config);

setPlayerEvents(player);

var defaultManifest = document.getElementById('default-manifest');
defaultManifest.addEventListener('click', function () {
  toggleDefaultButton();
});

var loadPlayerButton = document.getElementById('manifest-load');
loadPlayerButton.addEventListener('click', function () {
  loadPlayerFromControls();
});

var scheduleAdButton = document.getElementById('schedule-ad');
scheduleAdButton.addEventListener('click', function () {
  showAd();
  toggleInputFields();
});

var streamRadioButtons = document.getElementsByName('stream-format');
streamRadioButtons.forEach(function (element) {
  element.addEventListener('click', function () {
    setDefaultInput(element, 'manifest-input', config.source);
  })
});

var drmRadioButtons = document.getElementsByName('drm-format');
drmRadioButtons.forEach(function (element) {
  element.addEventListener('click', function () {
    setDefaultInput(element, 'drm-license', config.drmSource.drm);
  })
});

function setURLParameter(format, manifest, drm, license) {
  var manifestValue = encodeURIComponent(manifest);
  var streamFormatValue = encodeURIComponent(format);
  if (drm) {
    var drmValue = encodeURIComponent(drm);
    var licenseValue = encodeURIComponent(license);
  }
  var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + '?format=' + streamFormatValue + '&manifest=' + manifestValue;

  if (drmValue && licenseValue) {
    newURL = newURL + '&drm=' + drmValue + '&license=' + licenseValue;
  }
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

function setupPlayer(manifestType, manifestUrl, drm = 'none', licenceUrl = '') {
  // clone config to avoid leftovers from previous calls
  var conf = JSON.parse(JSON.stringify(config));

  if (manifestUrl == null || manifestUrl === '') {
      return;
  } else {
    conf.source = {};
    conf.source[manifestType] = manifestUrl;
  }

  if (player) {
    clearChart();
    setupChart();
  }

  

  if (drm !== 'none') {
    conf.source['drm'] = {};
    conf.source.drm[drm] = { 'LA_URL': licenceUrl };
  }

  if (!conf.source) {
    conf.source = JSON.parse(JSON.stringify(config.source));
  }

  player.load(conf.source).then(function () {
    createAdConfig();
    player.play();
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

  setupPlayer(manifestType, manifestInput, drmSystem, licenceInput);
}

function setDefaultManifest() {
  var drmSystem = document.querySelector('[name="drm-format"]:checked').value;
  var manifestType = document.querySelector('[name="stream-format"]:checked').value;

  if (drmSystem === 'none') {
    document.querySelector('#manifest-input').value = config.source[manifestType];
    document.querySelector('#drm-license').value = null;
    setURLParameter(manifestType, config.source[manifestType], null, null);
  }
  else {
    document.querySelector('#manifest-input').value = config.drmSource[manifestType];
    document.querySelector('#drm-license').value = config.drmSource.drm[drmSystem];
    setURLParameter(manifestType, config.drmSource[manifestType], drmSystem, config.drmSource.drm[drmSystem]);
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

function toggleDefaultButton() {
  var defaultCheckbox = document.querySelector('#default-manifest');

  if (!defaultCheckbox.checked) {
    defaultCheckbox.classList.add('on');
    defaultCheckbox.checked = true;
  } else {
    defaultCheckbox.classList.remove('on');
    defaultCheckbox.checked = false;
  }

  toggleInputFields();
}

function toggleInputFields() {
  var defaultCheckbox = document.querySelector('#default-manifest');
  var manifestInput = document.querySelector('#manifest-input');
  var licenceInput = document.querySelector('#drm-license');

  
  if (defaultCheckbox.checked) {
    manifestInput.readOnly = true;
    licenceInput.readOnly = true;
    for (i = 1; i < 4; i++) {
      var adManifest = document.getElementById(`ad${i}-input`);

      if (adManifest) {
        adManifest.readOnly = true;
      }
    }
    setDefaultManifest();
    loadPlayerFromControls();
  }
  else {
    defaultCheckbox.classList.remove('on');
    defaultCheckbox.checked = false;
    manifestInput.readOnly = false;
    licenceInput.readOnly = false;
    for (i = 1; i < 4; i++) {
      var adManifest = document.getElementById(`ad${i}-input`);

      if (adManifest) {
        adManifest.readOnly = false;
      }
    }
  }
}

function setDefaultInput(radioButton, inputTextId, defaultConfig) {
  
  var defaultCheckbox = document.querySelector('#default-manifest');

  if (defaultCheckbox.checked) {
    var inputText = document.getElementById(inputTextId);

      if (radioButton.checked === true) {
        inputText.value = defaultConfig[radioButton.value];
      }
  }
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

  var adArray = document.getElementsByClassName('demo-input-box ad-box');

  if (adArray && adArray.length < 3) {
    scheduleAdButton.classList.remove('disabled');
  }
}

function createAdBox(number) {
  $(`<div class="demo-input-box ad-box" id="ad-box-${number}">
  <div class="demo-item-header">
      <div>AD ${number}</div>
      <button id="delete-ad${number}" class="btn btn-outline-primary active demo-button" type="delete-ad" onclick="hideAd('ad-box-${number}')">Delete</button>
  </div>
  <div class="demo-stream-type-input">
      <div class="type-header">AD Type</div>
      <div class="input-type">
        <label><input id="ad${number}-type" type="radio" name="ad${number}-type" value="vast" checked> VAST</label>
      </div>
      <div class="input-type">
        <label><input id="ad${number}-type" type="radio" name="ad${number}-type" value="vpaid"> VPAID</label>
      </div>
      <div class="input-type">
        <label><input id="ad${number}-type" type="radio" name="ad${number}-type" value="vmap"> VMAP</label>
      </div>
      <div class="input-type">
        <label><input id="ad${number}-type" type="radio" name="ad${number}-type" value="ima"> IMA</label>
      </div>
  </div>
  <div class="demo-stream-type-input">
      <div class="type-header">AD Position</div>
      <div class="input-type">
        <label><input id="ad${number}-position" type="radio" name="ad${number}-position" value="pre" checked> Pre-Roll</label>
      </div>
      <div class="input-type">
        <label><input id="ad${number}-position" type="radio" name="ad${number}-position" value="50%"> Mid-Roll</label>
      </div>
      <div class="input-type">
        <label><input id="ad${number}-position" type="radio" name="ad${number}-position" value="post"> Post-Roll</label>
      </div>
  </div>
  <input id="ad${number}-input" class="form-control" name="ad${number}-input" type="text" placeholder="AD Source URL">
</div>`).appendTo('#ad-box-wrapper');

var adArray = document.getElementsByClassName('demo-input-box ad-box');

var adRadioButtons = document.getElementsByName(`ad${number}-type`);
adRadioButtons.forEach(function (element) {
  element.addEventListener('click', function () {
    setDefaultInput(element, `ad${number}-input`, defaultAdUrl);
  })
});

if (adArray && adArray.length === 3) {
  scheduleAdButton.classList.add('disabled');
}
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

function addChartData(chart, seriesIndex, xAxis, yAxis) {
  chart.series[seriesIndex].addPoint([xAxis, yAxis], true, false);
}

function setupChart() {
  initialTimestamp = Date.now();
  bufferChart = Highcharts.chart(document.getElementById("buffer-chart"), {

    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    credits: {
      enabled: false
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
      data: [[0, 0]],
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
      data: [[0, 0]],
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
    credits: {
      enabled: false
    },
    title: {
      text: 'Bitrate Levels'
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
        text: 'bitrate',
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
      data: [[0, 0]],
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
  player.on(bitmovin.player.PlayerEvent.AudioPlaybackQualityChanged, function (data) {
    log("On Audio Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.VideoPlaybackQualityChanged, function (data) {
    log("On Video Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.StallStarted, function (data) {
    log("On Buffering Started: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.StallEnded, function (data) {
    log("On Buffering Ended: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Playing, function (data) {
    log("On Playing: " + JSON.stringify(data))
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Paused, function (data) {
    log("On Paused: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Play, function (data) {
    log("On Play: " + JSON.stringify(data))
  });

  player.on(bitmovin.player.PlayerEvent.MetadataParsed, function (data) {
    log("On Metadata Parsed: " + JSON.stringify(data))
  });

  player.on(bitmovin.player.PlayerEvent.Ready, function (data) {
    log("On Ready: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.SourceLoaded, function (data) {
    log("On Loaded: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Error, function (data) {
    log("On Error: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Seek, function (data) {
    log("On Seek Started: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.Seeked, function (data) {
    log("On Seek Finished: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.on(bitmovin.player.PlayerEvent.TimeChanged, function () {
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
