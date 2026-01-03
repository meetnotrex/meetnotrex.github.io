let supporterVideoSize = 1;
function setVideSizeMode(videoElem, mode, isSupporterVideo) {
    videoElem.classList.remove(findClassByStartName(videoElem, "video_mode"));
    if (mode == undefined || mode > 3 || mode < 1) {
        mode = Number(videoElem.dataset.mode);
        mode = ++mode > 3 ? 1 : mode;
    }
    //  console.log("setVideSizeMode mode:"+mode);
    //    videoElem.classList.remove("video_mode" + mode);
    videoElem.dataset.mode = mode;
    videoElem.classList.add("video_mode" + mode);
    supporterVideoSize = mode;
    if (!amICustomer && isSupporterVideo && myInfo.userType === USER_TYPE.SUPPORTER) {
        var j = {data: {supporterVideoSize: supporterVideoSize}};
        supporterEncryptAgent(CMD.VIDEO_SIZE, j);
    }

}
function getReminedHeight(el) {
    return window.innerHeight - el.getBoundingClientRect().bottom;
}
function setVideoSizeFromSupporterCmd(mode) {
    // console.log("setVideoSizeFromSupporterCmd mode:"+mode);
    setVideSizeMode(g("#supporter_video"), Number(mode), true)
}
g("#video_size_change_supporter_bt").onclick = () => {
    setVideSizeMode(g("#supporter_video"), 0, true);
};
g("#video_size_change_customer_bt").onclick = () => {
    setVideSizeMode(g("#customer_video"), 0, false)
};

let webcamScreenMode = 1;
g("#webcam_screen_switch_bt").onclick = function () {
    if (myInfo.userType === USER_TYPE.SUPPORTER || (typeof talkObj !== 'undefined' && talkObj.isTalkRightNow)) {

        closeDotMenuOpen();
        switchWebcamScreen();
//        Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
    } else {
        toast.error("این گزینه در هنگام گفتگو فعال خواهد شد");
    }
}
function switchWebcamScreen() {
    if (trio) {
        myInfo.isChangingVideo = true;
        trio.unpublishOwnFeed();
        setTimeout(() => {
            if (webcamScreenMode === 1) {
                webcamScreenMode = 2;
                trio.publishOwnFeed(true, true, true);
            } else {
                webcamScreenMode = 1;
                trio.publishOwnFeed(true, true);
            }
            myInfo.isChangingVideo = false;
            myInfo.isConnected = true;
        }, 1000);
    }
}
g("#pm_clear_bt").onclick = function () {
    g("#message").innerHTML = "";
    toast.info("پاکسازی شد الان می تونید بنویسید");
}
g("#webcam_screen_refresh_bt").onclick = function () {
    closeDotMenuOpen();
    if (myInfo.userType === USER_TYPE.SUPPORTER || (typeof talkObj !== 'undefined' && talkObj.isTalkRightNow)) {
//        setTimeout(() => {
//            webcamScreenMode = webcamScreenMode === 1 ? 2 : 1;
//            switchWebcamScreen();
//        }, 3000);
        if (localStream) {
            setTimeout(() => {
                Paris.attachMediaStream(aConfig.videoElems[myInfo.userType === USER_TYPE.SUPPORTER ? 0 : 1], localStream);
            }, 2000);
        }
    } else {
        toast.error("این گزینه در هنگام گفتگو فعال خواهد شد");
    }
}
g("#min_max_bt").onclick = function () {
    closeDotMenuOpen();
    var isFullScreen = toggleFullScreen();
    g("img", this).src = isFullScreen ? "./i/compress.svg" : "./i/expand.svg";
}
var dotedMenu = g(".dot_menu_open");
var moreBt = g("#more_bt");
moreBt.onclick = function () {
    dotedMenu.classList.toggle("hide");
//    moreBt.stopPropagation();
    document.addEventListener('click', closeDotMenuEvent);
    dotedMenu.style.height = (getReminedHeight(moreBt) + 5) + "px";
}

//document.addEventListener('click', closeDotMenuEvent);
//   if(dotedMenu.classList.contains("hide")){
//       dotedMenu.classList.remove("hide");
//       document.addEventListener('click',closeDotMenuEvent);
//   }else{
//       dotedMenu.classList.add("hide");
//       document.removeEventListener('click', closeDotMenuEvent);
//   }
//}
function closeDotMenuEvent(e) {
    if (!dotedMenu.contains(e.target) && !moreBt.contains(e.target)) {
        closeDotMenuOpen();
    }
}
function closeDotMenuOpen() {
    dotedMenu.classList.add("hide");
    document.removeEventListener('click', closeDotMenuEvent);
}
g(".survey_div_close").onclick = () => {
    g("#survey_div").classList.add("hide");
}

function getKeyByValue(object, searchKey, value) {
    let o = Object.keys(object).find(key =>
        object[key][searchKey] == value);
    return object[o];
}
const QUESTION_CONFIG = {
    radioButton: {type: 1, name: "radio"},
    checkBox: {type: 2, name: "checkbox"},
    textBox: {type: 3, name: "textbox"}
}
var connectAgainLock = false;
function connectAgain() {
    if (!connectAgainLock) {
        connectAgainLock = true;
        trio.destroyServer();
        resetWhenInDisconnection();
        lostConnectionCallback();
        setTimeout(function () {
            connectAgainLock = false;
            startLive(aConfig);
        }, 7000);
    }
}

