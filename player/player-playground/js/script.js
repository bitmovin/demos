var playerSchema = {};
var sourceSchema = {};
var initialTimestamp, bufferChart, bitrateChart;
var playerConfigEditor, sourceConfigEditor, playerConfigReader, sourceConfigReader, playerSchemaGenerator,
    sourceSchemaGenerator;
var updateCount = 0;
var player = null;
var demoKey = "0427d010-2bea-4b63-b02f-21340f73c0fb";
var playerConfig = {
    key: demoKey
};
var tempKeyHolder = {
    "key": "YOUR KEY HERE"
}

var sourceConfig = {
    dash: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
    hls: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    progressive: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4",
    smooth: "https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest",
    poster: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg"
};

var sources = [
    {
        title: "DASH",
        url: {
            dash: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
            poster: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/poster.jpg",
        }
    },
    {
        title: "HLS",
        url: {
            hls: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
            poster: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/poster.jpg",
        }
    },
    {
        title: "Smooth",
        url: {
            smooth: "https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest",
            poster: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/poster.jpg",
        }

    },
    {
        title: "Progressive",
        url: {
            progressive: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4",
            poster: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/poster.jpg",
        }
    }
];

ace.config.setModuleUrl('ace/mode/javascript_worker', "https://cdn.bitmovin.com/content/player-playground/worker.js");

