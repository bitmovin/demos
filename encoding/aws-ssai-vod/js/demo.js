const SSAI_HLS_PLAYBACK_PREFIX = "https://0ed91c03b8af40c09acb289b8691d218.mediatailor.us-east-1.amazonaws.com/v1/master/e43236c6c3da2f9adba09ce309a47dcec2045396/NABDemoVOD/";

const API_GATEWAY_URL = "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test";

var player;
var encodingSources = [];
var currentEncodingSource;
var intervalId = 0;
var currentLoadedSourceInfo = null;
const startEncodingButton = document.getElementById('vod-encoding-start');
const selectAssetDropDown = document.getElementById("available_targets");
const encodingAssetLabel  = document.getElementById("encoding-asset");
const encodingIdLabel     = document.getElementById("encoding-id");
const encodingStateLabel  = document.getElementById("encoding-state");
const encodingProgress    = document.getElementById("encoding-progress");
const loadingDiv = document.getElementById("loading");
const controlLog = document.getElementById('control-log');
const loadSourceButton = document.getElementById('load-source');
const assetInfoLabel = document.getElementById("playlist_url");

function init() {
  // create player
  var playerContainer = document.getElementById('player-container');
  player = createPlayer(playerContainer);

  selectAssetDropDown.onchange = onSelectionChange;
  startEncodingButton.onclick = startEncoding;
  loadSourceButton.onclick = onClickLoadSource;

  toggleStartEncodingButton(true);
  toggleLoadSourceButton(true);
  resetEncodingStatus("...");
  // scan S3 input source buffer
  scanSourceBucket();
}

function scanSourceBucket() {
  const xhr = new XMLHttpRequest();
  const response = xhr.open("GET", `${API_GATEWAY_URL}/scan-sources`);
  xhr.onload = () => {
    if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      populateEncodingSourcesDropdown(response)
    } else {
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send();
}

function populateEncodingSourcesDropdown(data) {
  encodingSources = data;
  for (var i = 0; i < data.length; i++) {
    var el = document.createElement("option");
    el.textContent = data[i].Key;
    el.value = data[i].Key;
    selectAssetDropDown.appendChild(el);
    console.log("appended options:" + JSON.stringify(el));
  }

  onSelectionChange();
}

function startEncoding() {
  var currentSelectedSource = getCurrentSelectedSource();
  // disable start encoding button
  showLoadingDiv();
  toggleStartEncodingButton(true);
  resetEncodingStatus(currentEncodingSource.Key, "PREPARING");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_GATEWAY_URL}/start-vod-encoding`);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  const body = JSON.stringify({
    input_file: currentSelectedSource.Key
  });
  xhr.onload = () => {
    hideLoadingDiv();
    if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      encodingAssetLabel.innerHTML = response.asset;
      encodingIdLabel.innerHTML = response.encoding_id;
      encodingStateLabel.innerHTML = response.status;
      encodingProgress.value = response.progress;
      document.getElementById("encoding-dashboard").href = response.status_url;
      intervalId = setInterval(function () {
        checkAndUpdateEncodingStatus(response.asset_path);
      }, 10000);
    } else {
      console.log(`Error: ${xhr.status}`);
      toggleStartEncodingButton(false);
      resetEncodingStatus(currentEncodingSource.Key, "ERROR");
    }
  };
  xhr.send(body);
}

function checkAndUpdateEncodingStatus(asset_name) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_GATEWAY_URL}/vod-encoding-status`);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  const body = JSON.stringify({
    name: asset_name
  });
  xhr.onload = () => {
    if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
      console.log('Encoding Status : ' + xhr.responseText);
      hideLoadingDiv();
      var response = JSON.parse(xhr.responseText);
      if (response.status == "FINISHED") {
        loadSource(response);
        toggleLoadSourceButton(false);
        currentLoadedSourceInfo = response;
      }

      if (response.status == "FINISHED" || response.status == "ERROR" || response.status == "CANCELLED" || response.status == "NOT_FOUND") {
        toggleStartEncodingButton(false);
        clearIntervalTimer();
      }

      if (response.status == "NOT_FOUND") {
        console.log("No encodings exist");
        hideLoadingDiv();
        toggleStartEncodingButton(false);
        resetEncodingStatus("...");
      } else {
        encodingAssetLabel.innerHTML = response.asset_path;
        encodingIdLabel.innerHTML = response.encoding_id;
        encodingStateLabel.innerHTML = response.status;
        encodingProgress.value = response.progress;
        document.getElementById("encoding-dashboard").href = response.status_url;
      }
    } else {
      toggleStartEncodingButton(false);
      clearIntervalTimer();
      console.log(`Error: ${xhr.status}`);
    }
  };
  xhr.send(body);
}

