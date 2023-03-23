const LOG_PULL_INTERVALL_SECONDS = 5 * 1000;

const DELIMITER = '&nbsp;'
const CMCD_KEYS = {
  EncodedBitrate: 'br',
  BufferLength: 'bl',
  BufferStarvation: 'bs',
  ContentId: 'cid',
  ObjectDuration: 'd',
  Deadline: 'dl',
  MeasuredThroughput: 'mtp',
  NextObjectRequest: 'nor',
  NextRangeRequest: 'nrr',
  ObjectType: 'ot',
  PlaybackRate: 'pr',
  RequestedMaximumThroughput: 'rtp',
  StreamingFormat: 'sf',
  SessionId: 'sid',
  StreamType: 'st',
  Startup: 'su',
  TopBitrate: 'tb',
  CmcdVersion: 'v',
}

const logsToDisplay = [];
let lastSuccessfulRetrieval = new Date();
let cmcdSessionId;

function setupPlayerWithCmcd() {
  cmcdSessionId = uuidv4();

  const cmcdConfig = {
    sessionId: cmcdSessionId,
    contentId: '1111-111111-111111-11111',
  };
  const cmcdPlugin = new window.bitmovin.player.integration.Cmcd.CmcdIntegration(cmcdConfig);
  
  const playerConfig = {
    key: '29ba4a30-8b5e-4336-a7dd-c94ff3b25f30',
    analytics: {
      key: '45adcf9b-8f7c-4e28-91c5-50ba3d442cd4',
      videoId: 'cmcd'
    },
    playback: {
      muted: true,
      autoplay: true,
    },
    network: {
      preprocessHttpRequest: cmcdPlugin.preprocessHttpRequest,
      preprocessHttpResponse: cmcdPlugin.preprocessHttpResponse,
    },
    adaptation: {
      onVideoAdaptation: cmcdPlugin.onVideoAdaptation,
      onAudioAdaptation: cmcdPlugin.onAudioAdaptation,
    }
  };

  const playerContainer = document.getElementById('player-container');
  const player = new bitmovin.player.Player(playerContainer, playerConfig);

  if (player.analytics) {
    const analyticsImpressionId = player.analytics.getCurrentImpressionId();
    if (analyticsImpressionId) {
      cmcdSessionId = analyticsImpressionId;
      cmcdPlugin.setSessionId(cmcdSessionId);
      console.log(`Updated CMCD session ID to match Analytics Impression ID ${cmcdSessionId}`);
    }
  }

  cmcdPlugin.setPlayer(player);

  player.load({
    hls: 'https://bitmovindemocmcd-a.akamaihd.net/content/MI201109210084_1/m3u8s-fmp4-rel/main.m3u8',
  });
}

function log(data) {
  if (!data || data.length < 1) {
    return;
  }

  const sorted = data.sort((a, b) => a.timestamp > b.timestamp);

  $('#logContent').html('');

  sorted.forEach(line => {
    $('<p class="log-message cmcd-log"></p>')
    .append(line.cmcdLog)
    .prependTo('#logContent');

    $('<p class="log-message cdn-log"></p>')
    .append(line.timestamp.toISOString() + ': ')
    .append(line.cdnLog)
    .prependTo('#logContent');
  })
}

