var player;

var videoBufferDisplay = document.querySelector('#videoBufferLength');
var audioBufferDisplay = document.querySelector('#audioBufferLength');
var playbackSpeedDisplay = document.querySelector('#playbackSpeed');
var timeDisplay = document.querySelector('#time');
var latencyDisplay = document.querySelector('#latency');
var slider = document.querySelector('#targetLatencySlider');
var targetLatencyDisplay = document.querySelector('#targetLatency');

var targetLatency = 3;
var videoOnly = false;
var dashUrl = 'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd';

var url = new URL(location.href);
var targetLatencyFromUrl = url.searchParams.get('latency');

var isFirefox = typeof InstallTrigger !== 'undefined';

if (targetLatencyFromUrl && !isNaN(Number(targetLatencyFromUrl))) {
    targetLatency = targetLatencyFromUrl;
}

if (url.searchParams.get('videoOnly') && url.searchParams.get('videoOnly') === 'true') {
    videoOnly = true;
}

if (url.searchParams.get('dashUrl')) {
    dashUrl = url.searchParams.get('dashUrl');
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
        latencyDisplay.innerText = Math.round(currentLatency * 1000) / 1000 + 's';
        timeDisplay.innerText = (new Date()).toISOString().substr(11,10);
        printBufferLevels();
        }
    }, 50);
    });
}

$(document).ready(loadPlayer);
