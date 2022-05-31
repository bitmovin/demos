var getSourceSchema = function () {
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
window.getSourceSchema = getSourceSchema;
