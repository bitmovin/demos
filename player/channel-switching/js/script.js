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
        dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
      }
    } else if (channelID === '2') {
      source = {
        dash: 'https://bitmovin-a.akamaihd.net/content/evostream/manifest.mpd'
      };
    } else {
      source = {
        dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd'
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
