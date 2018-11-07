var avBandwidth;

var player1 = null;

var CODEC = {
  DEFAULT: 'DEFAULT',
  TITLE: 'TITLE'
};

var codecsBitratesSegmentSizes = {};
codecsBitratesSegmentSizes[CODEC.DEFAULT] = {
  240000: [54193, 77101, 48701, 64470, 82128, 103695, 78523, 119910, 67832, 92273, 82287, 59114, 62670, 62603, 85473, 70378, 62124, 71928, 50163, 40829, 59277, 59929, 95839, 67016, 78653, 116553, 59188, 57066, 65793, 28889],
  375000: [81071, 108546, 69357, 95799, 123362, 165532, 118811, 195385, 106462, 139378, 133980, 89583, 91523, 97496, 131032, 108621, 95987, 119367, 74301, 56616, 90828, 94024, 155294, 99953, 126689, 184856, 90053, 84705, 100194, 42147],
  550000: [120207, 161230, 104858, 141006, 182595, 236739, 173917, 293396, 152156, 208290, 196868, 133041, 135346, 149657, 191775, 161696, 142158, 181953, 107691, 83873, 133490, 140845, 231656, 148611, 178007, 276519, 134556, 125494, 148231, 61076],
  750000: [162971, 223855, 147783, 188267, 242675, 322768, 231823, 401024, 203120, 282460, 272928, 177349, 187902, 204850, 260684, 216151, 198738, 249609, 142903, 111299, 180863, 196174, 321915, 204525, 250202, 377947, 182052, 170131, 201815, 80439],
  1000000: [221042, 297822, 206170, 254998, 327937, 430057, 306435, 545204, 269987, 380437, 372830, 237960, 249386, 280733, 349450, 297938, 268242, 343915, 191617, 145090, 243912, 272155, 432526, 270798, 323551, 530687, 241496, 227524, 276722, 110208],
  1500000: [340586, 460540, 332037, 388712, 507677, 639070, 457471, 822330, 408626, 581201, 598136, 364759, 389741, 442444, 541833, 460494, 421596, 540215, 298760, 227008, 379858, 431241, 664312, 410901, 478903, 820029, 365030, 351242, 422507, 164783],
  2300000: [521512, 697753, 514895, 599453, 790505, 1014129, 714819, 1333207, 662355, 862126, 954565, 549278, 624016, 701674, 852787, 721512, 668031, 867150, 458285, 329131, 602969, 681057, 1057880, 632352, 761337, 1286682, 571822, 537641, 657856, 251595],
  3000000: [622615, 832965, 593916, 716745, 1011796, 1358436, 940121, 1823793, 888780, 1087831, 1264217, 655575, 766969, 830598, 1088753, 891879, 864770, 1150136, 571613, 364950, 773732, 847522, 1405926, 747153, 997637, 1668276, 732574, 658372, 837036, 315868],
  4300000: [782399, 1167700, 897410, 962444, 1394541, 1789475, 1269845, 2458918, 1155002, 1333337, 1501625, 842767, 1070152, 1073383, 1519659, 1114443, 1150474, 1438662, 764667, 527791, 1085485, 1199604, 1618296, 902944, 1163749, 2187399, 980051, 890362, 1110014, 426988],
  5800000: [877561, 1315985, 910875, 1053288, 1715358, 2436838, 1731134, 3290824, 1562632, 1605110, 1922284, 949815, 1234090, 1180398, 1896528, 1302115, 1427774, 1716558, 927365, 578539, 1298563, 1372845, 2098170, 1005397, 1497777, 2866283, 1215110, 1067691, 1376383, 552754]
};