function beautifyCmcdHeaderData(data) {
  const cmcdFields = data.replace('CMCD-HEADER:', '').split(',');

  const beautified = cmcdFields.map(cmcd => {
    if (cmcd === CMCD_KEYS.Startup) {
      return 'Startup Mode';
    }
    if (cmcd.startsWith(`${CMCD_KEYS.ObjectType}=`)) {
      const value = cmcd.split('=')[1];
      const type = 
        value === 'v' ? 'Video' : 
        value === 'a' ? 'Audio' : 
        value === 'm' ? 'Manifest' : value;
      return `Object Type: ${type}`;
    }
    if (cmcd === CMCD_KEYS.BufferStarvation) {
      return 'BUFFER EMPTY!';
    }
    if (cmcd.startsWith(`${CMCD_KEYS.BufferLength}=`)) {
      const value = cmcd.split('=')[1];
      return `Buffer Length: ${(Number.parseFloat(value)/1000).toFixed(2)}s`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.EncodedBitrate}=`)) {
      const value = cmcd.split('=')[1];
      return `Encoded Bitrate: ${value}kbps`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.ContentId}=`)) {
      const value = cmcd.split('=')[1];
      return `Content ID: ${value.replace(/%22/g, '')}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.ObjectDuration}=`)) {
      const value = cmcd.split('=')[1];
      return `Object Duration: ${(Number.parseFloat(value)/1000).toFixed(2)}s`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.Deadline}=`)) {
      const value = cmcd.split('=')[1];
      return `Deadline: ${Number.parseFloat(value)/1000}s`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.MeasuredThroughput}=`)) {
      const value = cmcd.split('=')[1];
      return `Measured Throughput: ${value}kbps`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.NextObjectRequest}=`)) {
      const value = cmcd.split('=')[1];
      return `Next Object Request: ${value}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.NextRangeRequest}=`)) {
      const value = cmcd.split('=')[1];
      return `Next Range Request: ${value}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.PlaybackRate}=`)) {
      const value = cmcd.split('=')[1];
      return `Playback Rate: ${value}x`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.RequestedMaximumThroughput}=`)) {
      const value = cmcd.split('=')[1];
      return `Requested Maximum Throughput: ${value}kbps`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.StreamingFormat}=`)) {
      const value = cmcd.split('=')[1];
      const format = 
        value === 'h' ? 'HLS' : 
        value === 'd' ? 'DASH' : 
        value === 's' ? 'Smooth' : 'o';
      return `Streaming Format: ${format}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.SessionId}=`)) {
      const value = cmcd.split('=')[1];
      return `Session ID: ${value.replace(/%22/g, '')}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.StreamType}=`)) {
      const value = cmcd.split('=')[1];
      const type = value === 'v' ? 'VoD' : 'Live';
      return `Stream Type: ${type}`;
    }
    if (cmcd.startsWith(`${CMCD_KEYS.TopBitrate}=`)) {
      const value = cmcd.split('=')[1];
      return `Top Bitrate: ${value}kbps`;
    }
    // Version is usually omitted for version 1

    return cmcd;
  });

  return beautified.filter(Boolean).join(', ');
}

function getCmcdAndCdnLogFromS3() {
  const newRequestTimestamp = new Date();

  // See https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
  fetch('https://bitmovin-cmcd-demo.s3.amazonaws.com\?list-type\=2\&prefix\=akamai/ak')
  .then(response => response.text())
  .then(response => (new X2JS()).xml2js(response))
  .then(response => parseS3ObjectListingAndFetchDataStreamLogFiles(response, newRequestTimestamp))
  .then(responses => parseDataStreamLogFiles(responses))
}

function parseS3ObjectListingAndFetchDataStreamLogFiles(response, newRequestTimestamp) {
  console.log(`Found ${response.ListBucketResult.KeyCount} of max ${response.ListBucketResult.MaxKeys} keys (isTruncated=${response.ListBucketResult.IsTruncated})`);

  const elements = response.ListBucketResult.Contents;
  const relevantEntries = elements.filter(element => {
    const timestamp = new Date(element.Key.split('-')[2] * 1000);
    if (timestamp >= lastSuccessfulRetrieval) {
      return true;
    }
  });

  lastSuccessfulRetrieval = newRequestTimestamp;

  if (relevantEntries.length > 0) {
    let fetchPromises = []
    relevantEntries.forEach(element => {
      fetchPromises.push(
        fetch('https://bitmovin-cmcd-demo.s3.amazonaws.com/' + element.Key)
        .then(response => response.arrayBuffer())
      );
    });

    return Promise.all(fetchPromises);
  }
}

function parseDataStreamLogFiles(responses) {
  if (!responses || responses.length < 1) {
    return;
  }

  const allLogs = responses
  .map(response => gunzipLogFile(response))
  .join('')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line)); 

  const matchingLogs = allLogs.filter(log => log.customField.includes(`sid=%22${cmcdSessionId}%22`));
  const noOrOtherSessionId = allLogs.filter(log => !log.customField.includes(`sid=%22${cmcdSessionId}%22`));

  console.log(`No session ID or not ${cmcdSessionId}, ignoring those:`);
  console.log(noOrOtherSessionId);

  matchingLogs.forEach(logLine => logsToDisplay.push(convertLogLineToLoggingDataStructure(logLine)));
  log(logsToDisplay);
}

function gunzipLogFile(content) {
  const decompressed = fflate.decompressSync(new Uint8Array(content));
  return String.fromCharCode.apply(null, decompressed);
}

function convertLogLineToLoggingDataStructure(logLine) {
  return {
    timestamp: new Date(Number.parseFloat(logLine.reqTimeSec) * 1000),
    cdnLog: logLine.statusCode + DELIMITER +
            logLine.reqMethod + DELIMITER +
            logLine.proto + DELIMITER +
            logLine.reqHost + '/' + logLine.reqPath + DELIMITER +
            (parseInt(logLine.cacheStatus) ? 'Cache HIT' : 'Cache MISS'),
    cmcdLog: beautifyCmcdHeaderData(logLine.customField),
  }
}

$(function() {
  setupPlayerWithCmcd();
  setInterval(getCmcdAndCdnLogFromS3, LOG_PULL_INTERVALL_SECONDS);
});
