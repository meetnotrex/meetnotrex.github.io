var slideFileArr = [], slideLatestPageChecked, hosthostSlideSupporterPageIndex, hostThisPage, viewerQuestionIndex,slideFileName;

ntrx.viewerSlideNextPage=function() {
    if (hostThisPage + 1 <= slideLatestPageChecked) {
        hostThisPage++;
        changeSlidePage(hostThisPage, slideFileArr);
    }
}

ntrx.viewerSlidePrewPage=function() {
    if (hostThisPage > 0) {
        hostThisPage--;
        changeSlidePage(hostThisPage, slideFileArr);
    }
}

ntrx.supporterSlideNextPage=function () {
    if (hosthostSlideSupporterPageIndex + 1 <= slideFileArr.length - 1) {
        hosthostSlideSupporterPageIndex++;
        if (hosthostSlideSupporterPageIndex > slideLatestPageChecked) {
            slideLatestPageChecked++;
			if(!questionMode){
            mediaHistory.history[mediaHistory.latestMediaName].pointer = slideLatestPageChecked;
			}
		}
        hostThisPage = hosthostSlideSupporterPageIndex;
        changeSlidePage(hostThisPage, slideFileArr);
        let j = {
            data: {
                state: MEDIA_STATE.NEXT_SLIDE_PAGE,
                latestPageChecked: slideLatestPageChecked,
                supporterPageIndex: hosthostSlideSupporterPageIndex,
                supporterThisPage: hostThisPage
            }
        };
        supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    }
}

ntrx.supporterSlidePrevPage=function() {
    if (hosthostSlideSupporterPageIndex - 1 > -1) {
        hosthostSlideSupporterPageIndex--;
        hostThisPage = hosthostSlideSupporterPageIndex;
        changeSlidePage(hostThisPage, slideFileArr);
        let j = {
            data: {
                state: MEDIA_STATE.PREW_SLIDE_PAGE,
                latestPageChecked: slideLatestPageChecked,
                supporterPageIndex: hosthostSlideSupporterPageIndex,
                supporterThisPage: hostThisPage
            }
        };
        supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    }
}


function changeSlidePage(page, slideArry) {
    g('#slide_image').src = slideArry[page];
    g("#slide_page_number").innerHTML = `${page + 1}/${slideArry.length}`;
}


ntrx.participandSendSlideQuestion=function () {
    let questionText = g("#slide_question_textbox").value.trim();
    if (questionText && questionText.length > 10) {
        let questionValidator = isInputValidate(questionText);
        if (questionValidator && questionValidator[0]) {
            let j = {
                data: {
                    questionType: MEDIA_MIME_TYPE.SLIDE,
                    questionText: questionText,
                    questionPointer: hostThisPage,
                    fileAddress: slideFileArr,
                    talkSession: myInfo.talkSession,
                    userName: myInfo.viewerUsername,
                    fileName:slideFileName
                }
            };
            participantEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER, j);
            toast.info("سوال شما به سمت مشاور ارسال شد درصورت ارسال موفق پیغام برای شما قابل مشاهده میباشد");
            g("#slide_question_textbox").innerHTML = "";
            ntrx.slideCloseQuestion();
        }else{
            toast.error(`شما در متن سوال خود از کارکتر های غیر مجاز استفاده کرده اید {${questionValidator[1]}}`);
        }
    } else {
        toast.error("طول متن سوال شما نباید کمتر از 10 کارکتر باشد");
    }
}


function slideShowQuestion() {
    viewerQuestionIndex = slideFileArr[hostThisPage];
    g("#slide_question_textbox").value = "";
    g("#slide_question_image").src = viewerQuestionIndex;
    changeElementsVisibility(["#slide_container"], ["#slide_question_box_container"]);
}


ntrx.slideCloseQuestion=function () {
    changeElementsVisibility(["#slide_question_box_container"], ["#slide_container"]);
}


function changeElementsVisibility(needToHide, needToShow) {
    if (needToHide) {
        for (let iterator of needToHide) {
            g(iterator).classList.add(hideClass);
        }
    }
    if (needToShow) {
        for (let iterator of needToShow) {
            g(iterator).classList.remove(hideClass);
        }
    }
}