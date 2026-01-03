var aConfig;
//var qStream;
//var mystream = null;
//var feeds = [];
//var feeds = new Map();
var handler = null;
var firstCliclHappend = false;

var localStream,remoteStream;
function startLive(config) {
//    config.roomId = "1234";
    aConfig = config;

    monsole.log(config);
    var trio = {};
//    trio.reConnect = startLive(config);
    var paris = null;
//    var handler = null;
    var opaqueId = "videoroomtest-" + Paris.randomString(12);

    var myid = null;
    var mystream = null;
// We use this other ID just to map our subscriptions to us
    var mypvtid = null;
//    var feeds = [];
    var feeds = new Map();

//    Paris.init({debug: "all", callback: function () {
//            monsole.log("before promise block 1");
//            new Promise(function () {
//                monsole.log("inside promise block 1");
//                setTimeout(function () {
//                    monsole.log("inside promise block with timeout 1");
//                    // Initialize the library (all console debuggers enabled)
//                    session();
//                }, 3500)
//            });
//            monsole.log("after promise block 1");
//        }});
    Paris.init({callback: function () {
            // Initialize the library (all console debuggers enabled)
            session();
        }});

    function session() {
        // Make sure the browser supports WebRTC
        if (!Paris.isWebrtcSupported()) {
            toast.error("مرورگر شما از امکانات لایو پشتیبانی نمیکند لطفا از مرورگر بروز کروم استفاده کنید");
            monsole.error("No WebRTC support... ");
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
                monsole.error(error);
//                  trio.destroyServer();
//                    resetWhenInDisconnection();
//                config.lostConnectionCallback();
//                setTimeout(function () {
//                    startLive(aConfig);
//                }, 7000);
//startLive(config);
                connectAgain();
            },
            destroyed: function () {
                monsole.error("destroyed room --");
                if (!config.isDestroyed) {
                    config.isDestroyed = true;
                    trio.destroyServer();
                    config.lostConnectionCallback();
                }
            }
        }, etc)
    }

    function attach() {
        monsole.log("attach() Attach to VideoRoom plugin");
        paris.attach({
            plugin: etc + ".plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                handler = pluginHandle;
                monsole.log("attach() success Plugin attached! (" + handler.getPlugin() + ", id=" + handler.getId() + ")");
                monsole.log("attach() success  -- This is a publisher/manager");
                if (config.isPublisher) {
                    registerUsername();
                } else {
                    if (nameEnteredMode == 1 && !firstCliclHappend) {

                        var j = {title: 'برای ورود به اتاق آماده ای ؟'};
//                j.body = '<span>بیا تو</span>';
                        j.control = '<span id="enter_bt" class="button_ctr2 bg-css-blue bt">بزن بریم!</span>';
                        j.notClose = 1;
                        showDialog(j);
                        g("#enter_bt").onclick = function () {
                            closeDialog();
                            firstCliclHappend = true;
                            registerUsername();
                        }
                    } else {
                        registerUsername();
                    }
                }
            },
            error: function (error) {
                monsole.error("attach() error  -- Error attaching plugin...", error);
            },
            consentDialog: function (on) {
                monsole.log("attach() consentDialog Consent dialog should be " + (on ? "on" : "off") + " now");
            },
            iceState: function (state) {
                monsole.log("attach() iceState ICE state changed to " + state);
                if (state === 'disconnected') {

//                    trio.destroyServer();
//                    config.lostConnectionCallback();

////                handler.hangup();
////                setTimeout(()=>{
////                    attach();
////                },3500)

////                  trio.reConnect();
////                  startLive(config);

                }
            },
            mediaState: function (medium, on) {
                monsole.log("attach() mediaState Paris " + (on ? "started" : "stopped") + " receiving our " + medium);
            },
            webrtcState: function (on) {
                monsole.log("attach() webrtcState Paris says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                if (!on) {
                    return;
                } else {
                    myInfo.isConnected = true;
                }
            },
            onmessage: function (msg, jsep) {
                monsole.log("attach() onmessage ::: Got a message (publisher) :::", msg);
                var event = msg["videoroom"];
                monsole.log("attach() onmessage Event: ", event);
                if (event != undefined && event != null) {
                    if (event === "joined") {
                        // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                        myid = msg["id"];
                        mypvtid = msg["private_id"];
                        monsole.log("onmessage event === \"joined\" joined room " + msg["room"] + " with ID " + myid + " and private ID of " + mypvtid + " config.isPublisher : " + config.isPublisher);
                        trio.userRoomId = myid;
                        config.videoRoomCallback(myid);
//                                    if (config.isPublisher) {
                        //trio.publishOwnFeed(true);
//                                    } 
//                                    else {
//                                        trio.publishOwnFeed(false);
//                                    }
// monsole.log("before promise block 1");
//                                    new Promise(function () {
//                                         monsole.log("inside promise block 1");
//                                        setTimeout(function () {
//                                             monsole.log("inside promise block with timeout 1");
//                                            trio.publishOwnFeed(config.isPublisher);
//                                        }, 3000)
//                                    });
//                                                      monsole.log("after promise block 1");
                        trio.publishOwnFeed(config.isPublisher, config.isPublisher);
//                             
                        // Any new feed to attach to?
                        if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                            var list = msg["publishers"];
                            monsole.log("onmessage  event === \"joined\"  msg[\"publishers\"] !== null Got a list of available publishers/feeds:", list);
                            for (var f in list) {
                                var id = list[f]["id"];
                                var display = list[f]["display"];
                                var audio = list[f]["audio_codec"];
                                var video = list[f]["video_codec"];
                                monsole.log("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                newRemoteFeed(id, display, audio, video);
                            }
                        }
                    } else if (event === "destroyed") {
                        // The room has been destroyed
                        monsole.error("onmessage event === \"destroyed\" The room has been destroyed!");
                        toast.error("اتاق بسته شد");
                        getBackToProfile();
                    } else if (event === "event") {
                        monsole.log("onmessage event === \"event\"");
                        // Any new feed to attach to?
                        if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                            var list = msg["publishers"];
                            monsole.log("onmessage event === \"event\" msg[\"publishers\"] !== null Got a list of available publishers/feeds:", list);
                            for (var f in list) {
                                var id = list[f]["id"];
                                var display = list[f]["display"];
                                var audio = list[f]["audio_codec"];
                                var video = list[f]["video_codec"];
                                monsole.log("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                newRemoteFeed(id, display, audio, video);
                            }
                        } else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
                            // One of the publishers has gone away?
                            var leaving = msg["leaving"];
                            monsole.log("onmassage event === \"event\" msg[\"leaving\"] !== null Publisher left ", leaving);
//                            monsole.log();
                            config.participantCounterCallback(leaving, false);
                            var remoteFeed = null;
//                            for (var i = 1; i <= config.maxCap; i++) {
//                                if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid === leaving) {
//                                    remoteFeed = feeds[i];
//                                    feeds[i] = null;
//                                    break;
//                                }
//                            }

                            remoteFeed = feeds.get(leaving);
                            if (remoteFeed) {
                                monsole.log("onmassage  event === \"event\"  msg[\"leaving\"] !== null remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                //hide video element because participant is gone
                                feeds.delete(leaving);
                                config.videoElemCallback(false, true, remoteFeed);
                                remoteFeed.detach();
                            }

//                            if (remoteFeed != null) {
//                                monsole.log("onmassage  event === \"event\"  msg[\"leaving\"] !== null remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
//                                //hide video element because participant is gone
//                                config.videoElemCallback(false, true, remoteFeed);
////                                feeds[remoteFeed.rfindex] = null;
//                                remoteFeed.detach();
//                            }
                        } else if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
                            // One of the publishers has unpublished?
                            var unpublished = msg["unpublished"];
                            monsole.log("onmassage  event === \"event\" msg[\"unpublished\"] !== null Publisher left" + unpublished, msg);
//                                        config.participantCounterCallback(unpublished, false);
                            if (unpublished === 'ok') {
                                // That's us
                                monsole.log("onmassage  event === \"event\" msg[\"unpublished\"] !== null handler.hangup()!!!");
                                handler.hangup();
                                return;
                            }
                            var remoteFeed = null;

//                            for (var i = 1; i <= config.maxCap; i++) {
//                                if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == unpublished) {
//                                    remoteFeed = feeds[i];
//                                    monsole.log("onmassage  event === \"event\"   msg[\"unpublished\"] !== null  remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has unpublished the room, detaching");
//                                    feeds[i] = null;
//                                    break;
//                                }
//                            }

                            remoteFeed = feeds.get(unpublished);
                            if (remoteFeed) {
                                monsole.log("onmassage  event === \"event\"   msg[\"unpublished\"] !== null  remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has unpublished the room, detaching");
                                //hide video element because participant is gone
                                feeds.delete(unpublished);
                                config.videoElemCallback(false, true, remoteFeed);
                                remoteFeed.detach();
                            }


//                            if (remoteFeed != null) {
//                                monsole.log("onmassage  event === \"event\"  msg[\"unpublished\"] !== null remoteFeed != null Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
//                                // hide video element because participant is gone
//                                config.videoElemCallback(false, true, remoteFeed);
////                                feeds[remoteFeed.rfindex] = null;
//                                remoteFeed.detach();
//                            }
                        } else if (msg["kicked"] !== undefined && msg["kicked"] !== null) {
                            //this event added by me to handle the current participant with another live page viewing
                            // One of the publishers has gone away?
                            var kicked = msg["kicked"];
                            monsole.log("onmassage event === \"event\" msg[\"kicked\"] !== null Publisher left ", kicked);
//                            monsole.log();
                            config.participantCounterCallback(kicked, false);
                            var remoteFeed = null;

                            remoteFeed = feeds.get(kicked);
                            if (remoteFeed) {
                                monsole.log("onmassage  event === \"event\"  msg[\"leaving\"] !== null remoteFeed != null  Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                //hide video element because participant is gone
                                feeds.delete(kicked);
                                config.videoElemCallback(false, true, remoteFeed);
                                remoteFeed.detach();
                            }


                        } else if (msg["error"] !== undefined && msg["error"] !== null) {
                            monsole.error("onmassage  event === \"event\" msg[\"error\"] !== null MSG:", msg);
                            if (msg["error_code"] === 426) {
                                toast.info("اتاق معتبر نیست سعی کنید دوباره وارد شوید");
                                getBackToProfile();
                            } else if (msg["error_code"] === 432) {
                                monsole.error("onmassage  event === \"event\"  msg[\"error\"] !== null MSG3:" + msg["error"]);
                                config.outOfCapacityRoomCallback();
                                trio.destroyServer();
                            } else if (msg["error_code"] === 433) {
                                toast.error("شما دسترسی لازم برای ورود به اتاق را ندارید");
                            } else {
                                monsole.error("onmassage  event === \"event\"  msg[\"error\"] !== null MSG1:" + msg["error"], msg);
                            }
                        }
                    }
                }
                if (jsep !== undefined && jsep !== null) {
                    monsole.log("attach() onmessage Handling SDP as well...", jsep);
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
                monsole.log("onlocalstream ::: Got a local stream :::", stream);
                config.videoElemCallback(true, false);
                mystream = stream;
                var vIdx = config.isSupporter ? 0 : 1;
                monsole.log("attach() onlocalstream config.isSupporter ", config.isSupporter, " vIdx :", vIdx, " config.videoElems[vIdx] : ", config.videoElems[vIdx]);
                
                localStream=stream;
                
                Paris.attachMediaStream(config.videoElems[vIdx], stream);
                config.videoElems[vIdx].muted = "muted";

                if (handler.webrtcStuff.pc.iceConnectionState !== "completed" &&
                        handler.webrtcStuff.pc.iceConnectionState !== "connected") {
                }
                var videoTracks = stream.getVideoTracks();
                if (!videoTracks || videoTracks.length === 0) {
                    // No webcam
//                    toast.error("دوربین پیدا نشد");
                    toast.error("ارتباط تصویری قطع است");
                }
            },
            slowLink: function () {
                toast.error("سرعت اینترنت شما ضعیف شد و احتمال قطعی وجود خواهد داشت");
            },
            onremotestream: function (stream) {
                // The publisher stream is sendonly, we don't expect anything here
                monsole.log("onremotestream", "stream", stream);
            },
            oncleanup: function () {
                monsole.log("oncleanup ::: Got a cleanup notification: we are unpublished now :::");
                config.videoElemCallback(true, true);
                mystream = null;
                config.lostConnectionCallback();
            }
        })
    }
    ;



    function registerUsername() {
        var register = {
            request: "join",
            room: config.roomId,
            ptype: "publisher",
            display: config.isSupporter ? "s" : "c"
        };
        if (config.pin) {
            register.pin = config.pin;
        }
        if (config.token) {
            register.token = config.token;
        }
        monsole.log("registerUsername() register json: ", register);
        handler.send({message: register});
    }

    trio.publishOwnFeed = function (withAudio, withVideo, isScreenSharing) {
        //***
        monsole.log("trio.publishOwnFeed a ", "withAudio: " + withAudio, "withVideo: " + withVideo);
        // Publish our stream
//        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: withMedia, data: true};
//        var media = {"audioRecv": false, "videoRecv": false, "audioSend": withMedia, "videoSend": withMedia, "data": true,
//            "audio": true, "video": "stdres", "audiocodec": "opus", "videocodec": "vp8", "bitrate": 30000};

//        var media= {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: true, data: true};
//        if (withMedia) {
//            media.audio = true;
//            media.video = "lowres";
//            media.audiocodec = "opus";
//            media.videocodec = "vp8"
////            media.addAudio=withMedia;
////            media.addVideo=withMedia;
//        }

//        var media = {audioRecv: false, videoRecv: false, audioSend: withMedia, videoSend: withMedia, data: true
//            ,audio: true, video: "lowers", audiocodec: "opus", videocodec: "vp8"};//, bitrate: 10000

//        var media = {audioRecv: false, videoRecv: false, audioSend: false, videoSend: false, data: false
//            , audio: false, video: false, audiocodec: "opus", videocodec: "vp8"};//, bitrate: 10000
//        if (withMedia) {
        var media;
        if (isScreenSharing) {
            media = {audioRecv: false, videoRecv: false, audioSend: withAudio, videoSend: withVideo, data: true
                , audio: true, video: "screen", audiocodec: "opus", videocodec: "vp9"};//, bitrate: 10000
        } else {
            media = {audioRecv: false, videoRecv: false, audioSend: withAudio, videoSend: withVideo, data: true
                , audio: true, video: "lowres", audiocodec: "opus", videocodec: "vp9"};//, bitrate: 10000
        }
//        }

//*** for test and this line will be disable video
//var media = {audioRecv: true, videoRecv:true, audioSend: withMedia, videoSend: withMedia ,audiocodec : "opus" ,audio : withMedia ,video:withMedia?"lowers":false ,data: true};
//        var media = {audioRecv: !withMedia, videoRecv:!withMedia, audioSend: withMedia, videoSend: true,audiocodec : "opus",audio : withMedia,video:withMedia?"lowers":false, data: true};
//        var media = {audioRecv: !withMedia, videoRecv: !withMedia, audioSend: withMedia, videoSend: true, audiocodec: "opus", audio: false, video: false, data: true};
//        if (withMedia) {
//            media.videocodec = "vp8";
//        }
        monsole.log('~~~~~~~~~~~~~~~~~~~~~~ publish Own Feed : ', 'withAudio:' + withAudio, "media:", media);
        handler.createOffer({
            media: media,
            simulcast: false,
            simulcast2: false,
            success: function (jsep) {
                monsole.log("Got publisher SDP! createOffer()", jsep);
//                var publish = {request: "configure", audio: false, video: false};
//                if (withMedia) {
                // publish = {request: "configure", audio: withMedia, video: withMedia};
//                }
                var publish = {request: "configure", audio: true, video: true};
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
//                    publish.audiocodec = "opus";
//                    publish.videocodec = "vp8"
//            media.addAudio=withMedia;
//            media.addVideo=withMedia;
                //  }
                handler.send({message: publish, jsep: jsep});
//                trio.unpublishOwnFeed();
            },
            error: function (error) {
                //show permission dialog/help to release them
                monsole.error("WebRTC error:", error);
//                    if (withMedia) {
// below line will be make infinity loop
//                trio.publishOwnFeed(withMedia);
//                    } else {
//                        trio.publishOwnFeed(true);
//                    }
            }
        })
    }

    function newRemoteFeed(id, display, audio, video) {
//        if (audio && video) {
        monsole.log("newRemoteFeed() id: " + id + " display: " + display + " audio: " + audio + " video: " + video);
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
//        return true;
        var remoteFeed = null;
        paris.attach({
            plugin: etc + ".plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.simulcastStarted = false;
//               monsole.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
//                monsole.log("newRemoteFeed() attach() success ############ remoteFeed #################", remoteFeed);
                monsole.log("newRemoteFeed() attach() success   -- This is a subscriber");
//                config.participantCounterCallback(remoteFeed.rfid, true);
                // We wait for the plugin to send us an offer
                var subscribe = {
                    request: "join",
                    room: config.roomId,
                    ptype: "subscriber",
                    feed: id,
                    pin: config.pin,
                    private_id: mypvtid
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
                monsole.log("newremotefeed() subscribe json: ", subscribe);
                remoteFeed.send({message: subscribe});
            },
            error: function (error) {
                monsole.error("newremotefeed() error  -- Error attaching plugin...", error);
//                bootbox.alert("Error attaching plugin... " + error);
            },
            onmessage: function (msg, jsep) {
                monsole.log("newremotefeed() onmessage ::: Got a message (subscriber) :::", msg);
                var event = msg["videoroom"];
                monsole.log("newremotefeed() onmessage Event: " + event);
                if (msg["error"] !== undefined && msg["error"] !== null) {
//                    bootbox.alert("MSG2:" + msg["error"]);
                    monsole.error("newremotefeed() onmessage  msg[\"error\"] !== null MSG2:" + msg["error"]);
                } else if (event != undefined && event != null) {
                    monsole.log("newremotefeed() onmessage  event === \"attached\" event != null");
                    if (event === "attached") {
                        monsole.log("newremotefeed() onmessage  event === \"attached\" event != null event === \"attached\"");

                        // Subscriber created and attached
//                        for (var i = 1; i < config.maxCap; i++) {
//                            if (feeds[i] === undefined || feeds[i] === null) {
//                                remoteFeed.rfindex = i;
//                                feeds[i] = remoteFeed;
//                                break;
//                            }
//                        }
                        remoteFeed.rfid = msg["id"];
                        remoteFeed.rfdisplay = msg["display"];
                        monsole.log("newremotefeed() onmessage  event === \"attached\" Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                        feeds.set(remoteFeed.rfid, remoteFeed);
                        config.participantCounterCallback(remoteFeed.rfid, true);
                    } else if (event === "event") {
                        monsole.log("newremotefeed() onmessage  event === \"event\" ");
// Check if we got a simulcast-related event from this publisher
                    } else {
                        monsole.log("newremotefeed() onmessage  else ", msg);
                        // What has just happened?
                    }
                }
//                    if (jsep) {
                if (jsep !== undefined && jsep !== null) {
                    monsole.log("newremotefeed() jsep !== null Handling SDP as well...", jsep);
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
//                        media: {"audioSend": !config.isPublisher, "videoSend": !config.isPublisher, "data": true}, // // We want recvonly audio/video
                        // media: {audioRecv: true, videoRecv: true, audioSend: false, videoSend: false, data: true
                        //     , audio: true, video: "lowers", audiocodec: "opus", videocodec: "vp8"}, // // We want recvonly audio/video
                        media: {audioSend: false, videoSend: false, data: true}, // // We want recvonly audio/video
                        success: function (jsep) {
                            monsole.log("newremotefeed() jsep !== null Got SDP!", jsep);
                            var body = {request: "start", room: config.roomId};
                            remoteFeed.send({message: body, jsep: jsep});
                        },
                        error: function (error) {
                            monsole.error("newremotefeed() jsep !== null WebRTC error:", error);
                        }
                    });
                }
            },
            iceState: function (state) {
                monsole.log("newremotefeed()  iceState ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
//                if(!remoteFeed.rfindex&&state==="disconnected"){
//                    connectAgain();
//                }
            },
            webrtcState: function (on) {
                monsole.log("newremotefeed() webrtcstate Paris says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
//                monsole.log("newremotefeed() webrtcstate ~~~~~~~~~~ remoteFeed: ", remoteFeed);
                if (!on) {
                    config.videoElemCallback(false, !on, remoteFeed);
                }
//                else{
//                    config.peerConnectionCallback(on,remoteFeed);
//                }
            },
            onlocalstream: function (stream) {
                // The subscriber stream is recvonly, we don't expect anything here
                monsole.log("newremotefeed() onlocalstream in newremotefeed", stream);
            },
            onremotestream: function (stream) {
//                monsole.log("newremotefeed() onremotestream Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
//                monsole.log("---------------------------Remote feed #" + remoteFeed.rfindex, "reservedVideoElem: " + reservedVideoElem, ", stream:", stream);
//                monsole.log("newremotefeed() onremotestream Remote feed remoteFeed.rfdisplay:" + remoteFeed.rfindex, "remoteFeed", remoteFeed, ", stream:",stream);
//                var vIdx = config.isSupporter || config.isPublisher ? 1 : remoteFeed.rfindex - 1;
//                var vIdx = config.isSupporter ? 1 : (config.isPublisher ? 0 : remoteFeed.rfindex - 1);
//                monsole.log("+++++++++++++++++++++ vIdx: " + vIdx + " ++++++++++++++++++++++++++");
//                Paris.attachMediaStream(config.videoElems[remoteFeed.rfindex + reservedVideoElem], stream);
//                Paris.attachMediaStream(config.videoElems[vIdx], stream);
//                monsole.log("newremotefeed() onremotestream  remoteFeed.rfdisplay: " + remoteFeed.rfdisplay, " stream:", stream);
//monsole.log("newremotefeed() onremotestream remoteFeed.rfdisplay : ",remoteFeed.rfdisplay," remoteFeed.rfdisplay === \"s\" :",remoteFeed.rfdisplay === "s" ," config.videoElems[remoteFeed.rfdisplay === \"s\" ? 0 : 1] : ",config.videoElems[remoteFeed.rfdisplay === "s" ? 0 : 1]);
                monsole.log("newremotefeed() onremotestream remoteFeed.rfdisplay : ", remoteFeed.rfdisplay, " remoteFeed.rfindex: ", remoteFeed.rfindex, " remoteFeed: ", remoteFeed, " stream: ", stream);
                config.videoElemCallback(false, remoteFeed.detached, remoteFeed);
                remoteStream=stream;
                Paris.attachMediaStream(config.videoElems[remoteFeed.rfdisplay === "s" ? 0 : 1], stream);
                var videoTracks = stream.getVideoTracks();
                if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                    toast.error("دریافت ویدیو با اختلال روبرو شد ممکنه کارشناس قطع شده باشه یا مشکل از اینترنت شما باشه");
                }
                if (myInfo.supporterRoomId === remoteFeed.rfid) {
//                    toast.info("کارشناس قطع شد لطفا منتظر باشید تا دوباره برگردد");

                }

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
                config.peerConnectionCallback(remoteFeed.rfid, remoteFeed);
            },
            ondata: function (data) {
                monsole.log("We got data from the DataChannel! ", data);
//                monsole.log("newremotefeed() ondata We got data from the DataChannel! data: ", data, " id: ", id);
                config.receiveMsgCallback(data, id);
//                    setMsgProcess(data, false);
            },
            oncleanup: function () {
                monsole.log("newremotefeed() oncleanup  ::: Got a cleanup notification (remote feed " + id + ") :::");
//                config.participantCounterCallback(id, false);
            }
        });
//        }
    }

    trio.sendDataChannel = function (j) {
//        monsole.log("====================== trio.sendDataChannel ==================== j:", j, typeof j);
        if (typeof j === 'object') {
//            j.userRoomId = myid;
            j.userRoomId = myInfo.userType === USER_TYPE.SUPPORTER ? myInfo.supporterRoomId : myInfo.myUserRoomId;
            j = JSON.stringify(j);
        }
        monsole.log("sendDataChannel json:", j);
        handler.data({
            text: j,
            error: function (reason) {
                monsole.error(reason);
                toast.error("متاسفانه پیام ارسال نشد لطفا اینترنت خود را چک کنید");
            },
            success: function () {
                config.sendMsgCallback(j, true);
//                chatInput.val('');
            }
        });
    }

    trio.unpublishOwnFeed = function () {
        monsole.log("unpublishOwnFeed()");
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
//                        monsole.log("WebRTC error... " + JSON.stringify(error));
//                    }
//                });
    }

    trio.switchPublisherSubscriber = function switchPublisherSubscriber(isToPublisher) {
        monsole.log("switchPublisherSubscriber()");
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
        monsole.log("destroyServer()");
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
//                monsole.log("result:--", result);
//            }});
//    }
    return trio;
}