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
  }
};

var updateCount = 0;

var loadManifestButton = document.getElementById('manifest-load');
loadManifestButton.onclick = loadPlayerFromControls;

var setDefaultManifestButton = document.getElementById('default-manifest');
setDefaultManifestButton.onclick = setDefaultManifest;

var scheduleAdButton = document.getElementById('schedule-ad');
scheduleAdButton.onclick = showAd;

var deleteAdButton1 = document.getElementById('delete-ad1');
deleteAdButton1.onclick = hideAd;

var deleteAdButton2 = document.getElementById('delete-ad2');
deleteAdButton2.onclick = hideAd;

var deleteAdButton3 = document.getElementById('delete-ad3');
deleteAdButton3.onclick = hideAd;

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

function setupPlayer(drm, manifestUrl, licenceUrl, manifestType) {
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
    conf.source.drm[drm] = {'LA_URL': licenceUrl};
  }

  if (!conf.source) {
    conf.source = JSON.parse(JSON.stringify(config.source));
  }

  player.setup(conf).then(function () {
    createAdConfig();
    debugger;
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

  setupPlayer(drmSystem, manifestInput, licenceInput, manifestType);
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
    var adType = document.querySelector(`[name="ad${i}-type"]:checked`).value;

    document.querySelector(`#ad${i}-input`).value = defaultAdUrl[adType];
  }

}

function createAdConfig() {
  for (i = 1; i < 4; i++) {
    var adBox = document.getElementById(`ad-box-${i}`);

    if (adBox.style.display === 'unset') {
      var adManifestUrl = document.getElementById(`ad${i}-input`).value;
      var adType = document.querySelector(`[name="ad${i}-type"]:checked`).value;
      var adPosition = document.querySelector(`[name="ad${i}-position"]:checked`).value;

      player.scheduleAd(adManifestUrl, adType, {
        pertistant: true,
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

  if (adBox1.style.display === '' || adBox1.style.display === 'none') {
    adBox1.style.display = 'unset';
  }
  else if (adBox2.style.display === '' || adBox2.style.display === 'none') {
    adBox2.style.display = 'unset';
  }
  else if (adBox3.style.display === '' || adBox3.style.display === 'none') {
    adBox3.style.display = 'unset';
  }
}

function hideAd(event) {
  document.getElementById(event.currentTarget.parentNode.id).style.display = 'none';
}







window.chartColors = {
  black: 'rgb(0,0,0)',
  white: 'rgb(255,255,255)',
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

var initialTimestamp;
var bufferChart;
var bitrateChart;

function clearChart() {
  bufferChart.destroy();
  bitrateChart.destroy();
}

function addNewData(videoBuffer, audioBuffer, bitrate) {
  var currentTimeDiff = (Date.now() - initialTimestamp) / 1000;

  bufferChart.data.datasets[0].data.push({ x: currentTimeDiff, y: videoBuffer });
  bufferChart.data.datasets[1].data.push({ x: currentTimeDiff, y: audioBuffer });
  bitrateChart.data.datasets[0].data.push({ x: currentTimeDiff, y: bitrate / 1000000.0 });

  bufferChart.data.labels.push(currentTimeDiff);
  bitrateChart.data.labels.push(currentTimeDiff);

  if (bufferChart.data.datasets[0].data.length > 20) {
      bufferChart.data.datasets[0].data.shift();
      bufferChart.data.datasets[1].data.shift();
      bufferChart.data.labels.shift();
      bitrateChart.data.labels.shift();
      bitrateChart.data.datasets[0].data.shift();
  }

  bufferChart.update();
  bitrateChart.update();
}

function updateCharts(player) {
  addNewData(player.getVideoBufferLength(), player.getAudioBufferLength(), player.getDownloadedVideoData().bitrate);
  console.warn(player.getDownloadedVideoData().bitrate);
}

function setupChart() {
  initialTimestamp = Date.now();
  var maxBufferLevel = trimInput($('#maxBufferLevel').val());

  maxBufferLevel = maxBufferLevel > 0 ? maxBufferLevel : 60;

  bufferChart = new Chart(document.getElementById("buffer-chart"), {
      type: 'line',
      data: {
          datasets: [{
              data: [{}],
              label: "Video",
              borderColor: window.chartColors.grey,
              backgroundColor: window.chartColors.grey,
              fill: false
          }, {
              data: [],
              label: "Audio",
              borderColor: "#FFA500",
              backgroundColor: "#FFA500",
              fill: false
          }
          ]
      },
      options: {
          title: {
              display: true,
              text: 'Buffer Levels'
          },
          scales: {
              xAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'Time'
                  },
                  ticks: {
                      min: 0,
                      max: 60,
                      stepSize: 10,
                  }
              }],
              yAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'seconds'
                  },
                  ticks: {
                      min: 0,
                      max: maxBufferLevel + 10,
                      stepSize: 10
                  }
              }]
          }
      }
  });

  bitrateChart = new Chart(document.getElementById("bitrate-chart"), {
      type: 'line',
      data: {
          labels: [],
          datasets: [{
              data: [],
              label: "Video Bitrate",
              borderColor: window.chartColors.grey,
              backgroundColor: window.chartColors.grey,
              fill: false
          }
          ]
      },
      options: {
          title: {
              display: true,
              text: 'Playback Bitrate'
          },
          scales: {
              xAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'Time'
                  },
                  ticks: {
                      min: 0,
                      max: 60,
                      stepSize: 20
                  }
              }],
              yAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'kbps'
                  },
                  ticks: {
                      min: 0,
                      max: 8,
                      stepSize: 1
                  }
              }]
          }
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

  player.addEventHandler(player.EVENT.ON_AUDIO_PLAYBACK_QUALITY_CHANGED, function(data) {
    log("On Audio Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_VIDEO_PLAYBACK_QUALITY_CHANGED, function(data) {
    log("On Video Playback Quality Changed: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_STALL_STARTED, function(data) {
    log("On Buffering Started: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_STALL_ENDED, function(data) {
    log("On Buffering Ended: " + JSON.stringify(data));
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_PLAYING, function(data) {
    log("On Playing: " + JSON.stringify(data))
    updateCharts(player);
  });

  player.addEventHandler(player.EVENT.ON_PAUSE, function(data) {
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

  player.addEventHandler('onTimeChanged', function() {
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
