let MEDIA_STATE = Object.freeze({
    CLOSE_MEDIA: 1,
    CHANGE_SCREEN: 2,
    PAUSE_MOVIE: 3,
    FORWARD_MOVIE: 4,
    BACKWARK_MOVIE: 5,
    NEXT_SLIDE_PAGE: 6,
    PREW_SLIDE_PAGE: 7,
    MOVE_TO_PAGE: 8,
    MOVE_LATEST_VIDEO_TIMER: 9,
    UPDATE_SEEKBAR: 10
}),
        MEDIA_MIME_TYPE = Object.freeze({
            IMAGE: {code: 1, name: "img"},
            MOVIE: {code: 2, name: "movie"},
            SLIDE: {code: 3, name: "slide"}
        });

var participantQuestion = {}, participantQuestionLock = false, participantQuestionLockInterval, showMediaStorageObj = null, participantQuestionchangeMediaState = null,
        participantSlideState = null, participantVideoState = null;
function clearParticipantQuestionLock() {
    participantQuestionLock = false;
    participantQuestion = {};

    if (showMediaStorageObj) {
        if (participantQuestionchangeMediaState) {
            if (showMediaStorageObj.media.slideArr && showMediaStorageObj.media.fileName === participantQuestionchangeMediaState.fileName) {
                showMediaStorageObj.pointer = participantQuestionchangeMediaState.supporterPageIndex;
            }
            if (participantQuestionchangeMediaState.state === MEDIA_STATE.CLOSE_MEDIA) {
                participantQuestionchangeMediaState = null;
            }
        }
        showMediaStorage(showMediaStorageObj.media, showMediaStorageObj.isSupporter, showMediaStorageObj);
        showMediaStorageObj = null;
    }

    if (participantQuestionchangeMediaState) {
        setTimeout(() => {
            changeMediaState(participantQuestionchangeMediaState);
            participantQuestionchangeMediaState = null;
        }, 300);
    }

    if (participantSlideState) {
        setTimeout(() => {
            showSlideDataCmd(participantSlideState);
            participantSlideState = null;
        }, 600);
    }

    if (participantVideoState) {
        setTimeout(() => {
            showVideoDataCmd(participantVideoState);
            participantVideoState = null;
        }, 900);
    }

//    if (participantQuestionLockInterval) {
//        clearInterval(participantQuestionLockInterval);
//    }

}
function showMediaStorage(media, isSupporter, latestMedia) {
    if (videoTimerInterval) {
        clearInterval(videoTimerInterval);
    }
    if (!isSupporter && participantQuestionLock) {
//        if (participantQuestionLockInterval) {
//            clearInterval(participantQuestionLockInterval);
//        }
//        participantQuestionLockInterval = setInterval(function () {
//            showMediaStorage(media, isSupporter);
//        }, 5000);

        showMediaStorageObj = {media: media, isSupporter: isSupporter, pointer: media.pointer};
        monsole.log(")))))))))1))))) showMediaStorage media:", media, "isSupporter:", isSupporter, "latestMedia:", latestMedia);
    } else {
//    let mediaQuestionDiv = g(".media_question_div_close");
//    if (mediaQuestionDiv) {
//        g("#media_question_div").classList.add("hide");
//    }
        monsole.log(")))))))))2))))) showMediaStorage media:", media, "isSupporter:", isSupporter, "latestMedia:", latestMedia);
        if (media) {
//            monsole.log(media.mimeType);
            if (isSupporter) {
                mediaHistory.latestMediaData = media;
                if (latestMedia && latestMedia.pointer !== undefined) {
                    mediaHistory.history[mediaHistory.latestMediaData.fileName] = {pointer: latestMedia.pointer};
                }
            }
            switch (media.mimeType) {
                case MEDIA_MIME_TYPE.IMAGE.code:
                    showImageMedia(media.fileAddressUrl, media.fileName, isSupporter, media.questionText);
                    imageFileName = media.fileName;
                    closeDialog();
                    if (isSupporter) {
                        if (mediaHistory.history[media.fileName]) {
                            mediaHistory.latestMediaName = media.fileName;
                        } else {
                            insertNewMediaHistory(media);
                        }
                    } else {
                        g("#ask_media_question_bt").onclick = imageShowQuestion;
                    }
                    break;
                case MEDIA_MIME_TYPE.MOVIE.code:
                    showVideoMedia(media.fileAddressUrl, latestMedia ? latestMedia.pointer : 0, isSupporter, media.questionText);
                    videoFileName = media.fileName;
                    closeDialog();
                    if (isSupporter) {
                        if (mediaHistory.history[media.fileName]) {
                            mediaHistory.latestMediaName = media.fileName;
                            hostVideoElem.currentTime = mediaHistory.history[media.fileName].pointer;
                            let j = {
                                data: {
                                    state: MEDIA_STATE.MOVE_LATEST_VIDEO_TIMER,
                                    pointer: mediaHistory.history[media.fileName].pointer,
                                    fileName: mediaHistory.latestMediaName
                                }
                            };
                            supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
                        } else {
                            insertNewMediaHistory(media);
                        }
                    } else {
                        g("#ask_media_question_bt").onclick = videoToggleQuestion;
                    }
                    showVideoTime();
                    break;
                case MEDIA_MIME_TYPE.SLIDE.code:
                    showSlideMedia(media.slideArr, latestMedia ? latestMedia.pointer : 0, isSupporter, media.questionText);
                    slideFileName = media.fileName;
                    closeDialog();
                    if (isSupporter) {
                        if (mediaHistory.history[media.fileName]) {
                            mediaHistory.latestMediaName = media.fileName;
//                            changeSlidePage(mediaHistory.history[media.fileName].pointer, slideFileArr);
                            slideLatestPageChecked = mediaHistory.history[media.fileName].pointer;
                            hosthostSlideSupporterPageIndex = mediaHistory.history[media.fileName].pointer;
                            hostThisPage = mediaHistory.history[media.fileName].pointer;
                            let j = {
                                data: {
                                    state: MEDIA_STATE.MOVE_TO_PAGE,
                                    pointer: mediaHistory.history[media.fileName].pointer,
                                    fileName: mediaHistory.latestMediaName
                                }
                            };
                            supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
                        } else {
                            insertNewMediaHistory(media);
                        }
                    } else {
                        g("#ask_media_question_bt").onclick = slideShowQuestion;
                    }
                    break;
            }
        }
    }
}

