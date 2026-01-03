var aConfig;

function startLive(config) {
	config.roomId="1234";
    aConfig = config;

    console.log(config);
    var trio = {};
    var paris = null;
    var handler = null;
    var opaqueId = "videoroomtest-" + Paris.randomString(12);

    var myid = null;
    var mystream = null;
// We use this other ID just to map our subscriptions to us
    var mypvtid = null;
    var feeds = [];
//    var reservedVideoElem = config.isPublisher ? 0 : -1;


    // Initialize the library (all console debuggers enabled)
    Paris.init({debug: "all", callback: function () {
            session();
        }});

    function session() {
        // Make sure the browser supports WebRTC
        if (!Paris.isWebrtcSupported()) {
            toast.error("مرورگر شما از امکانات لایو پشتیبانی نمیکند لطفا از مرورگر بروز کروم استفاده کنید");
            console.error("No WebRTC support... ");
            return;
        }
        // Create session
        paris = new Paris({
            server: config.host,
            success: function () {
                // Attach to VideoRoom plugin
                attach();
            },
            error: function (error) {
               console.error(error);
                trio.destroyServer();
                config.lostConnectionCallback();
            },
            destroyed: function () {
                console.error("destroyed room --");
                trio.destroyServer();
                config.lostConnectionCallback();
            }
        }, etc)
    }

    function attach() {
        console.log("attach() Attach to VideoRoom plugin");
        paris.attach({
            plugin: etc + ".plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                handler = pluginHandle;
                console.log("attach() success Plugin attached! (" + handler.getPlugin() + ", id=" + handler.getId() + ")");
                console.log("attach() success  -- This is a publisher/manager");
                registerUsername();
            },
            error: function (error) {
                console.error("attach() error  -- Error attaching plugin...", error);
            },
            consentDialog: function (on) {
                console.log("attach() consentDialog Consent dialog should be " + (on ? "on" : "off") + " now");
            },
            iceState: function (state) {
                console.log("attach() iceState ICE state changed to " + state);
                if (state === 'disconnected') {
                    trio.destroyServer();
                    config.lostConnectionCallback();
                }
            },
            mediaState: function (medium, on) {
                console.log("attach() mediaState Paris " + (on ? "started" : "stopped") + " receiving our " + medium);
            },
            webrtcState: function (on) {
                console.log("attach() webrtcState Paris says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                if (!on) {
                    return;
                }
            },
            onmessage: function (msg, jsep) {
               console.log ("attach() onmessage ::: Got a message (publisher) :::", msg);
                var event = msg["videoroom"];
                console.log("attach() onmessage Event: " , event);
                if (event != undefined && event != null) {
                    if (event === "joined") {
                        // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                        myid = msg["id"];
                        mypvtid = msg["private_id"];
                        console.log("onmessage event === \"joined\" joined room " + msg["room"] + " with ID " + myid + " and private ID of " + mypvtid + " config.isPublisher : " + config.isPublisher);
                        trio.userRoomId = myid;
                        config.videoRoomCallback(myid);
//                                    if (config.isPublisher) {
                        //trio.publishOwnFeed(true);
//                                    } 
//                                    else {
//                                        trio.publishOwnFeed(false);
//                                    }
// console.log("before promise block 1");
//                                    new Promise(function () {
//                                         console.log("inside promise block 1");
//                                        setTimeout(function () {
//                                             console.log("inside promise block with timeout 1");
//                                            trio.publishOwnFeed(config.isPublisher);
//                                        }, 3000)
//                                    });
//                                                      console.log("after promise block 1");
                        trio.publishOwnFeed(config.isPublisher);
//                             
                        // Any new feed to attach to?
                        if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                            var list = msg["publishers"];
                            console.log("onmessage  event === \"joined\"  msg[\"publishers\"] !== null Got a list of available publishers/feeds:", list);
//                            console.log("before promise block 2");
//                              new Promise(function () {
//                                  console.log("inside promise block 2");
//                                        setTimeout(function () {
//                                  console.log("inside promise block with timeout 2");    
                            for (var f in list) {
                                var id = list[f]["id"];
                                var display = list[f]["display"];
                                var audio = list[f]["audio_codec"];
                                var video = list[f]["video_codec"];
                                console.log("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                newRemoteFeed(id, display, audio, video);
                            }
//                             }, 10000)
//                                    });
//                                    console.log("after promise block 2");
                        }
                    } else if (event === "destroyed") {
                        // The room has been destroyed
                      console.error("onmessage event === \"destroyed\" The room has been destroyed!");
                        toast.error("اتاق بسته شد");
                    } else if (event === "event") {
                        console.log("onmessage event === \"event\"");
                        // Any new feed to attach to?
                        if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                            var list = msg["publishers"];
                            console.log("onmessage event === \"event\" msg[\"publishers\"] !== null Got a list of available publishers/feeds:", list);
                            for (var f in list) {
                                var id = list[f]["id"];
                                var display = list[f]["display"];
                                var audio = list[f]["audio_codec"];
                                var video = list[f]["video_codec"];
                                console.log("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                newRemoteFeed(id, display, audio, video);
                            }
                        } else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
                            // One of the publishers has gone away?
                            var leaving = msg["leaving"];
                            console.log("onmassage event === \"event\" msg[\"leaving\"] !== null Publisher left ", leaving);
//                            console.log();
                            config.participantCounterCallback(leaving, false);
                            var remoteFeed = null;
                            for (var i = 1; i < config.maxCap; i++) {
                                if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid === leaving) {
                                    remoteFeed = feeds[i];
                                    break;
                                }
                            }
                            if (remoteFeed != null) {
                                console.log("onmassage  event === \"event\"  msg[\"leaving\"] !== null remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                //hide video element because participant is gone
                                config.videoElemCallback(false, true, remoteFeed);
                                feeds[remoteFeed.rfindex] = null;
                                remoteFeed.detach();
                            }
                        } else if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
                            // One of the publishers has unpublished?
                            var unpublished = msg["unpublished"];
                            console.log("onmassage  event === \"event\" msg[\"unpublished\"] !== null Publisher left" + unpublished, msg);
//                                        config.participantCounterCallback(unpublished, false);
                            if (unpublished === 'ok') {
                                // That's us
                                console.log("onmassage  event === \"event\" msg[\"unpublished\"] !== null handler.hangup()!!!");
                                handler.hangup();
                                return;
                            }
                            var remoteFeed = null;
                            for (var i = 1; i < config.maxCap; i++) {
                                if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == unpublished) {
                                    remoteFeed = feeds[i];
                                    break;
                                }
                            }
                            if (remoteFeed != null) {
                                console.log("onmassage  event === \"event\"  msg[\"unpublished\"] !== null remoteFeed != null Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                // hide video element because participant is gone
                                config.videoElemCallback(false, true, remoteFeed);
                                feeds[remoteFeed.rfindex] = null;
                                remoteFeed.detach();
                            }
                        } else if (msg["error"] !== undefined && msg["error"] !== null) {
                            console.error("onmassage  event === \"event\" msg[\"error\"] !== null MSG:" ,msg);
                            if (msg["error_code"] === 426) {
                                toast.error("اتاق معتبر نیست لطفا دوباره اقدام کنید");
                                getBackToProfile();
                            } else if (msg["error_code"] === 432) {
                                console.error("onmassage  event === \"event\"  msg[\"error\"] !== null MSG3:" + msg["error"]);
                                config.outOfCapacityRoomCallback();
                                trio.destroyServer();
                            } else if (msg["error_code"] === 433) {
                                toast.error("شما دسترسی لازم برای ورود به اتاق را ندارید");
                            } else {
                                console.error("onmassage  event === \"event\"  msg[\"error\"] !== null MSG1:" + msg["error"], msg);
                            }
                        }
                    }
                }
                if (jsep !== undefined && jsep !== null) {
                    console.log("attach() onmessage Handling SDP as well...", jsep);
                    handler.handleRemoteJsep({jsep: jsep});
                    // Check if any of the media we wanted to publish has
                    // been rejected (e.g., wrong or unsupported codec)
                    var audio = msg["audio_codec"];
                    if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                        // Audio has been rejected
                        toast.error("مرورگر شما نمیتواند با میکروفن ارتباط برقرار کند لطفا از مرورگر بروز کروم استفاده کنید");
                    }
                    var video = msg["video_codec"];
                    if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                        // Video has been rejected
                        // Hide the webcam video
                        toast.error("مرورگر شما نمیتواند با ویدیو ارتباط برقرار کند لطفا از مرورگر بروز کروم استفاده کنید");
                    }
                }
            },
            onlocalstream: function (stream) {
                console.log("onlocalstream ::: Got a local stream :::", stream);
                config.videoElemCallback(true, false);
                mystream = stream;
                var vIdx = config.isSupporter ? 0 : 1;
                console.log("attach() onlocalstream config.isSupporter ",config.isSupporter," vIdx :",vIdx ," config.videoElems[vIdx] : ",config.videoElems[vIdx]);
                Paris.attachMediaStream(config.videoElems[vIdx], stream);
                config.videoElems[vIdx].muted = "muted";

                if (handler.webrtcStuff.pc.iceConnectionState !== "completed" &&
                        handler.webrtcStuff.pc.iceConnectionState !== "connected") {
                }
                var videoTracks = stream.getVideoTracks();
                if (!videoTracks || videoTracks.length === 0) {
                    // No webcam
                    toast.error("دوربین پیدا نشد");
                }
            },
            slowLink: function () {
                toast.error("سرعت اینترنت شما ضعیف شد و احتمال قطعی وجود خواهد داشت");
            },
            onremotestream: function (stream) {
                // The publisher stream is sendonly, we don't expect anything here
               console.log("onremotestream", "stream", stream);
            },
            oncleanup: function () {
                console.log("oncleanup ::: Got a cleanup notification: we are unpublished now :::");
                config.videoElemCallback(true, true);
                mystream = null;
                config.lostConnectionCallback();
            }
        })
    }
    ;



    function registerUsername() {
        var register = {
            "request": "join",
            "room": config.roomId,
            "ptype": "publisher",
            "display": config.isSupporter ? "s" : "c"
        };
        if (config.pin) {
            register.pin = config.pin;
        }
        if (config.token) {
            register.token = config.token;
        }
        console.log("registerUsername() register json: ",register);
        handler.send({message: register});
    }

    trio.publishOwnFeed = function (withMedia) {
        //***
        console.log("trio.publishOwnFeed a ", "withMedia: " + withMedia);
//        new Promise(function () {
        // Publish our stream
//        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: withMedia, data: true};
//        var media = {"audioRecv": false, "videoRecv": false, "audioSend": withMedia, "videoSend": withMedia, "data": true,
//            "audio": true, "video": "stdres", "audiocodec": "opus", "videocodec": "vp8", "bitrate": 30000};

//        var media= {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: true, data: true};
//        if (withMedia) {
//            media.audio = true;
//            media.video = "lowers";
//            media.audiocodec = "opus";
//            media.videocodec = "vp8"
////            media.addAudio=withMedia;
////            media.addVideo=withMedia;
//        }

//        var media = {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: withMedia, data: true
//            ,audio: true, video: "lowers", audiocodec: "opus", videocodec: "vp8"};//, bitrate: 10000
        var media;
//        var media = {audioRecv: false, videoRecv: false, audioSend: false, videoSend: false, data: false
//            , audio: false, video: false, audiocodec: "opus", videocodec: "vp8"};//, bitrate: 10000
//        if (withMedia) {
        media = {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: withMedia, data: true
            , audio: true, video: "lowers", audiocodec: "opus", videocodec: "vp8"};//, bitrate: 10000
//        }

//*** for test and this line will be disable video
//var media = {audioRecv: true, videoRecv:true, audioSend: withMedia, videoSend: withMedia ,audiocodec : "opus" ,audio : withMedia ,video:withMedia?"lowers":false ,data: true};
//        var media = {audioRecv: !withMedia, videoRecv:!withMedia, audioSend: withMedia, videoSend: true,audiocodec : "opus",audio : withMedia,video:withMedia?"lowers":false, data: true};
//        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: true, audiocodec: "opus", audio: false, video: false, data: true};
//        if (withMedia) {
//            media.videocodec = "vp8";
//        }
        console.log('~~~~~~~~~~~~~~~~~~~~~~ publish Own Feed : ', 'withMedia:' + withMedia, "media:", media);
        handler.createOffer({
            media: media,
            simulcast: false,
            simulcast2: false,
            success: function (jsep) {
                console. log("Got publisher SDP! createOffer()", jsep);
//                var publish = {request: "configure", audio: false, video: false};
//                if (withMedia) {
               // publish = {request: "configure", audio: withMedia, video: withMedia};
//                }
                var publish = {"request": "configure", "audio": true, "video": true};
                // You can force a specific codec to use when publishing by using the
                // audiocodec and videocodec properties, for instance:
                // 		publish["audiocodec"] = "opus"
                // to force Opus as the audio codec to use, or:
                // 		publish["videocodec"] = "vp9"
                // to force VP9 as the videocodec to use. In both case, though, forcing
                // a codec will only work if: (1) the codec is actually in the SDP (and
                // so the browser supports it), and (2) the codec is in the list of
                // allowed codecs in a room. With respect to the point (2) above,
                // refer to the text in etc.plugin.videoroom.jcfg for more details.
                // We allow people to specify a codec via query string, for demo purposes
                // 
               // if (withMedia) {
//            publish.audio = true;
//                    publish.video = "lowers";
//                    publish.audiocodec = "opus";
//                    publish.videocodec = "vp8"
//            media.addAudio=withMedia;
//            media.addVideo=withMedia;
              //  }
                handler.send({"message": publish, "jsep": jsep});
//                trio.unpublishOwnFeed();
            },
            error: function (error) {
                //show permission dialog/help to release them
                console.error("WebRTC error:", error);
//                    if (withMedia) {
                trio.publishOwnFeed(withMedia);
//                    } else {
//                        trio.publishOwnFeed(true);
//                    }
            }
        })
//        });
    }

    function newRemoteFeed(id, display, audio, video) {
//        if (audio && video) {
//        new Promise(function () {
        console.log("newRemoteFeed() id: " + id + " display: " + display + " audio: " + audio + " video: " + video);
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
//        return true;
        var remoteFeed = null;
        paris.attach({
            plugin: etc + ".plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.simulcastStarted = false;
//               console.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
                console.log("newRemoteFeed() attach() success ############ remoteFeed #################", remoteFeed);
                console.log("newRemoteFeed() attach() success   -- This is a subscriber");
//                config.participantCounterCallback(remoteFeed.rfid, true);
                // We wait for the plugin to send us an offer
                var subscribe = {
                    "request": "join",
                    "room": config.roomId,
                    "ptype": "subscriber",
                    "feed": id,
                    "pin": config.pin,
                    "token": config.token,
                    "private_id": mypvtid
                };
                // In case you don't want to receive audio, video or data, even if the
                // publisher is sending them, set the 'offer_audio', 'offer_video' or
                // 'offer_data' properties to false (they're true by default), e.g.:
                // 		subscribe["offer_video"] = false;
                // For example, if the publisher is VP8 and this is Safari, let's avoid video
                if (Paris.webRTCAdapter.browserDetails.browser === "safari" &&
                        (video === "vp9" || (video === "vp8" && !Paris.safariVp8))) {
                    if (video) {
                        video = video.toUpperCase()
                    }
                    toast.error("ویدیو با مرورگر سافاری سازگار نیست لطفا از مرورگر بروز کروم استفاده کنید");
                    subscribe["offer_video"] = false;
                }
                remoteFeed.videoCodec = video;
                console.log("newremotefeed() subscribe json: ",subscribe);
                remoteFeed.send({message: subscribe});
            },
            error: function (error) {
                console.error("newremotefeed() error  -- Error attaching plugin...", error);
//                bootbox.alert("Error attaching plugin... " + error);
            },
            onmessage: function (msg, jsep) {
                console.log("newremotefeed() onmessage ::: Got a message (subscriber) :::", msg);
                var event = msg["videoroom"];
                console.log("newremotefeed() onmessage Event: " + event);
                if (msg["error"] !== undefined && msg["error"] !== null) {
//                    bootbox.alert("MSG2:" + msg["error"]);
                    console.error("newremotefeed() onmessage  msg[\"error\"] !== null MSG2:" + msg["error"]);
                } else if (event != undefined && event != null) {
                    console.log("newremotefeed() onmessage  event === \"attached\" event != null");
                    if (event === "attached") {
                        console.log("newremotefeed() onmessage  event === \"attached\" event != null event === \"attached\"");
                        // Subscriber created and attached
                        for (var i = 1; i < config.maxCap; i++) {
                            if (feeds[i] === undefined || feeds[i] === null) {
                                feeds[i] = remoteFeed;
                                remoteFeed.rfindex = i;
                                break;
                            }
                        }
                        remoteFeed.rfid = msg["id"];
                        remoteFeed.rfdisplay = msg["display"];
                        console.log("newremotefeed() onmessage  event === \"attached\" Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                        config.participantCounterCallback(remoteFeed.rfid, true);
                    } else if (event === "event") {
                        console.log("newremotefeed() onmessage  event === \"event\" ");
// Check if we got a simulcast-related event from this publisher
                    } else {
                        console.log("newremotefeed() onmessage  else ",msg);
                        // What has just happened?
                    }
                }
//                    if (jsep) {
                if (jsep !== undefined && jsep !== null) {
                   console.log("newremotefeed() jsep !== null Handling SDP as well...", jsep);
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
//                        media: {"audioSend": !config.isPublisher, "videoSend": !config.isPublisher, "data": true}, // // We want recvonly audio/video
                       // media: {audioRecv: true, videoRecv: true, audioSend: false, videoSend: false, data: true
                       //     , audio: true, video: "lowers", audiocodec: "opus", videocodec: "vp8"}, // // We want recvonly audio/video
                       media: {"audioSend": false, "videoSend": false, "data": true}, // // We want recvonly audio/video
                        success: function (jsep) {
                            console.log("newremotefeed() jsep !== null Got SDP!", jsep);
                            var body = {"request": "start", "room": config.roomId};
                            remoteFeed.send({"message": body, "jsep": jsep});
                        },
                        error: function (error) {
                            console.error("newremotefeed() jsep !== null WebRTC error:", error);
                        }
                    });
                }
            },
            iceState: function (state) {
                console.log("newremotefeed()  iceState ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
            },
            webrtcState: function (on) {
                console.log("newremotefeed() webrtcstate Paris says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
                console.log("newremotefeed() webrtcstate ~~~~~~~~~~ remoteFeed: ", remoteFeed);
                if (!on) {
                    config.videoElemCallback(false, !on, remoteFeed);
                }
//                else{
//                    config.peerConnectionCallback(on,remoteFeed);
//                }
            },
            onlocalstream: function (stream) {
                // The subscriber stream is recvonly, we don't expect anything here
                console.log("newremotefeed() onlocalstream in newremotefeed");
            },
            onremotestream: function (stream) {
//                console.log("newremotefeed() onremotestream Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
//                console.log("---------------------------Remote feed #" + remoteFeed.rfindex, "reservedVideoElem: " + reservedVideoElem, ", stream:", stream);
                console.log("newremotefeed() onremotestream Remote feed remoteFeed.rfdisplay:" + remoteFeed.rfindex, "remoteFeed", remoteFeed, ", stream:", stream);
//                var vIdx = config.isSupporter || config.isPublisher ? 1 : remoteFeed.rfindex - 1;
//                var vIdx = config.isSupporter ? 1 : (config.isPublisher ? 0 : remoteFeed.rfindex - 1);
//                console.log("+++++++++++++++++++++ vIdx: " + vIdx + " ++++++++++++++++++++++++++");
//                Paris.attachMediaStream(config.videoElems[remoteFeed.rfindex + reservedVideoElem], stream);
//                Paris.attachMediaStream(config.videoElems[vIdx], stream);
//                console.log("newremotefeed() onremotestream  remoteFeed.rfdisplay: " + remoteFeed.rfdisplay, " stream:", stream);
console.log("newremotefeed() onremotestream remoteFeed.rfdisplay : ",remoteFeed.rfdisplay," remoteFeed.rfdisplay === \"s\" :",remoteFeed.rfdisplay === "s" ," config.videoElems[remoteFeed.rfdisplay === \"s\" ? 0 : 1] : ",config.videoElems[remoteFeed.rfdisplay === "s" ? 0 : 1]);
                Paris.attachMediaStream(config.videoElems[remoteFeed.rfdisplay === "s" ? 0 : 1], stream);
                var videoTracks = stream.getVideoTracks();
                if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                    toast.error("لحظاتی ویدیو دریافت نشد ممکنه مشکل از اینترنت باشه و یا قدرت سیستم شما ضعیفه");
                }

                config.videoElemCallback(false, false, remoteFeed);
//                if (!config.isPublisher) {
//                    Paris.attachMediaStream(config.videoElems[remoteFeed.rfindex + reservedVideoElem], stream);
//                } else {
//                    Paris.attachMediaStream(config.videoElems[1], stream);
//                }
//                    var videoTracks = stream.getVideoTracks();
//                    if (videoTracks && videoTracks.length > 0) {
                // show video element with stream and hidden video element without stream
//                    }
//                    return;
            },
            ondataopen: function (data) {
                Paris.log("newremotefeed() ondataopen The DataChannel is available!");
                config.peerConnectionCallback(remoteFeed.rfid);
            },
            ondata: function (data) {
//                    Paris.debug("We got data from the DataChannel! " + data);
                console.log("newremotefeed() ondata We got data from the DataChannel! data: ", data, " id: ", id);
                config.receiveMsgCallback(data, id);
//                    setMsgProcess(data, false);
            },
            oncleanup: function () {
                console.log("newremotefeed() oncleanup  ::: Got a cleanup notification (remote feed " + id + ") :::");
                config.participantCounterCallback(id, false);
            }
        })
