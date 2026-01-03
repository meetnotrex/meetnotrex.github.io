var CMD = Object.freeze({
    INTERVAL_INFO: Object.freeze({cmd: 1, isDirectional: false, isEnc: false, enc: null}),
    PUBLIC_MSG: Object.freeze({cmd: 2, isDirectional: false, isEnc: false, enc: null}),
    PRIVATE_MSG: Object.freeze({cmd: 3, isDirectional: true, isEnc: true, enc: "rc4"}),
    MSG_ACK: Object.freeze({cmd: 4, isDirectional: true, isEnc: true, enc: "rc4"}),
    CLEAN_CHAT_BOX: Object.freeze({cmd: 5, isDirectional: false, isEnc: false, enc: null}),
    ACCEPT_VIEWER_TALK: Object.freeze({cmd: 6, isDirectional: true, isEnc: true, enc: "rc4"}),
    ACCEPT_VIEWER_TALK_ACK: Object.freeze({cmd: 7, isDirectional: true, isEnc: true, enc: "rc4"}),
    PUBLISH_CUSTOMER_MSG: Object.freeze({cmd: 8, isDirectional: false, isEnc: false, enc: null}),
    SET_TALK_REQUEST: Object.freeze({cmd: 10, isDirectional: true, isEnc: true, enc: "rc4"}),
    REMOVE_TALK_REQUEST: Object.freeze({cmd: 11, isDirectional: true, isEnc: true, enc: "rc4"}),
    TALK_RESPONSE_ACK: Object.freeze({cmd: 12, isDirectional: true, isEnc: true, enc: "rc4"}),
    CHECK_VIEWER_IS_EXIST: Object.freeze({cmd: 13, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_IS_EXIST_ACK: Object.freeze({cmd: 14, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_STATISTICS_REQUEST: Object.freeze({cmd: 15, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_STATISTICS_ACK: Object.freeze({cmd: 16, isDirectional: true, isEnc: true, enc: "rc4"}),
    SET_PARTICIPANT_PASS: Object.freeze({cmd: 17, isDirectional: true, isEnc: true, enc: "rsa"}),
    PARTICIPANT_PASS_ACK: Object.freeze({cmd: 18, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIEWER_TALK_END: Object.freeze({cmd: 19, isDirectional: true, isEnc: true, enc: "rc4"}),
    VIDEO_SIZE: Object.freeze({cmd: 20, isDirectional: false, isEnc: false, enc: null}),
    ACTIVE_AND_DEACTIVE_CHAT: Object.freeze({cmd: 21, isDirectional: false, isEnc: false, enc: null}),
    SEND_NEW_SURVEY_TO_VIEWERS: Object.freeze({cmd: 22, isDirectional: false, isEnc: false, enc: null}),
    //SEND_ALL_PREVIOUS_SURVEYS_TO_NEW_VIEWERS : Object.freeze({cmd: 23, isDirectional: true, isEnc: true, enc: "rc4"}),
    SEND_SURVEY_ANSWER_TO_SUPPORTER: Object.freeze({cmd: 24, isDirectional: true, isEnc: true, enc: "rc4"}),
    SEND_SURVEY_ANSWER_TO_SUPPORTER_ACK: Object.freeze({cmd: 25, isDirectional: true, isEnc: false, enc: null}),

    SEND_HOST_MEDIA_TO_CUSTOMERS: Object.freeze({cmd: 26, isDirectional: false, isEnc: false, enc: null}),
    CHANGE_HOST_MEDIA_STATE: Object.freeze({cmd: 27, isDirectional: false, isEnc: false, enc: null}),
    SEND_MEDIA_QUESTION_TO_SUPPORTER: Object.freeze({cmd: 28, isDirectional: true, isEnc: true, enc: "rc4"}),
    SEND_MEDIA_QUESTION_TO_SUPPORTER_ACK: Object.freeze({cmd: 29, isDirectional: true, isEnc: false, enc: null}),

    SEND_LIVE_PIN_TEXT_TO_ALL_USER: Object.freeze({cmd: 30, isDirectional: false, isEnc: false, enc: null}),

    ACCESS_SEND_VOICE_TO_SERVER: Object.freeze({cmd: 31, isDirectional: true, isEnc: true, enc: "rc4"}),
    ACCESS_SEND_VOICE_TO_SERVER_ACK: Object.freeze({cmd: 32, isDirectional: true, isEnc: false, enc: null}),

    SUPPORTER_SEND_REQUEST_OF_NEW_PUBLISHER_ID_TO_VIEWER: Object.freeze({cmd: 33, isDirectional: true, isEnc: false, enc: null}),
    SEND_REQUEST_OF_NEW_SUPPORTER_PUBLISHER_ID_BY_VIEWER: Object.freeze({cmd: 34, isDirectional: false, isEnc: true, enc: "rsa"}), // {password , ...}
    SET_RESPONSE_OF_NEW_SUPPORTER_PUBLISHER_ID_AND_REGISTER_VIEWER_PASSWORD: Object.freeze({cmd: 35, isDirectional: true, isEnc: true, enc: "rc4"}),
    SEND_MEDIA_QUESTION_TO_ALL_VIEWER: Object.freeze({cmd: 36, isDirectional: false, isEnc: false, enc: null}),
});
var USER_TYPE = Object.freeze({
    SUPPORTER: 3,
    PARTICIPANT: 7,
    GUEST_PARTICIPANT: 8
});
// // Helper to parse query string
//function getQueryStringValue(name) {
//    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
//    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
//            results = regex.exec(location.search);
//    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
//}
//function getHashParameterValue(name, u) {
//    u = u || window.location.href;
//    var url = new URL(u.replace("#", "?"));
//    return url.searchParams.get(name);
//}
//function getURLSearchParams(urlSearchParamsObj,name){
//    if(urlSearchParamsObj&&name){
//        return urlSearchParamsObj.get(name);
//    }
//    return null;
//}
//===============================================utility fuctions===============================================
function g(e, f, m) {//selector , father , ismultipe
    if (!f) {
        f = document;
    }
    if (m) {
        return f.querySelectorAll(e);
    }
    return f.querySelector(e);
}
function toggleFullScreen() {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
            (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        var elem = document.documentElement;
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return true;
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return false;
    }
}
function findClassByStartName(elem, startName) {
    var arr = elem.classList, i;
    for (var r = 0; r < arr.length; r++) {
        i = arr[r];
        if (i.startsWith(startName)) {
            return i;
        }
    }
    return null;
}
function b64EncodeUnicode(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p) {
            return String.fromCharCode('0x' + p)
        }))
    } catch (e) {
        return null
    }
}
function b64DecodeUnicode(str) {
    try {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
    } catch (e) {
        return null
    }
}
function rc4(k, s) {
    //    var g = [], i, j = 0, x, r = '', l = 0400;
    var g = [], i, j = 0, x, r = '', l = 256;
    for (i = 0; i < l; i++) {
        g[i] = i;
    }
    for (i = 0; i < l; i++) {
        j = (j + g[i] + k.charCodeAt(i % k.length)) % l;
        x = g[i];
        g[i] = g[j];
        g[j] = x;
    }
    i = 0;
    j = 0;
    for (var y = 0; y < s.length; y++) {
        i = (i + 1) % l;
        j = (j + g[i]) % l;
        x = g[i];
        g[i] = g[j];
        g[j] = x;
        r += String.fromCharCode(s.charCodeAt(y) ^ g[(g[i] + g[j]) % l]);
    }
    return r;
}
function removeHtml(e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}
function removeChildren(ch, i) {
    if (typeof i === "number" && i > -1 && ch.length) {
        for (; i < ch.length; i++) {
            ch[i].remove();
        }
    }
}
function showAlert(title, body, closeTxt) {
    if (title) {
        dialogTitle.innerHTML = '<span class="dialog_title">' + title + '</span>';
    }
    if (body) {
        dialogBody.innerHTML = '<span>' + body + '</span>';
    }
    closeBt.textContent = closeTxt ? closeTxt : "متوجه شدم";
    modal.classList.remove(hide);
}
function runAfterDelay(func, time) {
    if (typeof func === "function") {
        setTimeout(function () {
            func();
        }, time ? time : 3000);
    }
}
function sortArrayByNumber(numericIndex, arr, isAsc) {
    if (numericIndex !== undefined && numericIndex > -1 && arr && arr.length > 0) {
        arr.sort(function (a, b) {
            return a[numericIndex] - b[numericIndex]
        });
        if (!isAsc) {
            arr.reverse();
        }
        return arr;
    }
    return null;
}
//========================================================= ===========================================
function createHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html').body.childNodes[0];
}
function getBackToProfile(error, time) {
    if (error) {
        toast.error(error);
    }
    toast.info("تا چند لحظه دیگر به صفحه پروفایل سایت منتقل خواهید شد");
//    toast.info("اگر مجدد وصل نشدید از طریق داشبورد اتاق را ببندید");
    runAfterDelay(function () {
        var domain = window.location.hostname;
        if (domain.split("\.").length > 2) {
            domain = domain.substring(domain.lastIndexOf(".", domain.lastIndexOf(".") - 1) + 1, domain.length);
        }
        //*** uncomment in production
        window.location.href = serviceUrl + "s/" + domain;
        monsole.log("############################################ getBackToProfile");
    }, time || 5000);
}
function orchesterSend(jsonParam, endpoint, callback) {
    if (jsonParam && endpoint) {
        //    if (!endpoint) {
        //        endpoint = myInfo ? myInfo.endpoint : null;
        //        if (!endpoint) {
        //            if (callback) {
        //                callback(false, "no endpoint exist");
        //            }
        //            return false;
        //        }
        //    }
        endpoint = myInfo.endpoint + endpoint;
        var data = new FormData();
        data.append("siteId", myInfo.siteId);
        data.append("supporterId", myInfo.supporterId);
        data.append("serverSession", myInfo.serverSession);
        Object.keys(jsonParam).forEach(function (e) {
            data.append(e, jsonParam[e]);
        });
        fetch(endpoint, {
            method: 'POST',
            credentials: 'omit',
            mode: 'cors',
            cache: 'no-cache',
            body: data
        }).then(function (b) {
            return b.json();
        }).then(function (d) {
            if (callback) {
                callback(true, d);
            }
        }).catch(function (e) {
            toast.error("ارتباط با مرکز لحظاتی قطع شد، پایداری اینترنت خود را چک کنید");
            if (callback) {
                callback(false, e);
            }
        });
    }
}
//========================================================= Modal Dialog ===========================================
function showDialog(j) {
    closeDialog();
    var m = '<div id="modal_div">' +
            (j.notClose ? '' : '<img src="./i/close.svg" class="modal_close_bt corner_close">') +
            '<div id="modal_dialog">' +
            '<div id="dialog_title">' + (j.title ? '<span class="dialog_title">' + j.title + '</span>' : '') + '</div>' +
            '<div id="dialog_body">' + (j.body ? j.body : '') + '</div>' +
            '<div id="dialog_control">' + (j.control ? j.control : '') + '</div>' +
            (j.notClose ? '' :
                    '<div class="dialog_close">' +
                    '<span class="button_ctr2 bg-css-orange modal_close_bt bt"><span id="close_bt">فعلا نه</span></span>' +
                    '</div>') +
            '</div>' +
            '</div>';
    g('body').append(createHtml(m));
    if (!j.notClose) {
        g(".modal_close_bt", 0, 1).forEach(function (i) {
            i.onclick = closeDialog;
        })
    }
    return g("#modal_div");
}
function closeDialog() {
    if (typeof dialogInterval !== 'undefined') {
        clearInterval(dialogInterval);
    }
    var modal = g("#modal_div");
    if (modal) {
        modal.remove();
    }
}
if (etc) {
    etc = etc.substr(2, 5);
}
//========================================================= Media Devices Permission ===========================================
function checkMediaPermission(permissionCallback) {
    monsole.log("function checkMediaPermission ============");
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevicesx
        navigator.enumerateDevices = function (callback) {
            navigator.mediaDevices.enumerateDevices().then(callback);
        }
    }
    var MediaDevices = [];
    var isHTTPs = location.protocol === 'https:';
    var result = {canEnumerate: false, hasMicrophone: false, hasSpeakers: true/*hasSpeakers:true cause of firefox can not to detect*/, hasWebcam: false, withMicrophonePermission: false, withWebcamPermission: false};
    if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
        result.canEnumerate = true;
    } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
        result.canEnumerate = true;
    }
    if (!result.canEnumerate) {
        permissionCallback(result);
        return;
    }
    if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }
    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }
    if (!navigator.enumerateDevices) {
        permissionCallback(result);
        return;
    }
    MediaDevices = [];
    navigator.enumerateDevices(function (devices) {
        devices.forEach(function (_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }
            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }
            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }
            var skip;
            MediaDevices.forEach(function (d) {
                if (d.id === device.id && d.kind === device.kind) {
                    skip = true;
                }
            });
            if (skip) {
                return;
            }
            monsole.log("device:", device);
            if (!device.deviceId) {
                device.deviceId = device.id;
            }
            if (!device.id) {
                device.id = device.deviceId;
            }
            if (!device.label) {
                device.label = 'Please invoke getUserMedia once.';
                if (!isHTTPs) {
                    device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
            } else {
                if (device.kind === 'videoinput' && !result.withWebcamPermission) {
                    result.withWebcamPermission = true;
                }
                if (device.kind === 'audioinput' && !result.withMicrophonePermission) {
                    result.withMicrophonePermission = true;
                }
            }
            if (device.kind === 'audioinput') {
                result.hasMicrophone = true;
            }
            if (device.kind === 'audiooutput') {
                result.hasSpeakers = true;
            }
            if (device.kind === 'videoinput') {
                result.hasWebcam = true;
            }
            // there is no 'videoouput' in the spec.
            MediaDevices.push(device);
        });
        permissionCallback(result);
    });
}
function getCamAndMicPermission(permissionCallback, withVideo) {
    //need to have SSL cert in out of localhost    
    if (location.protocol === 'https:') {
        navigator.mediaDevices.getUserMedia({audio: true, video: withVideo}).then(
                function () {
                    //                monsole.log("success");
                    permissionCallback(true);
                },
                function () {
                    //                monsole.log("error");
                    permissionCallback(false);
                })
    } else {
        toast.error("این سایت گواهی SSL ندارد و نمیتوان وجود اجازه دسترسی به میکروفن و دوربین را بررسی کرد");
    }
}



