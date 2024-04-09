(function () {
  var resizeTimeout = -1;
  var conf = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'picture-in-picture'
    },
    playback: {
      muted: true
    },
    events: {
      playerresized: function (ev) {
        if (!$('.player-switch').hasClass('fixed-player')) {
          // work with a timeout as the resize event is triggered periodically and when resizing back to the original
          // size, the first few events will have a smaller size as the player is gradually growing.

          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(function () {
            $('.player-container').height(ev.height.substr(0, ev.height.indexOf('px')) - 2);
          }, 500);
        }
      }
    }
  };

  var source = {
    dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg'
  };

  var playerContainer = document.getElementById('player');
  var player = new bitmovin.player.Player(playerContainer, conf);

  player.load(source).then(function () {
    var container = $('.player-container');
    var playerHeight = $('#player').height();

    // necessary if page is refreshed in scrolled state
    // keep the page from jumping, adjust the player container to match the biggest size of the player
    if (container.height() <= playerHeight) {
      container.height(playerHeight);
    }
  });

  var timeout;
  var scrolled = false;

  function adjustPlayer() {
    var container = $('.player-container');

    if(container.length === 0) {
      return;
    }

    // extract constants for better readabilty
    var lowerEdge = container.offset().top + container.height();
    var switchToMinPlayerPos = lowerEdge - (window.innerHeight / 3);
    var currentScrollPos = document.body.scrollTop || document.documentElement.scrollTop;

    if (timeout) {
      clearTimeout(timeout);
    }

    // toggle the css-class responsible for the player moving to the lower right corner
    if (currentScrollPos > switchToMinPlayerPos) {
      timeout = setTimeout(function () {
        clearTimeout(timeout);
        timeout = void 0;
        $('.player-switch').addClass('fixed-player');
      }, 200);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        clearTimeout(timeout);
        timeout = void 0;
        $('.player-switch').removeClass('fixed-player');
      });
    }
  }

// listen to scrolling events
  window.onscroll = adjustPlayer;
})();
