let adType = document.getElementById('adType').value;
let manifestUrl = document.getElementById('ad-server-url').value;
let schedule = document.getElementById('schedule-list').value;

player.scheduleAd(manifestUrl, adType, {
  'timeOffset': schedule,
  'pertistant': true,
  'adMessage': 'scheduledAd'
});