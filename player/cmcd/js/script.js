function setupPlayerWithCmcd() {
  cmcdSessionId = uuidv4();

  const playerConfig = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'cmcd'
    },
    playback: {
      muted: true,
      autoplay: true,
    }
  };

  const cmcdConfig = {
    sessionId: cmcdSessionId,
    contentId: '1111-111111-111111-11111',
  };

  const cmcdPlugin = new window.bitmovin.player.integration.Cmcd.CmcdIntegration(cmcdConfig);
  playerConfig.network = {
    preprocessHttpRequest: cmcdPlugin.preprocessHttpRequest,
    preprocessHttpResponse: cmcdPlugin.preprocessHttpResponse,
  };
  playerConfig.adaptation = {
    desktop: {
      onVideoAdaptation: cmcdPlugin.onVideoAdaptation,
      onAudioAdaptation: cmcdPlugin.onAudioAdaptation,
    },
    mobile: {
      onVideoAdaptation: cmcdPlugin.onVideoAdaptation,
      onAudioAdaptation: cmcdPlugin.onAudioAdaptation,
    },
  };

  const playerContainer = document.getElementById('player-container');
  const player = new bitmovin.player.Player(playerContainer, playerConfig);
  
  cmcdPlugin.setPlayer(player);

  player.load({
    hls: 'https://bitmovindemocmcd-a.akamaihd.net/content/MI201109210084_1/m3u8s-fmp4-rel/main.m3u8',
  });
}

$(function() {
  setupPlayerWithCmcd();
});