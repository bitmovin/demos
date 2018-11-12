(function () {
  var player, timeout;

  var playerKey = '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30';
  var poster = 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/poster_tos.jpg';

  var assets = [
    {
      url: 'https://storage.googleapis.com/bitmovin-demos/av1/stream.mpd',
      codec: 'av1',
      poster: poster
    },
    {
      url: 'https://storage.googleapis.com/bitmovin-demos/av1/stream_chrome.mpd',
      codec: 'av01.0.00M.08',
      poster: poster
    }
  ];

  var analyticsConfig = {
    key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
    videoId: 'av1'
  }

  var analytics = bitmovin.analytics(analyticsConfig);

  function setPlayer() {
    if (player) {
      player.destroy();
    }

    player = bitmovin.player('player');
    analytics.register(player);
    return player;
  }

  function isChrome() {
    return !!window.chrome && !!window.chrome.webstore;
  }

  function isFirefox() {
    return typeof InstallTrigger !== 'undefined';
  }

  function getAsset() {
    for (var i = 0; i < assets.length; i++) {
      if (MediaSource.isTypeSupported('video/webm; codecs="' + assets[i].codec + '"')) {
        return assets[i];
      }
    }

    return {};
  }

  function getConfig() {
    var asset = getAsset();

    return {
      key: playerKey,
      source: {
        dash: asset.url,
        poster: asset.poster
      },
      playback: {
        muted: true
      },
      events: {
        error: function (error) {
          if (!error || !error.message) {
            onPlayerError('Could not load AV1 stream. Please try to update your browser.');
          }
        }
      }
    };
  }

  function getBrowserLink() {
    var firefoxNightly = '<a href=https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly target="_blank">Firefox Nightly</a>';
    var chromeCanary = '<a href="https://www.google.com/chrome/browser/canary.html" target="_blank">Chrome Canary</a> ';
    chromeCanary += 'with the <a href="https://bitmovin-a.akamaihd.net/webpages/demo-fw/av1/chrome-flags-av1.png" data-featherlight="image">AV1 flag enabled</a>';

    if (isChrome()) {
      return chromeCanary;
    }

    if (isFirefox()) {
      return firefoxNightly;
    }

    return firefoxNightly + ' or ' + chromeCanary;
  }

  function firePlayerError(customMessage) {
    player.fireEvent('onError', {
      message: customMessage || 'This browser does not seem to support (this version of) AV1, please try ' + getBrowserLink() + '.'
    });
  }

  function onPlayerCreated(player) {
    var config = player.getConfig();
    if (!config.source || !config.source.dash) {
      onPlayerError();
    }
  }

  function onPlayerError(customMessage) {
    setPlayer().setup({
      key: playerKey
    }).then(function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        firePlayerError(customMessage);
      }, 500)
    });
  }

  setPlayer().setup(getConfig())
    .then(onPlayerCreated, onPlayerError)
    .catch(onPlayerError);
})();