function loadEditors() {
    playerConfigEditor = ace.edit("editor1");
    playerConfigEditor.setTheme("ace/theme/twilight");
    playerConfigEditor.session.setMode("ace/mode/javascript");

    playerConfigEditor.setOptions({
        enableLiveAutocompletion: true
    });

    sourceConfigEditor = ace.edit("editor2");
    sourceConfigEditor.setTheme("ace/theme/twilight");
    sourceConfigEditor.session.setMode("ace/mode/javascript");

    JSONEditor.defaults.options.theme = "bootstrap4";
    JSONEditor.defaults.options.disable_edit_json = true;
    JSONEditor.defaults.options.disable_properties = true;
    JSONEditor.defaults.options.iconlib = "fontawesome5";

    playerSchemaGenerator = new JSONEditor(document.getElementById("form1"), {
        schema: getPlayerSchema(),
        form_name_root: "Player Configuration Generator"
    });

    playerSchemaGenerator.on("ready", function () {
        var watcherCallback = function (path) {
            var vals = "";
            var value = this.getEditor(path).getValue();
            if (path) {
                vals = path.split("Player Configuration Generator.");
            }

            if (vals && vals[1]) {
                if (playerSchemaGenerator.getEditor(path).ace_editor_instance) {
                    value = "$$" + value + "$$";
                    value = value.replace(/\n/g, '').replace(/\\"/g, '"');
                    setObjectProperty(playerSchema, vals[1], value)
                } else {
                    setObjectProperty(playerSchema, vals[1], value)
                }
            }

        }
        for (var key in playerSchemaGenerator.editors) {
            if (playerSchemaGenerator.editors.hasOwnProperty(key) && key !== "root" && !playerSchemaGenerator.editors[key].editors) {
                playerSchemaGenerator.watch(key, watcherCallback.bind(playerSchemaGenerator, key));
            }
        }
    });

    sourceSchemaGenerator = new JSONEditor(document.getElementById("form2"), {
        schema: getSourceSchema(),
        form_name_root: "Source Configuration Generator"
    });

    sourceSchemaGenerator.on("ready", function () {
        var watcherCallback = function (path) {
            var vals = "";
            var value = this.getEditor(path).getValue();
            if (path) {
                vals = path.split("Source Configuration Generator.");
            }

            if (vals && vals[1]) {
                if (sourceSchemaGenerator.getEditor(path).ace_editor_instance) {
                    value = "$$" + value + "$$";
                    value = value.replace(/\n/g, '').replace(/\\"/g, '"');
                    setObjectProperty(sourceSchema, vals[1], value)
                } else {
                    setObjectProperty(sourceSchema, vals[1], value)
                }
            }
        }

        for (var key in sourceSchemaGenerator.editors) {
            if (sourceSchemaGenerator.editors.hasOwnProperty(key) && key !== "root" && !sourceSchemaGenerator.editors[key].editors) {
                sourceSchemaGenerator.watch(key, watcherCallback.bind(sourceSchemaGenerator, key));
            }
        }
    });

    document.querySelector("#load-btn").addEventListener("click", setupPlayer);
    document.querySelector("#player-config-generate").addEventListener("click", generatePlayerConfig);
    document.querySelector("#source-config-generate").addEventListener("click", generateSourceConfig);
    document.querySelector("#source_defaults").addEventListener("change", populateValue);
    document.querySelector("#player-config-link").addEventListener("click", navigateToPlayerConfig);
    document.querySelector("#source-config-link").addEventListener("click", navigateToSourceConfig);
    document.querySelector("#player-config-copy").addEventListener("click", copyPlayerConfig);
    document.querySelector("#source-config-copy").addEventListener("click", copySourceConfig);

    playerConfigReader = ace.edit("editorPlayerConfig");
    playerConfigReader.setTheme("ace/theme/twilight");
    playerConfigReader.session.setMode("ace/mode/javascript");
    playerConfigReader.renderer.setShowGutter(false);
    playerConfigReader.setReadOnly(true);

    sourceConfigReader = ace.edit("editorSourceConfig");
    sourceConfigReader.setTheme("ace/theme/twilight");
    sourceConfigReader.session.setMode("ace/mode/javascript");
    sourceConfigReader.renderer.setShowGutter(false);
    sourceConfigReader.setReadOnly(true);

}

function setObjectProperty(object, path, value) {
    const parts = path.split(".");
    const limit = parts.length - 1;
    for (let i = 0; i < limit; ++i) {
        const key = parts[i];
        object = object[key] ?? (object[key] = {});
    }
    const key = parts[limit];
    object[key] = value;
}

function initialize() {

    loadDefaultSources();
    document.getElementById("error-div-player").innerHTML = "";
    document.getElementById("error-div-source").innerHTML = "";

    if (getUrlParameter("pConfig")) {
        playerConfigEditor.setValue(getUrlParameter("pConfig"), 1);
    } else {
        playerConfigEditor.setValue(JSON.stringify(tempKeyHolder, undefined, 2), 1);
    }
    if (getUrlParameter("sConfig")) {
        sourceConfigEditor.setValue(getUrlParameter("sConfig"), 1);
        setupPlayer();
    } else {
        loadDefaultPlayer();
    }
}

function loadDefaultSources() {
    var x = document.getElementById("source_defaults");
    for (var i = 0; i < sources.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = sources[i].title;
        x.add(option);
    }
}


function copyPlayerConfig() {
    var sel = playerConfigReader.selection.toJSON();
    playerConfigReader.selectAll();
    playerConfigReader.focus();
    document.execCommand("copy");
    playerConfigReader.selection.fromJSON(sel);
}

function copySourceConfig() {
    var sel = sourceConfigReader.selection.toJSON();
    sourceConfigReader.selectAll();
    sourceConfigReader.focus();
    document.execCommand("copy");
    sourceConfigReader.selection.fromJSON(sel);
}

function navigateToPlayerConfig(e) {
    e.preventDefault();
    document.getElementById("player-configuration").scrollIntoView(true);
}

function navigateToSourceConfig(e) {
    e.preventDefault();
    document.getElementById("source-configuration").scrollIntoView(true);
}

function populateValue(e) {
    if (e.target.value)
        sourceConfigEditor.setValue(JSON.stringify(sources[e.target.value].url, undefined, 2), 1);
}

function generatePlayerConfig() {
    if (playerSchema && Object.keys(playerSchema).length !== 0) {
        playerConfigReader.setValue(JSON.stringify(playerSchema, undefined, 2), 1);
        update(playerConfigReader);
    }
}

function update(ref) {
    ref.findAll('"$$', {
        regExp: false,
        caseSensitive: false,
        wholeWord: false
    });
    ref.replaceAll('');
    ref.findAll('$$"', {
        regExp: false,
        caseSensitive: false,
        wholeWord: false
    });
    ref.replaceAll('');
    ref.findAll('\\"', {
        regExp: false,
        caseSensitive: false,
        wholeWord: false
    });
    ref.replaceAll('"');
}

function generateSourceConfig() {

    if (sourceSchema && Object.keys(sourceSchema).length !== 0) {
        sourceConfigReader.setValue(JSON.stringify(sourceSchema, undefined, 2), 1);
        update(sourceConfigReader);
    }
}

function loadDefaultPlayer() {
    var playerContainer = document.getElementById("player-container");
    player = new bitmovin.player.Player(playerContainer, playerConfig);
    player.load(sourceConfig).then(function () {
        player.setVolume(0);
        playerOnloadSetups();
    }).catch(function (error) {
        console.error(error);
    });

}

function setupPlayer() {
    playerConfig = {};
    sourceConfig = {};
    document.getElementById("error-div-player").innerHTML = "";
    document.getElementById("error-div-source").innerHTML = "";

    if (playerConfigEditor.getValue() && Object.keys(playerConfigEditor.getValue()).length !== 0) {
        try {
            playerConfig = eval("(" + playerConfigEditor.getValue() + ")");
            insertUrlParam("pConfig", btoa(playerConfigEditor.getValue()));
        } catch (e) {
            if (e instanceof SyntaxError) {
                document.getElementById("error-div-player").innerHTML = "Error while parsing :  " + e.message + " ";
            }
        }
    }
    if (sourceConfigEditor.getValue() && Object.keys(sourceConfigEditor.getValue()).length !== 0) {
        try {
            sourceConfig = eval("(" + sourceConfigEditor.getValue() + ")");
            insertUrlParam("sConfig", btoa(sourceConfigEditor.getValue()));
        } catch (e) {
            if (e instanceof SyntaxError) {
                document.getElementById("error-div-source").innerHTML = "Error while parsing : " + e.message;
            }
        }
    }

    if (!playerConfig.key || playerConfig["key"].indexOf("-") === -1) {
        playerConfig.key = demoKey;
    }
    var playerContainer = document.getElementById("player-container");

    if (player) {
        player.unload().then(function () {
            player.destroy().then(function () {
                player = new bitmovin.player.Player(playerContainer, playerConfig);
                player.load(sourceConfig).then(function () {
                    playerOnloadSetups();
                }).catch(function (error) {
                    console.error(error);
                });
            });
        });
    } else {
        player = new bitmovin.player.Player(playerContainer, playerConfig);
        player.load(sourceConfig).then(function () {
            playerOnloadSetups();
        }).catch(function (error) {
            console.error(error);
        });
    }

}

function playerOnloadSetups() {
    clearChart();
    setupChart();
    setPlayerEvents();
}

function insertUrlParam(key, value) {
    if (window.history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + searchParams.toString();
        window.history.pushState({path: newurl}, "", newurl);
    }
}

function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");
        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : atob(decodeURIComponent(sParameterName[1]));
        }
    }
    return false;
}

