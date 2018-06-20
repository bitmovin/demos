var timerEl, timer, interval, timeout, player, clickTime, switchTime;
var delayTime = 0;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  playback: {
    autoplay: true,
    muted: true
  },
  events: {
    onTimeChanged: onTimeChanged
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
        dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
        hls: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
      }
    } else if (channelID === '2') {
      source = {
        title: 'Big Buck Bunny',
        description: 'A day in the life of Big Buck Bunny.',
        dash: 'https://bitmovin-a.akamaihd.net/content/bbb/stream.mpd',
        hls: 'https://bitmovin-a.akamaihd.net/content/bbb/stream.m3u8'
      };
    } else {
      source = {
        title: 'Sintel',
        description: 'The main character, Sintel, is attacked while traveling through a wintry mountainside.',
        dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
        hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
      }
    }

    player.load(source);
  }, delay);
}

(function () {
  player = bitmovin.player('player');
  player.setup(conf).then(function () {
    switchChannel('1');
  });
})();
