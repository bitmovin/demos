(function () {
  var bitmovinPlayer;

  var poster = 'https://bitmovin-a.akamaihd.net/webpages/demos/content/av1/poster_tos.jpg';

  var config = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'av1'
    },
    events: {
      error: function (error) {
        if (error == null || error.message == null) {
          $('<div> This browser does not seem to support (this version of) AV1, please try ' + getBrowserLink() + '.</div>').appendTo('#player-wrapper');
        }
      }
    },
    playback: {
      muted: true
    }
  };

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

  function setPlayer() {
    if (bitmovinPlayer != null) {
      bitmovinPlayer.destroy();
    }

    var playerContainer = document.getElementById('player-container');
    bitmovinPlayer = new bitmovin.player.Player(playerContainer, config);
    return bitmovinPlayer;
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

  function getSource() {
    var asset = getAsset();

    return {
        dash: asset.url,
        poster: asset.poster
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

  setPlayer().load(getSource());
})();
