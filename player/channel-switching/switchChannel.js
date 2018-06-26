function switchChannel(channelID) {
  var source;
  if (channelID === '1') {
    source = {
      title: 'Art of Motion',
      description: 'What is this event... Parcour?',
      dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
      hls: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    }
  } else if (channelID === '2') {
    source = {
      title: 'Big Buck Bunny',
      description: 'A day in the life of Big Buck Bunny.',
      dash: 'https://bitmovin-a.akamaihd.net/content/bbb/stream.mpd',
      hls: 'https://bitmovin-a.akamaihd.net/content/bbb/stream.m3u8'
    };
  } else {
    source = {
      title: 'Sintel',
      description: 'The main character, Sintel, is attacked while traveling through a wintry mountainside.',
      dash: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
      hls: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
    }
  }

  player.load(source);
}
