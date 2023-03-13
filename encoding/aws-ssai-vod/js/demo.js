$(() => {
  var player;
  var controlLog = document.getElementById('control-log');
  var config = {
    key: '',
    analytics: {
      key: '',
      videoId: 'ssai-demo',
    },
    playback: {
      muted: true,
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
    },
  };

  var source = {
    hls: 'https://b0412d9d14564e3a8adb85f0c67ddfb2.mediatailor.eu-west-1.amazonaws.com/v1/master/e43236c6c3da2f9adba09ce309a47dcec2045396/NABDemo/nab/ServerSideAdInsertion/master.m3u8',
  };

  var playerContainer = document.getElementById('player-container');
  player = new bitmovin.player.Player(playerContainer, config);
  player.load(source).then(function () {});

  function scrollControlLog() {
    controlLog.scrollTop = controlLog.scrollHeight;
  }
  setInterval(scrollControlLog, 100);
});
