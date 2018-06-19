const config = {
  key: '<YOUR PLAYER KEY>',
  source: {
    dash: 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/m3u8s/11331.m3u8',
    smooth:'',
    drm: {
      widevine: {
        LA_URL: 'https://widevine-proxy.appspot.com/proxy'
      },
      playready: {
        LA_URL: 'https://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&#038;ContentKey=EAtsIJQPd5pFiRUrV9Layw=='
      }
    }
  },
  cast: {
    enable: true
  }
};