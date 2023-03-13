$(() => {
  const last30SecBtn = document.getElementById("last-30-sec-btn");
  const last60SecBtn = document.getElementById("last-60-sec-btn");

  last30SecBtn.addEventListener("click", async () => {
    // ToDo: eplace it with AWS Lambda function to start triggering the Live-to-VOD manifest creation
    console.log("Last 30 sec to VOD button clicked");
  });

  last60SecBtn.addEventListener("click", () => {
    // ToDo: replace it with AWS Lambda function to start triggering the Live-to-VOD manifest creation
    console.log("Last 60 sec to VOD button clicked");
  });

  var player;
  var config = {
    key: '',
    analytics: {
      key: '',
      videoId: 'live-to-vod-demo',
    },
    playback: {
      muted: true
    }
  };

  var source = {
    hls: 'https://b0412d9d14564e3a8adb85f0c67ddfb2.mediatailor.eu-west-1.amazonaws.com/v1/master/e43236c6c3da2f9adba09ce309a47dcec2045396/NABDemo/nab/ServerSideAdInsertion/master.m3u8',
  };

  var playerContainer = document.getElementById('player-container2');
  player = new bitmovin.player.Player(playerContainer, config);
  player.load(source).then(function () {});
});
