function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.platform);
};

if (isIOS()) {
  showNotSupportedMessage();
} else {
  setupPlayer();
}

function showNotSupportedMessage() {
  var message = 'This demo is not currently available on iOS as we’re working to enhance this VR/360 demo. Please get in touch if you’d like to learn more.';

  var container = document.getElementById('player-container');
  var player = document.getElementById('player');
  var messageContainer = document.createElement('div');

  messageContainer.setAttribute('class', 'message-not-supported')
  messageContainer.textContent = message

  container.append(messageContainer);
  player.classList.add('is-unsupported');
}

function setupPlayer() {
  var conf = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'vr-360'
    },
    style: {
      aspectratio: '2:1'
    },
    playback: {
      muted: true
    }
  };
  
  var source = {
    dash: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
    hls: 'https://bitmovin.com/player-content/playhouse-vr/m3u8s/105560.m3u8',
    progressive: 'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4',
    poster: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/poster.jpg',
    vr: {
      startupMode: '2d',
      startPosition: 180
    }
  };
  
  var playerContainer = document.getElementById('player-container');
  var player = new bitmovin.player.Player(playerContainer, conf);
  
  player.load(source);
}