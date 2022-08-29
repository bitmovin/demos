(function () {

  var data;
  var chart;

  if (getBrowser() === BROWSER.SAFARI) {
    document.getElementById('chart-wrapper').style.display = 'none';
  }

  google.charts.load('current', {'packages': ['corechart']});

  google.charts.setOnLoadCallback(function () {
    chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    drawLineChart();
  });

  var dataset = [
    ['segmentNumber', 'Estimated throughput (Mbps)', 'Chosen quality (Mbps)', 'Buffer Length (x10s)'],
    [0, 0, 0, 0],
  ];

  function drawLineChart() {
    data = google.visualization.arrayToDataTable(dataset);
    var options = {
      title: '',
      chartArea: {
        width: '85%'
      },
      curveType: 'none',
      legend: {
        position: 'top',
      },
      vAxis: {
        minValue: 0,
        'Bitrates (Mbps)': {label: 'Bitrates (Mbps)'},
        'Buffer Length (x10s)': {label: 'Buffer Length(x10s)'},
        baselineColor: '#acacac',
        gridlines: {
          count: 9,
          color: "#dcdcdc"
        }
      },
      hAxis: {
        textPosition: 'out',
        title: 'Segment Number',
        baselineColor: '#acacac',
        minValue: 0,
        gridlines: {
          count: 10,
          color: "#dcdcdc"
        },
        titleTextStyle: {
          italic: false
        }
      },
      colors: [
        '#2c83b9',
        '#ff931e',
        '#bf004e'
      ]
    };

    chart.draw(data, options);
  }

  window.onresize = drawLineChart;

// var bufferDataSet = [
//   ['seconds', 'size'],
//   [0, 0],
//   [1, 1],
// ];

  if (location.protocol === 'file:') {
    document.getElementById('webserver-warning').style.display = 'block';
  }
  var availableRepresentations = 0;
  var segmentNumber = 0;
  var newValue = function (metrics) {
    var throughput;
    if (metrics.throughput > 5000) {
      throughput = 5000;
    } else {
      throughput = metrics.throughput;
    }

    console.log('troughput: ' + throughput + '\n picked quality: ' + player.getDownloadedVideoData().bitrate);
    var chosenQuality = player.getDownloadedVideoData().bitrate;
    segmentNumber += 1;
    dataset.push(
      [segmentNumber, throughput / 1000, parseInt(chosenQuality) / 1000000, player.getVideoBufferLength() / 10]);
    drawLineChart();
  };

  var conf = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'custom-adaptation'
    },
    playback: {
      muted: true
    },
    events: {
      downloadfinished: function (data) {
        if (data.downloadType.indexOf('media') !== -1 && data.mimeType.indexOf('video') !== -1 && data.size > 1000) {
          console.log('Estimated bandwidth: ' + Math.round(((data.size * 8) / data.downloadTime) / 1000) + 'kbps');
          newValue({throughput: Math.round(((data.size * 8) / data.downloadTime) / 1000)});
        }
      },
    },
    adaptation: {
      desktop: {
        onVideoAdaptation: function (param) {
          for (var i = 0; i < availableRepresentations.length; i++) {
            if (availableRepresentations[i].id === param.suggested) {
              console.log('Suggested representation: ' + availableRepresentations[i].bitrate / 1000 + 'kbps');
            }
          }
        },
      },
      mobile: {
        onVideoAdaptation: function (param) {
          for (var i = 0; i < availableRepresentations.length; i++) {
            if (availableRepresentations[i].id === param.suggested) {
              console.log('Suggested representation: ' + availableRepresentations[i].bitrate / 1000 + 'kbps');
            }
          }
        },
      },
    },
  };

  var source = {
    dash: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: 'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/poster.jpg',
  };

  var playerContainer = document.getElementById('player-container');
  player = new bitmovin.player.Player(playerContainer, conf);

  player.load(source).then(function () {
    availableRepresentations = player.getAvailableVideoQualities();
  });
})();