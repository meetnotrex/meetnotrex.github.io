var supporterVideoLastTime, supporterVideoCurrentTime, hostVideoElem, videoTimerInterval, viewerTimerQuestion, progressBar, videoFileName;
function videoToggleQuestion() {
    if (g("#question_container").classList.contains("hide")) {
        changeElementsVisibility(["#video_container"], ["#question_container"]);
        viewerTimerQuestion = hostVideoElem.currentTime;
        participantQuestionLock = true;
        participantQuestion = {
            data: {
                questionType: MEDIA_MIME_TYPE.MOVIE,
                questionText: null,
                questionPointer: viewerTimerQuestion,
                fileAddress: g("#host_panel_video").src,
                talkSession: myInfo.talkSession,
                userName: myInfo.viewerUsername,
                fileName: b64EncodeUnicode(videoFileName),
                fileName2: videoFileName
            }
        };
    } else {
        changeElementsVisibility(["#question_container"], ["#video_container"]);
    }
    g("#video_time_to_question span").innerHTML = toHoursAndMinutes(parseInt(hostVideoElem.currentTime));


}

function showVideoTime() {
    if (videoTimerInterval) {
        clearInterval(videoTimerInterval);
    }
    setTimeout(() => {
        videoTimerInterval = setInterval(() => {
            let durationTime = toHoursAndMinutes(hostVideoElem.duration);
            let currentTime = toHoursAndMinutes(hostVideoElem.currentTime);
            let videoTimer = g("#video_timer");
            if (videoTimer) {
                videoTimer.innerHTML = currentTime + "/" + durationTime;
                if (hostVideoElem.ended) {
                    clearInterval(videoTimerInterval);
                    changeImgSrc("#play_pause_player_bt img", "i/play.svg");
                }
                updateProgressBar();
            } else {
                clearInterval(videoTimerInterval);
            }
        }, 1000);
    }, 100);
}


function toHoursAndMinutes(totalSeconds) {
    // console.log(totalSeconds);
    let totalMinutes = Math.floor(totalSeconds / 60),
            seconds = sizableTime(totalSeconds % 60),
            hours = sizableTime(Math.floor(totalMinutes / 60)),
            minutes = sizableTime(totalMinutes % 60);
    hours = (hours) ? hours : "00";
    minutes = (minutes) ? minutes : "00";
    seconds = (seconds) ? seconds : "00";
    // console.log(hours , minutes , seconds);
    return `${hours}:${minutes}:${seconds}`;
}


function sizableTime(time) {
    if (time) {
        return (String(parseInt(time)).length == 2) ? String(parseInt(time)) : "0" + String(parseInt(time));
    } else {
        return "00"
    }
}

ntrx.supporterPlayVideo = function (arg) {
//    let timerElemnt = g("#video_timer");
    if (hostVideoElem.paused) {
        changeImgSrc("#play_pause_player_bt img", "i/pause.svg");
        hostVideoElem.play();
        showVideoTime();
    } else {
        changeImgSrc("#play_pause_player_bt img", "i/play.svg");
        hostVideoElem.pause();
        clearInterval(videoTimerInterval);
    }
    let j = {
        data: {
            state: MEDIA_STATE.PAUSE_MOVIE,
            videoTimer: hostVideoElem.currentTime,
            isPause: hostVideoElem.paused
        }
    };
    supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    setLatestVideoTimer();
}


function changeImgSrc(srcTag, srcUrl) {
    let elem = g(srcTag);
    elem.src = srcUrl;
}


ntrx.videoCloseQuestion = function () {
    clearParticipantQuestionLock();
    changeElementsVisibility(["#question_container"], ["#video_container"]);
}

ntrx.videoSendQuestion = function () {

    let questionText = g("#video_question_text_box").value.trim(),
            questionValidator = isInputValidate(questionText);
    if (questionText && questionText.length > 10) {
        if (questionValidator && questionValidator[0]) {
            participantQuestion.data.questionText = questionText;
//            let j = {
//                data: {
//                    questionType: MEDIA_MIME_TYPE.MOVIE,
//                    questionText: questionText,
//                    questionPointer: viewerTimerQuestion,
//                    fileAddress: g("#host_panel_video").src,
//                    talkSession: myInfo.talkSession,
//                    userName: myInfo.viewerUsername,
//                    fileName: b64EncodeUnicode(videoFileName),
//                    fileName2: videoFileName
//                }
//            };
            participantEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER, participantQuestion);
            toast.info("سوال شما به سمت مشاور ارسال شد درصورت ارسال موفق پیغام برای شما قابل مشاهده میباشد");
            g("#video_question_text_box").value = "";
            ntrx.videoCloseQuestion();
        } else {
            toast.error(`شما در متن سوال خود از کارکتر های غیر مجاز استفاده کرده اید {${questionValidator[1]}}`);
        }
    } else {
        toast.error("طول متن سوال شما نباید کمتر از 10 کارکتر باشد");
    }
}


ntrx.supporterForwardVideo = function () {
    supporterVideoCurrentTime = hostVideoElem.currentTime + 5;
    if (supporterVideoCurrentTime < supporterVideoLastTime) {
        hostVideoElem.currentTime = supporterVideoCurrentTime;
    } else {
        supporterVideoLastTime = supporterVideoCurrentTime;
        hostVideoElem.currentTime = supporterVideoCurrentTime;
    }
    showVideoTime();
    let j = {
        data: {
            state: MEDIA_STATE.FORWARD_MOVIE,
            videoTimer: supporterVideoCurrentTime
        }
    };
    supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    setLatestVideoTimer();
    updateProgressBar();
}


ntrx.supporterBackwardVideo = function () {
    hostVideoElem.currentTime -= 5;
    supporterVideoCurrentTime = hostVideoElem.currentTime;
    showVideoTime();
    let j = {
        data: {
            state: MEDIA_STATE.BACKWARK_MOVIE,
            videoTimer: supporterVideoCurrentTime
        }
    };
    supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    setLatestVideoTimer();
    updateProgressBar();
}

function setLatestVideoTimer() {
//    if (!questionMode) {
    supporterVideoLastTime = hostVideoElem.currentTime;
    mediaHistory.history[mediaHistory.latestMediaName].pointer = hostVideoElem.currentTime;
//    }
}
function seek(e) {
    var percent = e.offsetX / this.offsetWidth;
    hostVideoElem.currentTime = percent * hostVideoElem.duration;
    e.target.value = Math.floor(percent / 100);
    e.target.innerHTML = progressBar.value + '% played';
    supporterVideoCurrentTime = hostVideoElem.currentTime;
    let j = {
        data: {
            state: MEDIA_STATE.UPDATE_SEEKBAR,
            videoTimer: supporterVideoCurrentTime
        }
    };
    supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    updateProgressBar();
    setLatestVideoTimer();
}


// Update the progress bar
function updateProgressBar() {
    var percentage = Math.floor((100 / hostVideoElem.duration) * hostVideoElem.currentTime);
    if (progressBar) {
        progressBar.value = percentage;
        progressBar.innerHTML = percentage + '% played';
    }
}