function insertNewMediaHistory(media) {
    mediaHistory.latestMediaName = media.fileName;
    mediaHistory.history[media.fileName] = {};
    mediaHistory.history[media.fileName].pointer = 0;
}

function showImageMedia(fileAddress, fileName, isSupporter, questionBody) {

    closeDotMenuOpen();
    let textContent = '<div id="host_image_container">'
            + '<div id="user_question" class="' + (questionBody ? '' : 'hide') + '"><p>' + questionBody + '</p></div>'
            + '<div id="image_container">'
            + `<img src="${fileAddress}" alt="${fileName}">`
            + '</div>';

    if (isSupporter) {
        textContent += '</div></div>';
    } else {
        textContent += '<div id="image_question_container" class="hide">'
                + '<div id="host_media_question_text_container">'
                + '     <textarea id="image_question_input_element" class="height100" cols="30" rows="10" placeholder="سوالی داری بپرس؟"></textarea>'
                + '</div>'

                + '<div id="host_media_question_voice_container" class="hide" style="width: 400px;">'
                + '<div class="host_voice_container">'
                + '        <h3>سوال خود را بپرسید :</h3>'
                + '        <div class="host_voice_bt">'
                + '            <button id="startRecord" class="host_bt">استارت</button>'
                + '            <span id="voice_timer">00:00:00</span>'
                + '            <button id="stopRecord" class="host_bt" disabled>استاپ</button>'
                + '        </div>'
                + '        <div>'
                + '            <audio id="recordedAudio"></audio>'
                + '            <a id="audioDownload"></a>'
                + '        </div>'
                + '        <div id="host_voice_result_bt" class="host_voice_bt">'
                + '            <button id="reset_voice_bt" class="host_bt" disabled onclick="reset()">ریست</button>'
                // + '            <button class="host_bt">سوال تکستی</button>'
                + '            <button id="send_voice_bt" class="host_bt" disabled>ارسال</button>'
                + '        </div>'
                + '    </div>'
                + '</div>'

                + '<div class="bt_container">'
                + '<button id="image_send_question_bt" class="host_bt" onclick="ntrx.imageSendQuestion()">بفرست</button>'
//                + '<button id="change_voice_bt" class="host_bt" onclick="ntrx.toggleVoiceQuestion(`#image_send_question_bt`)">ارسال سوال بصورت ویس</button>'
                + '<button id="image_back_question_bt" class="host_bt" onclick="ntrx.imageCloseQuestion()">منصرف شدم</button>'
                + '</div></div></div>'
    }
    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");
//    monsole.log(")))))))))) showImageMedia fileAddress:", fileAddress, "fileName:", fileName, "isSupporter:", isSupporter, "questionBody:", questionBody, "textContent:", textContent);
}

