const liveStartBtn = document.getElementById("live-encoding-start");
const liveStopBtn = document.getElementById("live-encoding-stop");
const liveToVod30Btn = document.getElementById("last-30-sec-btn");
const liveToVod60Btn = document.getElementById("last-60-sec-btn");
const liveLoadBtn = document.getElementById("live-playback");
const liveToVodLoadBtn = document.getElementById("live-to-vod-playback");
const encodingIdDiv = document.getElementById("encodingId");
const encodingStatusDiv = document.getElementById("encodingStatus");
const loadingDiv = document.getElementById("loading");

const API_GATEWAY_URL = "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test";

let player;
let vodPlayer;
let hlsPlaybackUrl = null;
let liveToVodHlsUrl = null;
let BITMOVIN_PLAYER_LICENSE_KEY = ''
let BITMOVIN_ANALYTICS_LICENSE_KEY = ''
let liveEdgeSegmentNum = 0

async function startEncoding() {
    encodingIdDiv.classList.remove("hidden");
    loadingDiv.classList.remove("hidden");
    encodingIdDiv.textContent = `Setting up the Live Encoder. Please wait...`;

    const response = await fetch(`${API_GATEWAY_URL}/start-live-encoding`, { method: "POST" });

    encodingStatusDiv.classList.remove("hidden");

    const data = await response.json();

    if (hlsPlaybackUrl == null && data.url && data.url.hls) {
        hlsPlaybackUrl = data.url.hls;
        console.log(hlsPlaybackUrl);
    }
    console.log(data);

    return data.encoding_id;
}

async function stopEncoding() {
    const response = await fetch(`${API_GATEWAY_URL}/stop-live-encoding`, { method: "POST" });
    encodingStatusDiv.classList.add("hidden");
    encodingIdDiv.classList.add("hidden");
    loadingDiv.classList.add("hidden");

    const data = await response.json();
    console.log(data);

    return data.encoding_id;
}

async function clipLast30Sec() {
    const response = await fetch(`${API_GATEWAY_URL}/start-live-to-vod?startSegment=${liveEdgeSegmentNum - 14}&endSegment=${liveEdgeSegmentNum}`, { method: "POST" });
    const data = await response.json();
    console.log(data);

    if (liveToVodHlsUrl == null && data.url && data.url.hls) {
        liveToVodHlsUrl = data.url.hls;
        console.log(liveToVodHlsUrl);
    }
    loadLiveToVodPlayer();
    return data.encoding_id;
}

async function clipLast60Sec() {
    const response = await fetch(`${API_GATEWAY_URL}/start-live-to-vod?startSegment=${liveEdgeSegmentNum - 59}&endSegment=${liveEdgeSegmentNum}`, { method: "POST" });
    const data = await response.json();
    console.log(data);

    if (liveToVodHlsUrl == null && data.url && data.url.hls) {
        liveToVodHlsUrl = data.url.hls;
        console.log(liveToVodHlsUrl);
    }
    loadLiveToVodPlayer();
    return data.encoding_id;
}

function liveLoad() {
    loadPlayer();
}

function liveToVodLoad() {
    loadLiveToVodPlayer();
}

async function fetchLiveEncodingStatus() {
    const response = await fetch(`${API_GATEWAY_URL}/live-encoding-status`);

    const data = await response.json();
    console.log(data);

    return data.encoding_status;
}

async function checkStatusUntilRunning() {
    let status = await fetchLiveEncodingStatus();
    encodingStatusDiv.textContent = `Encoding Status: ${status}`;

    while (status !== "Status.RUNNING" && status !== "Status.CANCELED" && status !== "Status.FINISHED" ) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        status = await fetchLiveEncodingStatus();
        encodingStatusDiv.textContent = `Encoding Status: ${status}`;
    }

    encodingStatusDiv.textContent = `Encoding Status: ${status}. Please ingest your live stream in srt://44.194.223.128:2088`;
    loadingDiv.classList.add("hidden");
}

function loadPlayer() {
    var config = {
        key: BITMOVIN_PLAYER_LICENSE_KEY,
        analytics: {
            key: BITMOVIN_ANALYTICS_LICENSE_KEY,
            videoId: 'live-playback-demo',
        },
        playback: {
            muted: true,
            autoplay: true
        },
        logs: {
            level: 'debug'
        },
        network: {
            preprocessHttpResponse: function(type, response) {
                if (type === "media/video") {
                    const filename = response.url.substring(response.url.lastIndexOf('/') + 1);
                    if (filename.startsWith('segment_')) {
                        liveEdgeSegmentNum = parseInt(filename.substring(8, filename.lastIndexOf('.')), 10);
                    }
                }

                return Promise.resolve(response);
            }
        }
    };

    var playerContainer = document.getElementById('player-container');
    player = new bitmovin.player.Player(playerContainer, config);

    var source = {
        hls: hlsPlaybackUrl
    };
    player.load(source).then(function () {
        console.log('Successfully loaded source'); // Success!
    }, function () {
        console.log('Error while loading source'); // Error!
    });
}

function loadLiveToVodPlayer() {
    var config = {
        key: BITMOVIN_PLAYER_LICENSE_KEY,
        analytics: {
            key: BITMOVIN_ANALYTICS_LICENSE_KEY,
            videoId: 'live-to-vod-demo',
        },
        playback: {
            muted: true,
            autoplay: true
        },
        logs: {
            level: 'debug'
        }
    };

    var playerContainer = document.getElementById('player-container2');
    vodPlayer = new bitmovin.player.Player(playerContainer, config);

    var source = {
        hls: liveToVodHlsUrl
    };
    vodPlayer.load(source).then(function () {
        console.log('Successfully loaded source'); // Success!
    }, function () {
        console.log('Error while loading source'); // Error!
    });
}

$(() => {
    liveStartBtn.addEventListener("click", async () => {
        console.log("Live Encoding Start button clicked");
        const encodingId = await startEncoding();
        encodingIdDiv.textContent = `Encoding ID: ${encodingId}`;
        await checkStatusUntilRunning();
    });

    liveStopBtn.addEventListener("click", () => {
        console.log("Live Encoding Stop button clicked");
        stopEncoding();
    });

    liveToVod30Btn.addEventListener("click", () => {
        console.log("Live to VOD 30 seconds button clicked");
        clipLast30Sec();
    });

    liveToVod60Btn.addEventListener("click", () => {
        console.log("Live to VOD 60 seconds button clicked");
        clipLast60Sec();
    });

    liveLoadBtn.addEventListener("click", () => {
        console.log("Live Loads button clicked");
        liveLoad();
    });

    liveToVodLoadBtn.addEventListener("click", () => {
        console.log("Live to Vod Loads button clicked");
        liveToVodLoad();
    });
});
