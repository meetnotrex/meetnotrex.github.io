//var ttest;
var SERVER_ENDPOINT = Object.freeze({
    SCORE: "/score",
    OUT_OF_CAPACITY: "/outofcapacity"
});
var supporterCrypt = new JSEncrypt();
var trio, nameEnteredMode = 0, isPublicChatFree = false;
//var participantIds = [];
var firstCheck = g("#first_check");//, firstCheckTxt = g("#first_check p");
var talkObj = {talkPass: getRandom(20), isTalkReady: false, isTalkRightNow: false, isTalkWaitingNow: false, talkNumber: null, isTalkEnd: false, startTime: null, videoAllowed: false};
var myInfo = {isSupporterConnected: false, isChangingVideo: false, isConnected: false};

function checkParams() {
    var c = {};
    var urlParam = window.location.hash;
    if (urlParam && urlParam.length > 10 && urlParam.startsWith('#')) {
        urlParam = b64DecodeUnicode(urlParam.substr(1));
        if (urlParam) {
            urlParam = new URLSearchParams(urlParam);
            myInfo.siteId = Number(urlParam.get("siteid"));
            myInfo.supporterId = Number(urlParam.get("supporterid"));
            myInfo.supporterRoomId = urlParam.get("supporterroomid");
            myInfo.talkSession = urlParam.get("talksession");
            myInfo.serverSession = urlParam.get("serversession");
            myInfo.userType = Number(urlParam.get("usertype"));
            myInfo.rsaKey = b64DecodeUnicode(b64DecodeUnicode(urlParam.get("rsakey")));
            myInfo.siteBaseUrl = urlParam.get("baseurl");
            myInfo.endpoint = urlParam.get("endpoint");
            myInfo.supporterName = urlParam.get("supportername");
            myInfo.viewerUsername = urlParam.get("viewerusername").trim();
            myInfo.isAnalyseAllowed = urlParam.get("aa") === "true"; // analyseAllowed
            //console.log("myInfo",myInfo);
            g("#supporter_video .name").textContent = myInfo.supporterName;

            if (myInfo.viewerUsername == "null") {

                var j = {title: ' نام و نام خانوادگی خود را وارد کنید:'};
                j.body = '<input type="text" id="viewername" maxlength="25">';
                j.control = '<span id="viewernamebt" class="button_ctr2 bg-css-blue bt">بزن بریم</span>';
                j.notClose = 1;
                var dialog = showDialog(j);
                g("#viewername", dialog).focus();
                g("#viewernamebt", dialog).onclick = function () {

                    var viewerName = g("#viewername", dialog).value.trim();
                    var check = isInputValidate(viewerName);
                    if (!check) {
                        toast.error("برای تعامل بهتر لطفا نام خود را وارد کنید");
                    } else if (check[0]) {
                        if (viewerName.length < 5 || viewerName.length > 25) {
                            toast.error("لطفا نام را درست وارد کنید");
                        } else if (viewerName.startsWith("@")) {
                            toast.error("لطفا از حروف ساده استفاده کنید");
                        } else {
                            toast.info("حله ثبت شد");
                            myInfo.viewerUsername = viewerName;
                            closeDialog();
                            nameEnteredMode = 2;
                            secondInit();
                        }
                    } else {
                        toast.error("در نام خود از حروف غیر مجاز : " + check[1] + " استفاده شده لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                }

            } else {
                myInfo.viewerUsername = "@" + myInfo.viewerUsername;
                nameEnteredMode = 1;
                secondInit();
            }

            function secondInit() {
                c = {
                    host: urlParam.get("host"),
                    roomId: urlParam.get("roomid"),
                    token: urlParam.get("token"),
                    pin: urlParam.get("pin"),
                    maxCap: Number(urlParam.get("cap")),
                    isPublisher: false,
                    isSupporter: false,
                    videoElems: [g("#supporter_video video"), g("#customer_video video")],
                    videoRoomCallback: videoRoomCallback,
                    videoElemCallback: videoElemCallback,
                    sendMsgCallback: sendMsgCallback,
                    receiveMsgCallback: receiveMsgCallback,
                    outOfCapacityRoomCallback: outOfCapacityRoomCallback,
                    participantCounterCallback: participantCounterCallback,
                    peerConnectionCallback: peerConnectionCallback,
                    lostConnectionCallback: lostConnectionCallback
                }

                //    ttest = c;
                if (myInfo.siteId && myInfo.supporterId && myInfo.supporterRoomId && myInfo.talkSession && myInfo.serverSession &&
                        ([USER_TYPE.PARTICIPANT, USER_TYPE.GUEST_PARTICIPANT].includes(myInfo.userType)) &&
                        myInfo.rsaKey && c.host && c.roomId && c.token && c.pin && c.maxCap && myInfo.siteBaseUrl === location.origin) {
                    trio = startLive(c);
                    //*** uncomment in production
                    removeHash();
                } else {
                    toast.error("اطلاعات ورود به اتاق کامل نیست لطفا مجدد برای ورود اقدام فرمایید");
                }
            }
        }
    }
}
function lostConnectionCallback() {
    monsole.log("============== lostConnectionCallback ============== ");
    if (!talkObj.isTalkEnd && !myInfo.isChangingVideo) {
//        getBackToProfile("ارتباط با اتاق قطع شد اینترنت خود را چک کنید");
        toast.error("ارتباط با اتاق قطع شد اینترنت خود را چک کنید");
    }
}
function peerConnectionCallback(id, remoteFeed) {
    monsole.log("============== peerConnectionCallback isOn? ============== id:", id, "remoteFeed:", remoteFeed);
    if (amICustomer && !myInfo.isSupporterConnected && id === myInfo.supporterRoomId) {
        myInfo.isSupporterConnected = true;
        new Promise(function () {
            var passInterval = setInterval(function () {
                if (talkObj.isTalkReady) {
                    clearInterval(passInterval);
                } else if (myInfo.isConnected) {
                    setPasswordToSupporter();
                }
            }, 5000);
        });
    } else if (id && id !== myInfo.supporterRoomId && remoteFeed.rfdisplay === "s") {
//        var j = {data: {pass: talkObj.talkPass, talkSession: myInfo.talkSession}};
////                            monsole.log("sendTalkPasswordToSupporter", j);
//                                participantEncryptAgent(CMD.SEND_REQUEST_OF_NEW_SUPPORTER_PUBLISHER_ID_BY_VIEWER, j);
        myInfo.supporterRoomId = id;
        connectAgain();
    }
}

function videoRoomCallback(myId) {
    monsole.log("============== videoRoomCallback I'm joined successfully ==============", "myId:" + myId);
    if (myId) {
        myInfo.myUserRoomId = myId;
        supporterCrypt.setPublicKey(myInfo.rsaKey);
    } else {
        toast.error("بدرستی به اتاق متصل نشدید لطفا دوباره برای ورود به اتاق اقدام فرمایید");
    }
}
//var currentParticipantRoomId = -1;
//function videoElemCallback(isLocalStream, isGone, remoteFeed) {
//    var isSupporterJoined = remoteFeed ? remoteFeed.rfdisplay === "s" : true;
//    var id = remoteFeed ? remoteFeed.rfid : 0;
//    monsole.log("============== videoElemCallback ==============", " isLocalStream: " + isLocalStream, " isGone: " + isGone, " remoteFeed: ", remoteFeed,
//            " id: ", id, " isSupporterJoined: ", isSupporterJoined);
//    if ((amICustomer && (isLocalStream ||
//            (talkObj.isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))) ||
//            (!amICustomer && id && id !== trio.userRoomId)) {
//        
//        monsole.log("Video Elem Condition , amICustomer: ",amICustomer," isLocalStream: ",isLocalStream," (talkObj.isTalkRightNow && isSupporterJoined): ",(talkObj.isTalkRightNow && isSupporterJoined)," (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))): ",((isLocalStream ||(talkObj.isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))),
//            " (!amICustomer && id && id !== trio.userRoomId): ",(!amICustomer && id && id !== trio.userRoomId));
//        
//        var c = customerVideo.classList;
//        if (isGone) {
//            c.add(hide);
//            currentParticipantRoomId = -1;
//        } else {
//            c.remove(hide);
//            currentParticipantRoomId = isLocalStream ? -1 : remoteFeed.rfid;
//            cleanChatBox();
//        }
//    }
//}
var currentParticipantRoomId = -1;
function videoElemCallback(isLocalStream, isGone, remoteFeed) {
    var isSupporterJoined = remoteFeed && remoteFeed.rfdisplay === "s";
    if (!isSupporterJoined && amICustomer) {
        var id = remoteFeed ? remoteFeed.rfid : 0;
        monsole.log("============== videoElemCallback ==============", " isLocalStream: " + isLocalStream, " isGone: " + isGone, " remoteFeed: ", remoteFeed,
                " id: ", id, " isSupporterJoined: ", isSupporterJoined);
        if ((isLocalStream && talkObj.isTalkRightNow) ||
                (isLocalStream && talkObj.isTalkEnd) ||
                ((id && (currentParticipantRoomId === id || currentParticipantRoomId === -1)))

                //            (!amICustomer && id && id !== trio.userRoomId)
                ) {

            monsole.log("Video Elem Condition ", " isLocalStream: ", isLocalStream, " talkObj: ", talkObj, " remoteFeed: ", remoteFeed, " id: ", id, " isGone: ", isGone, " currentParticipantRoomId: ", currentParticipantRoomId);

            var c = customerVideo.classList;
            if (isGone) {
                c.add(hide);
                currentParticipantRoomId = -1;
            } else {
                c.remove(hide);
                currentParticipantRoomId = isLocalStream ? 0 : remoteFeed.rfid;
                //                currentParticipantRoomId = remoteFeed.rfid;
                //                cleanChatBox();
            }
        }
    }
    if (localStream) {
        setTimeout(() => {
            Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
        }, 2000);
    }
}
function sendMsgCallback(msg, isMyOwn) {
    monsole.log("============== sendMsgCallback ==============", "msg:", msg, "isMyOwn:", isMyOwn);
}
function receiveMsgCallback(msg, id) {
    monsole.log("============== receiveMsgCallback ==============", "msg:", msg, "isMyOwn:", id);
    processReceivedMsg(msg, id);
}
function outOfCapacityRoomCallback() {
    monsole.log("============== outOfCapacityRoomCallback ==============");
    orchesterSend({time: new Date() * 1}, SERVER_ENDPOINT.OUT_OF_CAPACITY);
    getBackToProfile("ظرفیت اتاق تکمیل است لطفا زمان دیگری برای ورود اقدام کنید یا بعدا از مشاور بخواهید که ظرفیت اتاق را افزایش دهد");
}
function participantCounterCallback(id, isJoin) {
    monsole.log("============== participantCounterCallback participantNumber:", "isJoin", isJoin, "id", id);
    if (id) {
        if (!isJoin && myInfo.supporterRoomId === id) {
            resetWhenInDisconnection();
            setTalkState(0);
        }
//        if (isJoin && !participantIds.includes(id)) {
//            participantIds.push(id);
//        } else if (!isJoin && participantIds.includes(id)) {
//            if (typeof currentParticipant !== 'undefined' && currentParticipant.userRoomId === id) {
//                currentParticipant = null;
//            }
//            participantIds = participantIds.filter(function (e) {
//                return e !== id;
//            })
//        }
    }
}

function rsaEncrypt(msg) {
    if (supporterCrypt.key.n) {
        return supporterCrypt.encrypt(msg);
    }
    toast.error("اطلاعات بدرستی دریافت نشده است لطفا این صفحه را ببندید و دوباره برای ورود به اتاق مشاوره اقدام نمایید");
    return null;
}
function processReceivedMsg(j, id) {
    //console.log("processReceivedMsg: ", j, id);
    try {
        j = JSON.parse(j);
        //        ttest = j;
        //console.log("processReceivedMsg: ", j, id);
        if (checkReceivedMsgIsHealthy(j, id)) {
            if (j.isEnc) {
                if (j.enc === "rc4") {
                    j.data = rc4(talkObj.talkPass, b64DecodeUnicode(j.data));
                } else {
                    j.data = null;
                }
            }
            monsole.log("processReceivedMsg: after rc4 decryption : ", j, id);
            if (j.data) {
                j.data = JSON.parse(j.data);
                if (j.data.z === 9) {
                    switch (j.cmd) {
                        case CMD.INTERVAL_INFO.cmd:
                            getIntervalInfo(j.data);
                            supporterAliveTime = new Date() * 1;
                            break;
                        case CMD.PUBLIC_MSG.cmd:
                        case CMD.PRIVATE_MSG.cmd:
                            writeMsgToChatList(j);
                            break;
                        case CMD.MSG_ACK.cmd:
                            ackMsgCallback(j);
                            break;
                        case CMD.PUBLISH_CUSTOMER_MSG.cmd:
                            // if (!talkObj.isTalkRightNow||isPublicChatFree) {
                            writeMsgToChatList(j);
                            //}
                            break;
                        case CMD.TALK_RESPONSE_ACK.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                if (j.data.state === "ok") {
                                    setTalkState(1, j);
                                    toast.success("با موفقیت در kharidlive انتظار گفتگو با شماره " + talkObj.talkNumber + " قرار گرفته اید");
                                } else if (j.data.state === "exist") {
                                    setTalkState(1, j);
                                    toast.info("هم اکنون در kharidlive انتظار مشاوره با شماره " + talkObj.talkNumber + " قرار دارید و نیازی به درخواست مجدد نیست");
                                } else if (j.data.state === "remove") {
                                    setTalkState(0);
                                } else if (j.data.state === "error") {
                                    setTalkState(0);
                                    //                                    isTalkWaitingNow=false;
                                    if (j.data.msg) {
                                        toast.error(j.data.msg);
                                    }
                                }
                            }
                            break;
                        case CMD.VIEWER_STATISTICS_REQUEST.cmd:
                            if (j.data.talkSession === myInfo.talkSession && myInfo.isAnalyseAllowed) {
                                var j = {data: {talkSession: myInfo.talkSession, state: "ok"}};
                                j.data.statistics = getStatisticData();
                                participantEncryptAgent(CMD.VIEWER_STATISTICS_ACK, j);
                            }
                            break;
                        case CMD.CHECK_VIEWER_IS_EXIST.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                var j = {data: {talkSession: myInfo.talkSession, state: "ok"}};
                                participantEncryptAgent(CMD.VIEWER_IS_EXIST_ACK, j);
                            }
                            break;
                        case CMD.PARTICIPANT_PASS_ACK.cmd:

//                            monsole.log("================================================================= = == = == = = = == =");
//                            monsole.log(j.data.survey);

                            if (j.data.livePinText) {
                                showLivePinText(j.data.livePinText);
                            }

                            if (j.data.state === "ok") {
                                talkObj.isTalkReady = true;
                                toast.success("به اتاق مشاوره متصل شدید ، خوش آمدید");
                                clearParticipantQuestionLock();
                                 resetMediaState();
                                g(".controller_div").classList.remove(hideClass);
                                //*** I comment this line cause of I don't want to show xamp home page in tests
                                //new iframe src is related to last public offer link 
                                if (j.data.lastPublicOfferLink && j.data.lastPublicOfferLink.length > 10) {//&& j.data.lastPublicOfferLink
                                    let u = b64DecodeUnicode(j.data.lastPublicOfferLink);
                                    iframe.src = u.startsWith(myInfo.siteBaseUrl) ? u : myInfo.siteBaseUrl;
                                } else {
                                    iframe.src = myInfo.siteBaseUrl;
                                }
                                if (j.data.supporterVideoSize) {
                                    setVideoSizeFromSupporterCmd(j.data.supporterVideoSize);
                                }
//*** this is commented cause of not impelemted survey and slides this will be uncomment with the below codes                                                                                
                                if (j.data.survey) {
//                                    monsole.log("================================================================= = == = == = = = == =");
//                                    monsole.log(j.data.survey);

                                    getSupporterQuestionArr(j.data.survey);
                                }
                                if (j.data.latestMedia && j.data.latestMedia.media) {
                                    showMediaStorage(j.data.latestMedia.media, false,j.data.latestMedia);
//                                    monsole.log("j.data.latestMedia.media.mimeType : ", j.data.latestMedia);
                                    switch (j.data.latestMedia.media.mimeType) {
                                        case MEDIA_MIME_TYPE.IMAGE.code:
                                            break;
                                        case MEDIA_MIME_TYPE.MOVIE.code:
//                                            hostVideoElem.currentTime = j.data.latestMedia.pointer;
//                                            console.log("j.data.latestMedia.isPause", j.data.latestMedia.isPause);
//                                            if (j.data.latestMedia.isPause) {
//                                                console.log("pause");
//                                                hostVideoElem.pause();
//                                            } else {
//                                                console.log("play");
//                                                hostVideoElem.play();
//                                            }
//                                            showVideoTime();
                                            showVideoDataCmd(j);
                                            break;
                                        case MEDIA_MIME_TYPE.SLIDE.code:
//                                            console.log("j.data.latestMedia.pointer : ", j.data.latestMedia.pointer);
//                                            changeSlidePage(j.data.latestMedia.pointer, slideFileArr);
//                                            slideLatestPageChecked = j.data.latestMedia.pointer;
//                                            hosthostSlideSupporterPageIndex = j.data.latestMedia.pointer;
//                                            hostThisPage = j.data.latestMedia.pointer;
                                            showSlideDataCmd(j);
                                            break;
                                    }
                                }
//                                console.log("setPublicChatMode j.data:",j.data,"j.data.publicchatmode:",j.data.publicchatmode);
                                setPublicChatMode(j.data.publicchatmode);
                                firstCheck.classList.add("hide");
                            }
                            break;
                        case CMD.ACCEPT_VIEWER_TALK.cmd:
                            if (talkObj.talkNumber && j.talkNumber === talkObj.talkNumber && j.data.talkSession === myInfo.talkSession) {
                                startToTalk();
                            }
                            break;
                        case CMD.VIEWER_TALK_END.cmd:
                            if (talkObj.talkNumber && j.data.talkNumber === talkObj.talkNumber) {
                                talkObj.isTalkEnd = true;
                                setEndTalk();
                            }
                            break;
                        case CMD.REMOVE_TALK_REQUEST.cmd:
                            if (j.data.talkSession === myInfo.talkSession) {
                                setTalkState(0);
                                toast.info("کارشناس مشاور شما را از kharidlive انتظار برای گفتگو حذف کرد");
                            }
                            break;
                        case CMD.CLEAN_CHAT_BOX.cmd:
                            cleanChatBox();
                            break;
                        case CMD.VIDEO_SIZE.cmd:
                            //console.log("CMD.VIDEO_SIZE",j);
                            if (j.data.supporterVideoSize) {
                                setVideoSizeFromSupporterCmd(j.data.supporterVideoSize);
                            }
                            break;
                        case CMD.SEND_NEW_SURVEY_TO_VIEWERS.cmd:
                            getSupporterQuestion(j.data);
                            break;
                        case CMD.SEND_SURVEY_ANSWER_TO_SUPPORTER_ACK.cmd:
                            sendAnswerAck(j.receiverId, j.data.questionId)
                            break;
                        case CMD.ACTIVE_AND_DEACTIVE_CHAT.cmd:
                            setPublicChatMode(j.data.publicchatmode);
                            break;
                        case CMD.SEND_HOST_MEDIA_TO_CUSTOMERS.cmd:
                            if (j.data) {
                                showMediaStorage(j.data, false,j.data);
                            }
                            break;
                        case CMD.CHANGE_HOST_MEDIA_STATE.cmd:
                            if (j.data) {
                                changeMediaState(j.data);
                            }
                            break;
                        case CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER_ACK.cmd:
                            if (j.data && j.data.isSuccessful) {
                                toast.success("پیام شما با موفقیت برای کارشناس ارسال شد");
                            } else {
                                toast.success("در هنگام ارسال پیام مشکلی پیش اومده. لطفا دوباره تلاش کنید");
                            }
                            break;
                        case CMD.SEND_LIVE_PIN_TEXT_TO_ALL_USER.cmd:
                            if (j.data) {
                                showLivePinText(j.data.livePinText);
                            }
                            break;
                        case CMD.ACCESS_SEND_VOICE_TO_SERVER_ACK.cmd:
                            if (j.data) {
                                if (j.data) {
                                    accessSendVoiceToServer.sendFile(j.data);
                                }
                            }
                            break;
                        case CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd:
//                            monsole.log("SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER id:", id, "j.data.newsupporterroomid:", j.data.newsupporterroomid);
                            if (id === j.data.newsupporterroomid) {

                                var j = {data: {pass: talkObj.talkPass, talkSession: myInfo.talkSession}};
//                            monsole.log("sendTalkPasswordToSupporter", j);
                                participantEncryptAgent(CMD.SEND_REQUEST_OF_NEW_SUPPORTER_PUBLISHER_ID_BY_VIEWER, j);
                            }
                            break;

                        case CMD.SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD.cmd:

//                            monsole.log("SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD id:", id, "j.data.newsupporterroomid:", j.data.newsupporterroomid, "j:", j);
                            g("#host_media_wrapper").classList.add("hide");
                            if (j.data.state === "ok") {
//                                myInfo.supporterRoomId = j.data.newsupporterroomid;
                                talkObj.isTalkReady = true;
                                myInfo.supporterRoomId = j.data.newsupporterroomid;
                                toast.success("کارشناس در لایو حضور دارد");
                                clearParticipantQuestionLock();
                                 resetMediaState();
                                g(".controller_div").classList.remove(hideClass);
                                //*** I comment this line cause of I don't want to show xamp home page in tests
                                //new iframe src is related to last public offer link 
//                                if (j.data.lastPublicOfferLink && j.data.lastPublicOfferLink.length > 10) {//&& j.data.lastPublicOfferLink
//                                    let u = b64DecodeUnicode(j.data.lastPublicOfferLink);
//                                    iframe.src = u.startsWith(myInfo.siteBaseUrl) ? u : myInfo.siteBaseUrl;
//                                } else {
//                                    iframe.src = myInfo.siteBaseUrl;
//                                }
                                if (j.data.supporterVideoSize) {
                                    setVideoSizeFromSupporterCmd(j.data.supporterVideoSize);
                                }
//*** this is commented cause of not impelemted survey and slides this will be uncomment with the below codes                                                                                
                                if (j.data.survey) {
                                    getSupporterQuestionArr(j.data.survey);
                                }
                                if (j.data.latestMedia && j.data.latestMedia.media) {
                                    showMediaStorage(j.data.latestMedia.media, false,j.data.latestMedia);
//                                    monsole.log("j.data.latestMedia.media.mimeType : ", j.data.latestMedia);
                                    switch (j.data.latestMedia.media.mimeType) {
                                        case MEDIA_MIME_TYPE.IMAGE.code:
                                            break;
                                        case MEDIA_MIME_TYPE.MOVIE.code:
//                                            hostVideoElem.currentTime = j.data.latestMedia.pointer;
//                                            console.log("j.data.latestMedia.isPause", j.data.latestMedia.isPause);
//                                            if (j.data.latestMedia.isPause) {
//                                                console.log("pause");
//                                                hostVideoElem.pause();
//                                            } else {
//                                                console.log("play");
//                                                hostVideoElem.play();
//                                            }
//                                            showVideoTime();
                                            showVideoDataCmd(j);
                                            break;
                                        case MEDIA_MIME_TYPE.SLIDE.code:
//                                            console.log("j.data.latestMedia.pointer : ", j.data.latestMedia.pointer);
//                                            changeSlidePage(j.data.latestMedia.pointer, slideFileArr);
//                                            slideLatestPageChecked = j.data.latestMedia.pointer;
//                                            hosthostSlideSupporterPageIndex = j.data.latestMedia.pointer;
//                                            hostThisPage = j.data.latestMedia.pointer;
                                            showSlideDataCmd(j);
                                            break;
                                    }
                                }
                                //console.log("setPublicChatMode j.data:",j.data,"j.data.publicchatmode:",j.data.publicchatmode);
                                setPublicChatMode(j.data.publicchatmode);
                            }


                            break;
                    }
                }
            }
        }
    } catch (e) {
        monsole.error(e);
    }
}
function showSlideDataCmd(j) {
    if (!participantQuestionLock) {
//        monsole.log("j.data.latestMedia.pointer : ", j.data.latestMedia.pointer);
        changeSlidePage(j.data.latestMedia.pointer, slideFileArr);
        slideLatestPageChecked = j.data.latestMedia.pointer;
        hosthostSlideSupporterPageIndex = j.data.latestMedia.pointer;
        hostThisPage = j.data.latestMedia.pointer;
    } else {
        participantSlideState = j;
    }
}
function showVideoDataCmd(j) {
    if (!participantQuestionLock) {
        hostVideoElem.currentTime = j.data.latestMedia.pointer;
//        monsole.log("j.data.latestMedia.isPause", j.data.latestMedia.isPause);
        if (j.data.latestMedia.isPause) {
//            monsole.log("pause");
            hostVideoElem.pause();
        } else {
//            monsole.log("play");
            hostVideoElem.play();
        }
        showVideoTime();
    } else {
        participantVideoState = j;
    }
}
function showLivePinText(text) {
    let t = {title: 'متن ارسال شده از سمت برگزار کننده'};
    t.body = '<div style="width: 400px;">' +
            `       <p style="padding: 15px 10px">${text}</p>` +
            '    </div>';

    t.control = '<span id="close_pin_text_page" class="button_ctr2 bg-css-red bt">متوجه شدم. صفحه را ببند</span>';
    showDialog(t);

    g("#close_pin_text_page").onclick = () => {
        closeDialog();
    }

    g(".dialog_close").style.display = "none";

}

function setPublicChatMode(publicChatMode) {
    isPublicChatFree = Boolean(publicChatMode);
    if (isPublicChatFree || talkObj.isTalkRightNow) {
        pmDiv.classList.remove(hide);
    } else {
        pmDiv.classList.add(hide);
    }
}
function checkReceivedMsgIsHealthy(j, id) {
    var flag = false, boole = j.cmd && j.userRoomId && ((j.cmd === CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd || j.cmd === CMD.SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD.cmd) || (id === myInfo.supporterRoomId))// || (j.userRoomId === id && id === myInfo.supporterRoomId)
            && j.data && (!j.isDirectional || (j.isDirectional && myInfo.myUserRoomId === j.receiverId));
//    monsole.log("=============== checkReceivedMsgIsHealthy ================ j:", j, "id:", id, "if condition : ", boole);
//    monsole.log("=============== checkReceivedMsgIsHealthy ================ j cmd:", j.cmd, "CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd:", CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd, "j.userRoomId:", j.userRoomId, "id:", id, "myInfo.supporterRoomId:", myInfo.supporterRoomId, "j.data:", j.data, "j.isDirectional:", j.isDirectional, "trio.userRoomId:", trio.userRoomId, "j.receiverId:", j.receiverId, "((j.cmd === CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd||j.cmd === CMD.SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD.cmd) || (j.userRoomId === id && id === myInfo.supporterRoomId)):", ((j.cmd === CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd || j.cmd === CMD.SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD.cmd) || (j.userRoomId === id && id === myInfo.supporterRoomId)), "(!j.isDirectional || (j.isDirectional && trio.userRoomId === j.receiverId)):", (!j.isDirectional || (j.isDirectional && myInfo.myUserRoomId === j.receiverId)));


    if (boole) {
        Object.keys(CMD).some(function (e) {
            var c = CMD[e];
            if (c.cmd === j.cmd) {
                flag = c.isEnc === j.isEnc && c.enc === j.enc;
                return true;
            }
        })
    }
    //    monsole.log("checkReceivedMsgIsHealthy", j, flag);
    return flag;
}
function setPasswordToSupporter() {
    if (!talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
        var j = {data: {pass: talkObj.talkPass, talkSession: myInfo.talkSession}};
        monsole.log("sendTalkPasswordToSupporter", j);
        participantEncryptAgent(CMD.SET_PARTICIPANT_PASS, j);
    } else {
        toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
    }
}
function setTalkState(isSuccessful, j) {
    var talkBtImg = g("img", addRemoveTalkBt);
    if (isSuccessful && j.data.talkNumber) {
        talkBtImg.src = "./i/pending.svg";
        talkObj.isTalkWaitingNow = true;
        talkObj.talkNumber = j.data.talkNumber;
        g("span", talkNumberDiv).textContent = talkObj.talkNumber;
        talkNumberDiv.classList.remove(hide);
    } else {
        talkBtImg.src = "./i/tap.svg";
        talkObj.isTalkWaitingNow = false;
        talkObj.talkNumber = null;
        talkNumberDiv.classList.add(hide);
        toast.info("اگر قبلا در kharidlive انتظار مشاوره بودید از این kharidlive حذف شدید");
    }
}
function setEndTalk() {
    monsole.log("--------------- setEndTalk --------------------");
    talkObj.isTalkEnd = true;
//    trio.destroyServer();
    if (!isPublicChatFree) {
        pmDiv.classList.add(hide);
    }
//    talkNumberDiv.classList.add(hide);
    talkObj.talkNumber = null;
    talkObj.isTalkRightNow = false;
    talkObj.isTalkWaitingNow = false;
//    cleanChatBox();
    toast.info("مشاوره به انتها رسید");

    if (myInfo.userType === USER_TYPE.PARTICIPANT && new Date() * 1 - talkObj.startTime > 60000) {//***18 is for test, 1 minutes 60000 in working mode
        toast.success("به این مشاوره چه امتیازی میدهید ؟");
        setEfficiencyScore(setTalkSession);
    } else {
        setTalkSession(-1)
    }
}

function setTalkSession(score) {
    if (score > 0 && talkObj.isTalkEnd && !talkObj.talkNumber && !talkObj.isTalkRightNow && !talkObj.isTalkWaitingNow) {
        orchesterSend({
            publisherId: myInfo.myUserRoomId,
            duration: Math.floor((new Date() * 1 - talkObj.startTime) / 1000),
            offerQty: talkObj.offerQty,
            score: score
        },
                SERVER_ENDPOINT.SCORE)
    }
    openFavoriteList();
}

function openFavoriteList() {

    resetWhenInDisconnection();

    var j = {notClose: true, title: ' اتمام مشاوره'};
    j.body = '<span> گفتگو به انتها رسید است آیا میخواهید kharidlive محصولات منتخب را مشاهده کنید؟ در غیر اینصورت گزینه دیگری را انتخاب کنید</span>'
    j.control = '<span id="open_favorite_list_bt" class="button_ctr2 bg-css-blue bt">بله نشونم بده</span><br>' +
            '<span id="stay_page_bt" class="button_ctr2 bg-css-green bt">همین جا می مونم</span><br>' +
            '<span id="close_page_bt" class="button_ctr2 bg-css-orangered bt">صفحه را ببندید</span>';
    showDialog(j);

    g("#open_favorite_list_bt").onclick = function () {
        openLinkInCurrentTab("./favorite_list.html");
    }
    g("#stay_page_bt").onclick = function () {
        closeDialog();
        toast.info("داریم سعی می کنیم دوباره به اتاق وصل بشید");
        connectAgain();
    }
    g("#close_page_bt").onclick = function () {
        getBackToProfile();
    }
}
function startToTalk() {
    closeDialog();
    var t1 = new Date() * 1;
    var j = {title: ' تا 7 ثانیه گفتگو کردن با کارشناس را تایید کنید'};
    j.control = '<span id="talk_apply_bt" class="button_ctr2 bg-css-green bt">شروع به گفتگو</span>';
    showDialog(j);
    g("#talk_apply_bt").onclick = function () {
        if (((new Date() * 1) - t1) < 7500) {
            //            trio.publishOwnFeed(true);
            pmDiv.classList.remove(hide);
            //messageAntiDuplicate.clear();
            var j = {data: {state: "ok", talkNumber: talkObj.talkNumber, talkSession: myInfo.talkSession}};
            participantEncryptAgent(CMD.ACCEPT_VIEWER_TALK_ACK, j);
            talkObj.isTalkRightNow = true;
            talkObj.isTalkWaitingNow = false;
            talkObj.startTime = new Date() * 1;
            talkObj.offerQty = 0;
            //            talkObj.score=-1;
            g("img", addRemoveTalkBt).src = "./i/tap.svg";
            talkNumberDiv.classList.add(hide);

            trio.publishOwnFeed(true, talkObj.videoAllowed);

        } else {
            toast.error("تایید کردن گفتگو بیشتر از 7 ثانیه طول کشید و درخواست رد شد");
        }
        closeDialog();
    }
}
function setTalkRequestToSupporter(videoAllowed) {
    talkObj.videoAllowed = false;
    toast.info("درخواست گفتگو در حال بررسی است و ممکن است کمی طول بکشد لطفا صبور باشید");
    if (!talkObj.isTalkWaitingNow) {
        if (talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
            var statistics = getStatisticData();
            if (statistics) {
                var qty = 0, time = 0;
                statistics.forEach(function (e) {
                    qty++;
                    time += e[4];
                });
                talkObj.videoAllowed = videoAllowed;
                var j = {data: {viewerUsername: myInfo.viewerUsername, talkSession: myInfo.talkSession, itemCount: qty, totalDuration: time * 1000, userType: myInfo.userType}};
                monsole.log("sendTalkPasswordToSupporter", j);
                participantEncryptAgent(CMD.SET_TALK_REQUEST, j);
            } else {
                toast.info("لطفا ابتدا از صفحات محصول در سایت بازدید کنید و چنانچه نیاز به مشاوره بود درخواست گفتگو دهید");
            }
        } else {
            toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
        }
    } else {
        toast.error("در حال حاضر شما در kharidlive انتظار مشاوره هستید لطفا منتظر بمانید تا برای مشاوره انتخاب شوید");
    }
}
function removeTalkRequestToSupporter() {
    if (talkObj.isTalkWaitingNow) {
        if (talkObj.isTalkReady && talkObj.talkPass && talkObj.talkPass.length > 20) {
            var j = {data: {talkSession: myInfo.talkSession}};
            monsole.log("sendTalkPasswordToSupporter", j);
            participantEncryptAgent(CMD.REMOVE_TALK_REQUEST, j);
        } else {
            toast.error("رمز عبور مخصوص مکالمه ساخته نشده لطفا دوباره وارد اتاق مشاوره شوید");
        }
    } else {
        toast.error("در حال حاضر شما در kharidlive انتظار مشاوره قرار ندارید");
    }
}
function participantEncryptAgent(...o) {
    //function participantEncryptAgent(o) {
    try {
        monsole.log("participantEncryptAgent ...o:", o);
        var obj = {};
        o.forEach(function (e) {
            //            obj = {...obj, ...e};
            monsole.log("o.forEach e: ", e);
            obj = Object.assign(obj, e);
        });
        if (obj.data) {
            obj.data.z = 9;
            obj.supporterroomid = myInfo.supporterRoomId;
            monsole.log("participantEncryptAgent obj before encryption: ", obj);
            obj.data = JSON.stringify(obj.data);
            monsole.log("participantEncryptAgent obj before encryption and after stringify: ", obj);
            if (obj.isEnc) {
                //                monsole.log("participantEncryptAgent obj.data:", obj);
                if (obj.enc === "rsa") {
                    obj.data = rsaEncrypt(obj.data);
                } else if (obj.enc === "rc4") {
                    obj.data = b64EncodeUnicode(rc4(talkObj.talkPass, obj.data));
                } else {
                    obj.data = null;
                }
            }
            if (obj.data) {
                monsole.log("participantEncryptAgent obj after encryption:", obj);
                trio.sendDataChannel(obj);
            }
        }
    } catch (e) {
        monsole.error(e);
    }
}
function resetWhenInDisconnection() {

// 435 error
// https://github.com/meetecho/janus-gateway/issues/452
    //    trio.unpublishOwnFeed();

    g(".controller_div").classList.add(hideClass);

    talkObj.isTalkRightNow = false;
    talkObj.isTalkWaitingNow = false;
    talkObj.startTime = new Date() * 1;
    talkObj.offerQty = 0;
    talkObj.score = -1;
    talkObj.isTalkReady = false;
    talkObj.talkNumber = null;
    talkObj.isTalkEnd = false;
    talkObj.startTime = null;
    talkObj.videoAllowed = false;

    if (!isPublicChatFree) {
        pmDiv.classList.add(hide);
    }
    g("img", addRemoveTalkBt).src = "./i/tap.svg";
    talkNumberDiv.classList.add(hide);
    customerVideo.classList.add(hide);
    currentParticipantRoomId = -1;
    myInfo.isSupporterConnected = false;
    myInfo.isConnected = false;
//    currentParticipant = null;

//    participantIds = [];

}
//============================================ message send / receive ================================== END

//var supporterAliveInterval, supporterAliveTime = new Date() * 1;
//supporterAliveInterval = setInterval(function () {
//    if (supporterAliveTime + 20000 < new Date() * 1) {
//        monsole.log("---------------------- supporterAliveInterval --------------------");
//        //*** uncomment in production
//        clearInterval(supporterAliveInterval);
//        if (nameEnteredMode > 0) {
//            trio.destroyServer();
//            if (!talkObj.isTalkEnd) {
//                getBackToProfile(" ارتباط کارشناس مشاور قطع شد و اتاق نا معتبر است، لطفا از اتاق خارج شوید و زمانی که کارشناس مجددا لایو را برگزار کرد وارد اتاق شوید");
//            }
//        }
//    }
//}, 15000);


//*** for test 
//firstCheck.classList.add("hide");

//*** below lines is for test deploymet of videoroom
//function checkParams() {
//        var c = {};
//                c = {
//                
//                    host: "https://stream.kharidlive.ir:9443/live",
//                    roomId: "1234",
//                    token: "token",
//                    pin: "pin",
//                    maxCap: 2,
//                isPublisher: false,
//                isSupporter: false,
//                    videoElems: [g("#supporter_video video"), g("#customer_video video")],
//                    videoRoomCallback: function(){monsole.log("0000000000 CallBack videoRoomCallback")},
//                    videoElemCallback: function(){monsole.log("0000000000 CallBack videoElemCallback")},
//                    sendMsgCallback: function(){monsole.log("0000000000 CallBack sendMsgCallback")},
//                    receiveMsgCallback: function(){monsole.log("0000000000 CallBack receiveMsgCallback")},
//                    outOfCapacityRoomCallback: function(){monsole.log("0000000000 CallBack outOfCapacityRoomCallback")},
//                    participantCounterCallback: function(){monsole.log("0000000000 CallBack participantCounterCallback")},
//                    peerConnectionCallback: function(){monsole.log("0000000000 CallBack peerConnectionCallback")},
//                    lostConnectionCallback: function(){monsole.log("0000000000 CallBack lostConnectionCallback")}
//                }
//     
//            trio = startLive(c);
//        
//}

checkParams();