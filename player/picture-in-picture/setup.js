var resizeTimeout = -1;
var conf = {
  key: '<YOUR PLAYER KEY HERE>',
  events: {
    playerresized: function (ev) {
      /**
       * when the player switches from minimized to full size, update the container size to prevent the page
       * from jumping when scrolling up
       * work with a timeout as the resize event is triggered periodically and when resizing back to the original size,
       * the first few events will have a smaller size as the player is gradually growing.
       */
      if (
        !$('.player-switch').hasClass('fixed-player')
      ) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            $('.player-container'
            ).height(ev.height.substr(0, ev.height.indexOf('px')) - 2);
          },
          250
        )
        ;
      }
    }
  }
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
  poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg',
};

var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.Player(playerContainer, conf);

player.load(source).then(function () {
  var container = $('.player-container');
  var playerHeight = $('#player').height();

  /* necessary if page is refreshed in scrolled state
     keep the page from jumping, adjust the player container to match the biggest size of the player */
  if (container.height() <= playerHeight) {
    container.height(playerHeight);
  }
});