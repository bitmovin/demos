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

ace.config.setModuleUrl('ace/mode/javascript_worker', "https://pagecdn.io/lib/ace/1.4.14/worker-javascript.min.js");

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

function intialize() {

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
        insertUrlParam("pConfig", btoa(playerConfigEditor.getValue()));
        try {
            playerConfig = eval("(" + playerConfigEditor.getValue() + ")");
        } catch (e) {
            if (e instanceof SyntaxError) {
                document.getElementById("error-div-player").innerHTML = "Error while parsing :  " + e.message + " ";
            }
        }
    }
    if (sourceConfigEditor.getValue() && Object.keys(sourceConfigEditor.getValue()).length !== 0) {
        insertUrlParam("sConfig", btoa(sourceConfigEditor.getValue()));
        try {
            sourceConfig = eval("(" + sourceConfigEditor.getValue() + ")");
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
        player.unload().then(() => {
            player.destroy().then(() => {
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

function getPlayerSchema() {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "key": {
                "type": "string",
                "default": "YOUR KEY HERE"
            },
            "playback": {
                "$ref": "#/definitions/PlaybackConfig"
            },
            "style": {
                "$ref": "#/definitions/StyleConfig"
            },
            "events": {
                "$ref": "#/definitions/EventConfig"
            },
            "buffer": {
                "$ref": "#/definitions/BufferConfig"
            },
            "tweaks": {
                "$ref": "#/definitions/TweaksConfig"
            },
            "cast": {
                "$ref": "#/definitions/CastConfig"
            },
            "adaptation": {
                "$ref": "#/definitions/AdaptationPlatformConfig"
            },
            "advertising": {
                "$ref": "#/definitions/AdvertisingConfig"
            },
            "location": {
                "$ref": "#/definitions/LocationConfig"
            },
            "logs": {
                "$ref": "#/definitions/LogsConfig"
            },
            "licensing": {
                "$ref": "#/definitions/LicensingConfig"
            },
            "network": {
                "$ref": "#/definitions/NetworkConfig"
            },
            "ui": {
                "type": "boolean",

            },
            "live": {
                "$ref": "#/definitions/LiveConfig"
            },
            "analytics": {
                "$ref": "#/definitions/AnalyticsConfig"
            }
        },
        "required": [
            "key"
        ],
        "additionalProperties": false,
        "definitions": {
            "PlaybackConfig": {
                "type": "object",
                "format": "grid",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "autoplay": {
                        "type": "boolean"
                    },
                    "muted": {
                        "type": "boolean"
                    },
                    "volume": {
                        "type": "number"
                    },
                    "audioLanguage": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "subtitleLanguage": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "isForcedSubtitle": {
                        "type": "string"
                    },
                    "timeShift": {
                        "type": "boolean"
                    },
                    "seeking": {
                        "type": "boolean"
                    },
                    "playsInline": {
                        "type": "boolean"
                    },
                    "preferredTech": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "$ref": "#/definitions/PreferredTechnology"
                        }
                    },
                    "audioCodecPriority": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "videoCodecPriority": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "PreferredTechnology": {
                "type": "object",
                "format": "grid",
                "properties": {
                    "player": {
                        "$ref": "#/definitions/PlayerType"
                    },
                    "streaming": {
                        "$ref": "#/definitions/StreamType"
                    },
                    "exclude": {
                        "type": "boolean"
                    }
                },
                "additionalProperties": false,
                "required": [
                    "player",
                    "streaming"
                ]
            },
            "PlayerType": {
                "type": "string",
                "enum": [
                    "html5",
                    "native",
                    "unknown"
                ]
            },
            "StreamType": {
                "type": "string",
                "enum": [
                    "progressive",
                    "dash",
                    "hls",
                    "smooth",
                    "unknown"
                ]
            },
            "StyleConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "width": {
                        "type": "string"
                    },
                    "height": {
                        "type": "string"
                    },
                    "aspectratio": {
                        "type": "string"

                    }
                },
                "additionalProperties": false
            },
            "EventConfig": {
                "type": "object",
                "options": {
                    "collapsed": true,
                    "hidden": true,
                },
                "additionalProperties": {
                    "$ref": "#/definitions/PlayerEventCallback"
                }
            },
            "PlayerEventCallback": {
                "type": "object",
                "additionalProperties": false
            },
            "BufferConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "video": {
                        "$ref": "#/definitions/BufferMediaTypeConfig"
                    },
                    "audio": {
                        "$ref": "#/definitions/BufferMediaTypeConfig"
                    }
                },
                "additionalProperties": false
            },
            "BufferMediaTypeConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "forwardduration": {
                        "type": "number"
                    },
                    "backwardduration": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "TweaksConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "autoqualityswitching": {
                        "type": "boolean"
                    },
                    "max_buffer_level": {
                        "type": "number"
                    },
                    "startup_threshold": {
                        "type": "number"
                    },
                    "restart_threshold": {
                        "type": "number"
                    },
                    "query_parameters": {
                        "$ref": "#/definitions/QueryParameters"
                    },
                    "native_hls_parsing": {
                        "type": "boolean"
                    },
                    "native_hls_download_error_handling": {
                        "type": "boolean"
                    },
                    "stop_download_on_pause": {
                        "type": "boolean"
                    },
                    "log_level": {
                        "$ref": "#/definitions/LogLevel"
                    },
                    "licenseServer": {
                        "type": "string"
                    },
                    "impressionServer": {
                        "type": "string"
                    },
                    "hls_audio_only_threshold_bitrate": {
                        "type": "number"
                    },
                    "adaptation_set_switching_without_supplemental_property": {
                        "type": "boolean"
                    },
                    "ignore_mp4_edts_box": {
                        "type": "boolean"
                    },
                    "disable_retry_for_response_status": {
                        "$ref": "#/definitions/ResponseStatusMap"
                    },
                    "live_segment_list_start_index_offset": {
                        "type": "number"
                    },
                    "prevent_video_element_preloading": {
                        "type": "boolean"
                    },
                    "serviceworker_scope": {
                        "type": "string"
                    },
                    "fairplay_ignore_duplicate_init_data_key_errors": {
                        "type": "boolean"
                    },
                    "no_quota_exceeded_adjustment": {
                        "type": "boolean"
                    },
                    "segment_encryption_transition_handling": {
                        "type": "boolean"
                    },
                    "enable_seek_for_live": {
                        "type": "boolean"
                    },
                    "resume_live_content_at_previous_position_after_ad_break": {
                        "type": "boolean"
                    },
                    "dword_base_media_decode_timestamps": {
                        "type": "boolean"
                    },
                    "force_base_media_decode_time_rewrite": {
                        "type": "boolean"
                    },
                    "preserve_gaps_for_base_media_decode_time_rewrite": {
                        "type": "boolean"
                    },
                    "force_software_decryption": {
                        "type": "boolean"
                    }
                }
            },
            "QueryParameters": {
                "type": "object",
                "options": {
                    "collapsed": true,
                    "hidden": true
                },
                "additionalProperties": {
                    "type": "string"
                }
            },
            "LogLevel": {
                "type": "string",
                "enum": [
                    "debug",
                    "log",
                    "warn",
                    "error",
                    "off"
                ]
            },
            "ResponseStatusMap": {
                "type": "object",
                "options": {
                    "hidden": true
                },
                "additionalProperties": {
                    "type": "array",
                    "items": {
                        "type": "number"
                    }
                }
            },
            "CastConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "enable": {
                        "type": "boolean"
                    },
                    "application_id": {
                        "type": "string"
                    },
                    "message_namespace": {
                        "type": "string"
                    },
                    "receiverStylesheetUrl": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            },
            "AdaptationPlatformConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "limitToPlayerSize": {
                        "type": "boolean"
                    },
                    "startupBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "maxStartupBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "disableDownloadCancelling": {
                        "type": "boolean"
                    },
                    "preload": {
                        "type": "boolean"
                    },
                    "exclude": {
                        "type": "boolean"
                    },
                    "bitrates": {
                        "$ref": "#/definitions/BitrateLimitationConfig"
                    },
                    "resolution": {
                        "$ref": "#/definitions/VideoSizeLimitationConfig"
                    },
                    "onVideoAdaptation": {
                        "type": "string"
                    },
                    "onAudioAdaptation": {
                        "type": "string"
                    },
                    "rttEstimationMethod": {
                        "$ref": "#/definitions/RttEstimationMethod"
                    },
                    "desktop": {
                        "$ref": "#/definitions/AdaptationConfig"
                    },
                    "mobile": {
                        "$ref": "#/definitions/AdaptationConfig"
                    }
                },
                "additionalProperties": false
            },
            "Bitrate": {
                "type": "string"

            },
            "BitrateLimitationConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "minSelectableAudioBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "maxSelectableAudioBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "minSelectableVideoBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "maxSelectableVideoBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    }
                },
                "additionalProperties": false
            },
            "VideoSizeLimitationConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "minSelectableVideoHeight": {
                        "type": "number"
                    },
                    "maxSelectableVideoHeight": {
                        "type": "number"
                    },
                    "minSelectableVideoWidth": {
                        "type": "number"
                    },
                    "maxSelectableVideoWidth": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "RttEstimationMethod": {
                "type": "string",
                "enum": [
                    "weightedaverage",
                    "median"
                ]
            },
            "AdaptationConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "limitToPlayerSize": {
                        "type": "boolean"
                    },
                    "startupBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "maxStartupBitrate": {
                        "$ref": "#/definitions/Bitrate"
                    },
                    "disableDownloadCancelling": {
                        "type": "boolean"
                    },
                    "preload": {
                        "type": "boolean"
                    },
                    "exclude": {
                        "type": "boolean"
                    },
                    "bitrates": {
                        "$ref": "#/definitions/BitrateLimitationConfig"
                    },
                    "resolution": {
                        "$ref": "#/definitions/VideoSizeLimitationConfig"
                    },
                    "onVideoAdaptation": {
                        "type": "string"
                    },
                    "onAudioAdaptation": {
                        "type": "string"
                    },
                    "rttEstimationMethod": {
                        "$ref": "#/definitions/RttEstimationMethod"
                    }
                },
                "additionalProperties": false
            },
            "AdvertisingConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "adBreaks": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "$ref": "#/definitions/AdConfig"
                        }
                    },
                    "videoLoadTimeout": {
                        "type": "number"
                    },
                    "strategy": {
                        "$ref": "#/definitions/RestrictStrategy"
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "adContainer": {
                        "type": "string"
                    },
                    "companionAdContainers": {
                        "type": "string"
                    },
                    "placeholders": {
                        "$ref": "#/definitions/AdTagPlaceholders"
                    }
                },
                "additionalProperties": false
            },
            "AdConfig": {
                "type": "object",
                "properties": {
                    "replaceContentDuration": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "RestrictStrategy": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "shouldPlayAdBreak": {
                        "type": "string"
                    },
                    "shouldPlaySkippedAdBreaks": {
                        "type": "string"
                    }
                },
                "required": [
                    "shouldPlayAdBreak",
                    "shouldPlaySkippedAdBreaks"
                ],
                "additionalProperties": false
            },
            "AdTagPlaceholders": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "playbackTime": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "height": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "width": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "domain": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "page": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "referrer": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "assetUrl": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "random": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    },
                    "timestamp": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "LocationConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "ui": {
                        "type": "string"
                    },
                    "ui_css": {
                        "type": "string"
                    },
                    "cast": {
                        "type": "string"
                    },
                    "google_ima": {
                        "type": "string"
                    },
                    "serviceworker": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            },
            "LogsConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "bitmovin": {
                        "type": "boolean"
                    },
                    "level": {
                        "$ref": "#/definitions/LogLevel"
                    },
                    "onLog": {
                        "$ref": "#/definitions/LogCallback"
                    }
                },
                "additionalProperties": false
            },
            "LogCallback": {
                "type": "object",
                "format": "javascript",
                "options": {
                    "infoText": "Javascript callback function",
                    "ace": {
                        "theme": "ace/theme/twilight",
                        "tabSize": 2,
                        "useSoftTabs": true,
                        "wrap": true
                    }
                },
                "properties": {
                    "textarea": {
                        "type": "string",
                        "title": "textarea"
                    }
                }
            },
            "LicensingConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "delay": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "NetworkConfig": {
                "type": "object",
                "options": {
                    "collapsed": true,
                },
                "properties": {
                    "preprocessHttpRequest": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "sendHttpRequest": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "retryHttpRequest": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "preprocessHttpResponse": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    }
                },
                "additionalProperties": false
            },
            "UIConfig": {},
            "LiveConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "synchronization": {
                        "type": "array",
                        "options": {
                            "collapsed": true
                        },
                        "items": {
                            "$ref": "#/definitions/SynchronizationConfigEntry"
                        }
                    },
                    "lowLatency": {
                        "$ref": "#/definitions/LowLatencyConfig"
                    }
                },
                "additionalProperties": false
            },
            "SynchronizationConfigEntry": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "method": {
                        "$ref": "#/definitions/LiveSynchronizationMethod"
                    },
                    "serverUrl": {
                        "type": "string"
                    }
                },
                "required": [
                    "method",
                    "serverUrl"
                ],
                "additionalProperties": false
            },
            "LiveSynchronizationMethod": {
                "type": "string",
                "enum": [
                    "httphead",
                    "httpxsdate",
                    "httpiso"
                ]
            },
            "LowLatencyConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "targetLatency": {
                        "type": "number"
                    },
                    "catchup": {
                        "$ref": "#/definitions/LowLatencySyncConfig"
                    },
                    "fallback": {
                        "$ref": "#/definitions/LowLatencySyncConfig"
                    }
                },
                "additionalProperties": false
            },
            "LowLatencySyncConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "playbackRateThreshold": {
                        "type": "number"
                    },
                    "seekThreshold": {
                        "type": "number"
                    },
                    "playbackRate": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "AnalyticsConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "key": {
                        "type": "string"
                    },
                    "playerKey": {
                        "type": "string"
                    },
                    "player": {
                        "type": "string"
                    },
                    "cdnProvider": {
                        "type": "string"
                    },
                    "videoId": {
                        "type": "string"
                    },
                    "title": {
                        "type": "string"
                    },
                    "userId": {
                        "type": "string"
                    },
                    "customData1": {},
                    "customData2": {},
                    "customData3": {},
                    "customData4": {},
                    "customData5": {},
                    "customData6": {},
                    "customData7": {},
                    "experimentName": {
                        "type": "string"
                    },
                    "config": {
                        "$ref": "#/definitions/CollectorConfig"
                    }
                },
                "additionalProperties": false
            },
            "AnalyticsDebugConfig": {
                "type": "object",
                "properties": {
                    "fields": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "CollectorConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "backendUrl": {
                        "type": "string"
                    },
                    "enabled": {
                        "type": "boolean"
                    },
                    "cookiesEnabled": {
                        "type": "boolean"
                    },
                    "origin": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            }
        }
    };

}

