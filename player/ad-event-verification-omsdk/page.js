// Add modules for ordinary playback, e.g. here specifically for DASH streams (step a)
bitmovin.player.core.Player.addModule(bitmovin.player['engine-bitmovin'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['mserenderer'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['xml'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['dash'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['abr'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['container-mp4'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['polyfill'].default);

// Add Bitmovin Advertising and OM SDK player modules
bitmovin.player.core.Player.addModule(bitmovin.player['advertising-core'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['advertising-bitmovin'].default);
bitmovin.player.core.Player.addModule(bitmovin.player['advertising-omsdk'].default);

// Create player config & include a OM SDK tracker config (step b)
var conf = {
  key: '<YOUR PLAYER KEY>',
  advertising: {
    adBreaks: [ /* ... */ ],
    trackers: {
      omSdk: {
        partnerName: 'awesome-company',
        partnerVersion: '1.0.0',
        verificationResources: [{
          validationScriptUrl: 'https://somewhere.com/validation-script.js',
        }]
      },
    }
  },
};

// Create player instance & load source (step c)
var playerContainer = document.getElementById('player-container');
var player = new bitmovin.player.core.Player(playerContainer, conf);

player.load({
  dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
});
