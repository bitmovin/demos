(function () {

  var noDrmSource = {
    'dash': 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    'hls': 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    'smooth': 'https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest'
  };

  var defaultSource = {
    'hls': 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/m3u8s/11331.m3u8',
    'dash': 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd',
    'smooth': 'https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest',
    'drm': {
      'widevine': {
        'LA_URL': 'https://widevine-proxy.appspot.com/proxy'
      },
      'playready': {
        'LA_URL': 'https://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&ContentKey=EAtsIJQPd5pFiRUrV9Layw=='
      }
    }
  };

  var keySystems = {
    'widevine': ['com.widevine.alpha'],
    'playready': ['com.microsoft.playready', 'com.youtube.playready'],
    'primetime': ['com.adobe.primetime', 'com.adobe.access'],
    'fairplay': ['com.apple.fps.1_0', 'com.apple.fps.2_0']
  };

  // force https, otherwise DRM would not work
  if (window.location.protocol !== 'https:' && window._rails_env === 'production') {
    window.location.protocol = 'https:';
  } else {
    console.warn('DRM will only work via https://. Will redirect in production. Current environment is: ' + window._rails_env);
  }

  var config = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'drm'
    },
    cast: {
      enable: true
    },
    playback: {
      muted: true
    }
  };

  var playerContainer = document.getElementById('player-container');
  var player = new bitmovin.player.Player(playerContainer, config);

  document.getElementById('detected-browser').innerHTML = getBrowserImage(getBrowser());


  /**
   * Destroys any previous player instance and creates a new one with the given information
   *
   * @param drm 'widevine' | 'playready' | '' | null
   * @param manifestUrl the url to the manifest of the stream
   * @param licenceUrl  the URL to the licence server of the DRM System
   */
  function setupPlayer(drm, manifestUrl, licenceUrl, manifestType) {
    // clone config to avoid leftovers from previous calls
    var source = {};

    if (manifestUrl == null || manifestUrl === '') {
      if (drm == null || drm == '') {
        source[manifestType] = noDrmSource[manifestType];
      } else {
        source[manifestType] = defaultSource[manifestType];
        source[drm] = defaultSource.drm;
      }
    } else {
      source = {};
      source[manifestType] = manifestUrl;
    }

    if (drm != null && drm !== '' && defaultSource.drm[drm]) {
      // If no licenceURL is provided use the one from the defaultSource for the given drm type
      licenceUrl = (licenceUrl !== '') ? licenceUrl : defaultSource.drm[drm]['LA_URL'];
      source['drm'] = {};
      source.drm[drm] = { 'LA_URL': licenceUrl };
    }

    if (!source) {
      source[manifestType] = noDrmSource[manifestType];
    }

    player.load(source).catch(function (error) {
      console.log(error);
    });
  }

  function loadPlayerOnEnter(keyEvent) {
    if (keyEvent.keyCode === 13) {
      loadPlayerFromControls();
    }
  }

  function loadPlayerFromControls() {
    var manifestInput = document.querySelector('#manifest-in').value;
    var licenceInput = document.querySelector('#licence-in').value;

    var drmSystem = document.querySelector('#available-drm-systems').options;
    drmSystem = drmSystem[drmSystem.selectedIndex].value;

    var manifestType = document.querySelector('#available-manifest-type').options;
    manifestType = manifestType[manifestType.selectedIndex].value;

    if (manifestInput && manifestInput !== '' && !checkIsUrlValid(manifestInput, 'Manifest URL')) {
      return;
    }
    if (licenceInput && licenceInput !== '' && !checkIsUrlValid(licenceInput, 'License URL')) {
      return;
    }

    setupPlayer(drmSystem, manifestInput, licenceInput, manifestType);
  }

  /**
   * retrieves an array containing all DRM systems supported by the current player instance inside the current browser
   *
   * @param {boolean} [initial=false]
   */
  function getSupportedDRMSystem(initial) {
    initial = initial || false;

    var retVal = [];

    return player.getSupportedDRM().then(function (drmSystem) {
      drmSystem.forEach(function (element) {
        var match = keySystems.widevine.find(function (obj) {
          return obj === element;
        }) ? 'widevine' : undefined;
        if (!match) {
          match = keySystems.playready.find(function (obj) {
            return obj === element;
          }) ? 'playready' : undefined;
        }
        if (!match) {
          match = keySystems.fairplay.find(function (obj) {
            return obj === element;
          }) ? 'fairplay' : undefined;
        }
        if (match) {
          retVal.push(match);
        }
      });

      // udpate the available DRM systems on the page before continuing
      if (initial) {
        var selectBox = document.querySelector('#available-drm-systems');
        retVal.forEach(function (element) {
          var newChild = document.createElement('OPTION');
          newChild.value = element;
          newChild.textContent = element;
          selectBox.appendChild(newChild);
        });
        if (retVal.length > 0) {
          selectBox.value = retVal[0];
        }
      }
    });
  }

  function getBrowserImage(selectedBrowser) {
    switch (selectedBrowser) {
      case BROWSER.CHROME:
        return '<i class="fa-brands fa-chrome" aria-hidden="true"></i>';
      case BROWSER.EDGE:
        return '<i class="fa-brands fa-edge" aria-hidden="true"></i>';
      case BROWSER.FIREFOX:
        return '<i class="fa-brands fa-firefox" aria-hidden="true"></i>';
      case BROWSER.IE:
        return '<i class="fa-brands fa-internet-explorer" aria-hidden="true"></i>';
      case BROWSER.OPERA:
        return '<i class="fa-brands fa-opera" aria-hidden="true"></i>';
      case BROWSER.SAFARI:
        return '<i class="fa-brands fa-safari" aria-hidden="true"></i>';
      case BROWSER.UNKNOWN:
      default:
        return '<i class="fa-solid fa-circle-question" aria-hidden="true"></i>';
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

  function supportedMediaSources() {
    var hasMediaSource, hasWebKitMediaSource;
    var mediaTypes = [
      'video/mp4; codecs="avc1.42c00d"',
      'video/mp4; codecs="ec-3"',
      'video/webm; codecs="vorbis,vp8"',
      'video/mp2t; codecs="avc1.42E01E,mp4a.40.2"'
    ];

    var supportedMediaTypes = {};
    if ('MediaSource' in window) {
      if (window.MediaSource) {
        hasMediaSource = true;
      }
    }

    if ('WebKitMediaSource' in window) {
      if (window.WebKitMediaSource) {
        hasWebKitMediaSource = true;
      }
    }

    for (var type in mediaTypes) {
      if (hasMediaSource) {
        supportedMediaTypes[mediaTypes[type]] = MediaSource.isTypeSupported(mediaTypes[type]);
      } else if (hasWebKitMediaSource) {
        supportedMediaTypes[mediaTypes[type]] = WebKitMediaSource.isTypeSupported(mediaTypes[type]);
      }
    }
    return supportedMediaTypes;
  }

  function insertMseSupportList() {
    var supported = false;
    var list = supportedMediaSources();
    var statusEl = document.getElementById('mse-supported');
    var listEl = document.getElementById('mse-list');

    Object.keys(list).forEach(function (key) {
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.innerText = key;
      li.classList.add(list[key] ? 'supported' : 'unsupported');
      supported = !supported ? list[key] : supported;
      li.appendChild(span);
      listEl.appendChild(li);
    });

    if (supported) {
      statusEl.classList.add('yes');
      statusEl.innerText = 'supported';
    } else {
      listEl.classList.add('no');
      statusEl.innerText = 'not supported';
    }
  }

  function insertEmeSupportList() {
    var list = {
      widevine: false,
      playready: false,
      primetime: false,
      fairplay: false
    };

    var supported = false;
    var listEl = document.getElementById('eme-list');
    var statusEl = document.getElementById('eme-supported');

    player.getSupportedDRM().then(function (drmSystems) {
      drmSystems.forEach(function (drm) {
        Object.keys(keySystems).forEach(function (key) {
          if (keySystems[key].indexOf(drm) !== -1) {
            list[key] = true;
            supported = true;
          }
        });
      });

      Object.keys(list).forEach(function (key) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerText = key;

        li.classList.add(list[key] ? 'supported' : 'unsupported');
        li.appendChild(span);
        listEl.appendChild(li);
      });

      if (supported) {
        statusEl.classList.add('yes');
        statusEl.innerText = 'supported';
      } else {
        listEl.classList.add('no');
        statusEl.innerText = 'not supported';
      }
    });
  }

  function setManifestType() {
    var browser = getBrowser();

    if (browser === BROWSER.IE || browser === BROWSER.EDGE) {
      document.querySelector('#available-manifest-type').selectedIndex = 2;
    }
  }

  getSupportedDRMSystem(true).then(function () {

    setManifestType();
    insertMseSupportList();
    insertEmeSupportList();
    loadPlayerFromControls();

    document.querySelector('#load-btn').addEventListener('click', loadPlayerFromControls);
    document.querySelector('#licence-in').addEventListener('keyup', loadPlayerOnEnter);
    document.querySelector('#manifest-in').addEventListener('keyup', loadPlayerOnEnter);
  });
})();
