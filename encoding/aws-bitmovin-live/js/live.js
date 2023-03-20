const liveStartBtn = document.getElementById("live-encoding-start");
const liveStopBtn = document.getElementById("live-encoding-stop");
const liveReloadBtn = document.getElementById("live-reload-btn");
const liveToVod30Btn = document.getElementById("last-30-sec-btn");
const liveToVod10Btn = document.getElementById("last-10-sec-btn");
const encodingIdDiv = document.getElementById("encodingId");
const encodingStatusDiv = document.getElementById("encodingStatus");
const loadingDiv = document.getElementById("loading");

const API_GATEWAY_URL = "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test";
const BITMOVIN_PLAYER_LICENSE_KEY = '';
const BITMOVIN_ANALYTICS_LICENSE_KEY = '';

let livePlayer;
let vodPlayer;
let hlsPlaybackUrl = null;
let liveToVodHlsUrl = null;
let liveEdgeSegmentNum = 0;
let targetDuration = 0;
let isLiveEncodingStarted = false;

async function startEncoding() {
    try {
        showEncodingIdDiv();
        showLoadingDiv();
        updateEncodingIdDiv("Setting up the Live Encoder. Please wait...");

        const response = await fetch(`${API_GATEWAY_URL}/start-live-encoding`, { method: "POST" });
        if (!response.ok) {
            console.log(response.statusText);
            throw new Error(`Failed to start live encoding: ${response.statusText}`);
        }

        showEncodingStatusDiv();

        const data = await response.json();

        if (hlsPlaybackUrl === null && data.url && data.url.hls) {
            hlsPlaybackUrl = data.url.hls;
            console.log(hlsPlaybackUrl);
        }
        console.log(data);

        return data.encoding_id;
    } catch (error) {
        stopEncoding();
        console.error(error);
        hideLoadingDiv();
        updateEncodingIdDiv("Error: Failed to start live encoding. Please check the console log for more details.");
    }
}

async function stopEncoding() {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/stop-live-encoding`, { method: "POST" });
        if (!response.ok) {
            throw new Error(`Failed to stop live encoding: ${response.statusText}`);
        }

        hideEncodingStatusDiv();
        hideEncodingIdDiv();
        hideLoadingDiv();
        isLiveEncodingStarted = false;
        toggleButtonState();

        const data = await response.json();
        console.log(data);

        return data.encoding_id;
    } catch (error) {
        console.error(error);
    }
}

async function clipLastNSeconds(n) {
    try {
        const segmentDiff = Math.floor(n / targetDuration);
        const response = await fetch(`${API_GATEWAY_URL}/start-live-to-vod?startSegment=${liveEdgeSegmentNum - segmentDiff}&endSegment=${liveEdgeSegmentNum}`, { method: "POST" });
        if (!response.ok) {
            throw new Error(`Failed to clip last ${n} seconds: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.url && data.url.hls) {
            liveToVodHlsUrl = data.url.hls;
            console.log(liveToVodHlsUrl);
        }
        loadLiveToVodPlayer();
        return data.encoding_id;
    } catch (error) {
        console.error(error);
    }
}

async function fetchLiveEncodingStatus() {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/live-encoding-status`);
        if (!response.ok) {
            throw new Error(`Failed to fetch live encoding status: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        return data.encoding_status;
    } catch (error) {
        console.error(error);
    }
}

async function checkStatusUntilRunning() {
    try {
        let status = await fetchLiveEncodingStatus();
        updateEncodingStatusDiv(`Encoding Status: ${status}`);

        while (status !== "Status.RUNNING" && status !== "Status.CANCELED" && status !== "Status.FINISHED" ) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            status = await fetchLiveEncodingStatus();
            updateEncodingStatusDiv(`Encoding Status: ${status}`);
        }

        if (status === "Status.RUNNING") {
            isLiveEncodingStarted = true;
            toggleButtonState();
        }

        updateEncodingStatusDiv(`Encoding Status: ${status}. Please ingest your live stream in srt://44.194.223.128:2088`);
        hideLoadingDiv();
    } catch (error) {
        console.error(error);
        hideLoadingDiv();
        updateEncodingStatusDiv("Error: " + error.message);
    }
}

