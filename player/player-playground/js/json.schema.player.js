var getPlayerSchema = function () {
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
window.getPlayerSchema = getPlayerSchema;
