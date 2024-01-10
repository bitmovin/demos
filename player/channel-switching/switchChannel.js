function switchChannel(channelID) {
  var source;
  if (channelID === '1') {
    source = {
      title: 'Art of Motion',
      description: 'What is this event... Parcour?',
      hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    }
  } else if (channelID === '2') {
    source = {
      title: 'Big Buck Bunny',
      description: 'A day in the life of Big Buck Bunny.',
      hls: 'https://cdn.bitmovin.com/content/assets/bbb/stream.m3u8',
      dash: 'https://cdn.bitmovin.com/content/assets/bbb/stream.mpd',
    };
  } else {
    source = {
      title: 'Sintel',
      description: 'The main character, Sintel, is attacked while traveling through a wintry mountainside.',
      hls: 'https://cdn.bitmovin.com/content/assets/sintel/hls/playlist.m3u8',
      dash: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd',
      poster: 'https://cdn.bitmovin.com/content/assets/sintel/poster.png'
    }
  }

  player.load(source);
}
