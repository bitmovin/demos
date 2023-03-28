const elements = {
    liveStartBtn: document.getElementById("live-encoding-start"),
    liveStopBtn: document.getElementById("live-encoding-stop"),
    liveReloadBtn: document.getElementById("live-reload-btn"),
    liveToVod30Btn: document.getElementById("last-30-sec-btn"),
    liveToVod10Btn: document.getElementById("last-10-sec-btn"),
    encodingIdDiv: document.getElementById("encodingId"),
    encodingStatusDiv: document.getElementById("encodingStatus"),
    loadingDiv: document.getElementById("loading"),
    liveUrlDiv: document.getElementById("live-url"),
    liveToVodUrlDiv: document.getElementById("live-to-vod-url"),
    liveToVodLoadingDiv: document.getElementById("live-to-vod-loading")
};

const API_GATEWAY_URL = "https://6xbphss2bk.execute-api.us-east-1.amazonaws.com/Test";
const BITMOVIN_PLAYER_LICENSE_KEY = 'e14e2f19-bac0-4206-ae12-f9aff71f66e8';
const BITMOVIN_ANALYTICS_LICENSE_KEY = 'cd45515d-bfb9-47a0-8dae-4523b6082360';

let livePlayer, vodPlayer;
let hlsPlaybackUrl = null;
let liveToVodHlsUrl = null;
let liveEdgeSegmentNum = 0;
let targetDuration = 0;
let isLiveEncodingStarted = false;

async function startEncoding() {
    try {
        showElement(elements.encodingIdDiv);
        showElement(elements.loadingDiv);
        updateElementText(elements.encodingIdDiv, "Setting up the Live Encoder. Please wait...");

        const response = await fetch(`${API_GATEWAY_URL}/start-live-encoding`, { method: "POST" });
        if (!response.ok) {
            console.log(response.statusText);
            throw new Error(`Failed to start live encoding: ${response.statusText}`);
        }

        showElement(elements.encodingStatusDiv);

        const data = await response.json();
        if (hlsPlaybackUrl === null && data.url && data.url.hls) {
            if (data.url.hls.startsWith('http://')) {
                hlsPlaybackUrl = data.url.hls.replace('http://', 'https://');
            } else {
                hlsPlaybackUrl = data.url.hls;
            }
            console.log(hlsPlaybackUrl);
        }
        console.log(data);

        return data.encoding_id;
    } catch (error) {
        stopEncoding();
        console.error(error);
        hideElement(elements.loadingDiv);
        updateElementText(elements.encodingIdDiv, "Error: Failed to start live encoding. Please check the console log for more details.");
    }
}

async function stopEncoding() {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/stop-live-encoding`, { method: "POST" });
        if (!response.ok) {
            throw new Error(`Failed to stop live encoding: ${response.statusText}`);
        }

        hideElement(elements.encodingStatusDiv);
        hideElement(elements.encodingIdDiv);
        hideElement(elements.loadingDiv);
        hideElement(elements.liveUrlDiv);
        hideElement(elements.liveToVodUrlDiv);
        hideElement(elements.liveToVodLoadingDiv);
        isLiveEncodingStarted = false;
        toggleButtonState(elements.liveStartBtn, isLiveEncodingStarted)

        const data = await response.json();
        console.log(data);

        return data.encoding_id;
    } catch (error) {
        console.error(error);
    }
}

async function clipLastNSeconds(n) {
    try {
        hideElement(elements.liveToVodUrlDiv);
        showElement(elements.liveToVodLoadingDiv);

        const segmentDiff = Math.floor(n / targetDuration);
        const response = await fetch(`${API_GATEWAY_URL}/start-live-to-vod?startSegment=${liveEdgeSegmentNum - segmentDiff}&endSegment=${liveEdgeSegmentNum}`, { method: "POST" });
        if (!response.ok) {
            throw new Error(`Failed to clip last ${n} seconds: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.url && data.url.hls) {
            if (data.url.hls.startsWith('http://')) {
                liveToVodHlsUrl = data.url.hls.replace('http://', 'https://');
            } else {
                liveToVodHlsUrl = data.url.hls;
            }
            console.log(liveToVodHlsUrl);
        }
        loadLiveToVodPlayer();

        hideElement(elements.liveToVodLoadingDiv);
        return data.encoding_id;
    } catch (error) {
        hideElement(elements.liveToVodLoadingDiv);
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

        return data;
    } catch (error) {
        console.error(error);
    }
}

