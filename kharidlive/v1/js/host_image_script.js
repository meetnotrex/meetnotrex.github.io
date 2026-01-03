var imageFileName;

function imageShowQuestion() {
    let questionContainer = g("#image_question_container");
    if (questionContainer.classList.contains("hide")) {
        changeElementsVisibility(["#image_container"], ["#image_question_container"]);
        participantQuestionLock = true;
        participantQuestion = {
            data: {
                questionType: MEDIA_MIME_TYPE.IMAGE,
                questionText: null,
                questionPointer: null,
                fileAddress: g("#image_container img").src,
                talkSession: myInfo.talkSession,
                userName: myInfo.viewerUsername,
                fileName: b64EncodeUnicode(imageFileName),
                fileName2: imageFileName
            }
        };
    } else {
        changeElementsVisibility(["#image_question_container"], ["#image_container"]);
    }
}

ntrx.imageCloseQuestion = function () {
    clearParticipantQuestionLock();
    changeElementsVisibility(["#image_question_container"], ["#image_container"]);
}

ntrx.imageSendQuestion = function () {
    let questionText = g("#image_question_input_element").value.trim();
    if (questionText && questionText.length > 10) {
        let questionValidator = isInputValidate(questionText);
        if (questionValidator && questionValidator[0]) {
            participantQuestion.data.questionText = questionText;
//            let j = {
//                data: {
//                    questionType: MEDIA_MIME_TYPE.IMAGE,
//                    questionText: questionText,
//                    questionPointer: null,
//                    fileAddress: g("#image_container img").src,
//                    talkSession: myInfo.talkSession,
//                    userName: myInfo.viewerUsername,
//                    fileName: b64EncodeUnicode(imageFileName),
//                    fileName2: imageFileName
//                }
//            };
            participantEncryptAgent(CMD.SEND_MEDIA_QUESTION_TO_SUPPORTER, participantQuestion);
            toast.info("سوال شما به سمت مشاور ارسال شد درصورت ارسال موفق پیغام برای شما قابل مشاهده میباشد");
            g("#image_question_input_element").value = "";
            ntrx.imageCloseQuestion();
        } else {
            toast.error(`شما در متن سوال خود از کارکتر های غیر مجاز استفاده کرده اید {${questionValidator[1]}}`);
        }
    } else {
        toast.error("طول متن سوال شما نباید کمتر از 10 کارکتر باشد");
    }
}