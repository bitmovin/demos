(function () {
  console.log("Starting WISH ABR");

  var qualitySwitches = 0;
  var buffer_size = 40;
  var throughputHistory = [];
  var currentQuality = null;
  var sameRepCount = 0;
  var MIN_BUFFER_RATIO = 0.2;
  var alpha = 0;
  var beta = 0;
  var gamma = 0;
  var denominator_exp = 0;
  var smoothThroughputKbps = 0;
  var num_downloaded_segments = 0;
  var selected_quality_index_array = [];
  var availableVideoQualities;
  var last_selected_quality = 0;
  var next_selected_quality = 0;
  var bitratesKbps;
  var SD = 4;
  var currentBufferS;
  var lastBufferS;
  var downloadedData;
  var low_buff_thresS = 0;
  var lastThroughputKbps = 0;
  var qualityFunction = null;
  var multiplier = 1;
  var m_xi = 0;
  var m_delta = 0;
  var maxBufferLevel = null;
  var videoThroughputKbps = 0;
  var audioThroughputKbps = 0;
  var qualityLevelList = [];

  var data;
  var chart;
  var segmentNumber = 0;
  var dataset = [
    [
      "segmentNumber",
      "Est. throughput (Mbps)",
      "Chosen quality (Mbps)",
      "Buffer Length (sec)",
    ],
    [0, 0, 0, 0],
  ];

  var playerConfig = {
    key: "29ba4a30-8b5e-4336-a7dd-c94ff3b25f30",
    analytics: {
      key: "45adcf9b-8f7c-4e28-91c5-50ba3d442cd4",
      videoId: "custom-adaptation",
    },
    playback: {
      muted: true,
      autoplay: true,
    },
    tweaks: {
      file_protocol: true,
      app_id: "ANY_ID",
      // max_buffer_level: buffer_size,
    },
    adaptation: {
      desktop: {
        onVideoAdaptation: wishmmsp,
      },
      mobile: {
        onVideoAdaptation: wishmmsp,
      },
    },
  };

  if (location.protocol === "file:") {
    document.getElementById("webserver-warning").style.display = "block";
  }

  var container = document.getElementById("player-container");
  var qfSelect = document.getElementById("quality_function");
  var preferencesSelect = document.getElementById("preferences");
  var player = new bitmovin.player.Player(container, playerConfig);

  var sourceConfig = {
    dash: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
  };

  function getUserConfiguration() {
    var preference = document.getElementById("preferences");

    var value = preference.value || "balance";

    switch (value) {
      case "save_data":
        m_xi = 1;
        m_delta = 1;
        break;
      case "balance":
        m_xi = 0.75;
        m_delta = 0.75;
        break;
      case "high_quality":
        m_xi = 0.5;
        m_delta = 0.5;
        break;
    }

    player
      .load(sourceConfig)
      .then(function () {
        console.log("Successfully loaded Source Config!");
      })
      .catch(function (reason) {
        console.log("Error while loading source:", reason);
      });
  }

  preferencesSelect.addEventListener("change", getUserConfiguration);
  qfSelect.addEventListener("change", getUserConfiguration);
  window.addEventListener("load", getUserConfiguration);
  availableVideoQualities = player.getAvailableVideoQualities();
  currentBufferS = player.getVideoBufferLength();

  function wishmmsp(bitmovinABRSuggestion) {
    console.log(
      "Quality switch suggested by Bitmovin player: ",
      bitmovinABRSuggestion
    );
    next_selected_quality = 0;
    bitratesKbps = availableVideoQualities.map(function (quality) {
      return quality.bitrate / 1000;
    });

    // sort bitrates
    bitratesKbps.sort(function (a, b) {
      if (a === Infinity) return 1;
      else if (isNaN(a)) return -1;
      else return a - b;
    });

    currentBufferS = player.getVideoBufferLength();

    if (!player) {
      return;
    }

    if (
      player.getConfig().hasOwnProperty("tweaks") &&
      player.getConfig().tweaks.hasOwnProperty("max_buffer_level")
    ) {
      maxBufferLevel = player.getConfig().tweaks.max_buffer_level;
    } else {
      maxBufferLevel = 20;
    }

    var init = function () {
      player.on(
        bitmovin.player.PlayerEvent.DownloadFinished,
        onDownloadFinished
      );
      player.on(bitmovin.player.PlayerEvent.SegmentPlayback, function (data) {
        SD = data.duration;
      });
    };

    if (player.getSource()) {
      init();
    } else {
      player.on(bitmovin.player.PlayerEvent.SourceLoaded, init);
    }

    var nextQuality = onVideoAdaptation();
    return nextQuality.id;
  }

  function resetBuffer() {
    console.log(" resetBuffer ");
    throughputHistory = [];
  }

  // Graph drawing
  if (getBrowser() === BROWSER.SAFARI) {
    document.getElementById("chart-wrapper").style.display = "none";
  }

  google.charts.load("current", { packages: ["corechart"] });

  google.charts.setOnLoadCallback(function () {
    chart = new google.visualization.LineChart(
      document.getElementById("curve_chart")
    );
    drawLineChart();
  });

  function newValue(metrics) {
    var throughput = metrics.throughput;

    var chosenQuality = player.getDownloadedVideoData().bitrate;

    console.log(
      "troughput: " + throughput + "\n picked quality: " + chosenQuality
    );

    segmentNumber += 1;

    dataset.push([
      segmentNumber,
      throughput / 1000,
      parseInt(chosenQuality) / 1000000,
      player.getVideoBufferLength(),
    ]);

    drawLineChart();
  }

  function onDownloadFinished(event) {
    var instantThroughputKbps =
      event.size > 2000
        ? (event.size * 8) / 1000 / event.downloadTime
        : lastThroughputKbps;
    if (event.downloadType === "media/video") {
      videoThroughputKbps = instantThroughputKbps;
      lastThroughputKbps = Math.max(videoThroughputKbps, audioThroughputKbps);
    } else {
      audioThroughputKbps = instantThroughputKbps;
      lastThroughputKbps = Math.max(videoThroughputKbps, audioThroughputKbps);
    }

    // Data for graph rendering
    console.log("Download finished");
    if (event.mimeType.includes("video")) {
      newValue({
        throughput: Math.round((event.size * 8) / event.downloadTime / 1000),
      });
    }
    // if (
    //   event.downloadType.indexOf("media") !== -1 &&
    //   event.mimeType.indexOf("video") !== -1 &&
    //   event.size > 1000
    // ) {
    // }
  }

  function getSmoothThroughput(
    margin,
    lastThroughputKbps,
    smoothThroughputKbps
  ) {
    if (lastThroughputKbps > 0) {
      if (smoothThroughputKbps === 0) {
        smoothThroughputKbps = lastThroughputKbps;
      } else {
        smoothThroughputKbps =
          (1 - margin) * smoothThroughputKbps + margin * lastThroughputKbps;
      }
    } else {
      smoothThroughputKbps = 5000; // finetune
    }

    return smoothThroughputKbps;
  }

  function getQualityFunction(bitrates, functionType) {
    var qualityLevelList = [];
    var length = bitrates.length;

    if (functionType === "linear") {
      for (var i = 0; i < length; i++) {
        qualityLevelList.push((1.0 * bitrates[i]) / bitrates[length - 1]);
      }
    } else {
      for (var i = 0; i < length; i++) {
        qualityLevelList.push(Math.log(bitrates[i] / bitrates[0]));
      }
    }
    return qualityLevelList;
  }

  function setWeightsLinear(m_xi, m_delta, qualityLevelList, segment_duration) {
    var num_considered_bitrate = bitratesKbps.length;
    var R_max_Mbps = bitratesKbps[num_considered_bitrate - 1];
    var R_o_Mbps = bitratesKbps[num_considered_bitrate - 1];
    var thrp_optimal = bitratesKbps[num_considered_bitrate - 1];
    var last_quality_1_Mbps = bitratesKbps[num_considered_bitrate - 2];
    var optimal_delta_buffer_S = buffer_size * (m_xi - MIN_BUFFER_RATIO);

    var temp_beta_alpha = optimal_delta_buffer_S / segment_duration;
    var temp_a =
      2.0 *
      Math.exp(
        1 + last_quality_1_Mbps / R_max_Mbps - (2.0 * R_o_Mbps) / R_max_Mbps
      );
    var temp_b =
      (1 + (temp_beta_alpha * SD) / optimal_delta_buffer_S) / thrp_optimal;

    denominator_exp = Math.exp(
      2 * qualityLevelList[num_considered_bitrate - 1] - 2 * qualityLevelList[0]
    );
    alpha =
      1.0 /
      (1 + temp_beta_alpha + (R_max_Mbps * temp_b * denominator_exp) / temp_a);
    beta = temp_beta_alpha * alpha;
    gamma = 1 - alpha - beta;
  }

  function setWeightsLogarit(
    m_xi,
    m_delta,
    qualityLevelList,
    segment_duration
  ) {
    var num_considered_bitrate = bitratesKbps.length;
    var R_i = bitratesKbps[num_considered_bitrate - 1];
    var R_min = bitratesKbps[0];
    var Q_k = qualityLevelList[qualityLevelList.length - 2];
    var delta_B = m_xi * buffer_size - low_buff_thresS;
    denominator_exp = Math.exp(
      2 * qualityLevelList[num_considered_bitrate - 1] - 2 * qualityLevelList[0]
    );

    alpha =
      1 /
      (1 +
        delta_B / segment_duration +
        Math.pow(R_i, 3) /
          (m_delta *
            Math.pow(R_min, 2) *
            bitratesKbps[num_considered_bitrate - 2]));
    beta = (alpha * delta_B) / segment_duration;
    gamma = 1 - alpha - beta;
  }

  function getTotalCost_v3(
    bitrates,
    qualityIndex,
    estimated_throghputKbps,
    currentbufferS
  ) {
    var totalCost;
    var bandwidthCost;
    var bufferCost;
    var qualityCost;
    var current_quality_level = qualityLevelList[qualityIndex];

    var temp = (bitrates[qualityIndex] * 1.0) / estimated_throghputKbps; // bitrate is in bps
    var average_quality = 0;
    var slice_window = 10;
    var length_quality = qualityLevelList.length;
    var num_downloaded_segments = selected_quality_index_array.length;
    var quality_window = Math.min(slice_window, num_downloaded_segments);

    for (var i = 1; i <= quality_window; i++) {
      var m_qualityIndex = getQualityIndexFromBitrate(
        selected_quality_index_array[num_downloaded_segments - i],
        length_quality
      );
      average_quality += qualityLevelList[m_qualityIndex];
    }

    average_quality = (average_quality * 1.0) / quality_window;

    bandwidthCost = temp;

    bufferCost = temp * ((SD * 1.0) / (currentbufferS - low_buff_thresS));
    qualityCost =
      Math.exp(
        qualityLevelList[length_quality - 1] +
          average_quality -
          2 * current_quality_level
      ) / denominator_exp;
    totalCost = alpha * bandwidthCost + beta * bufferCost + gamma * qualityCost;

    return totalCost;
  }

  function onVideoAdaptation() {
    availableVideoQualities = player.getAvailableVideoQualities();

    var length = bitratesKbps.length;

    low_buff_thresS = SD;
    if (downloadedData == null || currentBufferS < SD) {
      var minBitrate = availableVideoQualities[0].bitrate;
      var minQuality = availableVideoQualities[0];
      for (var i = 0; i < availableVideoQualities.length; i++) {
        if (availableVideoQualities[i].bitrate < minBitrate) {
          minQuality = availableVideoQualities[i];
          minBitrate = availableVideoQualities[i].bitrate;
        }
      }
      downloadedData = minQuality;
      return minQuality;
    }
    selected_quality_index_array.push(downloadedData.bitrate / 1000);
    num_downloaded_segments = selected_quality_index_array.length;

    var lowest_cost = Number.MAX_SAFE_INTEGER;
    var max_quality = 0;

    smoothThroughputKbps = getSmoothThroughput(
      0.125,
      lastThroughputKbps,
      smoothThroughputKbps
    );
    var estimated_throghputKbps = Math.min(
      smoothThroughputKbps,
      lastThroughputKbps
    );

    qualityLevelList = getQualityFunction(
      bitratesKbps,
      document.getElementById("quality_function").value
    );

    for (var i = length - 1; i >= 0; i--) {
      if (bitratesKbps[i] < smoothThroughputKbps * (1 + 0.1)) {
        max_quality = i;
        break;
      }
    }

    if (max_quality === 0) {
      next_selected_quality = max_quality;
    }

    if (document.getElementById("quality_function").value == "linear") {
      multiplier = 100;
      setWeightsLinear(m_xi, m_delta, qualityLevelList, SD);
    } else {
      multiplier = 10000;
      setWeightsLogarit(m_xi, m_delta, qualityLevelList, SD);
    }

    for (var i = 1; i <= max_quality; i++) {
      var currentTotalCost = Math.round(
        multiplier *
          getTotalCost_v3(
            bitratesKbps,
            i,
            estimated_throghputKbps,
            currentBufferS
          )
      );
      if (currentTotalCost <= lowest_cost) {
        next_selected_quality = i;
        lowest_cost = currentTotalCost;
      }
    }

    // check if it's suitable to decrease the quality
    var threshold_ = 0.2;
    if (
      lastBufferS - currentBufferS < lastBufferS * threshold_ &&
      next_selected_quality < last_selected_quality
    ) {
      next_selected_quality = last_selected_quality;
    }

    last_selected_quality = next_selected_quality;

    var finalDecision;
    for (var i = 0; i < availableVideoQualities.length; i++) {
      if (
        availableVideoQualities[i].bitrate ===
        bitratesKbps[next_selected_quality] * 1000
      ) {
        finalDecision = availableVideoQualities[i];
        break;
      }
    }

    downloadedData = finalDecision;
    lastBufferS = currentBufferS;

    return finalDecision;
  }

  function getQualityIndexFromBitrate(bitrate, bitrates_length) {
    for (var i = 0; i < bitrates_length; i++) {
      if (bitrate == bitratesKbps[i]) {
        return i;
      }
    }
    return 0;
  }

  function drawLineChart() {
    data = google.visualization.arrayToDataTable(dataset);
    console.log("Drawing chart", data, dataset);
    var options = {
      title: "",
      chartArea: {
        width: "85%",
      },
      curveType: "none",
      legend: {
        position: "top",
      },
      vAxis: {
        minValue: 0,
        "Bitrates (Mbps)": { label: "Bitrates (Mbps)" },
        "Buffer Length (x10s)": { label: "Buffer Length(x10s)" },
        baselineColor: "#acacac",
        gridlines: {
          count: 9,
          color: "#dcdcdc",
        },
      },
      hAxis: {
        textPosition: "out",
        title: "Segment Number",
        baselineColor: "#acacac",
        minValue: 0,
        gridlines: {
          count: 10,
          color: "#dcdcdc",
        },
        titleTextStyle: {
          italic: false,
        },
      },
      colors: ["#2c83b9", "#ff931e", "#bf004e"],
    };

    chart.draw(data, options);
  }

  window.addEventListener("resize", drawLineChart, true);
})();