function getCurrentSelectedSource() {
  var e = selectAssetDropDown;
  console.log('getCurrentSelectedSource: selectList=' + JSON.stringify(e));
  var value = e.options[e.selectedIndex].value;
  var currentItem = encodingSources.filter(x => x.Key === value)[0];
  currentEncodingSource = currentItem;
  return currentEncodingSource;
}

function updateEncodingStatus() {
  var currentSelectedSource = getCurrentSelectedSource();
  checkAndUpdateEncodingStatus(currentSelectedSource.Key);
  intervalId = setInterval(function () {
    checkAndUpdateEncodingStatus(currentSelectedSource.Key);
  }, 5000);
}

function onSelectionChange() {
  console.log('onSelectionChange');
  if (encodingSources.length === 0) {
    console.log('onSelectionChange: waiting for source list to be populated');
    return;
  }

  showLoadingDiv();
  toggleStartEncodingButton(true);
  toggleLoadSourceButton(true);
  resetEncodingStatus("...");
  clearIntervalTimer();
  updateEncodingStatus();
}

function toggleStartEncodingButton(disable) {
  startEncodingButton.disabled = disable;
}

function toggleLoadSourceButton(disable) {
  loadSourceButton.disabled = disable;
  currentLoadedSourceInfo = null;
}

function scrollControlLog() {
  controlLog.scrollTop = controlLog.scrollHeight;
  setInterval(scrollControlLog, 100);
}

function clearIntervalTimer() {
  console.log('clearing intervalId=' + intervalId);
  clearInterval(intervalId);
  intervalId = 0;
}

function resetEncodingStatus(asset_name, state="...") {
  encodingAssetLabel.innerHTML = asset_name;
  encodingIdLabel.innerHTML = "...";
  encodingStateLabel.innerHTML = state;
  encodingProgress.value = 0.0;
  document.getElementById("encoding-dashboard").href = "https://bitmovin.com/dashboard/encoding/home";
  assetInfoLabel.href = "";
  assetInfoLabel.innerHTML = "...";
}

function showLoadingDiv() {
  startEncodingButton.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
}

function hideLoadingDiv() {
  loadingDiv.classList.add("hidden");
  startEncodingButton.classList.remove("hidden");
}

const createPlayer = (container) => {
  var config = {
    key: 'e14e2f19-bac0-4206-ae12-f9aff71f66e8',
    analytics: {
      key: 'cd45515d-bfb9-47a0-8dae-4523b6082360',
      videoId: 'vod-ssai-demo'
    },
    playback: {
      muted: true,
      autoplay: false
    },
    logs: {
      //level: 'debug'
    },
    tweaks: {
      stop_download_on_pause: true
    },
    events: {
      play: function () {
        controlLog.innerHTML += 'Playing<br>';
      },
      paused: function () {
        controlLog.innerHTML += 'Paused<br>';
      },
      playbackfinished: function () {
        controlLog.innerHTML += 'PlaybackFinished<br>';
      },
      metadata: function (e) {
        controlLog.innerHTML += 'Metadata Event<br>';
        controlLog.innerHTML += JSON.stringify(e) + '<br>';
      },
    }
  };
  var player = new bitmovin.player.Player(container, config);
  return player;
};

const loadSource = (source_info) => {
  var hlsUrl = source_info.hls;
  var ssaiHlsUrl = hlsUrl.replace(/(https:|)(^|\/\/)(.*?\/)/g, SSAI_HLS_PLAYBACK_PREFIX);
  console.log('Loading Player: hlsUrl=' + hlsUrl);
  console.log('Loading Player: ssaiHlsUrl=' + ssaiHlsUrl);
  assetInfoLabel.href = ssaiHlsUrl;
  assetInfoLabel.innerHTML = ssaiHlsUrl;
  var source = {
    title: source_info.asset,
    hls: ssaiHlsUrl,
  };
  player.load(source).then(
      function () {
        console.log('Successfully created Bitmovin Player instance');
      },
      function (reason) {
        console.log('Error while creating Bitmovin Player instance ' + reason);
      }
  );
};

const onClickLoadSource = () => {
  if (currentLoadedSourceInfo != null) {
    loadSource(currentLoadedSourceInfo);
  }
};

$(document).ready(init);