function clearChart() {
    if (bufferChart)
        bufferChart.destroy();
    if (bitrateChart)
        bitrateChart.destroy();
}

function addNewData(videoBuffer, audioBuffer, bitrate) {
    var currentTimeDiff = (Date.now() - initialTimestamp) / 1000;

    addChartData(bufferChart, 0, currentTimeDiff, videoBuffer);
    addChartData(bufferChart, 1, currentTimeDiff, audioBuffer);
    addChartData(bitrateChart, 0, currentTimeDiff, bitrate / 1000000);
}

function updateCharts() {
    addNewData(player.getVideoBufferLength(), player.getAudioBufferLength(), player.getDownloadedVideoData().bitrate);
}

function addChartData(chart, seriesIndex, xAxis, yAxis) {
    chart.series[seriesIndex].addPoint([xAxis, yAxis], true, false);
}

function setupChart() {
    initialTimestamp = Date.now();
    bufferChart = Highcharts.chart(document.getElementById("buffer-chart"), {

        chart: {
            type: "spline",
            zoomType: "x"
        },
        credits: {
            enabled: false
        },
        title: {
            text: "Buffer Levels"
        },
        xAxis: {
            title: {
                text: "time",
                align: "low"
            },
            min: 0
        },
        yAxis: {
            title: {
                text: "sec",
                align: "high"
            },
            min: 0
        },
        legend: {
            align: "center",
            verticalAlign: "bottom"
        },
        series: [{
            name: "Video",
            data: [[0, 0]],
            marker: {
                enabled: true,
                fillColor: "#ffffff",
                lineWidth: 2,
                lineColor: null,
                symbol: "circle"
            },
            color: "#1FAAE2"
        }, {
            name: "Audio",
            data: [[0, 0]],
            marker: {
                enabled: true,
                fillColor: "#ffffff",
                lineWidth: 2,
                lineColor: null,
                symbol: "circle"
            },
            color: "#F49D1D"
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom"
                    }
                }
            }]
        }
    });

    bitrateChart = Highcharts.chart(document.getElementById("bitrate-chart"), {
        chart: {
            type: "spline",
            zoomType: "x"
        },
        credits: {
            enabled: false
        },
        title: {
            text: "Bitrate"
        },
        xAxis: {
            title: {
                text: "time",
                align: "low"
            },
            min: 0
        },
        yAxis: {
            title: {
                text: "Mbps",
                align: "high"
            },
            min: 0
        },
        legend: {
            align: "center",
            verticalAlign: "bottom"
        },
        series: [{
            name: "Video",
            data: [[0, 0]],
            marker: {
                enabled: true,
                fillColor: "#ffffff",
                lineWidth: 2,
                lineColor: null,
                symbol: "circle"
            },
            color: "#1FAAE2"
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom"
                    }
                }
            }]
        }
    });
}