//ntrx.toggleVoiceQuestion = (sendBt) => {
//    let voiceContainerElm = g("#host_media_question_voice_container");
//    let textContainerElm = g("#host_media_question_text_container");
//    let bt = g("#change_voice_bt");
//    sendBt = g(sendBt);
//    if (voiceContainerElm.classList.contains('hide')) {
//        voiceContainerElm.classList.remove('hide');
//        textContainerElm.classList.add('hide');
//        voiceManagement()
//        bt.textContent = "ارسال سوال بصورت متن";
//        sendBt.classList.add('hide');
//    } else {
//        voiceContainerElm.classList.add('hide');
//        textContainerElm.classList.remove("hide")
//        bt.textContent = "ارسال سوال بصورت ویس";
//        sendBt.classList.remove("hide");
//    }
//}


function showVideoMedia(fileAddress, pointer, isSupporter, questionBody) { //*** question will be insert into element
    closeDotMenuOpen();
    let textContent = '<div id="host_video_container"  class="default_screen">'
            + '<div id="user_question" class="' + (questionBody ? '' : 'hide') + '"><p>' + questionBody + '</p></div>'
            + '<div id="video_container"><div id="host_video_box">'
            + '<span id="video_timer" class="">00:00:00/00:00:00</span><span id="screen_state_text"></span>'
            + `<video id="host_panel_video" src="${fileAddress}"></video>`;
    if (!isSupporter) {
        textContent += '</div></div>'
                + '<div id="question_container" class="hide">'

                + '<div id="host_media_question_text_container">'
                + '     <div id="video_time_to_question">تایمر متوقف شده <span></span></div>'
                + '     <textarea name="" id="video_question_text_box" cols="30" rows="10" placeholder="سوالی داری بپرس ؟ "></textarea>'
                + '</div>'

                + '<div id="host_media_question_voice_container" class="hide" style="display: flex;align-items: center; justify-content: center">'
                + '<div class="host_voice_container">'
                + '        <h3>سوال خود را بپرسید :</h3>'
                + '        <div class="host_voice_bt">'
                + '            <button id="startRecord" class="host_bt">استارت</button>'
                + '            <span id="voice_timer">00:00:00</span>'
                + '            <button id="stopRecord" class="host_bt" disabled>استاپ</button>'
                + '        </div>'
                + '        <div>'
                + '            <audio id="recordedAudio"></audio>'
                + '            <a id="audioDownload"></a>'
                + '        </div>'
                + '        <div id="host_voice_result_bt" class="host_voice_bt">'
                + '            <button id="reset_voice_bt" class="host_bt" disabled onclick="reset()">ریست</button>'
                // + '            <button class="host_bt">سوال تکستی</button>'
                + '            <button id="send_voice_bt" class="host_bt" disabled>ارسال</button>'
                + '        </div>'
                + '    </div>'
                + '</div>'

                + '<div class="question_bt_box">'
                + '<button onclick="ntrx.videoSendQuestion()" id="video_send_question_bt" class="host_bt">بفرست</button>'
//                + '<button id="change_voice_bt" onclick="ntrx.toggleVoiceQuestion(`#video_send_question_bt`)" class="host_bt">ارسال سوال بصورت ویس</button>'
                + '<button onclick="ntrx.videoCloseQuestion()" id="video_cancel_question_bt" class="host_bt">منصرف شدم</button>'
                + '</div></div></div>';
    } else {
        textContent += '<div class="host_video_button_container"><button onclick="ntrx.supporterBackwardVideo()"><img alt="" src="i/fast-rewind-line.svg"></button>'
                + '<button onclick="ntrx.supporterPlayVideo(this)" id="play_pause_player_bt"><img alt="" src="i/play.svg"></button>'
                + '<button onclick="ntrx.supporterForwardVideo()"><img alt="" src="i/fast-forward-bold.svg"></button>'
                + '<progress id="video_progress_bar" min="0" max="100" value="0">0% played</progress>'
                + '<div></div></div></div></div></div>';
    }

    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");
    hostVideoElem = document.querySelector("#host_panel_video");
    supporterVideoCurrentTime = pointer;
    supporterVideoLastTime = pointer;
    hostVideoElem.currentTime = pointer;

    progressBar = document.getElementById('video_progress_bar');
    if (progressBar) {
        progressBar.addEventListener("click", seek);
    }
}


