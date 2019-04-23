var player;

var videoBufferDisplay = document.querySelector('#videoBufferLength');
var audioBufferDisplay = document.querySelector('#audioBufferLength');
var playbackSpeedDisplay = document.querySelector('#playbackSpeed');
var timeDisplay = document.querySelector('#time');
var latencyDisplay = document.querySelector('#latency');
var slider = document.querySelector('#targetLatencySlider');
var targetLatencyDisplay = document.querySelector('#targetLatency');
var chart;

var targetLatency = 3;
var videoOnly = false;
var dashUrl = 'https://lowlatency.global.ssl.fastly.net/ULLTIME_MBR/manifest.mpd';

var queryString = getQueryParams();

var targetLatencyFromUrl = queryString.latency;

var isFirefox = typeof InstallTrigger !== 'undefined';

if (targetLatencyFromUrl && !isNaN(Number(targetLatencyFromUrl))) {
    targetLatency = targetLatencyFromUrl;
}

if (queryString.videoOnly && queryString.videoOnly !== 'false') {
    videoOnly = true;
    var audioBufferDiv = document.querySelector('.latency-status-row.audio-buffer');
    audioBufferDiv.classList.add('hidden');
}

if (queryString.dashUrl) {
    dashUrl = queryString.dashUrl;
}

var updateTargetLatency = function() {
    targetLatencyDisplay.innerText = slider.value + 's';
    targetLatency = Number(slider.value);
    player.lowlatency.setTargetLatency(targetLatency);
};

slider.oninput = updateTargetLatency;
slider.value = String(targetLatency);

var conf = {
    key: '89f6ed6c-ab0e-46c2-ac47-5665e60c3c41',
    analytics: {
        key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
        videoId: 'low-latency-streaming'
    },
    playback: {
        autoplay: true,
        muted: true,
    },
    adaptation: {
        preload: false,
    },
    logs: {
        //level: 'debug'
    },
    style: {},
    events: {
        playbackspeedchanged: function(e) {
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
        MINIMUM_ALLOWED_UPDATE_PERIOD: 1
    },
    live: {
        lowLatency: {
        targetLatency: 3,
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
    },
    network: {
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
    player.load(source).then(function() {
    // ABR is not supported yet for low latency
    player.setVideoQuality(player.getAvailableVideoQualities()[0].id);
    updateTargetLatency();

    if (isFirefox) {
        document.getElementById('firefoxWarning').innerHTML = 'This demo works best on chrome, safari and edge';
    }

    setInterval(function() {
        if (player && !player.isPaused()) {
        var currentLatency = player.lowlatency.getLatency();
        var utcTime = new Date().getUTCHours();
        var estTime = new Date();
        estTime.setHours(utcTime+2);
        latencyDisplay.innerText = Math.round(currentLatency * 1000) / 1000 + 's';
        timeDisplay.innerText = estTime.toISOString().substr(11,10);
        printBufferLevels();
        }
    }, 50);

    setInterval(function() {
        if (chart && player && !player.isPaused()) {
        var currentLatency = player.lowlatency.getLatency();
        var utcTime = new Date().getUTCHours();
        var estTime = new Date();
        estTime.setHours(utcTime+2);
        updateChart(estTime.toISOString().substr(11,10), Math.round(currentLatency * 1000) / 1000);
        printBufferLevels();
        }
    }, 500);
    });
}

function setupChart(){
    var colors = {
        blue: '#2c83b9',
        blueTint: 'rgba(179,223,241,0.5)'
    };

    Chart.defaults.global.responsive = true;
    Chart.defaults.global.animation = false;

    var options = {
        scaleBeginAtZero: true,
        scaleShowGridLines: true,
        scaleGridLineColor: "#F3F3F3",
        scaleGridLineWidth: 1,
        scaleShowHorizontcaleBeginAtZerolLines: true,
        scaleShowVerticalLines: true,
        bezierCurve: false,
        bezierCurveTension: 0.4,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 20,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        elements: {
            point: {
                radius: 0
            }
        }
    };

    var data = {
        labels: [],
        datasets: [
            {
                label: "Latency",
                data: [],
                backgroundColor: colors.blueTint,
                borderColor: colors.blue,
                pointBackgroundColor: colors.blue,
                borderWidth: 2
            }
        ]
    };

    chart = new Chart(document.getElementById('chart-container').getContext('2d'), {
        type: 'line',
        data: data,
        options: options
    });
}

function updateChart(currentTime, latency){
    if (latency < 0 || latency > 10) {
        return;
    }

    var labels = chart.data.labels;
    var data = chart.data.datasets[0].data;

    labels.push(currentTime);
    data.push(latency);

    chart.update();
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

$(document).ready(function() {
    loadPlayer();
    setupChart();
});