function trimInput(input) {
    if ($.trim(input) !== "") {
        return input
    } else {
        return 0;
    }
}

function setPlayerEvents() {

    //remove existing listeners
    player.off(bitmovin.player.PlayerEvent.AudioPlaybackQualityChanged, updateCharts);
    player.off(bitmovin.player.PlayerEvent.VideoPlaybackQualityChanged, updateCharts);
    player.off(bitmovin.player.PlayerEvent.StallStarted, updateCharts);
    player.off(bitmovin.player.PlayerEvent.StallEnded, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Playing, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Paused, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Ready, updateCharts);
    player.off(bitmovin.player.PlayerEvent.SourceLoaded, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Error, updateCharts);
    player.off(bitmovin.player.PlayerEvent.AdError, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Seek, updateCharts);
    player.off(bitmovin.player.PlayerEvent.Seeked, updateCharts);
    player.off(bitmovin.player.PlayerEvent.TimeChanged, onTimechanged);

    //register listeners
    player.on(bitmovin.player.PlayerEvent.AudioPlaybackQualityChanged, updateCharts);
    player.on(bitmovin.player.PlayerEvent.VideoPlaybackQualityChanged, updateCharts);
    player.on(bitmovin.player.PlayerEvent.StallStarted, updateCharts);
    player.on(bitmovin.player.PlayerEvent.StallEnded, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Playing, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Paused, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Ready, updateCharts);
    player.on(bitmovin.player.PlayerEvent.SourceLoaded, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Error, updateCharts);
    player.on(bitmovin.player.PlayerEvent.AdError, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Seek, updateCharts);
    player.on(bitmovin.player.PlayerEvent.Seeked, updateCharts);
    player.on(bitmovin.player.PlayerEvent.TimeChanged, onTimechanged);
}

function onTimechanged() {
    updateCount++;
    if (updateCount % 4 == 1) {
        updateCharts();
    }
}

loadEditors();
initialize();