//below codes transfered to live_view_tools.js
//
//let supporterVideoSize = 1;
//function setVideSizeMode(videoElem, mode, isSupporterVideo) {
//    videoElem.classList.remove(findClassByStartName(videoElem, "video_mode"));
//    if (mode == undefined || mode > 3 || mode < 1) {
//        mode = Number(videoElem.dataset.mode);
//        mode = ++mode > 3 ? 1 : mode;
//    }
//    //  console.log("setVideSizeMode mode:"+mode);
//    //    videoElem.classList.remove("video_mode" + mode);
//    videoElem.dataset.mode = mode;
//    videoElem.classList.add("video_mode" + mode);
//    supporterVideoSize = mode;
//    if (!amICustomer && isSupporterVideo && myInfo.userType === USER_TYPE.SUPPORTER) {
//        var j = {data: {supporterVideoSize: supporterVideoSize}};
//        supporterEncryptAgent(CMD.VIDEO_SIZE, j);
//    }
//
//}
//function getReminedHeight(el) {
//    return window.innerHeight - el.getBoundingClientRect().bottom;
//}
//function setVideoSizeFromSupporterCmd(mode) {
//    // console.log("setVideoSizeFromSupporterCmd mode:"+mode);
//    setVideSizeMode(g("#supporter_video"), Number(mode), true)
//}
//g("#video_size_change_supporter_bt").onclick = () => {
//    setVideSizeMode(g("#supporter_video"), 0, true);
//};
//g("#video_size_change_customer_bt").onclick = () => {
//    setVideSizeMode(g("#customer_video"), 0, false)
//};
//
//let webcamScreenMode = 1;
//g("#webcam_screen_switch_bt").onclick = function () {
//    if (myInfo.userType === USER_TYPE.SUPPORTER || (typeof talkObj !== 'undefined' && talkObj.isTalkRightNow)) {
//
//        closeDotMenuOpen();
//        switchWebcamScreen();
////        Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
//    } else {
//        toast.error("این گزینه در هنگام گفتگو فعال خواهد شد");
//    }
//}
//function switchWebcamScreen() {
//    if (trio) {
//        myInfo.isChangingVideo = true;
//        trio.unpublishOwnFeed();
//        setTimeout(() => {
//            if (webcamScreenMode === 1) {
//                webcamScreenMode = 2;
//                trio.publishOwnFeed(true, true, true);
//            } else {
//                webcamScreenMode = 1;
//                trio.publishOwnFeed(true, true);
//            }
//            myInfo.isChangingVideo = false;
//            myInfo.isConnected = true;
//        }, 1000);
//    }
//}
//g("#pm_clear_bt").onclick = function () {
//    g("#message").innerHTML = "";
//    toast.info("پاکسازی شد الان می تونید بنویسید");
//}
//g("#webcam_screen_refresh_bt").onclick = function () {
//    closeDotMenuOpen();
//    if (myInfo.userType === USER_TYPE.SUPPORTER || (typeof talkObj !== 'undefined' && talkObj.isTalkRightNow)) {
////        setTimeout(() => {
////            webcamScreenMode = webcamScreenMode === 1 ? 2 : 1;
////            switchWebcamScreen();
////        }, 3000);
//        if (localStream) {
//            setTimeout(() => {
//                Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
//            }, 2000);
//        }
//    } else {
//        toast.error("این گزینه در هنگام گفتگو فعال خواهد شد");
//    }
//}
//g("#min_max_bt").onclick = function () {
//    closeDotMenuOpen();
//    var isFullScreen = toggleFullScreen();
//    g("img", this).src = isFullScreen ? "./i/compress.svg" : "./i/expand.svg";
//}
//var dotedMenu = g(".dot_menu_open");
//var moreBt = g("#more_bt");
//moreBt.onclick = function () {
//    dotedMenu.classList.toggle("hide");
////    moreBt.stopPropagation();
//    document.addEventListener('click', closeDotMenuEvent);
//    dotedMenu.style.height = (getReminedHeight(moreBt) + 5) + "px";
//}
//
////document.addEventListener('click', closeDotMenuEvent);
////   if(dotedMenu.classList.contains("hide")){
////       dotedMenu.classList.remove("hide");
////       document.addEventListener('click',closeDotMenuEvent);
////   }else{
////       dotedMenu.classList.add("hide");
////       document.removeEventListener('click', closeDotMenuEvent);
////   }
////}
//function closeDotMenuEvent(e) {
//    if (!dotedMenu.contains(e.target) && !moreBt.contains(e.target)) {
//        closeDotMenuOpen();
//    }
//}
//function closeDotMenuOpen() {
//    dotedMenu.classList.add("hide");
//    document.removeEventListener('click', closeDotMenuEvent);
//}
//g(".survey_div_close").onclick = () => {
//    g("#survey_div").classList.add("hide");
//}
//
//function getKeyByValue(object, searchKey, value) {
//    let o = Object.keys(object).find(key =>
//        object[key][searchKey] == value);
//    return object[o];
//}
//const QUESTION_CONFIG = {
//    radioButton: {type: 1, name: "radio"},
//    checkBox: {type: 2, name: "checkbox"},
//    textBox: {type: 3, name: "textbox"}
//}
//var connectAgainLock = false;
//function connectAgain() {
//    if (!connectAgainLock) {
//        connectAgainLock = true;
//        trio.destroyServer();
//        resetWhenInDisconnection();
//        lostConnectionCallback();
//        setTimeout(function () {
//            connectAgainLock = false;
//            startLive(aConfig);
//        }, 7000);
//    }
//}
//