function reloadLive() {
    livePlayer.load({ hls: hlsPlaybackUrl }).then(function () {
        console.log('Successfully loaded source'); // Success!
        livePlayer.timeShift(0);
    }, function () {
        console.log('Error while loading source'); // Error!
    });
}

function loadLiveToVodPlayer() {
    vodPlayer.load({ hls: liveToVodHlsUrl }).then(function () {
        console.log('Successfully loaded source'); // Success!
    }, function () {
        console.log('Error while loading source'); // Error!
    });
}

function initializeLiveToVodPlayer() {
    var config = {
        key: BITMOVIN_PLAYER_LICENSE_KEY,
        analytics: {
            key: BITMOVIN_ANALYTICS_LICENSE_KEY,
            title: 'NAB Live to VOD demo',
            videoId: "live-to-vod-demo",
            userId: 'nab-user-1',
        },
        playback: {
            muted: true,
            autoplay: true,
            preferredTech: [{
                player: 'html5',
                streaming: 'hls'
            }]
        },
        logs: {
            level: 'debug'
        }
    };

    var playerContainer = document.getElementById('player-container2');
    vodPlayer = new bitmovin.player.Player(playerContainer, config);
}

function initializeLivePlayer() {
    var config = {
        key: BITMOVIN_PLAYER_LICENSE_KEY,
        analytics: {
            key: BITMOVIN_ANALYTICS_LICENSE_KEY,
            title: 'NAB Live Encoding demo',
            videoId: "live-playback-demo",
            userId: 'nab-user-1',
        },
        playback: {
            muted: true,
            autoplay: true,
            preferredTech: [{
                player: 'html5',
                streaming: 'hls'
            }]
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
                if (type === "manifest/hls/variant") {
                    targetDuration = extractTargetDuration(response.body);
                }
                return Promise.resolve(response);
            }
        }
    };

    var playerContainer = document.getElementById('player-container');
    livePlayer = new bitmovin.player.Player(playerContainer, config);
}

function extractTargetDuration(body) {
    const targetDurationRegex = /#EXT-X-TARGETDURATION:(\d+)/;
    const match = body.match(targetDurationRegex);

    if (match && match[1]) {
        return parseInt(match[1], 10);
    } else {
        throw new Error("Target duration not found in the input string.");
    }
}

function showEncodingIdDiv() {
    encodingIdDiv.classList.remove("hidden");
}

function hideEncodingIdDiv() {
    encodingIdDiv.classList.add("hidden");
}

function updateEncodingIdDiv(text) {
    encodingIdDiv.textContent = text;
}

function showEncodingStatusDiv() {
    encodingStatusDiv.classList.remove("hidden");
}

function hideEncodingStatusDiv() {
    encodingStatusDiv.classList.add("hidden");
}

function updateEncodingStatusDiv(text) {
    encodingStatusDiv.textContent = text;
}

function showLoadingDiv() {
    loadingDiv.classList.remove("hidden");
}

function hideLoadingDiv() {
    loadingDiv.classList.add("hidden");
}

function toggleButtonState() {
    liveReloadBtn.disabled = !isLiveEncodingStarted;
    liveToVod30Btn.disabled = !isLiveEncodingStarted;
    liveToVod10Btn.disabled = !isLiveEncodingStarted;
}

$(() => {
    toggleButtonState();

    liveStartBtn.addEventListener("click", async () => {
        console.log("Live Encoding Start button clicked");
        startEncoding().then(async (encodingId) => {
            if (encodingId) {
                updateEncodingIdDiv(`Encoding ID: ${encodingId}`);
                await checkStatusUntilRunning();
            }
        });
    });

    liveStopBtn.addEventListener("click", () => {
        console.log("Live Encoding Stop button clicked");
        stopEncoding();
    });

    liveToVod30Btn.addEventListener("click", () => {
        console.log("Live to VOD 30 seconds button clicked");
        clipLastNSeconds(30);
    });

    liveToVod10Btn.addEventListener("click", () => {
        console.log("Live to VOD 10 seconds button clicked");
        clipLastNSeconds(10);
    });

    liveReloadBtn.addEventListener("click", () => {
        console.log("Live reload button clicked");
        reloadLive();
    });

    initializeLivePlayer();
    initializeLiveToVodPlayer();
});
