var player;

var videoBufferDisplay = document.querySelector('#videoBufferLength');
var audioBufferDisplay = document.querySelector('#audioBufferLength');
var playbackSpeedDisplay = document.querySelector('#playbackSpeed');
var timeDisplay = document.querySelector('#time');
var latencyDisplay = document.querySelector('#latency');
var latencySlider = document.querySelector('#targetLatencySlider');
var qualityStabilityDisplay = document.querySelector('#qualityStability');
var qualityStabilitySlider = document.querySelector('#qualtyStabilitySlider');
var targetLatencyDisplay = document.querySelector('#targetLatency');

var targetLatency = 5;
var videoOnly = false;
var dashUrl = 'https://cmafref.akamaized.net/cmaf/live-ull/2006350/akambr/out.mpd';

var queryString = getQueryParams();

var targetLatencyFromUrl = queryString.latency;

var isFirefox = typeof InstallTrigger !== 'undefined';

var initialTimestamp, bufferChart, bitrateChart;
var updateCount = 0;

if (targetLatencyFromUrl && !isNaN(Number(targetLatencyFromUrl))) {
    targetLatency = targetLatencyFromUrl;
}

if (queryString.videoOnly && queryString.videoOnly !== 'false') {
    videoOnly = true;
}

if (queryString.dashUrl) {
    dashUrl = queryString.dashUrl;
}

var updateTargetLatency = function() {
    targetLatencyDisplay.innerText = latencySlider.value + 's';
    targetLatency = Number(latencySlider.value);
    player.lowlatency.setTargetLatency(targetLatency);
};

latencySlider.oninput = updateTargetLatency;
latencySlider.value = String(targetLatency);

var updateQualityStability = function() {
    var targetValue = Number(qualityStabilitySlider.value);
    if (isNaN(targetValue) || targetValue < 0 || targetValue > 1) {
        console.warn('Invalid value for qualityStabilityBalance: ', targetValue);
        return;
    }
    player.adaptation.setConfig({qualityStabilityBalance: targetValue});
    qualityStabilityDisplay.innerText = targetValue;
}
qualityStabilitySlider.oninput = updateQualityStability;

var conf = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
        key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
        videoId: 'low-latency-streaming'
    },
    playback: {
        autoplay: true,
        muted: true,
    },
    adaptation: {
        logic: 'low-latency-v1',
        preload: false,
        // Encourage switching to a higher quality sooner
        qualityStabilityBalance: 0.3,
    },
    logs: {
        //level: 'debug'
    },
    style: {},
    events: {
        [bitmovin.player.PlayerEvent.LatencyModeChanged]: function(e) {
            playbackSpeedDisplay.innerText = e.to;
        },
    },
    tweaks: {
        RESTART_THRESHOLD: 0.2,
        RESTART_THRESHOLD_DELTA: 0.05,
        STARTUP_THRESHOLD: 0.2,
        STARTUP_THRESHOLD_DELTA: 0.05,
        END_OF_BUFFER_TOLERANCE: 0.05,
        LIVE_EDGE_DISTANCE: 0.5,
        LOW_LATENCY_BUFFER_GUARD: 0.8,
        CHUNKED_CMAF_STREAMING: true,
    },
    live: {
        lowLatency: {
            targetLatency: targetLatency,
            catchup: {
                playbackRateThreshold: 0.075,
                seekThreshold: 5,
                playbackRate: 1.2,
            },
            fallback: {
                playbackRateThreshold: 0.075,
                seekThreshold: 5,
                playbackRate: 0.95,
            },
        },
        synchronization: [{
            method: 'httphead',
            serverUrl: 'https://time.akamai.com',
        }],
    },
    nonetwork: {
        preprocessHttpResponse: function(type, response) {
        if (type === 'manifest/dash') {
            if (videoOnly) {
            response.body = response.body.replace('mp4a.40.2', 'dummy');
            }
        }
        return response;
        }
    }
};

var source = { dash: dashUrl };

function printBufferLevels() {
    var videoBuffer = Math.round(player.getVideoBufferLength() * 100) / 100;
    var audioBuffer = Math.round(player.getAudioBufferLength() * 100) / 100;

    if (videoBuffer !== null) {
        videoBufferDisplay.innerText = videoBuffer + 's';
    }

    if (audioBuffer !== null) {
        audioBufferDisplay.innerText = audioBuffer + 's';
    }
}

function loadPlayer() {
    player = new bitmovin.player.Player(document.getElementById('player-container'), conf);

    setPlayerEvents(player);

    player.load(source).then(function() {
    updateTargetLatency();

    if (isFirefox) {
        document.getElementById('firefoxWarning').innerHTML = 'This demo works best on chrome, safari and edge';
    }

    setInterval(function() {
        if (player && !player.isPaused()) {
        var currentLatency = player.lowlatency.getLatency();
        var utcTime = new Date().getUTCHours();
        var estTime = new Date();
        estTime.setHours(utcTime-4);
        latencyDisplay.innerText = Math.round(currentLatency * 1000) / 1000 + 's';
        timeDisplay.innerText = estTime.toISOString().substr(11,10);
        printBufferLevels();
        }
    }, 50);
    });
}

function getQueryParams() {
    var queryParams = {};

    var queryString = location.search.substring(1).split('&');

    queryString.forEach(function(queryParam) {
        var splitQueryParam = queryParam.split('=');

        queryParams[decodeURIComponent(splitQueryParam[0])] = decodeURIComponent(splitQueryParam[1]);
    });

    return queryParams;
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

function getBaseChartConfig() {
  return {
    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    credits: {
      enabled: false
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom'
    },
    xAxis: {
      title: {
        text: 'time',
        align: 'low'
      },
      min: 0
    },
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
  }
}

function setupChart() {
  initialTimestamp = Date.now();
  bufferChart = Highcharts.chart(document.getElementById("buffer-chart"), {
    ...getBaseChartConfig(),
    title: {
      text: 'Buffer Levels'
    },
    yAxis: {
      title: {
        text: 'sec',
        align: 'high'
      },
      min: 0
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
    
  });

  bitrateChart = Highcharts.chart(document.getElementById("bitrate-chart"), {
    ... getBaseChartConfig(),
    title: {
      text: 'Bitrate'
    },
    yAxis: {
      title: {
        text: 'Mbps',
        align: 'high'
      },
      min: 0
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
  });
}

function log(text) {
  console.debug(text);
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
  
    player.on(bitmovin.player.PlayerEvent.TimeChanged, function () {
      updateCount++;
  
      if (updateCount % 4 == 1) {
        updateCharts(player);
      }
    });
  }
  
setupChart();
$(document).ready(loadPlayer);
