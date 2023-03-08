var config = {
  key: '<YOUR PLAYER KEY>',
  cast: {
    enable: true
  }
};

var source = {
  dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd',
  hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion_drm/m3u8s/11331.m3u8',
  smooth: 'https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest',
  drm: {
    widevine: {
      LA_URL: 'https://cwip-shaka-proxy.appspot.com/no_auth'
    },
    playready: {
      LA_URL: 'https://test.playready.microsoft.com/service/rightsmanager.asmx?PlayRight=1&ContentKey=EAtsIJQPd5pFiRUrV9Layw=='
    }
  }
};
