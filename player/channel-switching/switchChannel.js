function switchChannel(channelID) {
  var source;
  if (channelID === '1') {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
    }
  } else if (channelID === '2') {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/evostream/manifest.mpd'
    };
  } else {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd'
    }
  }

  player.load(source);
}
