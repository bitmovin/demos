const AWS_S3_INPUT_BUCKET_NAME = 'nab-demo-input-test';
const AWS_USER_ACCESS_KEY = 'AKIARQ4JSVAMNNHA45FQ';
const AWS_USER_ACCESS_SECRET = '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';

var player;
var controlLog = document.getElementById('control-log');
var encodingSources = [];
var currentEncodingSource;

window.onload = () => {
  // create player
  var playerContainer = document.getElementById('player-container');
  player = createPlayer(playerContainer);

  toggleStartEncodingButton(true);
  toggleStartPlaybackButton(true);
  // scan S3 input source buffer
  scanAwsS3Bucket();
};


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
      metadataparsed: function (e) {
        controlLog.innerHTML += 'MetadataParsed Event<br>';
        controlLog.innerHTML += JSON.stringify(e) + '<br>';
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
  var source = {
    title: source_info.asset,
    hls: source_info.hls,
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
  s3 = new AWS.S3({ apiVersion: '2012-08-10', accessKeyId: AWS_USER_ACCESS_KEY, secretAccessKey: AWS_USER_ACCESS_SECRET, region: "us-east-1" });
  // Create the parameters for calling listObjects
  var bucketParams = {
    Bucket : AWS_S3_INPUT_BUCKET_NAME,
  };

  // Call S3 to obtain a list of the objects in the bucket
  s3.listObjects(bucketParams, function(err, data) {
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
  var select = document.getElementById("select-asset");

  for (var i = 0; i < data.Contents.length; i++) {
    var el = document.createElement("option");
    el.textContent = data.Contents[i].Key;
    el.value = data.Contents[i].Key;
    select.appendChild(el);
  }

  onSelectionChange();
}

function startPlayback() {
  player.play();
}

function startEncoding() {
  var currentSelectedSource = getCurrentSelectedSource();
  // disable start encoding button
  toggleStartEncodingButton(true);
  toggleStartPlaybackButton(true);

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
      document.getElementById("encoding-start").value = response.status + ": " + response.progress + "%";
      updateEncodingDashboardLink(response.status_url);
      var intervalId = setInterval(function() {
        checkAndUpdateEncodingStatus(response.asset, response.encoding_id, intervalId);
      }, 10000);
    } else {
      console.log(`Error: ${xhr.status}`);
      toggleStartEncodingButton(false);
    }
  };
  xhr.send(body);
}

function checkAndUpdateEncodingStatus(asset, encoding_id, intervalId=null) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test/vod-encoding-status");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    const body = JSON.stringify({
      id: encoding_id
    });
    xhr.onload = () => {
      if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
        console.log('Encoding Status : ' + xhr.responseText);
        var result = JSON.parse(xhr.responseText);
        if (result.status == "FINISHED") {
          // enable back start encoding button
          toggleStartEncodingButton(false);
          toggleStartPlaybackButton(false);
          updateEncodingDashboardLink(result.status_url)
          document.getElementById("encoding-start").value = "Start Encoding";
          if (intervalId) {
            clearInterval(intervalId);
          }
          loadPlayer(result);
        } else {
          document.getElementById("encoding-start").value = result.status  + ": " + result.progress + "%";
          updateEncodingDashboardLink(result.status_url)
        }
      } else {
        console.log(`Error: ${xhr.status}`);
      }
    };
    xhr.send(body);
}

function getCurrentSelectedSource() {
  var e = document.getElementById("select-asset");
  var value = e.options[e.selectedIndex].value;
  var currentItem = encodingSources.filter(x => x.Key === value)[0];
  currentEncodingSource = currentItem;
  return currentEncodingSource;
}

function queryDynamoDb() {
  var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', accessKeyId: AWS_USER_ACCESS_KEY, secretAccessKey: AWS_USER_ACCESS_SECRET, region: "us-east-1",
    dynamoDbCrc32: false});
  var params = {
    TableName: "nab-demo-encodings"
  };

  dynamodb.scan(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      updateState(data);
    }
  });
}

function updateState(dbData) {
  var currentSelectedSource = getCurrentSelectedSource();
  var selectedItem = dbData.Items.filter(x => x.title.S === currentSelectedSource.Key)[0];

  if (selectedItem) {
    checkAndUpdateEncodingStatus(selectedItem.title.S, selectedItem.id.S);
  } else {
    console.log ("No encodings exist");
    toggleStartEncodingButton(false);
    toggleStartPlaybackButton(true);
    updateEncodingDashboardLink("javascript: void(0)")
  }
}

function onSelectionChange() {
  queryDynamoDb();
}

function toggleStartEncodingButton(disable) {
  document.getElementById("encoding-start").disabled = disable;
}

function toggleStartPlaybackButton(disable) {
  document.getElementById("playback-start").disabled = disable;
}

function updateEncodingDashboardLink(url) {
  document.getElementById("encoding-status").href = url;
}

function scrollControlLog() {
  controlLog.scrollTop = controlLog.scrollHeight;
  setInterval(scrollControlLog, 100);
}
