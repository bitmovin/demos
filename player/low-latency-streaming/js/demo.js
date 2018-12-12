var player = null;
var videoBufferDisplay = document.querySelector('#videoBufferLength');
var audioBufferDisplay = document.querySelector('#audioBufferLength');
var playbackSpeedDisplay = document.querySelector('#playbackSpeed');
var timeDisplay = document.querySelector('#time');
var prftDisplay = document.querySelector('#prft');
var latencyDisplay = document.querySelector('#latency');
var slider = document.querySelector('#targetLatencySlider');
var targetLatencyDisplay = document.querySelector('#targetLatency');

var referenceTimeRequestTimestamp;
var referenceTime;

var targetLatency = 2.5;
var latencyTolerance = 0.075;
var minBufferGuard = 0.5;
var catchupPlaybackRate = 1.2;
var fallbackPlaybackRate = 0.95;
var videoOnly = false;
var currentLatency;
var hasPrft = false;
var dashUrl = '//akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd';
var anchor;

var url = new URL(location.href);
var targetLatencyFromUrl = url.searchParams.get('latency');
if (targetLatencyFromUrl && !isNaN(Number(targetLatencyFromUrl))) {
    targetLatency = targetLatencyFromUrl;
}

if (url.searchParams.get('videoOnly')) {
    videoOnly = Boolean(url.searchParams.get('videoOnly'));
}

if (url.searchParams.get('manifest')) {
    dashUrl = url.searchParams.get('manifest');
}

var updateTargetLatency = function() {
    targetLatencyDisplay.innerText = slider.value + 's';
    targetLatency = Number(slider.value);
};

slider.oninput = updateTargetLatency;

slider.value = String(targetLatency);
updateTargetLatency();

const now = function() {
var timeSinceReference = (performance.now() - referenceTimeRequestTimestamp);

var currentDate = new Date(referenceTime.getTime());
currentDate.setMilliseconds(currentDate.getMilliseconds() + timeSinceReference);
return currentDate;
};

fetch('https://time.akamai.com/?iso&ms').then((e) => {
    referenceTimeRequestTimestamp = performance.now();
        return e.text();
    }).then((text) => {
    referenceTime = new Date(text);
    setInterval(() => timeDisplay.innerText = now().toISOString().substr(11,10), 50);
});

function getBufferLevels() {
    var videoBuffer = player.getVideoBufferLength();
    var audioBuffer = player.getAudioBufferLength();

    if (videoBuffer !== null) {
        videoBufferDisplay.innerText = videoBuffer + 's';
    }

    if (audioBuffer !== null) {
        audioBufferDisplay.innerText = audioBuffer + 's';
    }

    return [videoBuffer, audioBuffer].map((level)=>level || 0);
}

function getHighestBufferLevel() {
    return Math.max(...getBufferLevels());
}

function getCommonBufferLevel() {
    return Math.min(...getBufferLevels());
}

setInterval(function() {
    if (player && !player.isPaused()) {
        var buffer = getCommonBufferLevel();

        if (!hasPrft && anchor) {
            var timeSinceStart = (Date.now() - anchor.wallClock) / 1000;
            var currentLiveEdgeTime = anchor.liveEdgeTime + timeSinceStart;
            currentLatency = currentLiveEdgeTime - player.getCurrentTime();
            latencyDisplay.innerText = Math.round(currentLatency * 1000) / 1000 + 's';
        }

        if (currentLatency < targetLatency - latencyTolerance) {
            player.setPlaybackSpeed(fallbackPlaybackRate);
            return;
        }

        if (currentLatency < targetLatency) {
            player.setPlaybackSpeed(1);
            return;
        }

        if (buffer <= minBufferGuard) {
            player.setPlaybackSpeed(1);
            return;
        }

        if (currentLatency > targetLatency + latencyTolerance) {
            player.setPlaybackSpeed(catchupPlaybackRate);
        }
    }
}, 50);

var loadPlayer = function () {
  var config = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'low-latency-streaming'
    },
    playback: {
      autoplay: true,
      muted: true
    },
    adaptation: {
        preload: false
    },
    events: {
        playing: () => {
          if (!anchor) {
            var buffer = getHighestBufferLevel();
            anchor = {
              liveEdgeTime: player.getCurrentTime() + buffer,
              wallClock: Date.now(),
            };
          }
        },
        segmentplayback: (e) => {
          if (!e.producerReferenceTime || e.mimeType !== 'video/mp4') {
            return;
          }
  
          hasPrft = true;
  
          // The player potentially uses wrong offset, we need to correct that here
          const ntpEpochStart = (new Date('1/1/1900')).getTime();
          const unixEpochStart = (new Date('1/1/1970')).getTime();
          var usedOffset = ntpEpochStart - unixEpochStart;
  
          // We need to use UTC dates for our calculations
          var correctOffset = -2208988800000;
  
          var offsetAdjustment = correctOffset - usedOffset;
  
          var currentSegemntPrft = new Date(e.producerReferenceTime + offsetAdjustment);
          currentLatency = (now().getTime() - currentSegemntPrft.getTime()) / 1000;
  
          prftDisplay.innerText = currentSegemntPrft.toISOString().substr(11,10);

          latencyDisplay.innerText = currentLatency + 's';
        },
        playbackspeedchanged: (e) => {
          playbackSpeedDisplay.innerText = e.to;
        },
      },
      tweaks: {
        RESTART_THRESHOLD: 0.2,
        RESTART_THRESHOLD_DELTA: 0.05,
        STARTUP_THRESHOLD: 0.2,
        STARTUP_THRESHOLD_DELTA: 0.05,
        END_OF_BUFFER_TOLERANCE: 0.05,
        LIVE_EDGE_DISTANCE: 0.5
      },
      network: {
        preprocessHttpResponse: (type, response) => {
          if (type === 'manifest/dash') {
            if (videoOnly) {
              response.body = response.body.replace('mp4a.40.2', 'dummy');
            }
          }
          return response;
        }
      }
    };

  var source = {
    dash: dashUrl
  };

  var playerContainer = document.getElementById('player-container');
  player = new bitmovin.player.Player(playerContainer, config);

  player.load(source).then(() => {
      // ABR is not supported yet for low latency
      player.setVideoQuality(player.getAvailableVideoQualities()[0].id);
  });
};


$(document).ready(loadPlayer);