codecsBitratesSegmentSizes[CODEC.TITLE] = {
  240000: [58550, 87572, 56969, 67544, 83720, 100748, 80378, 119677, 69444, 94606, 79219, 61392, 71725, 64063, 85835, 71217, 64242, 68605, 51547, 49434, 61187, 62602, 91003, 67206, 67059, 117519, 60884, 61186, 69209, 31292],
  360000: [90506, 134591, 86293, 103110, 127218, 151409, 126864, 187573, 118175, 133504, 123632, 92432, 108681, 97788, 133426, 106044, 97398, 106451, 78108, 73551, 92874, 96504, 137217, 100989, 99064, 182998, 92985, 93813, 106546, 46384],
  540000: [137364, 206337, 144482, 157527, 193860, 242751, 205109, 296753, 196138, 202930, 186036, 140311, 172263, 157062, 204366, 162990, 148771, 173909, 117962, 111312, 145032, 153861, 208075, 145057, 151615, 282765, 141442, 141250, 161249, 70686],
  810000: [192578, 288669, 216795, 222891, 273762, 341037, 276931, 433865, 240753, 282113, 265690, 188619, 237468, 241493, 293097, 229093, 216166, 265411, 165064, 154364, 208768, 233068, 295007, 212526, 214302, 421547, 200749, 200728, 229866, 101702]
};

var SEGMENT_SIZE_SECONDS = 4;

var compareCodecSegmentsBytes = 0;
var selectedCodecSegmentBytes = 0;

var currentSegmentDownloaded = 0;
var currentSegmentDisplayed = 0;
var segmentData = [];

var MAX_SEGMENT_VIEW_COUNT = 10;

var chart = null;

var currentTime = 0;

var updateRequestData = function (selectedRequestData, compareRequestedData, savingsPercentage, costReduction) {
  document.getElementById('selected-codec-request-data').innerHTML = selectedRequestData;
  document.getElementById('compare-codec-request-data').innerHTML = compareRequestedData;
  document.getElementById('savings-percentage').innerHTML = savingsPercentage;
  document.getElementById('cost-reduction').innerHTML = costReduction;
};

var bytesToMegabytes = function (bytes) {
  return bytes / 1024 / 1024;
};

var bytesToGigabytes = function (bytes) {
  return bytesToMegabytes(bytes) / 1024;
};

var roundToTwo = function (number) {
  return Math.round(number * 100) / 100;
};


var updateBandwidthData = function () {
  var playbackData = player1.getPlaybackVideoData();
  var playbackBitrate = playbackData.bitrate;

  if (!playbackBitrate) {
    return;
  }

  var compareBitrate = avBandwidth;

  var compareCodecBitratesSegmentSizes = codecsBitratesSegmentSizes[CODEC.DEFAULT];
  var compareCodecSegmentSizes = compareCodecBitratesSegmentSizes[compareBitrate];
  var compareCodecSegmentSize = compareCodecSegmentSizes[currentSegmentDownloaded];

  var selectedCodecBitratesSegmentSizes = codecsBitratesSegmentSizes[CODEC.TITLE];
  var playbackCodecSegmentSizes = selectedCodecBitratesSegmentSizes[playbackBitrate];
  var playbackCodecSegmentSize = playbackCodecSegmentSizes[currentSegmentDownloaded];

  compareCodecSegmentsBytes += compareCodecSegmentSize;
  selectedCodecSegmentBytes += playbackCodecSegmentSize;

  segmentData.push({
    compareCodecSegmentSize: compareCodecSegmentSize,
    playbackCodecSegmentSize: playbackCodecSegmentSize,
    compareCodecSegmentsBytes: compareCodecSegmentsBytes,
    selectedCodecSegmentBytes: selectedCodecSegmentBytes
  });

  currentSegmentDownloaded++;
};