async function checkStatusUntilRunning() {
    try {
        showElement(elements.encodingIdDiv);
        showElement(elements.loadingDiv);

        let ret = await fetchLiveEncodingStatus();
        let status = ret.encoding_status;
        updateElementText(elements.encodingStatusDiv, `Encoding Status: ${status}`)

        while (status !== "Status.RUNNING" && status !== "Status.CANCELED" && status !== "Status.FINISHED" ) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            ret = await fetchLiveEncodingStatus();
            status = ret.encoding_status;
            updateElementText(elements.encodingStatusDiv, `Encoding Status: ${status}`)
        }

        if (status === "Status.RUNNING") {
            isLiveEncodingStarted = true;
            toggleButtonState(elements.liveStartBtn, isLiveEncodingStarted)
            // toggleButtonState();
        }

        updateElementText(elements.encodingStatusDiv, `Encoding Status: ${status}. Please ingest your live stream in srt://44.194.223.128:2088`);
        hideElement(elements.loadingDiv);
    } catch (error) {
        console.error(error);
        hideElement(elements.loadingDiv);
        updateElementText(elements.encodingStatusDiv, "Error: " + error.message)
    }
}

async function checkIfEncodingRunning() {
    try {
        let ret = await fetchLiveEncodingStatus();
        if (ret.encoding_status === "Status.RUNNING") {
            isLiveEncodingStarted = true;
            toggleButtonState(elements.liveStartBtn, isLiveEncodingStarted)
            showElement(elements.encodingIdDiv);
            showElement(elements.encodingStatusDiv);
            updateElementText(elements.encodingIdDiv, `Encoding ID: ${ret.encoding_id}`);
            updateElementText(elements.encodingStatusDiv, `Encoding Status: ${ret.encoding_status}. Please ingest your live stream in srt://44.194.223.128:2088`);
            if (ret.live_encoding_info && ret.live_encoding_info.hls) {
                if (ret.live_encoding_info.hls.startsWith('http://')) {
                    hlsPlaybackUrl = ret.live_encoding_info.hls.replace('http://', 'https://');
                } else {
                    hlsPlaybackUrl = ret.live_encoding_info.hls;
                }
                reloadLive();
            }
        } else if (ret.encoding_status === "Status.QUEUED") {
            isLiveEncodingStarted = true;
            toggleButtonState(elements.liveStartBtn, isLiveEncodingStarted)
            showElement(elements.encodingIdDiv);
            showElement(elements.encodingStatusDiv);
            updateElementText(elements.encodingIdDiv, `Encoding ID: ${ret.encoding_id}`);
            updateElementText(elements.encodingStatusDiv, `Encoding Status: ${ret.encoding_status}`);
            if (ret.live_encoding_info && ret.live_encoding_info.hls) {
                if (ret.live_encoding_info.hls.startsWith('http://')) {
                    hlsPlaybackUrl = ret.live_encoding_info.hls.replace('http://', 'https://');
                } else {
                    hlsPlaybackUrl = ret.live_encoding_info.hls;
                }
            }
            await checkStatusUntilRunning();
        }
    } catch (error) {
        console.error(error);
    }
}

function reloadLive() {
    hideElement(elements.liveUrlDiv);
    updateElementText(elements.liveReloadBtn, 'Loading')

    livePlayer.load({ hls: hlsPlaybackUrl }).then(function () {
        showElement(elements.liveUrlDiv);
        updateElementText(elements.liveUrlDiv, `<strong>Manifest URL</strong>:<br>${hlsPlaybackUrl}`)

        console.log('Successfully loaded source'); // Success!
        livePlayer.timeShift(0);

        updateElementText(elements.liveReloadBtn, 'Loaded')
    }, function () {
        console.log('Error while loading source'); // Error!
        updateElementText(elements.liveReloadBtn, 'Load')
    });
}

function loadLiveToVodPlayer() {
    hideElement(elements.liveToVodUrlDiv);

    vodPlayer.load({ hls: liveToVodHlsUrl }).then(function () {
        showElement(elements.liveToVodUrlDiv);
        updateElementText(elements.liveToVodUrlDiv, `<strong>Manifest URL</strong>:<br>${liveToVodHlsUrl}`);

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
            videoId: "live-to-vod-demo"
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
            videoId: "live-playback-demo"
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

function showElement(element) {
    element.classList.remove("hidden");
}

function hideElement(element) {
    element.classList.add("hidden");
}

function updateElementText(element, text) {
    element.innerHTML = text;
}

function toggleButtonState(element, flag) {
    element.disabled = flag;
}

$(() => {
    elements.liveStartBtn.addEventListener("click", async () => {
        console.log("Live Encoding Start button clicked");
        startEncoding().then(async (encodingId) => {
            if (encodingId) {
                updateElementText(elements.encodingIdDiv, `Encoding ID: ${encodingId}`)
                await checkStatusUntilRunning();
            }
        });
    });

    elements.liveStopBtn.addEventListener("click", () => {
        console.log("Live Encoding Stop button clicked");
        stopEncoding();
    });

    elements.liveToVod30Btn.addEventListener("click", () => {
        console.log("Live to VOD 30 seconds button clicked");
        clipLastNSeconds(30);
    });

    elements.liveToVod10Btn.addEventListener("click", () => {
        console.log("Live to VOD 10 seconds button clicked");
        clipLastNSeconds(10);
    });

    elements.liveReloadBtn.addEventListener("click", () => {
        console.log("Live reload button clicked");
        reloadLive();
    });

    initializeLivePlayer();
    initializeLiveToVodPlayer();
    checkIfEncodingRunning();
});
