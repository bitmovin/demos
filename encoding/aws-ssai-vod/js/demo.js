
const AWS_S3_INPUT_BUCKET_NAME = 'nab-demo-input-test';
const AWS_USER_ACCESS_KEY = '';
const AWS_USER_ACCESS_SECRET = '';
const SSAI_HLS_PLAYBACK_PREFIX = "https://0ed91c03b8af40c09acb289b8691d218.mediatailor.us-east-1.amazonaws.com/v1/master/e43236c6c3da2f9adba09ce309a47dcec2045396/NABDemoVOD/";

var player;
var encodingSources = [];
var currentEncodingSource;
var s3;
var intervalId = 0;
var startEncodingButton = document.getElementById('start-encoding-button');
var selectAssetDropDown = document.getElementById("available_targets");
var encodingAssetLabel     = document.getElementById("encoding-asset");
var encodingIdLabel     = document.getElementById("encoding-id");
var encodingStateLabel  = document.getElementById("encoding-state");
var encodingProgress    = document.getElementById("encoding-progress");
var controlLog = document.getElementById('control-log');

function init() {
  // create player
  var playerContainer = document.getElementById('player-container');
  player = createPlayer(playerContainer);

  startEncodingButton.onclick = startEncoding;
  selectAssetDropDown.onchange = onSelectionChange;

  toggleStartEncodingButton(true, "Start");
  resetEncodingStatus("...");
  // scan S3 input source buffer
  scanAwsS3Bucket();
}


const createPlayer = (container) => {
  var config = {
    key: '6c88f166-fe3e-467a-9276-aea43864cdcb',
    playback: {
      muted: true,
      //autoplay: true
    },
    analytics: {
      key: '293d0808-ee2f-4655-8749-9bf1b2f95823',
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

const loadPlayer = (source_info) => {
  var hlsUrl = source_info.hls;
  var ssaiHlsUrl = hlsUrl.replace(/(https:|)(^|\/\/)(.*?\/)/g, SSAI_HLS_PLAYBACK_PREFIX);
  console.log('Loading Player: hlsUrl=' + hlsUrl);
  console.log('Loading Player: ssaiHlsUrl=' + ssaiHlsUrl);
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

function scanAwsS3Bucket() {
  s3 = new AWS.S3({
    apiVersion: '2012-08-10',
    accessKeyId: AWS_USER_ACCESS_KEY,
    secretAccessKey: AWS_USER_ACCESS_SECRET,
    region: "us-east-1"
  });
  // Create the parameters for calling listObjects
  var bucketParams = {
    Bucket: AWS_S3_INPUT_BUCKET_NAME,
  };

  // Call S3 to obtain a list of the objects in the bucket
  s3.listObjects(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
      populateEncodingSourcesDropdown(data)
    }
  });

}

function populateEncodingSourcesDropdown(data) {
  encodingSources = data.Contents;
  for (var i = 0; i < data.Contents.length; i++) {
    var el = document.createElement("option");
    el.textContent = data.Contents[i].Key;
    el.value = data.Contents[i].Key;
    selectAssetDropDown.appendChild(el);
    console.log("appended options:" + JSON.stringify(el));
  }

  onSelectionChange();
}

function startEncoding() {
  var currentSelectedSource = getCurrentSelectedSource();
  // disable start encoding button
  toggleStartEncodingButton(true, "Start");
  resetEncodingStatus(currentEncodingSource.Key, "PREPARING");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test/start-vod-encoding");
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  const body = JSON.stringify({
    input_file: currentSelectedSource.Key
  });
  xhr.onload = () => {
    if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      encodingAssetLabel.innerHTML = response.asset;
      encodingIdLabel.innerHTML = response.encoding_id;
      encodingStateLabel.innerHTML = response.status;
      encodingProgress.value = response.progress;
      updateEncodingDashboardLink(response.status_url);
      intervalId = setInterval(function () {
        checkAndUpdateEncodingStatus(response.asset, response.encoding_id);
      }, 10000);
    } else {
      console.log(`Error: ${xhr.status}`);
      toggleStartEncodingButton(false, "Start");
      resetEncodingStatus(currentEncodingSource.Key, "ERROR");
    }
  };
  xhr.send(body);
}

function checkAndUpdateEncodingStatus(asset, encoding_id) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test/vod-encoding-status");
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  const body = JSON.stringify({
    id: encoding_id
  });
  xhr.onload = () => {
    if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
      console.log('Encoding Status : ' + xhr.responseText);
      var response = JSON.parse(xhr.responseText);
      if (response.status == "FINISHED") {
        loadPlayer(response);
      }
    } else {
      console.log(`Error: ${xhr.status}`);
    }

    if (response.status == "FINISHED" || response.status == "ERROR") {
      toggleStartEncodingButton(false, "Start");
      clearIntervalTimer();
    }
    encodingAssetLabel.innerHTML = response.asset;
    encodingIdLabel.innerHTML = response.encoding_id;
    encodingStateLabel.innerHTML = response.status;
    encodingProgress.value = response.progress;
    updateEncodingDashboardLink(response.status_url);
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

function queryDynamoDb() {
  var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    accessKeyId: AWS_USER_ACCESS_KEY,
    secretAccessKey: AWS_USER_ACCESS_SECRET,
    region: "us-east-1",
    dynamoDbCrc32: false
  });
  var params = {
    TableName: "nab-demo-encodings"
  };

  dynamodb.scan(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      updateEncodingStatus(data);
    }
  });
}

function updateEncodingStatus(dbData) {
  var currentSelectedSource = getCurrentSelectedSource();
  var selectedItem = dbData.Items.filter(x => x.title.S === currentSelectedSource.Key)[0];

  if (selectedItem) {
    intervalId = setInterval(function () {
      checkAndUpdateEncodingStatus(selectedItem.title.S, selectedItem.id.S, intervalId);
    }, 10000);
  } else {
    console.log("No encodings exist");
    toggleStartEncodingButton(false, "Start");
    resetEncodingStatus("...");
  }
}

function onSelectionChange() {
  console.log('onSelectionChange');
  if (encodingSources.length === 0) {
    console.log('onSelectionChange: waiting for source list to be populated');
    return;
  }

  toggleStartEncodingButton(true, "Start");
  resetEncodingStatus("...");
  clearIntervalTimer();
  queryDynamoDb();
}

function toggleStartEncodingButton(disable, value=null) {
  startEncodingButton.disabled = disable;

  if (value !== null) {
    startEncodingButton.value = value;
  }
}

function updateEncodingDashboardLink(url) {
  document.getElementById("encoding-dashboard").href = url;
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
  updateEncodingDashboardLink("https://bitmovin.com/dashboard/encoding/home")
}

$(document).ready(init);
