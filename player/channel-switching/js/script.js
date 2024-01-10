var timerEl, timer, interval, timeout, player, clickTime, switchTime;
var delayTime = 0;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  analytics: {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'channel-switching'
  },
  playback: {
    autoplay: true,
    muted: true
  },
  events: {
    timechanged: onTimeChanged
  }
};

function resetButtons() {
  var container = document.querySelector('.button-container');
  var buttons = container.getElementsByTagName('button');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].removeAttribute('disabled');
    var info = buttons[i].querySelector('.timer');
    if (info) {
      info.innerText = '';
    }
  }
}

function updateTimer(time) {
  if (!timerEl) {
    return;
  }

  timer = time;
  timerEl.innerText = ' (' + time + ')';
}

function resetTimer() {
  if (!timerEl) {
    return;
  }

  timer = null;
  timerEl.innerText = '';
  timerEl = null;
}

function disableButton() {
  if (!timerEl) {
    return;
  }

  timerEl.parentElement.setAttribute('disabled', 'disabled');
  resetTimer();
}

function onTimeChanged() {
  if (!clickTime || switchTime) {
    return;
  }

  switchTime = Date.now();
  var diffTime = switchTime - clickTime - delayTime;
  var diffEl = document.getElementById('switch-time');
  diffEl.innerText = 'First frame after ' + diffTime + 'ms';
}

function resetDiff() {
  document.getElementById('switch-time').innerHTML = 'Waiting for first frame...';
  clickTime = null;
  switchTime = null;
}

document.getElementById('ch1').addEventListener('click', function(event) {
     switchChannel('1', event);
});

document.getElementById('ch2').addEventListener('click', function(event) {
  switchChannel('2', event);
});

document.getElementById('ch3').addEventListener('click', function(event) {
  switchChannel('3', event);
});


function switchChannel(channelID, event) {
  var delay = 0;

  resetButtons();

  if (event) {
    player.pause();
    resetDiff();
    clickTime = Date.now();
  }

  if (event && event.target) {
    timerEl = event.target.querySelector('.timer');
  }

  if (delayTime > 0 && timerEl) {
    updateTimer(delayTime / 1000);
    delay = delayTime;

    clearInterval(interval);
    interval = setInterval(function () {
      updateTimer(--timer);
    }, 1000);
  }

  clearTimeout(timeout);
  timeout = setTimeout(function () {
    disableButton();

    var source;
    if (channelID === '1') {
      source = {
        title: 'Art of Motion',
        description: 'What is this event... Parcour?',
        hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
        dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
      }
    } else if (channelID === '2') {
      source = {
        title: 'Big Buck Bunny',
        description: 'A day in the life of Big Buck Bunny.',
        hls: 'https://cdn.bitmovin.com/content/assets/bbb/stream.m3u8',
        dash: 'https://cdn.bitmovin.com/content/assets/bbb/stream.mpd',
      };
    } else {
      source = {
        title: 'Sintel',
        description: 'The main character, Sintel, is attacked while traveling through a wintry mountainside.',
        hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
        dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
        poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
      }
    }

    player.load(source);
  }, delay);
}

(function () {
  var playerContainer = document.getElementById('player-container');
  player = new bitmovin.player.Player(playerContainer, conf);

  switchChannel('1');
})();
