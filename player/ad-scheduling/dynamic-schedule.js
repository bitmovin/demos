let adType = document.getElementById('adType').value;
let manifestUrl = document.getElementById('ad-server-url').value;
let schedule = document.getElementById('schedule-list').value;

player.ads.schedule({
  tag: {
    url: manifestUrl,
    type: adType
  },
  id: 'Ad',
  position: schedule
});