//        });
//        }
    }

    trio.sendDataChannel = function sendDataChannel(j) {
        if (typeof j === 'object') {
            j.userRoomId = myid;
            j = JSON.stringify(j);
        }
        handler.data({
            text: j,
            error: function (reason) {
                console.error(reason);
                toast.error("متاسفانه پیام ارسال نشد لطفا اینترنت خود را چک کنید");
            },
            success: function () {
                config.sendMsgCallback(j, true);
//                chatInput.val('');
            }
        });
    }

    trio.unpublishOwnFeed = function () {
        console.log("unpublishOwnFeed()");
//       function unpublishOwnFeed() {
        // Unpublish our stream
        var unpublish = {request: "unpublish"};
        handler.send({message: unpublish});
// Remove local video
//        handler.createOffer(
//                {
//                    media: {removeVideo: true, removeAudio: true},
//                    simulcast: false,
//                    simulcast2: false,
//                    success: function (jsep) {
//                        Paris.debug(jsep);
//                        handler.send({message: {audio: true, video: true}, "jsep": jsep});
//                    },
//                    error: function (error) {
//                        console.log("WebRTC error... " + JSON.stringify(error));
//                    }
//                });
    }

    trio.switchPublisherSubscriber = function switchPublisherSubscriber(isToPublisher) {
        console.log("switchPublisherSubscriber()");
        if (isToPublisher) {
            config.isPublisher = true;
//            reservedVideoElem = config.isPublisher ? 0 : -1;
            trio.publishOwnFeed(true);
        } else {
            config.isPublisher = false;
//            reservedVideoElem = config.isPublisher ? 0 : -1;
            trio.unpublishOwnFeed();
        }
    }
    trio.destroyServer = function destroyServer() {
        console.log("destroyServer()");
        if (handler) {
            handler.hangup();
        }
        if (paris && paris.isConnected()) {
            paris.destroy();
        }
    }

//    function toggleMute() {
//        var muted = sfutest.isAudioMuted();
//        Paris.log((muted ? "Unmuting" : "Muting") + " local stream...");
//        if (muted)
//            sfutest.unmuteAudio();
//        else
//            sfutest.muteAudio();
//        muted = sfutest.isAudioMuted();
//        $('#mute').html(muted ? "Unmute" : "Mute");
//    }

//    trio.getStreamInfo = function getStreamInfo() {
//        // Send a request for more info on the mountpoint we subscribed to
////    var body = {"request": "info", "id": parseInt(selectedStream)};
//        var body = {"request": "info", "id": config.roomId};
//        handler.send({"message": body, success: function (result) {
//                console.log("result:--", result);
//            }});
//    }
    return trio;
}