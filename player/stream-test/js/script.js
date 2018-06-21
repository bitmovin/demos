var manifest = document.getElementById('manifest');
manifest.onkeyup = handleKeyPress;

var streamFormat = document.getElementById('stream_format');
var submitButton = document.getElementById('submit');
submitButton.onclick = loadManifest;

var conf = {
  key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    smooth: 'http://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest',
    poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
  },
  cast: {
    enable: true
  }
};

var player = bitmovin.player('player');
player.setup(JSON.parse(JSON.stringify(conf)));

function load(manifestUrl) {
  var loadConfig = {};
  loadConfig[streamFormat.value] = manifestUrl;
  player.load(loadConfig).then(function () {
    player.play();
  });
}

function getSelectedOption() {
  var options = streamFormat.getElementsByTagName("option");
  return options[streamFormat.selectedIndex].innerHTML;
};

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
    loadManifest();
  }
}

function loadManifest() {
  if (manifest.value.length > 1) {
    if (!checkIsUrlValid(manifest.value, 'Manifest URL')) {
      handleError('invalidUrl');
      return false;
    }
    check404(manifest.value).then(function () {
      handleError('clean');
      load(manifest.value);
    }).catch(function (reason) {
      handleError(reason);
    });
  } else {
    handleError('emptyfield');
    load(conf.source[streamFormat.value]);
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
  // check if url is abolute
  if (!/^https?:\/\/|^\/\//i.test(url)) {
    console.error(urlPurpose + ' has to be absolute');
    return false;
  }
  return true;
}

function check404(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.status !== 200) {
        xhr.onreadystatechange = null;
        reject(xhr.status);
      } else {
        xhr.onreadystatechange = null;
        resolve(200);
      }
    };
    xhr.send('Content-type', 'application/x-www-form-urlencoded');
  });
}

function handleError(error) {
  switch (error) {
    case 'mixedContentError':
      document.getElementById('error').innerHTML = 'Mixed content error.';
      break;
    case 'invalidUrl':
      document.getElementById('error').innerHTML = 'Invalid URL';
      break;
    case 'clean':
      document.getElementById('error').innerHTML = '';
      break;
    case 'emptyfield':
      document.getElementById('error').innerHTML = 'No file provided - The default Bitmovin ' + setSelectedOption() + ' Example will be loaded';
      break;
    case 0:
      document.getElementById('error').innerHTML = 'The provided url is not reachable';
      break;
    default:
      document.getElementById('error').innerHTML = 'HTTP \'' + error + '\' error while requesting the manifest';
      break;
  }
}