function getSourceSchema() {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "dash": {
                "type": "string"
            },
            "hls": {
                "type": "string"
            },
            "progressive": {
                "type": "string"
            },
            "smooth": {
                "type": "string"
            },
            "poster": {
                "type": "string"
            },
            "drm": {
                "$ref": "#/definitions/DRMConfig"
            },
            "options": {
                "$ref": "#/definitions/SourceConfigOptions"
            },
            "subtitleTracks": {
                "type": "array",
                "options": {
                    "collapsed": true
                },
                "items": {
                    "$ref": "#/definitions/SubtitleTrack"
                }
            },
            "thumbnailTrack": {
                "$ref": "#/definitions/ThumbnailTrack"
            },
            "vr": {
                "$ref": "#/definitions/VRConfig"
            },
            "title": {
                "type": "string"
            },
            "description": {
                "type": "string"
            },
            "labeling": {
                "$ref": "#/definitions/SourceLabelingStreamTypeConfig"
            },
            "analytics": {
                "$ref": "#/definitions/AnalyticsConfig"
            },
            "metadata": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                }
            }
        },
        "additionalProperties": false,
        "definitions": {
            "ProgressiveSourceConfig": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string"
                    },
                    "type": {
                        "type": "string"
                    },
                    "bitrate": {
                        "type": "number"
                    },
                    "preferred": {
                        "type": "boolean"
                    },
                    "label": {
                        "type": "string"
                    }
                },
                "required": [
                    "url"
                ],
                "additionalProperties": false
            },
            "DRMConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "widevine": {
                        "$ref": "#/definitions/WidevineModularDRMConfig"
                    },
                    "playready": {
                        "$ref": "#/definitions/PlayReadyDRMConfig"
                    },
                    "fairplay": {
                        "$ref": "#/definitions/AppleFairplayDRMConfig"
                    },
                    "clearkey": {
                        "options": {
                            "collapsed": true
                        },
                        "anyOf": [
                            {
                                "$ref": "#/definitions/ClearKeyDRMConfig"
                            },
                            {
                                "$ref": "#/definitions/ClearKeyDRMServerConfig"
                            }
                        ]
                    },
                    "immediateLicenseRequest": {
                        "type": "boolean"
                    },
                    "preferredKeySystems": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "WidevineModularDRMConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "LA_URL": {
                        "type": "string"
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "maxLicenseRequestRetries": {
                        "type": "number"
                    },
                    "licenseRequestRetryDelay": {
                        "type": "number"
                    },
                    "headers": {
                        "$ref": "#/definitions/HttpHeaders"
                    },
                    "prepareLicense": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "prepareMessage": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "mediaKeySystemConfig": {
                        "type": "object",
                        "properties": {
                            "audioCapabilities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "contentType": {
                                            "type": "string"
                                        },
                                        "robustness": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "distinctiveIdentifier": {
                                "type": "string",
                                "enum": [
                                    "not-allowed",
                                    "optional",
                                    "required"
                                ]
                            },
                            "initDataTypes": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "label": {
                                "type": "string"
                            },
                            "persistentState": {
                                "type": "string",
                                "enum": [
                                    "not-allowed",
                                    "optional",
                                    "required"
                                ]
                            },
                            "sessionTypes": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "videoCapabilities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "contentType": {
                                            "type": "string"
                                        },
                                        "robustness": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        },
                        "additionalProperties": false
                    },
                    "videoRobustness": {
                        "type": "string"
                    },
                    "audioRobustness": {
                        "type": "string"
                    },
                    "serverCertificate": {
                        "type": "object",
                        "properties": {
                            "byteLength": {
                                "type": "number"
                            }
                        },
                        "required": [
                            "byteLength"
                        ],
                        "additionalProperties": false
                    }
                },
                "additionalProperties": false
            },
            "HttpHeaders": {
                "type": "object",
                "additionalProperties": {
                    "type": "string"
                }
            },
            "PlayReadyDRMConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "LA_URL": {
                        "type": "string"
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "maxLicenseRequestRetries": {
                        "type": "number"
                    },
                    "licenseRequestRetryDelay": {
                        "type": "number"
                    },
                    "headers": {
                        "$ref": "#/definitions/HttpHeaders"
                    },
                    "mediaKeySystemConfig": {
                        "type": "object",
                        "properties": {
                            "audioCapabilities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "contentType": {
                                            "type": "string"
                                        },
                                        "robustness": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "distinctiveIdentifier": {
                                "type": "string",
                                "enum": [
                                    "not-allowed",
                                    "optional",
                                    "required"
                                ]
                            },
                            "initDataTypes": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "label": {
                                "type": "string"
                            },
                            "persistentState": {
                                "type": "string",
                                "enum": [
                                    "not-allowed",
                                    "optional",
                                    "required"
                                ]
                            },
                            "sessionTypes": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "videoCapabilities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "contentType": {
                                            "type": "string"
                                        },
                                        "robustness": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        },
                        "additionalProperties": false
                    },
                    "customData": {
                        "type": "string"
                    },
                    "forceSSL": {
                        "type": "boolean"
                    },
                    "utf8message": {
                        "type": "boolean"
                    },
                    "plaintextChallenge": {
                        "type": "boolean"
                    }
                },
                "additionalProperties": false
            },
            "AppleFairplayDRMConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "LA_URL": {
                        "type": "string"
                    },
                    "certificateURL": {
                        "type": "string"
                    },
                    "headers": {
                        "$ref": "#/definitions/HttpHeaders"
                    },
                    "certificateHeaders": {
                        "$ref": "#/definitions/HttpHeaders"
                    },
                    "prepareMessage": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "prepareContentId": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "prepareCertificate": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "prepareLicense": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "prepareLicenseAsync": {
                        "type": "string",
                        "format": "javascript",
                        "options": {
                            "infoText": "Javascript callback function",
                            "ace": {
                                "theme": "ace/theme/twilight",
                                "tabSize": 2,
                                "useSoftTabs": true,
                                "wrap": true
                            }
                        }
                    },
                    "useUint16InitData": {
                        "type": "boolean"
                    },
                    "licenseResponseType": {
                        "$ref": "#/definitions/HttpResponseType"
                    },
                    "getLicenseServerUrl": {
                        "type": "string"
                    },
                    "maxLicenseRequestRetries": {
                        "type": "number"
                    },
                    "maxCertificateRequestRetries": {
                        "type": "number"
                    },
                    "serverCertificate": {
                        "type": "object",
                        "properties": {
                            "byteLength": {
                                "type": "number"
                            }
                        },
                        "required": [
                            "byteLength"
                        ],
                        "additionalProperties": false
                    }
                },
                "required": [
                    "certificateURL"
                ],
                "additionalProperties": false
            },
            "HttpResponseType": {
                "type": "string",
                "enum": [
                    "arraybuffer",
                    "blob",
                    "document",
                    "json",
                    "text"
                ]
            },
            "ClearKeyDRMConfig": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/ClearKeyDRMConfigEntry"
                }
            },
            "ClearKeyDRMConfigEntry": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "kid": {
                        "type": "string"
                    },
                    "key": {
                        "type": "string"
                    }
                },
                "required": [
                    "key"
                ],
                "additionalProperties": false
            },
            "ClearKeyDRMServerConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "LA_URL": {
                        "type": "string"
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "maxLicenseRequestRetries": {
                        "type": "number"
                    },
                    "licenseRequestRetryDelay": {
                        "type": "number"
                    },
                    "headers": {
                        "$ref": "#/definitions/HttpHeaders"
                    }
                },
                "required": [
                    "LA_URL"
                ],
                "additionalProperties": false
            },
            "SourceConfigOptions": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "manifestWithCredentials": {
                        "type": "boolean"
                    },
                    "withCredentials": {
                        "type": "boolean"
                    },
                    "hlsManifestWithCredentials": {
                        "type": "boolean"
                    },
                    "hlsWithCredentials": {
                        "type": "boolean"
                    },
                    "dashManifestWithCredentials": {
                        "type": "boolean"
                    },
                    "dashWithCredentials": {
                        "type": "boolean"
                    },
                    "persistentPoster": {
                        "type": "boolean"
                    },
                    "startTime": {
                        "type": "number"
                    },
                    "startOffset": {
                        "type": "number"
                    },
                    "startOffsetTimelineReference": {
                        "$ref": "#/definitions/TimelineReferencePoint"
                    },
                    "audioCodecPriority": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "videoCodecPriority": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "headers": {
                        "$ref": "#/definitions/HttpHeaders"
                    }
                },
                "additionalProperties": false
            },
            "TimelineReferencePoint": {
                "type": "string",
                "enum": [
                    "start",
                    "end"
                ]
            },
            "SubtitleTrack": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "label": {
                        "type": "string"
                    },
                    "role": {
                        "type": "array",
                        "items": {
                            "$ref": "#/definitions/MediaTrackRole"
                        }
                    },
                    "lang": {
                        "type": "string"
                    },
                    "kind": {
                        "type": "string"
                    },
                    "isFragmented": {
                        "type": "boolean"
                    },
                    "url": {
                        "type": "string"
                    },
                    "enabled": {
                        "type": "boolean"
                    },
                    "forced": {
                        "type": "boolean"
                    }
                },
                "additionalProperties": false,
                "required": [
                    "id",
                    "kind",
                    "label",
                    "lang"
                ]
            },
            "MediaTrackRole": {
                "type": "object",
                "properties": {
                    "schemeIdUri": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    },
                    "id": {
                        "type": "string"
                    }
                },
                "required": [
                    "schemeIdUri"
                ],
                "additionalProperties": {
                    "anyOf": [
                        {
                            "type": "string"
                        },
                        {
                            "not": {}
                        }
                    ]
                }
            },
            "ThumbnailTrack": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "url": {
                        "type": "string"
                    }
                },
                "required": [
                    "url"
                ],
                "additionalProperties": false
            },
            "VRConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "contentType": {
                        "$ref": "#/definitions/VRContentType"
                    },
                    "stereo": {
                        "type": "boolean"
                    },
                    "startPosition": {
                        "type": "number"
                    },
                    "contentFieldOfView": {
                        "type": "number"
                    },
                    "verticalFieldOfView": {
                        "type": "number"
                    },
                    "horizontalFieldOfView": {
                        "type": "number"
                    },
                    "viewingWindow": {
                        "$ref": "#/definitions/VRViewingWindowConfig"
                    },
                    "restrictedInlinePlayback": {
                        "type": "boolean"
                    },
                    "enableFrameRateMeasurements": {
                        "type": "boolean"
                    },
                    "cardboard": {
                        "type": "string"
                    },
                    "viewingDirectionChangeThreshold": {
                        "type": "number"
                    },
                    "viewingDirectionChangeEventInterval": {
                        "type": "number"
                    },
                    "keyboardControl": {
                        "$ref": "#/definitions/VRKeyboardControlConfig"
                    },
                    "mouseControl": {
                        "$ref": "#/definitions/VRControlConfig"
                    },
                    "apiControl": {
                        "$ref": "#/definitions/VRControlConfig"
                    }
                },
                "required": [
                    "contentType"
                ],
                "additionalProperties": false
            },
            "VRContentType": {
                "type": "string",
                "enum": [
                    "single",
                    "tab",
                    "sbs"
                ]
            },
            "VRViewingWindowConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "minYaw": {
                        "type": "number"
                    },
                    "maxYaw": {
                        "type": "number"
                    },
                    "minPitch": {
                        "type": "number"
                    },
                    "maxPitch": {
                        "type": "number"
                    }
                },
                "required": [
                    "minYaw",
                    "maxYaw",
                    "minPitch",
                    "maxPitch"
                ],
                "additionalProperties": false
            },
            "VRKeyboardControlConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "transitionTimingType": {
                        "$ref": "#/definitions/TransitionTimingType"
                    },
                    "transitionTime": {
                        "type": "number"
                    },
                    "maxDisplacementSpeed": {
                        "type": "number"
                    },
                    "keyMap": {
                        "$ref": "#/definitions/KeyMap"
                    }
                },
                "additionalProperties": false
            },
            "TransitionTimingType": {
                "type": "string",
                "enum": [
                    "none",
                    "ease-in",
                    "ease-out",
                    "ease-in-out"
                ]
            },
            "KeyMap": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "up": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "down": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "left": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "right": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "rotateClockwise": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "rotateCounterclockwise": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "VRControlConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "transitionTimingType": {
                        "$ref": "#/definitions/TransitionTimingType"
                    },
                    "transitionTime": {
                        "type": "number"
                    },
                    "maxDisplacementSpeed": {
                        "type": "number"
                    }
                },
                "additionalProperties": false
            },
            "SourceLabelingStreamTypeConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "dash": {
                        "$ref": "#/definitions/SourceLabelingConfig"
                    },
                    "hls": {
                        "$ref": "#/definitions/SourceLabelingConfig"
                    }
                },
                "additionalProperties": false
            },
            "SourceLabelingConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "tracks": {
                        "type": "string"
                    },
                    "qualities": {
                        "type": "string"
                    },
                    "subtitles": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            },
            "AnalyticsConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "debug": {
                        "anyOf": [
                            {
                                "type": "boolean"
                            },
                            {
                                "$ref": "#/definitions/AnalyticsDebugConfig"
                            }
                        ]
                    },
                    "key": {
                        "type": "string"
                    },
                    "playerKey": {
                        "type": "string"
                    },
                    "player": {
                        "type": "string"
                    },
                    "cdnProvider": {
                        "type": "string"
                    },
                    "videoId": {
                        "type": "string"
                    },
                    "title": {
                        "type": "string"
                    },
                    "userId": {
                        "type": "string"
                    },
                    "customData1": {},
                    "customData2": {},
                    "customData3": {},
                    "customData4": {},
                    "customData5": {},
                    "customData6": {},
                    "customData7": {},
                    "experimentName": {
                        "type": "string"
                    },
                    "config": {
                        "$ref": "#/definitions/CollectorConfig"
                    }
                },
                "additionalProperties": false
            },
            "AnalyticsDebugConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "fields": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "CollectorConfig": {
                "type": "object",
                "options": {
                    "collapsed": true
                },
                "properties": {
                    "backendUrl": {
                        "type": "string"
                    },
                    "enabled": {
                        "type": "boolean"
                    },
                    "cookiesEnabled": {
                        "type": "boolean"
                    },
                    "origin": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            }
        }
    };
}

loadEditors();
intialize();