function showSlideMedia(slideArr, slideIndex, isSupporter, questionBody) {//*** question will be insert into element
    closeDotMenuOpen();
    let textContent = '<div id="slide_container"><div id="user_question" class="' + (questionBody ? '' : hide) + '"><p>' + questionBody + '</p></div>'
            + '<div id="slide_file_container">'
            + '<img id="slide_image"></div><div id="slide_bt_container">';

//    monsole.log("isSupporter : ", isSupporter);

    if (isSupporter) {
        textContent += '<button class="slide_bt slide_bt_right" onclick="ntrx.supporterSlideNextPage()">></button>'
                + '<span id="slide_page_number"></span>'
                + '<button class="slide_bt slide_bt_left" onclick="ntrx.supporterSlidePrevPage()"><</button>'
                + '</div></div></div>';
    } else {
        textContent += '<button class="slide_bt slide_bt_right" onclick="ntrx.viewerSlideNextPage()">></button>'
                + '<div id="slide_page_index"><span id="slide_page_number"></span></div>'
                + '<button class="slide_bt slide_bt_left" onclick="ntrx.viewerSlidePrewPage()"><</button>'
                + '</div></div>'
                + '<div class="hide" id="slide_question_box_container">'


                + '<div id="host_media_question_text_container">'
                + '<div id="slide_image_question_box" class="height100 hide"><img alt="" id="slide_question_image" class="hide">'
                + '</div>'
                + '<div id="slide_inputs_question_box"><div id="slide_ask_question_input">'
                + '<textarea id="slide_question_textbox" class="height100" cols="30" rows="10" placeholder="سوالی داری بپرس؟"></textarea>'
                + '</div>'
                + '</div></div>'



                + '<div id="host_media_question_voice_container" class="hide" style="display: flex;align-items: center; justify-content: center">'
                + '    <div class="host_voice_container">'
                + '        <h3>سوال خود را بپرسید :</h3>'
                + '        <div class="host_voice_bt">'
                + '            <button id="startRecord" class="host_bt">استارت</button>'
                + '            <span id="voice_timer">00:00:00</span>'
                + '            <button id="stopRecord" class="host_bt" disabled>استاپ</button>'
                + '        </div>'
                + '        <div>'
                + '            <audio id="recordedAudio"></audio>'
                + '            <a id="audioDownload"></a>'
                + '        </div>'
                + '        <div id="host_voice_result_bt" class="host_voice_bt">'
                + '            <button id="reset_voice_bt" class="host_bt" disabled onclick="reset()">ریست</button>'
                // + '            <button class="host_bt">سوال تکستی</button>'
                + '            <button id="send_voice_bt" class="host_bt" disabled>ارسال</button>'
                + '        </div>'
                + '    </div>'
                + '</div>'





                + '<div id="slide_button_question_box">'
                + '<button id="slide_send_question_bt" class="host_bt" onclick="ntrx.participandSendSlideQuestion()">بفرست</button>'
//                + '<button id="change_voice_bt" class="host_bt" onclick="ntrx.toggleVoiceQuestion(`#slide_send_question_bt`)">ارسال سوال بصورت ویس</button>'
                + '<button id="slide_cancel_question_bt" class="host_bt" onclick="ntrx.slideCloseQuestion()">منصرف شدم</button>'
                + '</div></div>';
    }


    monsole.log("showSlideMedia slideArr:", slideArr, "slideIndex:", slideIndex, "isSupporter:", isSupporter, "questionBody:", questionBody);

    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");
    slideFileArr = (slideArr) ? slideArr : [];
    slideLatestPageChecked = slideIndex ? slideIndex : 0;
    hosthostSlideSupporterPageIndex = slideIndex ? slideIndex : 0;
    hostThisPage = slideIndex ? slideIndex : 0;
//    if (!questionBody) {
//        setTimeout(() => {
//            changeSlidePage(hostThisPage, slideFileArr);
    monsole.log("showSlideMedia 2  slideArr:", slideArr, "slideIndex:", slideIndex, "isSupporter:", isSupporter, "questionBody:", questionBody, "hosthostSlideSupporterPageIndex:", hosthostSlideSupporterPageIndex);
    changeSlidePage(hosthostSlideSupporterPageIndex, slideFileArr);
//        }, 500);
//    }
}


