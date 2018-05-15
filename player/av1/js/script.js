(function () {
  var player, timeout;

  var playerKey = '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30';
  var poster = 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/poster_tos.jpg';

  var assets = [
    {
      url: 'https://bitmovin-demos.commondatastorage.googleapis.com/mozillaAV1_Oct2017/e87fb2378f01103d5d6e477a4ef6892dc714e614_v1/stream.mpd',
      codec: 'av1.experimental.e87fb2378f01103d5d6e477a4ef6892dc714e614',
      poster: poster
    },
    {
      url: 'https://bitmovin-demos.commondatastorage.googleapis.com/av1/f5bdeac22930ff4c6b219be49c843db35970b918_v1/stream.mpd',
      codec: 'av1.experimental.f5bdeac22930ff4c6b219be49c843db35970b918',
      poster: poster
    },
    {
      // url: 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/mozilla/stream.mpd',
      url: 'https://bitbucketireland.s3.amazonaws.com/av1/aadbb0251996c8ebb8310567bea330ab7ae9abe4_v2_tiles/stream.mpd',
      codec: 'av1.experimental.aadbb0251996c8ebb8310567bea330ab7ae9abe4',
      poster: poster
    },
    {
      url: 'https://bitbucketireland.s3.amazonaws.com/av1/aadbb0251996c8ebb8310567bea330ab7ae9abe4_v1/stream.mpd',
      codec: 'av1.experimental.aadbb0251996c8ebb8310567bea330ab7ae9abe4',
      poster: poster
    },
    {
      url: 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/chrome/stream.mpd',
      codec: 'av1',
      poster: poster
    }
  ];

  function setPlayer() {
    if (player) {
      player.destroy();
    }

    player = bitmovin.player('player');
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
      events: {
        onError: function (error) {
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
