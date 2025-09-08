var spmvPlayer;
var uiManager;
var shiftedOffset = 0;
var typesToCache = ['manifest/hls/master', 'manifest/hls/variant', 'media/video', 'media/audio'];
// TODO: Maybe preload everything ahead of thime

window.onload = function () {
  var conf = {
    key: '89f6ed6c-ab0e-46c2-ac47-5665e60c3c41',
    playback: {
      muted: true,
      autoplay: true,
    },
    style: {},
    cast: {
      enable: true,
    },
    logs: {
      level: 'debug',
    },
    events: {
      playbackfinished: function () {
        console.log('Playback finished, replaying...');
        spmvPlayer.play();
      },
    },
    adaptation: {
      onVideoAdaptation: function (data) {
        console.warn(
          [...data.representations].filter(v => v.bandwidth < 4000000).sort((a, b) => b.bandwidth - a.bandwidth),
        );
        return [...data.representations]
          .filter(v => v.bandwidth < 4000000)
          .sort((a, b) => b.bandwidth - a.bandwidth)[0];
      },
    },
    network: {
      sendHttpRequest: function (_, request) {
        if (appCache.hasInCache(request.url)) {
          const cachedBody = appCache.getFromCache(request.url);
          return {
            getResponse: function () {
              const response = {
                request: request,
                url: request.url,
                headers: request.headers,
                status: 200,
                statusText: 'OK',
                body: cachedBody,
              };
              return Promise.resolve(response);
            },
            setProgressListener: function () {},
            cancel: function () {},
          };
        }

        return fetch(request.url, { headers: request.headers });
      },
      preprocessHttpResponse: function (type, res) {
        if (typesToCache.indexOf(type) > -1) {
          appCache.maybeCache(res.url, res.body);
        }

        return Promise.resolve(res);
      },
    },
    tweaks: {
      file_protocol: true,
      app_id: 'com.bitmovinmultiview.app',
    },
    ui: false,
  };

  const source1 = {
    dash: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Alcaraz-Griekspoor-Beijing-2024/manifest.mpd',
    hls: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Alcaraz-Griekspoor-Beijing-2024/manifest.m3u8',
    poster: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Alcaraz-Griekspoor-Beijing-2024/poster.jpg',
  };

  const source2 = {
    dash: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Draper-Hurkacz-Tokyo-2024/manifest.mpd',
    hls: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Draper-Hurkacz-Tokyo-2024/manifest.m3u8',
    poster: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Draper-Hurkacz-Tokyo-2024/poster.jpg',
  };

  const source3 = {
    dash: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Fritz-Fils-Tokyo-2024/manifest.mpd',
    hls: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Fritz-Fils-Tokyo-2024/manifest.m3u8',
    poster: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Fritz-Fils-Tokyo-2024/poster.jpg',
  };

  const source4 = {
    dash: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Medvedev-Monfils-Beijing-2024/manifest.mpd',
    hls: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Medvedev-Monfils-Beijing-2024/manifest.m3u8',
    poster: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/Medvedev-Monfils-Beijing-2024/poster.jpg',
  };

  const source = {
    hls: 'https://cdn.bitmovin.com/content/demos/multiview-atp-tennistv/tiled/manifest.m3u8',
  }

  spmvPlayer = new bitmovin.player.Player(document.getElementById('singleplayermv-container'), conf);
  uiManager = bitmovin.singleplayermv.playerui.UIFactory.buildDefaultTvUI(spmvPlayer, {});

  spmvPlayer.load(source).then(function () {
    // Move the control bar up in z-index
    var controlBar = document.querySelector('.bmpui-ui-controlbar');
    controlBar.style.position = 'absolute';
    controlBar.style.zIndex = 1;

    var inTileView = true;

    uiManager.currentUi.playerWrapper.getPlayer().on('tileSelected', function (event) {
      if (event.tileIndex === null && !inTileView) {
        console.warn('Grid clicked');
        inTileView = true;
        return spmvPlayer.load({
          hls: source.hls,
          options: {
            startOffset: (spmvPlayer.getCurrentTime() || 0) - shiftedOffset,
            startOffsetTimelineReference: 'start',
          },
        })
      }

      if (event.tileIndex === 0 && inTileView) {
        console.warn('Tile 1 clicked');
        inTileView = false;
        return spmvPlayer.load({
          hls: source1.hls,
          options: {
            startOffset: (spmvPlayer.getCurrentTime() || 0) + shiftedOffset,
            startOffsetTimelineReference: 'start',
          },
        });
      }

      if (event.tileIndex === 1 && inTileView) {
        console.warn('Tile 2 clicked');
        inTileView = false;
        return spmvPlayer.load({
          hls: source2.hls,
          options: {
            startOffset: (spmvPlayer.getCurrentTime() || 0) + shiftedOffset,
            startOffsetTimelineReference: 'start',
          },
        });
      }

      if (event.tileIndex === 2 && inTileView) {
        console.warn('Tile 3 clicked');
        inTileView = false;
        return spmvPlayer.load({
          hls: source3.hls,
          options: {
            startOffset: (spmvPlayer.getCurrentTime() || 0) + shiftedOffset,
            startOffsetTimelineReference: 'start',
          },
        });
      }

      if (event.tileIndex === 3 && inTileView) {
        console.warn('Tile 4 clicked');
        inTileView = false;
        return spmvPlayer.load({
          hls: source4.hls,
          options: {
            startOffset: (spmvPlayer.getCurrentTime() || 0) + shiftedOffset,
            startOffsetTimelineReference: 'start',
          },
        });
      }
    });
  });
};
