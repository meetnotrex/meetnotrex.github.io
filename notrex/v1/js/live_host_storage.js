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
        IMAGE: { code: 1, name: "img" },
        MOVIE: { code: 2, name: "movie" },
        SLIDE: { code: 3, name: "slide" }
    });

function showMediaStorage(media, isSupporter) {
    if (videoTimerInterval) {
        clearInterval(videoTimerInterval);
    }
    let mediaQuestionDiv = g(".media_question_div_close");
    if (mediaQuestionDiv) {
        g("#media_question_div").classList.add("hide");
    }
    if (media) {
        console.log(media.mimeType);
        switch (media.mimeType) {
            case MEDIA_MIME_TYPE.IMAGE.name:
                showImageMedia(media.fileAddressUrl, media.fileName, isSupporter);
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
            case MEDIA_MIME_TYPE.MOVIE.name:
                showVideoMedia(media.fileAddressUrl, isSupporter);
                videoFileName = media.fileName;
                closeDialog();
                if (isSupporter) {
                    if (mediaHistory.history[media.fileName]) {
                        mediaHistory.latestMediaName = media.fileName;
                        hostVideoElem.currentTime = mediaHistory.history[media.fileName].pointer;
                        let j = { data: { state: MEDIA_STATE.MOVE_LATEST_VIDEO_TIMER, pointer: mediaHistory.history[media.fileName].pointer } };
                        supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
                    } else {
                        insertNewMediaHistory(media);
                    }
                } else {
                    g("#ask_media_question_bt").onclick = videoToggleQuestion;
                }
                showVideoTime();
                break;
            case MEDIA_MIME_TYPE.SLIDE.name:
                showSlideMedia(media.slideArr, isSupporter);
                slideFileName = media.fileName;
                closeDialog();
                if (isSupporter) {
                    if (mediaHistory.history[media.fileName]) {
                        mediaHistory.latestMediaName = media.fileName;
                        changeSlidePage(mediaHistory.history[media.fileName].pointer, slideFileArr);
                        slideLatestPageChecked = mediaHistory.history[media.fileName].pointer;
                        hosthostSlideSupporterPageIndex = mediaHistory.history[media.fileName].pointer;
                        hostThisPage = mediaHistory.history[media.fileName].pointer;
                        let j = { data: { state: MEDIA_STATE.MOVE_TO_PAGE, pointer: mediaHistory.history[media.fileName].pointer } };
                        supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
                    } else {
                        insertNewMediaHistory(media);
                    }
                }else{
                    g("#ask_media_question_bt").onclick = slideShowQuestion;
                }
                break;
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
        + `<img src="${fileAddress}" alt="${fileName}">`;

    if (isSupporter) {
        textContent += '</div></div>';
    } else {
        textContent +=
            // '<div class="bt_container"><button onclick="imageShowQuestion()"><img src="./i/help.svg"></button></div>'
            '</div><div id="image_question_container" class="hide">'
            + '<textarea id="image_question_input_element" class="height100" cols="30" rows="10" placeholder="سوالی داری بپرس"></textarea>'
            + '<div class="bt_container">'
                + '<button id="image_send_question_bt" onclick="ntrx.imageSendQuestion()">بفرست</button>'
            + '<button id="image_back_question_bt" onclick="ntrx.imageCloseQuestion()">منصرف شدم</button>'
            + '</div></div></div>'
    }
    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");

}

function showVideoMedia(fileAddress, isSupporter, questionBody) { //*** question will be insert into element
    closeDotMenuOpen();
    let textContent = '<div id="host_video_container" state="1" class="default_screen">'
        + '<div id="user_question" class="' + (questionBody ? '' : 'hide') + '"><p>' + questionBody + '</p></div>'
        + '<div id="video_container"><div id="host_video_box">'
        + '<span id="video_timer" class="">00:00:00/00:00:00</span><span id="screen_state_text"></span>'
        + `<video id="host_panel_video" src="${fileAddress}"></video><div class="host_video_button_container">`;
    if (!isSupporter) {
        textContent += '</div></div></div>'
            + '<div id="question_container" class="hide">'
            + '<div id="video_time_to_question">تایمر متوقف شده <span></span></div>'
            + '<textarea name="" id="video_question_text_box" class="height100" cols="30" rows="5" placeholder="سوالی داری بپرس ؟ "></textarea>'
            + '<div class="question_bt_box">'
            + '<button onclick="ntrx.videoSendQuestion()" id="video_send_question_bt">بفرست</button>'
            + '<button onclick="ntrx.videoCloseQuestion()" id="video_cancel_question_bt">منصرف شدم</button>'
            + '</div></div></div>';
    } else {
        textContent += '<button onclick="ntrx.supporterBackwardVideo()"><img src="i/fast-rewind-line.svg"></button>'
            + '<button onclick="ntrx.supporterPlayVideo(this)" id="play_pause_player_bt"><img src="i/play.svg"></button>'
            + '<button onclick="ntrx.supporterForwardVideo()"><img src="i/fast-forward-bold.svg"></button>'
            + '<progress id="video_progress_bar" min="0" max="100" value="0">0% played</progress>'
            + '<div></div></div></div></div></div>';
    }

    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");
    hostVideoElem = document.querySelector("#host_panel_video");
    supporterVideoCurrentTime = 0;
    supporterVideoLastTime = 0;

    progressBar = document.getElementById('video_progress_bar');
    if (progressBar) {
        progressBar.addEventListener("click", seek);
    }
}








function showSlideMedia(slideArr, isSupporter, questionBody) {//*** question will be insert into element
    closeDotMenuOpen();
    let textContent = '<div id="slide_container"><div id="user_question" class="' + (questionBody ? '' : hide) + '"><p>' + questionBody + '</p></div>'
        + '<div id="slide_file_container">'
        + '<img id="slide_image"></div><div id="slide_bt_container">'

    console.log("isSupporter : ", isSupporter);

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
            + '<div id="slide_image_question_box" class="height100"><img id="slide_question_image">'
            + '</div>'
            + '<div id="slide_inputs_question_box"><div id="slide_ask_question_input">'
            + '<textarea id="slide_question_textbox" cols="55" rows="3" placeholder="سوالی داری بپرس ؟"></textarea>'
            + '</div>'
            + '<div id="slide_button_question_box">'
            + '<button id="slide_send_question_bt" onclick="ntrx.participandSendSlideQuestion()">بفرست</button>'
            + '<button id="slide_cancel_question_bt" onclick="ntrx.slideCloseQuestion()">منصرف شدم</button>'
            + '</div></div></div>';
    }
    g("#media_container").innerHTML = textContent;
    g("#host_media_wrapper").classList.remove("hide");
    slideFileArr = (slideArr) ? slideArr : [];
    slideLatestPageChecked = 0;
    hosthostSlideSupporterPageIndex = 0;
    hostThisPage = 0;
    if(!questionBody){
        setTimeout(() => {
            changeSlidePage(hostThisPage, slideFileArr);
        }, 500);
    }
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


function changeMediaState(data) {
    if (data) {
        switch (data["state"]) {
            case MEDIA_STATE.CLOSE_MEDIA:
                g("#host_media_wrapper").classList.add("hide");
                g("#media_container").innerHTML = "";
                console.log(videoTimerInterval);
                if (videoTimerInterval) {
                    clearInterval(videoTimerInterval);
                }
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