g("#change_media_container_bt").onclick = () => {
    g("#middle_wrapper").classList.toggle("host_container_mode_2");
    /*     mediaWrapperElm = g("#host_media_wrapper");
     let sizeMode = mediaWrapperElm.getAttribute("data-mode");
     switch (Number(sizeMode)) {
     case 1:
     sizeMode++;
     mediaWrapperElm.setAttribute("data-mode", sizeMode);
     //mediaWrapperElm.classList.remove("host_container_mode_1");
     mediaWrapperElm.classList.add("host_container_mode_2");
     break;
     case 2:
     sizeMode = 1;
     mediaWrapperElm.setAttribute("data-mode", sizeMode);
     mediaWrapperElm.classList.remove("host_container_mode_2");
     //mediaWrapperElm.classList.add("host_container_mode_1");
     break;
     } */
}
function resetMediaState() {
    showMediaStorageObj = null;
    g("#host_media_wrapper").classList.add("hide");
    g("#media_container").innerHTML = "";
//                    monsole.log(videoTimerInterval);
    if (videoTimerInterval) {
        clearInterval(videoTimerInterval);
    }
}
function changeMediaState(data) {
    monsole.log("changeMediaState data", data);
    if (videoTimerInterval) {
        clearInterval(videoTimerInterval);
    }
    if (participantQuestionLock) {
        participantQuestionchangeMediaState = data;
    } else {
        if (data) {
            switch (data["state"]) {
                case MEDIA_STATE.CLOSE_MEDIA:
                    resetMediaState();
                    break;
                case MEDIA_STATE.CHANGE_SCREEN:
                    break;
                case MEDIA_STATE.PAUSE_MOVIE:
                    hostVideoElem.currentTime = data.videoTimer;
                    (data.isPause) ? hostVideoElem.pause() : hostVideoElem.play();
                    // changeImgSrc("#play_pause_player_bt img", "i/pause.svg");
                    showVideoTime();
                    break;
                case MEDIA_STATE.FORWARD_MOVIE:
                case MEDIA_STATE.BACKWARK_MOVIE:
                    hostVideoElem.currentTime = data.videoTimer;
                    showVideoTime();
                    break;
                case MEDIA_STATE.NEXT_SLIDE_PAGE:
                case MEDIA_STATE.PREW_SLIDE_PAGE:
                    slideLatestPageChecked = data.latestPageChecked;
                    hosthostSlideSupporterPageIndex = data.supporterPageIndex;
                    hostThisPage = data.supporterThisPage;
                    changeSlidePage(hostThisPage, slideFileArr);
                    break;
                case MEDIA_STATE.MOVE_TO_PAGE:
                    slideLatestPageChecked = data.pointer;
                    hosthostSlideSupporterPageIndex = data.pointer;
                    hostThisPage = data.pointer;
                    changeSlidePage(hostThisPage, slideFileArr);
                    break;
                case MEDIA_STATE.MOVE_LATEST_VIDEO_TIMER:
                    hostVideoElem.currentTime = data.pointer;
                    showVideoTime();
                    break;
                case MEDIA_STATE.UPDATE_SEEKBAR:
                    hostVideoElem.currentTime = data.videoTimer;
                    showVideoTime();
                    break;
            }
        }
    }
}