var shiftSegments = function () {
  var labels = chart.data.labels;
  var datasets = chart.data.datasets;

  var isDatasetFilled = Math.max(datasets[0].data.length, datasets[1].data.length) === MAX_SEGMENT_VIEW_COUNT;

  var start = timeToDigit(labels[0]);
  var end = timeToDigit(labels[labels.length - 1]);

  var currentRangeMidPoint = start + ((end - start) / 2);
  var currentTimeWithinRange = currentTime >= start;
  var allowedToShift = !isDatasetFilled || (currentTimeWithinRange && currentTime >= currentRangeMidPoint);

  if (!allowedToShift || segmentData.length === 0 || !chart.data.datasets[0] || player1.hasEnded()) {
    return;
  }

  var segment = segmentData.shift();

  var compareCodecSegmentSize = segment.compareCodecSegmentSize;
  var playbackCodecSegmentSize = segment.playbackCodecSegmentSize;
  var compareCodecSegmentsBytes = segment.compareCodecSegmentsBytes;
  var selectedCodecSegmentBytes = segment.selectedCodecSegmentBytes;

  var compareCodecBitrate = roundToTwo((compareCodecSegmentSize / SEGMENT_SIZE_SECONDS / 1e3) * 8);
  var playbackCodecBitrate = roundToTwo((playbackCodecSegmentSize / SEGMENT_SIZE_SECONDS / 1e3) * 8);

  datasets[0].data.push(Math.round(compareCodecBitrate));
  datasets[1].data.push(Math.round(playbackCodecBitrate));

  while (datasets[0].data.length > MAX_SEGMENT_VIEW_COUNT) {
    labels.shift();
    datasets[0].data.shift();
    datasets[1].data.shift();
    labels.push(digitToTime(timeToDigit(labels[labels.length - 1]) + SEGMENT_SIZE_SECONDS))
  }

  chart.update();

  var selectedRequestData = roundToTwo(bytesToMegabytes(selectedCodecSegmentBytes));
  var compareRequestedData = roundToTwo(bytesToMegabytes(compareCodecSegmentsBytes));
  var savingsPercentage = roundToTwo((1 - selectedCodecSegmentBytes / compareCodecSegmentsBytes) * 100);

  var costReduction = roundToTwo(bytesToGigabytes(compareCodecSegmentsBytes - selectedCodecSegmentBytes) * 1e6 * 0.025);

  updateRequestData(selectedRequestData, compareRequestedData, savingsPercentage, costReduction);

  currentSegmentDisplayed++;
};

function digitToTime(digit) {
  var minutes = Math.floor(digit / 60);
  var seconds = digit - (minutes * 60);
  return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

function timeToDigit(time) {
  var parts = time.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

var setupChart = function () {
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
        label: "Default",
        data: [],
        steppedLine: true,
        backgroundColor: colors.orangeTint,
        borderColor: colors.orange,
        pointBackgroundColor: colors.orange,
        borderWidth: 2
      },
      {
        label: "Per Title",
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
    data.labels.push(digitToTime(count * SEGMENT_SIZE_SECONDS));
  }

  var UserDefinedScaleDefaults = Chart.scaleService.getScaleDefaults("linear");
  var UserDefinedScale = Chart.scaleService.getScaleConstructor("linear").extend({
    buildTicks: function () {
      this.min = 0;
      this.max = 8000;
      var stepWidth = 1000;

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
    }
  });

  chart = new Chart(document.getElementById('chart-container').getContext('2d'), {
    type: 'line',
    data: data,
    options: options
  });
};

var interval;

function setupInterval() {
  clearInterval(interval);
  interval = setInterval(function () {
    currentTime += 0.01;
    chart.draw();
  }, 10);
}

var loadPerTitlePlayer = function (avBandwidth) {
  var config = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'per-title-encoding'
    },
    source: {
      dash: '//bitmovin-a.akamaihd.net/webpages/demos/content/per-title/pertitle_profile/stream.mpd'
    },
    adaptation: {
      desktop: {
        qualityThreshold: 0.5,
        disableDownloadCancelling: true,
        maxSelectableVideoBitrate: avBandwidth
      },
      mobile: {
        qualityThreshold: 0.5,
        disableDownloadCancelling: true
      }
    },
    playback: {
      muted: true
    },
    events: {
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
      playbackfinished: function () {
        clearInterval(interval);
      }
    }
  };

  var playerContainer = document.getElementById('player-container-1');
  player1 = new bitmovin.player.Player(playerContainer, config);

  player1.load(config.source).then(function () {
    player1.preload();
    player1.seek = function () {
    };
  });

  player1.on(bitmovin.player.PlayerEvent.SegmentRequestFinished, function (segment) {
    if (segment.mimeType.indexOf('audio') >= 0) {
      return;
    }

    updateBandwidthData();
  });

  player1.on(bitmovin.player.PlayerEvent.TimeChanged, function (event) {
    currentTime = event.time;
    shiftSegments();
  });

  setupChart();
};


var initPertitle = function () {
  avBandwidth = 5800000;

  updateRequestData(0, 0, 0, 0);
  loadPerTitlePlayer(avBandwidth);
};

$(document).ready(initPertitle);