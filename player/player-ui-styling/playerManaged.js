const config = {
  key: '<YOUR PLAYER KEY HERE>',
  location: {
    ui: 'https://domain.tld/path/to/bitmovinplayer-ui.js',
    ui_css: 'styles/bitmovinplayer-ui.css',
  },
};

const playerContainer = document.getElementById('player-id');
const player = new bitmovin.player.Player(playerContainer, config);
