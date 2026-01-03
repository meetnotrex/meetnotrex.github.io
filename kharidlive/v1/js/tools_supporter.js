var SERVER_ENDPOINT = Object.freeze({
    SET_STATISTICS_DATA: "/statistics",
    SET_RSA_AND_PUBLISHER_ID: "/keyandid",
    KICK_USER: "/kick",
    BAN_USER: "/ban",
    END_LIVE: "/end",
    SET_TALK_SESSION: "/settalksession",
});
var supporterCrypt = new JSEncrypt();
supporterCrypt.getKey();

function rsaDecrypt(msg) {
    return supporterCrypt.decrypt(msg);
}
function rsaEncryptMsg(msg) {
    return supporterCrypt.encrypt(msg);
}

var trio, currentExistCustomerTalkSession;
var participantIds = [];
var firstCheck = g("#first_check")//, firstCheckTxt = g("#first_check p");
//var videoElems = [g("#supporter_video video"), g("#customer_video video")];
var myInfo = {isConnected: false, isChangingVideo: false};
var previousSupporterRoomId;
var checkParamsLock = false;
function checkParams() {
    if (checkParamsLock) {
        toast.info("لطفا صبور باشید تا بررسی ها انجام شود");
    } else {
        checkParamsLock = true;
        var c = {};
        var urlParam = window.location.hash;
        if (urlParam && urlParam.length > 10 && urlParam.startsWith('#')) {
            urlParam = b64DecodeUnicode(urlParam.substr(1));
            if (urlParam) {
                urlParam = new URLSearchParams(urlParam);

                var rsaPriv = urlParam.get("rsapriv");
                if (rsaPriv && rsaPriv.trim().length > 50) {
                    rsaPriv = b64DecodeUnicode(rsaPriv);
                    supporterCrypt.setPrivateKey(rsaPriv);
                } else {
                    supporterCrypt.getKey();
                }
                myInfo.supporterRsaPublicKey = supporterCrypt.getPublicKey();

                myInfo.siteId = Number(urlParam.get("siteid"));
                myInfo.supporterId = Number(urlParam.get("supporterid"));
                myInfo.talkSession = urlParam.get("talksession");
                myInfo.serverSession = urlParam.get("serversession");
                myInfo.userType = Number(urlParam.get("usertype"));
                myInfo.siteBaseUrl = urlParam.get("baseurl");
                myInfo.endpoint = urlParam.get("endpoint");
                myInfo.supporterName = urlParam.get("supportername");

                myInfo.isAnalyseAllowed = urlParam.get("aa") === "true"; // analyseAllowed

                g("#supporter_video .name").textContent = myInfo.supporterName;

                c = {
                    host: urlParam.get("host"),
                    roomId: urlParam.get("roomid"),
                    token: urlParam.get("token"),
                    pin: urlParam.get("pin"),
                    maxCap: Number(urlParam.get("cap")),
                    isPublisher: true,
                    isSupporter: true,
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
                myInfo.roomId = c.roomId;
            }
        }
        if (myInfo.siteId && myInfo.supporterId && myInfo.supporterRsaPublicKey && myInfo.talkSession && myInfo.serverSession &&
                myInfo.userType === USER_TYPE.SUPPORTER && c.host && c.roomId && c.token && c.pin && c.maxCap && myInfo.siteBaseUrl === location.origin) {
            trio = startLive(c);
            if (!myInfo.isAnalyseAllowed) {
                g("#visited_bt").classList.add(hide);
            }
            //*** uncomment in production
            removeHash();
        } else {
            toast.error("اطلاعات ورود به اتاق کامل نیست لطفا مجدد برای ورود اقدام فرمایید");
        }
    }
}

function lostConnectionCallback() {
    if (myInfo.isConnected && !myInfo.isChangingVideo) {
        myInfo.isConnected = false;
//        getBackToProfile("ارتباط با اتاق قطع شد اینترنت خود را چک کنید");
        toast.error("ارتباط با اتاق قطع شد اینترنت خود را چک کنید");
    }
}
//function peerConnectionCallback(isOn, remoteFeed) {
//    monsole.log("============== peerConnectionCallback isOn? ==============", isOn);
//}
function peerConnectionCallback(id) {
    monsole.log("============== peerConnectionCallback ============== id: ", id);
    updateNewSupporterPublisherId(id);
}
function updateNewSupporterPublisherId(id) {
    setTimeout(function () {
        if (!participantIds.includes(id)) {
            var j = {receiverId: id, data: {newsupporterroomid: myInfo.supporterRoomId}};
            supporterEncryptAgent(CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER, j);
        }
    }, 7000);
}
function videoRoomCallback(myId) {
    monsole.log("============== videoRoomCallback I'm joined successfully ==============", "myId:" + myId);
    if (myId) {
        myInfo.supporterRoomId = myId;
        var j = {rsaKey: b64EncodeUnicode(myInfo.supporterRsaPublicKey), rsaPriv: b64EncodeUnicode(supporterCrypt.getPrivateKey()), supporterRoomId: myInfo.supporterRoomId};
        orchesterSend(j, SERVER_ENDPOINT.SET_RSA_AND_PUBLISHER_ID, function (isSent, result) {
            if (isSent && result && result.status === "ok") {
                toast.success("به اتاق مشاوره متصل شدید ، خوش آمدید");
                //                *** I comment this line cause of I don't want to show xamp home page in tests
                iframe.src = myInfo.siteBaseUrl;
                if (result.msg) {
                    toast.success(result.msg);
                }
                firstCheck.classList.add("hide");
//                myInfo.isConnected = true;

//                webcamScreenMode = 2;
//                switchWebcamScreen();

//                    var j = {receiverId: id, data: {newsupporterroomid: myInfo.supporterRoomId}};
//    supporterEncryptAgent(CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER, j);
                startIntervals();
            } else {
                toast.error("ارسال اطلاعات به سرور با خطا روبرو شد لطفا اتصال اینترنت خود را چک کنید و دوباره به برگزاری لایو اقدام فرمایید");
                destroySession();
            }
        });

    } else {
        toast.error("بدرستی به اتاق متصل نشدید لطفا دوباره برای ورود به اتاق اقدام فرمایید");
    }
}
//function destroySession() {
//    trio.destroyServer();
//    orchesterSend({}, SERVER_ENDPOINT.END_LIVE);
//    getBackToProfile();
//
//}
function destroySession() {
    orchesterSend({}, SERVER_ENDPOINT.END_LIVE, function (isSent, result) {
        if (isSent && result) {//&&result.status==="ok"
            if (result.msg) {
                if (result.status === "ok") {
                    toast.success(result.msg);
                } else {
                    toast.err(result.msg);
                }
            }
            if (result.func) {
                window[result.func]();
            }
            //            destroySessionCallBack();
        }
    });
}
function destroySessionCallBack() {
    trio.destroyServer();
    getBackToProfile();
}

var currentParticipantRoomId = -1;
var isConnectionChecked = false;
function videoElemCallback(isLocalStream, isGone, remoteFeed) {
    monsole.log("============== videoElemCallback ============== supporter ", "isLocalStream:" + isLocalStream, "isGone:" + isGone, "remoteFeed:", remoteFeed);
    var isSupporterJoined = remoteFeed ? remoteFeed.rfdisplay === "s" : true;
    var id = remoteFeed ? remoteFeed.rfid : 0;
    if (isGone && remoteFeed && remoteFeed.detached && id === previousSupporterRoomId) {
        myInfo.isConnected = false;
    }
    if (!isGone) {
        monsole.log("---------------- supporter joined : myInfo.supporterRoomId:", myInfo.supporterRoomId, "isSupporterJoined:", isSupporterJoined, "myInfo.userType:", myInfo.userType, "USER_TYPE.SUPPORTER:", USER_TYPE.SUPPORTER, "myInfo.userType===USER_TYPE.SUPPORTER:", myInfo.userType === USER_TYPE.SUPPORTER, "id:", id, "myInfo.isConnected:", myInfo.isConnected, "isConnectionChecked:", isConnectionChecked);
        if (remoteFeed && isConnectionChecked && myInfo.isConnected && isSupporterJoined && myInfo.userType === USER_TYPE.SUPPORTER && id && id !== previousSupporterRoomId) {
            monsole.log("---------------- supporter joined condition is true");
            toast.error("اگر هم اکنون به عنوان کارشناس در لایو حضور دارید ابتدا صفحه لایو قبلی را ببندید اگر نه دوباره وارد شوید");
            destroySessionCallBack();
        } else {
            isConnectionChecked = true;
        }
        if (id) {
            previousSupporterRoomId = id;
        }

        if ((amICustomer && (isLocalStream || (isTalkRightNow && isSupporterJoined) || (!isSupporterJoined && (currentParticipantRoomId === -1 || currentParticipantRoomId === id)))) ||
                (!amICustomer && id && currentParticipant && id === currentParticipant.userRoomId) ||
                (!amICustomer && id && previousActiveParticipant && id === previousActiveParticipant.userRoomId)) {
            currentParticipant = previousActiveParticipant;
            customerVideo.classList.remove(hide);
            currentParticipantRoomId = isLocalStream ? -1 : remoteFeed.rfid;
            //            cleanChatBox();
        }
    }
    if (localStream) {
        setTimeout(() => {
            Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
        }, 2000);
    }
//    else if(isGone&&!isSupporterJoined){
//                   participantIds = participantIds.filter(function (e) {
//                return e !== id;
//            });
//            removeInArray(viewerTalkInfo, "userRoomId", id);
//        
//    }
}
function sendMsgCallback(msg, isMyOwn) {
    //    monsole.log("============== sendMsgCallback ==============", "msg:", msg, "isMyOwn:", isMyOwn);
}
function receiveMsgCallback(msg, id) {
    monsole.log("============== receiveMsgCallback ==============", "msg:", msg, "isMyOwn:", id);
    processReceivedMsg(msg, id);
}
function outOfCapacityRoomCallback() {
    monsole.log("============== outOfCapacityRoomCallback ==============");
}
function participantCounterCallback(id, isJoin) {
    monsole.log("============== participantNumber:", "isJoin", isJoin, "id", id);
    if (id) {
//        if (isJoin && !participantIds.includes(id)) {
//            participantIds.push(id);
//            ////            if(previusViewerTalkInfo&&previusViewerTalkInfo.userRoomId!==id){
//            ////                previusViewerTalkInfo=null;
//            ////            }else{
//            ////                viewerTalkInfo.push(previusViewerTalkInfo);
//            ////            }
//        } else 
        if (!isJoin && participantIds.includes(id)) {
            ////            previusViewerTalkInfo = findInArray(viewerTalkInfo, "userRoomId", id);
            //            viewerTalkInfo = removeInArray(viewerTalkInfo, "userRoomId", id);
            talkWaitingQueue = removeInArray(talkWaitingQueue, "userRoomId", id);
            participantIds = participantIds.filter(function (e) {
                return e !== id;
            });
            setTalkQueueQty();
            if (currentParticipant && currentParticipant.userRoomId === id) {
                currentParticipant = null;
                customerVideo.classList.add(hide);
                currentParticipantRoomId = -1;
                toast.error("ارتباط مشتری جاری قطع شد");
                cleanChatBox();
                setTalkSession();
            }

        }
    }
}
var talkWaitingQueue = [];
// this is who talking right now with supporter
var viewerTalkInfo = [];
////var previusViewerTalkInfo;
function processReceivedMsg(j, id) {
    try {
        j = JSON.parse(j);
        monsole.log("processReceivedMsg: ", j, id);
        if (checkReceivedMsgIsHealthy(j, id)) {
            if (j.isEnc) {
                if (j.enc === "rsa") {
                    j.data = rsaDecrypt(j.data);
                } else if (j.enc === "rc4") {
                    var viewer = findInArray(viewerTalkInfo, "userRoomId", id);
                    j.data = viewer ? rc4(viewer.pass, b64DecodeUnicode(j.data)) : null;
                }
            }
            monsole.log("processReceivedMsg: after rc4 decryption : ", j, id);
            if (j.data) {
                j.data = JSON.parse(j.data);
                if (j.data.z === 9) {
                    switch (j.cmd) {
                        //                        case CMD.PUBLIC_MSG.cmd:
                        case CMD.PRIVATE_MSG.cmd:
                            if (isCurrentParticipant(id, j) || publicChatMode) {
                                writeMsgToChatList(j);
                            }
                            break;
                        case CMD.MSG_ACK.cmd:
                            //                            monsole.log("+++++++++++++++++++++++ CMD.MSG_ACK.cmd +++++++++ currentMyMsg",currentMyMsg);
                            if (isCurrentParticipant(id, j)) {
                                ackMsgCallback(j);
                            }
                            break;
                        case CMD.REMOVE_TALK_REQUEST.cmd:
                            removeTalkWaitingQueue(j.data);
                            break;
                        case CMD.SET_TALK_REQUEST.cmd:
                            setTalkWaitingQueue(j.data, id);
                            break;
                        case CMD.VIEWER_STATISTICS_ACK.cmd:
                            if (isCurrentParticipant(id, j)) {
                                viewerStatisticsAck(j.data);
                            }
                            break;
                        case CMD.VIEWER_IS_EXIST_ACK.cmd:
                            viewerIsExistAck(j.data);
                            break;
                        case CMD.SET_PARTICIPANT_PASS.cmd:
                            monsole.log("++++++++++++++++++++++++++ CMD.SET_PARTICIPANT_PASS.cmd", j);
                            // {userRoomId:xxx-xx-xxxx, isRsa:true, cmd: CMD.SET_PARTICIPANT_PASS, data:{pass: talkPass, talkSession: myInfo.talkSession}}
                            if (currentParticipant && currentParticipant.talkSession == j.data.talkSession) {
                                toast.error("مخاطب در حال گفتگو می خواهد در صفحه دیگری گفتگو را ببیند برای همین صفحه ای که در آن با شما گفتگو می کرد نا معتبر است و بسته می شود");
                            }
                            if (j.data.pass && j.data.talkSession) {
                                var previousParticipant = findInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                                if (previousParticipant) {
                                    participantIds = participantIds.filter(function (e) {
                                        return e !== previousParticipant.userRoomId;
                                    });
                                    //if viewer is duplicat, so old version will be removed 
                                    orchesterSend({publisherId: previousParticipant.userRoomId}, SERVER_ENDPOINT.KICK_USER);
                                }
                                viewerTalkInfo = removeInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                                j.data.userRoomId = id;
                                participantIds.push(id);
                                viewerTalkInfo.push(j.data);
                                var res = {
                                    receiverId: id, data: {
                                        talkSession: j.data.talkSession, state: "ok", supporterVideoSize: supporterVideoSize,
                                        lastPublicOfferLink: b64EncodeUnicode(lastPublicOfferLink),
                                        publicchatmode: publicChatMode,
//*** this is commented cause of not impelemted survey and slides this will be uncomment with the below codes 
                                        survey: getPreviousQuestion(),
                                        latestMedia: {
                                            media: mediaHistory.latestMediaData,
                                            pointer: (mediaHistory.latestMediaData && mediaHistory.latestMediaData.mimeType === MEDIA_MIME_TYPE.MOVIE.code) ? hostVideoElem.currentTime :
                                                    (mediaHistory.history[mediaHistory.latestMediaName]) ? mediaHistory.history[mediaHistory.latestMediaName].pointer : null,
                                            isPause: (hostVideoElem && hostVideoElem.paused) ? true : false
                                        },
                                        livePinText: (LIVE_PIN_TEXT.allowToSend) ? LIVE_PIN_TEXT.text : false
                                    }
                                };
//                                console.log(res.data.latestMedia.isPause);
                                supporterEncryptAgent(CMD.PARTICIPANT_PASS_ACK, res);
                            }
                            break;
                        case CMD.ACCEPT_VIEWER_TALK_ACK.cmd:
                            if (isCurrentParticipant(id, j)) {
                                talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", currentParticipant.talkSession);
                                setTalkQueueQty();
                                g("#customer_video .name").textContent = currentParticipant.viewerUsername;
                                toast.success("مشتری با شماره " + currentParticipant.talkNumber + " به گفتگو پیوست");
                                clearTalkLock();
                                closeDialog();
                            } else {
                                toast.info("");
                            }
                            break;
//                        case CMD.SEND_SURVEY_ANSWER_TO_SUPPORTER.cmd:
//
//                            let formData = new FormData();
//                            formData.append("supporterId", myInfo.supporterId || 0);
//                            formData.append("siteId", myInfo.siteId || 0);
//                            formData.append("serverSession", myInfo.serverSession || "");
//                            formData.append("talkSession", myInfo.talkSession || "");
//                            formData.append("surveyAnswer", j.data["answer"] || "");
//                            formData.append("surveyId", j.data["questionId"] || 0);
//                            formData.append("username", j.data["userStringId"] || "");
//                            let pathUrl = `${hostServerAddress}/supporter/insert-survey-answer`;
//
//
//                            requestSender(pathUrl, formData, "POST", (res) => {
//                                console.log("=====================================================================");
//                                console.log("new answer");
//                                console.log(res);
//                            });
//
//                            updateQuestionAnswer(j.data, id);
//                            break;

                        case CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER.cmd:
                            if (j.data) {
                                let newMediaQuestionObj = {
                                    userName: j.data.userName,
                                    questionDateTime: getDateTime(),
                                    questionType: j.data.questionType.code,
                                    questionPointer: j.data.questionPointer,
                                    questionTextContent: j.data.questionText,
                                    fileAddress: j.data.fileAddress,
                                    fileName: j.data.fileName
                                };
                                let validator = isInputValidate(newMediaQuestionObj.questionTextContent);
                                if (validator && validator[0] && (!Array.isArray(newMediaQuestionObj.fileAddress) && (newMediaQuestionObj.fileAddress.startsWith(fileServerAddress)) ||
                                        newMediaQuestionObj.fileAddress[newMediaQuestionObj.questionPointer].startsWith(fileServerAddress))) {


                                    let formData = new FormData();
                                    formData.append("supporterId", myInfo.supporterId || 0);
                                    formData.append("siteId", myInfo.siteId || 0);
                                    formData.append("serverSession", myInfo.serverSession || "");
                                    formData.append("talkSession", myInfo.talkSession || "");
//                                formData.append("question", j.data["questionText"] || "");
//                                formData.append("fileName", j.data["fileName2"] || "");
                                    formData.append("json", JSON.stringify(newMediaQuestionObj));
                                    formData.append("roomId", myInfo.roomId);
                                    let pathUrl = `${hostServerAddress}/supporter/insert-media-question`;

                                    requestSender(pathUrl, formData, "POST", (res) => {
                                        monsole.log(res);
                                    });
                                    mediaQuestionArr.push(newMediaQuestionObj);

                                    supporterEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER_ACK, {
                                        receiverId: id,
                                        data: {isSuccessful: j.data ? true : false}
                                    });
                                } else {
                                    supporterEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER_ACK, {
                                        receiverId: id,
                                        data: {isSuccessful: false}
                                    });
                                }
                            } else {
                                supporterEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER_ACK, {
                                    receiverId: id,
                                    data: {isSuccessful: false}
                                });
                            }
                            break;
//                        case CMD.ACCESS_SEND_VOICE_TO_SERVER.cmd :
//
//                            if (j.data) {
//                                let formData = new FormData();
//                                formData.append("supporterId", myInfo.supporterId || 0);
//                                formData.append("siteId", myInfo.siteId || 0);
//                                formData.append("serverSession", myInfo.serverSession || "");
//                                formData.append("talkSession", myInfo.talkSession || "");
//                                formData.append("username", j.data["username"] || "");
//                                formData.append("userTalkSession", j.data["userTalkSession"] || "");
//                                formData.append("fileSize", j.data["fileSize"] || 0);
//                                let pathUrl = `${hostServerAddress}/media-question/voice/access-request`;
//
//                                requestSender(pathUrl, formData, "POST", (res) => {
//
//                                    let j = {
//                                        receiverId: id,
//                                        data: {
//                                            success: res.success,
//                                            token: res.token,
//                                            expireTime: res.expireTime,
//                                            serverAddress: hostServerAddress
//                                        }
//                                    }
//                                    supporterEncryptAgent(CMD.ACCESS_SEND_VOICE_TO_SERVER_ACK, j);
//                                })
//                            }
//                            break;
                        case CMD.SEND_REQUEST_OF_NEW_SUPPORTER_PUBLISHER_ID_BY_VIEWER.cmd:

                            if (j.data.pass && j.data.talkSession) {
                                var previousParticipant = findInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                                if (previousParticipant) {
                                    participantIds = participantIds.filter(function (e) {
                                        return e !== previousParticipant.userRoomId;
                                    });
//                                    //if viewer is duplicat, so old version will be removed 
//                                    orchesterSend({ publisherId: previousParticipant.userRoomId }, SERVER_ENDPOINT.KICK_USER);
                                }
                                viewerTalkInfo = removeInArray(viewerTalkInfo, "talkSession", j.data.talkSession);
                                j.data.userRoomId = id;
                                viewerTalkInfo.push(j.data);
                                participantIds.push(id);

                                var res = {
                                    receiverId: id, data: {
                                        talkSession: j.data.talkSession, state: "ok", supporterVideoSize: supporterVideoSize,
                                        publicchatmode: publicChatMode, newsupporterroomid: myInfo.supporterRoomId //lastPublicOfferLink: b64EncodeUnicode(lastPublicOfferLink),
//*** this is commented cause of not impelemted survey and slides this will be uncomment with the below codes 
                                        , survey: getPreviousQuestion(),
                                        latestMedia: {
                                            media: mediaHistory.latestMediaData,
                                            pointer: (mediaHistory.latestMediaData && mediaHistory.latestMediaData.mimeType === MEDIA_MIME_TYPE.MOVIE.code) ? hostVideoElem.currentTime :
                                                    (mediaHistory.history[mediaHistory.latestMediaName]) ? mediaHistory.history[mediaHistory.latestMediaName].pointer : null,
                                            isPause: (hostVideoElem && hostVideoElem.paused) ? true : false
                                        }
                                    }
                                };
//                                console.log(res.data.latestMedia.isPause);
                                supporterEncryptAgent(CMD.SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD, res);
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
function isCurrentParticipant(id, j) {
    return currentParticipant && id && j && j.data && currentParticipant.userRoomId === id && currentParticipant.talkSession === j.data.talkSession;
}

function checkReceivedMsgIsHealthy(j, id) {
    var flag = false;
    var boole = j.cmd && j.supporterroomid && ((j.cmd === CMD.SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER.cmd || j.cmd === CMD.SEND_REQUEST_OF_NEW_SUPPORTER_PUBLISHER_ID_BY_VIEWER.cmd) || j.supporterroomid === myInfo.supporterRoomId) && j.data;
//    monsole.log(" -=-=-==-=-=-=--=  checkReceivedMsgIsHealthy id:", id, "j:", j, "condition:", boole);
    if (boole) {//&& j.userRoomId === id
        Object.keys(CMD).some(function (e) {
            var c = CMD[e];
            if (c.cmd === j.cmd) {
                flag = c.isEnc === j.isEnc && c.enc === j.enc;
                return true;
            }
        })
    }
    return flag;
}

function removeTalkWaitingQueue(data) {
    if (data.talkSession) {
        var viewer = findInArray(viewerTalkInfo, "talkSession", data.talkSession);
        if (viewer) {
            var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
            var j = {receiverId: waitViewer.userRoomId, data: {talkSession: data.talkSession}};
            if (waitViewer) {
                j.data.state = "remove";
                talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", data.talkSession);
                setTalkQueueQty();
            } else {
                j.data.state = "error";
                j.data.msg = "شما در kharidlive انتظار مشاوره قرار نگرفته اید";
            }
            supporterEncryptAgent(CMD.TALK_RESPONSE_ACK, j);
        }
    }
}
function setTalkWaitingQueue(data, id) {
    if (data.talkSession) {
        var viewer = findInArray(viewerTalkInfo, "talkSession", data.talkSession);
        if (viewer) {
            var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
            var j = {data: {talkSession: data.talkSession}};
            if (waitViewer) {
                j.data.state = "exist";
                j.data.talkNumber = waitViewer.talkNumber;
                j.receiverId = waitViewer.userRoomId;
            } else {
                data.time = new Date() * 1;
                data.talkNumber = talkNumber++;
                data.userRoomId = viewer.userRoomId;
                j.data.state = "ok";
                j.data.talkNumber = data.talkNumber;
                j.receiverId = id;
                talkWaitingQueue.push(data);
                setTalkQueueQty();
            }
            supporterEncryptAgent(CMD.TALK_RESPONSE_ACK, j);
        }
    }
}
function removeTalkRequestToCustomer(talkSession) {
    if (talkSession) {
        var waitViewer = findInArray(talkWaitingQueue, "talkSession", talkSession);
        if (waitViewer) {
            talkWaitingQueue = removeInArray(talkWaitingQueue, "talkSession", talkSession);
            setTalkQueueQty();
            var j = {receiverId: waitViewer.userRoomId, data: {talkSession: talkSession}};
            supporterEncryptAgent(CMD.REMOVE_TALK_REQUEST, j);
            toast.info("درخواست گفتگوی مشتری به شماره " + waitViewer.talkNumber + " حذف شد");
            closeDialog();
        } else {
            toast.error("مشتری موجود نیست احتمالا مشتری از مکالمه منصرف شده است");
        }
    }
}
function setTalkQueueQty() {
    if (talkWaitingQueue.length > 0) {
        talkQueueQty.classList.remove(hide);
    } else {
        talkQueueQty.classList.add(hide);
    }
    talkQueueQty.textContent = talkWaitingQueue.length;
}
function checkViewerStatistics(talkSession) {
    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
    if (viewer && viewer.pass) {
        var j = {receiverId: viewer.userRoomId, data: {talkSession: talkSession}};
        monsole.log("checkViewerStatistics", viewer, j);
        supporterEncryptAgent(CMD.VIEWER_STATISTICS_REQUEST, j);
    } else {
        toast.error("این بیننده در kharidlive شما موجود نیست");
    }
}
function viewerStatisticsAck(data) {
    if (currentParticipant.talkSession === data.talkSession && data.state === "ok") {
        //data.statistics = [[hash,link,title,image,totalTime,days],...]
        visitedItemList = data.statistics;
        receiveStatisticsResponse();
        monsole.log(" viewerStatisticsAck ", data);
    }
}
function checkViewerIsExist(talkSession) {
    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
    if (viewer && viewer.pass) {
        currentExistCustomerTalkSession = talkSession;
        var j = {receiverId: viewer.userRoomId, data: {talkSession: talkSession}};
        monsole.log("checkViewerIsExist", viewer, j);
        supporterEncryptAgent(CMD.CHECK_VIEWER_IS_EXIST, j);
        toast.info("درخواست بررسی حضور مشتری در اتاق ارسال شد اگر پاسخی دریافت نشد مشتری حضور ندارد");
    } else {
        toast.error("این بیننده در kharidlive شما موجود نیست و میتوانید آنرا حذف کنید");
    }
}
function viewerIsExistAck(data) {
    if (currentExistCustomerTalkSession && currentExistCustomerTalkSession === data.talkSession && data.state === "ok") {
        monsole.log(" viewerIsExistAck ", data.talkSession, data.state);
        var waitViewer = findInArray(talkWaitingQueue, "talkSession", data.talkSession);
        toast.success("مشتری در انتظار گفتگو با شماره " + waitViewer.talkNumber + " در اتاق حضور دارد");
    }
    currentExistCustomerTalkSession = null;
}
//var kickParticipantTimeout ;
function endParticipantTalk() {
    if (currentParticipant) {
        setTalkSession();
        var j = {receiverId: previousActiveParticipant.userRoomId, data: {talkSession: previousActiveParticipant.talkSession, talkNumber: previousActiveParticipant.talkNumber}};
        supporterEncryptAgent(CMD.VIEWER_TALK_END, j);
        // if current participant not closed their
        //        kickParticipantTimeout=setTimeout(function(){
        //          if(currentParticipant){
        //              
        //          }
        //        },5000)
    } else {
        toast.error("اطلاعات مخاطب جاری گفتگو پیدا نشد");
    }
}

function supporterEncryptAgent(...o) {
    //function supporterEncryptAgent(o) {
    try {
        monsole.log("supporterEncryptAgent ...o:", o);
        var obj = {};
        o.forEach(function (e) {
            //            obj = {...obj, ...e};
            monsole.log("o.forEach e: ", e);
            obj = Object.assign(obj, e);
        });
        monsole.log("supporterEncryptAgent obj total:", obj);
        if (obj.data) {
            obj.data.z = 9;
            monsole.log("supporterEncryptAgent obj before encryption: ", obj);
            var talkSession = obj.data.talkSession;
            obj.data = JSON.stringify(obj.data);
            monsole.log("supporterEncryptAgent obj before encryption and after stringify: ", obj);
            if (obj.isEnc) {
                if (obj.enc === "rsa") {
                    obj.data = rsaEncrypt(obj.data);
                } else if (obj.enc === "rc4" && talkSession) {
                    //                    monsole.log("supporterEncryptAgent obj total:", obj);
                    var viewer = findInArray(viewerTalkInfo, "talkSession", talkSession);
                    //                    monsole.log("supporterEncryptAgent viewer:", viewer, "talkSession ", talkSession);
                    obj.data = viewer ? b64EncodeUnicode(rc4(viewer.pass, obj.data)) : null;
                } else {
                    obj.data = null;
                }
            }
            if (obj.data) {
                monsole.log("supporterEncryptAgent obj after encryption:", obj);
                trio.sendDataChannel(obj);
            }
        }
    } catch (err) {
        monsole.error(err);
    }
}
//============================================ message send / receive ================================== END
var interval1, interval2;//, interval3;
function stopIntervals() {
    clearInterval(interval1);
    clearInterval(interval2);
//    clearInterval(interval3);
}
function startIntervals() {
    interval1 = setInterval(function () {
        if (myInfo.isConnected) {
            var j = {data: {viewerCount: participantIds.length + 1, participantUsername: currentParticipant ? currentParticipant.viewerUsername : null}};
            //*** uncomment in production
            supporterEncryptAgent(CMD.INTERVAL_INFO, j);
            viewerCount.textContent = j.data.viewerCount;
        } else {
            viewerCount.textContent = "0";
        }
    }, 10000);
//    var lastOrchesterConnected = new Date() * 1;
    interval2 = setInterval(function () {
        if (myInfo.isConnected) {
            var j = {viewerCount: participantIds.length + 1};
            orchesterSend(j, SERVER_ENDPOINT.SET_STATISTICS_DATA, function (isSuccessful, result) {
                if (isSuccessful && result.status === "ok") {
//                    lastOrchesterConnected = new Date() * 1;
                }
            });
        }
    }, 30000);//*** 30 seconds

//    interval3 = setInterval(function () {
//        if (myInfo.isConnected && lastOrchesterConnected + 70000 < new Date() * 1) {
//            monsole.log("destroySession", lastOrchesterConnected);
//            toast.error('متاسفانه ارتباط با هماهنگ کننده قطع شده است اینترنت خود را چک کنید و دوباره وارد اتاق شوید');
////            endParticipantTalk();
////            destroySession();
//        }
//    }, 7 * 60000);//*** 5 minutes for orchester DC to leave the room
////    }, 150000);//*** 150 seconds for orchester DC to leave the room
}

function preSupporterLiveCheck() {
    var j = {title: ' برای ورود به اتاق آماده هستید ؟'};
    j.body = '<span>برای ورود به اتاق اجازه دسترسی به میکروفن و دوربین دستگاه شما مورد نیاز است</span>';
    j.control = '<span id="precheck_bt" class="button_ctr2 bg-css-blue bt">بله اجازه میدهم و لایو را شروع میکنم</span>';
    j.notClose = true,
            showDialog(j);
    g("#precheck_bt").onclick = function () {
        toast.info("در حال بررسی وضعیت میکروفن و دوربین");
        checkMediaPermission(function (r) {
            if (r.canEnumerate) {
                var flag = true;
                if (!r.hasSpeakers) {
                    flag = false;
                    toast.error("این دستگاه فاقد خروجی صدا یا بلندگو برای مکالمه است");
                }
                if (!r.hasMicrophone) {
                    flag = false;
                    toast.error("این دستگاه فاقد ورودی صدا یا میکروفن برای مکالمه است");
                }
                if (!r.hasWebcam) {
                    flag = false;
                    toast.error("این دستگاه فاقد ورودی تصویر یا دوربین برای مکالمه است");
                }
                if (flag) {
                    if (!r.withMicrophonePermission) {
                        flag = false;
                        toast.error("در این مرورگر دسترسی میکروفن داده نشده است لطفا آنرا فعال کنید");
                    }
                    if (!r.withWebcamPermission) {
                        flag = false;
                        toast.error("در این مرورگر دسترسی دوربین وبکم داده نشده است لطفا آنرا فعال کنید");
                    }
                    if (flag) {
                        toast.success("اجازه دسترسی وجود دارد، در حال اتصال به اتاق");
                        checkParams();
                        closeDialog();

//                        accessToHostServer();

                    } else {
                        getCamAndMicPermission(function (isAllowed) {
                            if (isAllowed) {
                                toast.success("اجازه دسترسی داده شده است، در حال اتصال به اتاق");
                                checkParams();
                                closeDialog();

//                                accessToHostServer();

                            } else {
                                closeDialog();
                                toast.error("اجازه دسترسی به میکروفن و یا دوربین وبکم بسته شده است لطفا از طریق راهنما دسترسی را فعال کنید");
                                var j = {notClose: true, title: ' راهنمای دسترسی میکروفن و دوربین:'};
                                j.control = '<span id="media_help" class="button_ctr2 bg-css-blue bt">راهنما را باز کن</span>';
                                showDialog(j);
                                g("#media_help").onclick = function () {
                                    openLinkInNewTab("https://kharidlive.ir/etc/help-permission-problems-resolving");
                                }
                            }
                        }, true);
                    }
                }
            } else {
                toast.error("میکروفن و دوربین قابل شناسایی نبود! از آخرین ورژن مرورگر کروم و یا دستگاه دیگر استفاده کنید");
            }
        });
    }
}

let accessToHostServer = () => {
    // myInfo.supporterId = 10;
    // myInfo.siteId = 100;
    // myInfo.serverSession = "12345";
    // myInfo.talkSession = "12345";

    let formData = new FormData();
    formData.append('supporterId', myInfo.supporterId);
    formData.append("siteId", myInfo.siteId);
    formData.append("serverSession", myInfo.serverSession);
    formData.append("talkSession", myInfo.talkSession);
    let pathUrl = `${hostServerAddress}/supporter/access-new-supporter`;

    requestSender(pathUrl, formData, "POST", (res) => {
        res["valid"] ? toast.success(res["pMessage"]) : toast.error(res["pMessage"]);
    });
}

function setTalkSession() {
    if (previousActiveParticipant && !previousActiveParticipant.isEndTimeSent) {
        previousActiveParticipant.isEndTimeSent = true;
        orchesterSend({
            publisherId: previousActiveParticipant.userRoomId,
            customerTalkSession: previousActiveParticipant.talkSession,
            duration: Math.floor((new Date() * 1 - previousActiveParticipant.startTalkTime) / 1000),
            offerQty: previousActiveParticipant.offerQty
        },
                SERVER_ENDPOINT.SET_TALK_SESSION, function (isSuccessful, result) {
                    if (isSuccessful && result.status === "ok") {
                        toast.success("آمار این مکالمه ثبت شد");
                    } else {
                        toast.error("متاسفانه آمار این مکالمه ثبت نشد");
                    }
                })
    }
}
function resetWhenInDisconnection() {

    currentParticipant = null;
    previousActiveParticipant = null;
    customerVideo.classList.add(hide);
    currentParticipantRoomId = -1;
    myInfo.isConnected = false;
    toast.error("ارتباط مشتری جاری قطع شد");


    participantIds = [];
    talkWaitingQueue = [];
    stopIntervals();

    setTalkQueueQty();
}


//*** for test 
//firstCheck.classList.add("hide");


////*** below lines is for test deploymet of videoroom
//function checkParams() {
//    if (checkParamsLock) {
//        toast.info("لطفا صبور باشید تا بررسی ها انجام شود");
//    } else {
//        checkParamsLock = true;
//        var c = {};
//                c = {
//                    host: "https://stream.kharidlive.ir:9443/live",
//                    roomId: "1234",
//                    token: "token",
//                    pin: "pin",
//                    maxCap: 2,
//                    isPublisher: true,
//                    isSupporter: true,
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
//              firstCheck.classList.add("hide");
//        }
//}


preSupporterLiveCheck();