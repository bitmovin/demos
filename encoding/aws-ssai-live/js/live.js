$(() => {
  const liveStartBtn = document.getElementById("live-encoding-start");
  const liveStopBtn = document.getElementById("live-encoding-stop");

  liveStartBtn.addEventListener("click", async () => {
    // ToDo: replace it with AWS Lambda function to start triggering the Live-to-VOD manifest creation
    console.log("Live Encoding Start button clicked");
  });

  liveStopBtn.addEventListener("click", () => {
    // ToDo: replace it with AWS Lambda function to start triggering the Live-to-VOD manifest creation
    console.log("Live Encoding Stop button clicked");
  });

  var player;
  var config = {
    key: '',
    analytics: {
      key: '',
      videoId: 'ssai-demo',
    },
    playback: {
      muted: true,
    },
  };

  var source = {
    hls: 'https://b0412d9d14564e3a8adb85f0c67ddfb2.mediatailor.eu-west-1.amazonaws.com/v1/master/e43236c6c3da2f9adba09ce309a47dcec2045396/NABDemo/nab/ServerSideAdInsertion/master.m3u8',
  };

  var playerContainer = document.getElementById('player-container');
  player = new bitmovin.player.Player(playerContainer, config);
  player.load(source).then(function () {});
});
