function switchChannel(channelID) {
  var source;
  if (channelID === '1') {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
      hls: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    }
  } else if (channelID === '2') {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/evostream/manifest.mpd'
    };
  } else {
    source = {
      dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
      hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
    }
  }

  player.load(source);
}
