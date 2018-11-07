(function () {
  var SEGMENT_LENGTH = 1;
  var MAX_SEGMENT_VIEW_COUNT = 15 / SEGMENT_LENGTH;
  var MAX_BITRATE = 10500;
  var BITRATE_STEPS = 2000;
  var QUALITY_THRESHOLD = 0.49;
  var QUALITY_UPPER_THRESHOLD = 49.5;
  var STARTUP_BITRATE = '5mbps';

  var POSTER = '//bitmovin-a.akamaihd.net/webpages/demo-fw/per-scene-adaptation/tos_poster.png';
  var SOURCE = '//bitmovin-a.akamaihd.net/webpages/demos/content/per-scene/manifest.mpd';
  var SPRITE_IMAGE = '//bitmovin-a.akamaihd.net/webpages/demos/content/per-scene/sprites/sprite.png';
  var SPRITE_VTT = '//bitmovin-a.akamaihd.net/webpages/demos/content/per-scene/sprites/sprite.vtt';

  var player;
  var isUpdateThumbnails = false;
  var currentTime = 0;
  var interval;
  var myLineChart;
  var savings = 0; //saving till now
  var dl = 0;
  var dlw = 0;
  var segmentStack = [];

  var tiles = new Image();
  tiles.src = SPRITE_IMAGE;

  function setupChart() {
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.animation = false;
    Chart.defaults.global.showTooltips = false;

    var options = {
      scaleBeginAtZero: true,
      scaleShowGridLines: true,
      scaleGridLineColor: "#F3F3F3",
      scaleGridLineWidth: 1,
      scaleShowHorizontcaleBeginAtZerolLines: true,
      scaleShowVerticalLines: true,
      bezierCurve: false,
      bezierCurveTension: 0.4,
      pointDot: true,
      pointDotRadius: 4,
      pointDotStrokeWidth: 1,
      pointHitDetectionRadius: 20,
      datasetStroke: true,
      datasetStrokeWidth: 2,
      datasetFill: true,
      scales: {
        yAxes: [{
          type: "user-defined"
        }]
      },
      elements: {
        point: {
          radius: 0
        }
      }
    };

    var colors = {
      blue: '#2c83b9',
      orange: '#ff931e',
      blueTint: 'rgba(179,223,241,0.5)',
      orangeTint: 'rgba(244,225,201,0.3)'
    };

    var data = {
      labels: [],
      datasets: [
        {
          label: "Standard",
          data: [],
          steppedLine: true,
          backgroundColor: colors.orangeTint,
          borderColor: colors.orange,
          pointBackgroundColor: colors.orange,
          borderWidth: 2
        }, {
          label: "Per-Scene Adaptation",
          data: [],
          steppedLine: true,
          backgroundColor: colors.blueTint,
          borderColor: colors.blue,
          pointBackgroundColor: colors.blue,
          borderWidth: 2
        }
      ]
    };

    for (var count = 0; count < MAX_SEGMENT_VIEW_COUNT; count++) {
      data.labels.push(digitToTime(count * SEGMENT_LENGTH));
    }

    var UserDefinedScaleDefaults = Chart.scaleService.getScaleDefaults("linear");
    var UserDefinedScale = Chart.scaleService.getScaleConstructor("linear").extend({
      buildTicks: function () {
        this.min = 0;
        this.max = MAX_BITRATE;
        var stepWidth = BITRATE_STEPS;

        this.ticks = [];
        for (var tickValue = this.min; tickValue <= this.max; tickValue += stepWidth) {
          this.ticks.push(tickValue);
        }

        if (this.options.position == "left" || this.options.position == "right") {
          this.ticks.reverse();
        }

        if (this.options.ticks.reverse) {
          this.ticks.reverse();
          this.start = this.max;
          this.end = this.min;
        } else {
          this.start = this.min;
          this.end = this.max;
        }

        this.zeroLineIndex = this.ticks.indexOf(0);
      }
    });

    Chart.scaleService.registerScaleType("user-defined", UserDefinedScale, UserDefinedScaleDefaults);

    // ref: //stackoverflow.com/questions/30256695/chart-js-drawing-an-arbitrary-vertical-line
    // Charts.js v2: //stackoverflow.com/questions/36329630/chart-js-2-0-vertical-lines
    var originalLineDraw = Chart.controllers.line.prototype.draw;
    Chart.helpers.extend(Chart.controllers.line.prototype, {
      draw: function () {
        originalLineDraw.apply(this, arguments);

        if (!this._data || this._data.length === 0) {
          // no data available yet
          return;
        }

        // draw currentTime indicator
        var labels = this.chart.config.data.labels;
        var chartArea = this.chart.chartArea;
        var timeRange = timeToDigit(labels[labels.length - 1]) - timeToDigit(labels[0]);
        var timeInRange = currentTime - timeToDigit(labels[0]);
        var xRange = chartArea.right - chartArea.left;
        var x = Math.min(chartArea.left + xRange * (timeInRange / timeRange), chartArea.right);

        // draw line
        this.chart.chart.ctx.beginPath();
        this.chart.chart.ctx.moveTo(x, chartArea.top);
        this.chart.chart.ctx.strokeStyle = '#1fabe2';
        this.chart.chart.ctx.lineWidth = 2;
        this.chart.chart.ctx.shadowBlur = 0.5;
        this.chart.chart.ctx.lineTo(x, chartArea.bottom);
        this.chart.chart.ctx.stroke();

        // draw thumbnails
        if (isUpdateThumbnails) {
          isUpdateThumbnails = false;
          updateThumbnails();
        }
      }
    });

    myLineChart = new Chart(document.getElementById('repChart').getContext('2d'), {
      type: 'line',
      data: data,
      options: options
    });
  }

  function digitToTime(digit) {
    var minutes = Math.floor(digit / 60);
    var seconds = digit - (minutes * 60);
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

  function timeToDigit(time) {
    var parts = time.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function thumbToDiv(thumb) {
    var div = document.createElement('div');
    div.style.backgroundImage = 'url("' + SPRITE_IMAGE + '")';
    div.style.backgroundRepeat = 'no-repeat';
    div.style.backgroundPosition = (-thumb.x) + 'px ' + (-thumb.y) + 'px';
    div.style.width = thumb.width + 'px';
    div.style.height = thumb.height + 'px';
    return div;
  }

  function updateThumbnails() {
    var chartArea = myLineChart.chartArea;
    var tmpThumb = player.getThumbnail(0);
    var chartWidth = chartArea.right - chartArea.left;
    var thumbnailWidth = chartWidth / MAX_SEGMENT_VIEW_COUNT;
    var ratio = thumbnailWidth / tmpThumb.width;

    var thumbnailBars = Array.from(document.getElementsByClassName('thumbnails'));

    thumbnailBars.forEach(function (thumbnails) {
      thumbnails.style.height = ratio * tmpThumb.height + 'px';
      thumbnails.style.paddingLeft = chartArea.left + 'px';

      // drop old thumbnails
      while (thumbnails.firstChild) {
        thumbnails.removeChild(thumbnails.firstChild);
      }

      for (var l = 0; l < MAX_SEGMENT_VIEW_COUNT; l++) {
        var currentLabel = myLineChart.data.labels[l];
        var nextLabel = myLineChart.data.labels[l + 1];

        if (!nextLabel) {
          nextLabel = digitToTime(timeToDigit(currentLabel) + SEGMENT_LENGTH);
        }

        var thumb = player.getThumbnail((timeToDigit(currentLabel) + timeToDigit(nextLabel)) / 2);

        if (thumb) {
          var img = thumbToDiv(thumb);
          img.style.float = 'left';
          img.style.zoom = ratio;
          thumbnails.appendChild(img);

          img.tip = thumbToDiv(thumb);
          img.tip.style.position = 'absolute';
          img.tip.style.display = 'none';
          thumbnails.appendChild(img.tip);

          img.onmouseover = function () {
            this.tip.style.display = 'block';
            this.tip.style.top = (thumbnails.offsetTop - this.tip.offsetHeight - 5) + 'px';
            this.tip.style.left = (thumbnails.offsetLeft + this.offsetLeft * this.style.zoom + this.offsetWidth * this.style.zoom / 2 - this.tip.offsetWidth / 2) + 'px';
          }.bind(img);

          img.onmouseout = function (evt) {
            this.tip.style.display = 'none';
          }.bind(img);
        }
      }
    });
  }

  function playbackStats() {
    var video = player.getVideoElement();
    if (!video || video.buffered.length === 0) {
      return;
    }
    document.getElementById('buffer-start').innerHTML = '' + video.buffered.start(0).toFixed(2);
    document.getElementById('buffer-end').innerHTML = '' + video.buffered.end(0).toFixed(2);
    document.getElementById('requested-data').innerHTML = '' + (dl / 1024).toFixed(4) + ' MB';
    document.getElementById('delivered-data').innerHTML = '' + (dlw / 1024).toFixed(4) + ' MB';
    document.getElementById('cost-reduction').innerHTML = '' + (1000000 * 0.025 * savings / 1024 / 1024).toFixed(2) + ' USD';
    document.getElementById('saving').innerHTML = '' + (savings / 1024).toFixed(4) + " MB (" + (100 * savings / dl).toFixed(2) + '%)';
  }

  function addDataToChart(point) {
    var labels = myLineChart.data.labels;
    var datasets = myLineChart.data.datasets;
    datasets[0].data.push(Math.round(point.rep[1]));
    datasets[1].data.push(Math.round(point.rep[0]));

    while (datasets[0].data.length > MAX_SEGMENT_VIEW_COUNT) {
      labels.shift();
      datasets[0].data.shift();
      datasets[1].data.shift();
      labels.push(digitToTime(timeToDigit(labels[labels.length - 1]) + SEGMENT_LENGTH));
    }
    myLineChart.update();
  }

  function update() {
    var labels = myLineChart.data.labels;
    var datasets = myLineChart.data.datasets;
    var isDatasetFilled = Math.max(datasets[0].data.length, datasets[1].data.length) === MAX_SEGMENT_VIEW_COUNT;
    var currentRange = {
      start: timeToDigit(labels[0]),
      end: timeToDigit(labels[labels.length - 1])
    };
    var currentRangeMidPoint = currentRange.start + ((currentRange.end - currentRange.start) / 2);
    var currentTimeWithinRange = currentTime >= currentRange.start;
    var allowedToShift = !isDatasetFilled || (currentTimeWithinRange && currentTime >= currentRangeMidPoint);
    if (!allowedToShift || segmentStack.length === 0 || !myLineChart.data.datasets[0] || player.hasEnded()) {
      // no need to redraw the graph
      return;
    }

    var point = segmentStack.shift();
    addDataToChart(point);

    isUpdateThumbnails = true;

    // update statistics
    var savDelta = (point.seg[1] - point.seg[0]);
    var dlDelta = point.seg[1];
    var dlwDelta = point.seg[0];

    if (!isNaN(savings + savDelta)) {
      savings += savDelta;
    }

    if (!isNaN(dl + dlDelta)) {
      dl += dlDelta;
    }

    if (!isNaN(dlw + dlwDelta)) {
      dlw += dlwDelta;
    }    
    playbackStats();
  }

  function setupPlayer() {
    var config = {
      key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
      analytics: {
        key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
        videoId: 'per-scene-adaptation'
      },
      source: {
        dash: getSource(),
        title: 'Per-Scene Adaptation',
        thumbnailTrack: {
          url: SPRITE_VTT
        },
        poster: POSTER
      },
      playback: {
        muted: true
      },
      adaptation: {
        desktop: {
          startupBitrate: STARTUP_BITRATE,
          qualityThreshold: QUALITY_THRESHOLD,
          qualityUpperThreshold: QUALITY_UPPER_THRESHOLD,
          disableDownloadCancelling: true
        },
        mobile: {
          startupBitrate: STARTUP_BITRATE,
          qualityThreshold: QUALITY_THRESHOLD,
          qualityUpperThreshold: QUALITY_UPPER_THRESHOLD,
          disableDownloadCancelling: true
        }
      },
      tweaks: {
        max_buffer_level: 20
      },
      events: {
        segmentrequestfinished: function (data) {
          if (!data.qualityInformation || !data.success || data.isInit || data.mimeType.indexOf('video') < 0) {
            return;
          }

          printDebugInfosPerSegment(data);

          var obj = {
            rep: [
              data.qualityInformation.optimizedBitrate / 1000,
              data.qualityInformation.alternativeBitrate / 1000
            ],
            seg: [
              data.qualityInformation.optimizedSize / 1000,
              data.qualityInformation.alternativeSize / 1000
            ]
          };
          if (!isNaN(obj.rep[0]) && !isNaN(obj.rep[1]) && !isNaN(obj.seg[0]) && !isNaN(obj.seg[1])) {
            segmentStack.push(obj);
          }
        },
        timechanged: function (evt) {
          currentTime = evt.time;
          update();
          try {
            var recommendationOverlay = document.getElementsByClassName('bmpui-ui-recommendation-overlay')[0];
            if (recommendationOverlay) {
              recommendationOverlay.style.display = 'none'
            }
          } catch (ignore) {
          }
        },
        play: function () {
          setupInterval();
        },
        stallstarted: function () {
          clearInterval(interval);
        },
        stallended: function () {
          setupInterval();
        },
        paused: function () {
          clearInterval(interval);
        },
        playbackFinished: function () {
          clearInterval(interval);
        }
      }
    };

    function setupInterval() {
      clearInterval(interval);
      interval = setInterval(function () {
        currentTime += 0.01;
        myLineChart.draw();
      }, 10);
    }

    var playerContainer = document.getElementById('player-container');
    player = new bitmovin.player.Player(playerContainer, config);
    player.load(config.source).then(function (response) {
      console.log('player loaded');
      player.preload();
      player.seek = function () {
      };
      updateThumbnails();
      window.addEventListener('resize', function () {
        myLineChart.update();
        updateThumbnails();
      });
    }, function (reason) {
      console.error('player setup failed');
      console.error(reason);
    });
  }

  function getSource() {
    return SOURCE;
  }

  /* **************************** For debugging only *****************************/

  function getPsnrComparisonForSegment(idx) {
    var psnrForAllQualities = [];
    window.qas.r = window.qas.r.sort(function (a, b) {
      return parseFloat(a.b) - parseFloat(b.b);
    });
    for (var i = 0; i < window.qas.r.length; i++) {
      psnrForAllQualities.push(window.qas.r[i].b / 1000 + ": " + window.qas.r[i].q[idx]);
    }
    return psnrForAllQualities;
  }

  function printDebugInfosPerSegment(data) {
    var optQuality = data.qualityInformation.optimizedQuality || data.qualityInformation.originalQuality;

    var x = {
      optimizedKbps: data.qualityInformation.optimizedBitrate / 1000,
      originalKbps: data.qualityInformation.alternativeBitrate / 1000,
      optimizedQuality: optQuality,
      originalQuality: data.qualityInformation.originalQuality,
      diffQuality: Math.round((data.qualityInformation.originalQuality - optQuality) * 100) / 100
    };

    // console.warn(atob(data.uid), x);
    // console.log(Math.round(data.size * 8 / 1000 / data.downloadTime * 100) / 100);
  }

  /* **************************** For debugging only *****************************/

  setupChart();
  setupPlayer();
})();