let voiceManagement = () => {


    let rec;
    let audioChunks;
    let timerInterval;
    let voiceRecorderTimer = 0;
    let blob;

    function timerConvertor(timer = 0) {
        let sec = String(Math.floor((timer) % 60)),
            min = String(Math.floor((timer / 60) % 60)),
            hour = String(Math.floor((timer / 60 / 60) % 24))
        sec = (sec.length === 2) ? sec : `0${sec}`
        min = (min.length === 2) ? min : `0${min}`
        hour = (hour.length === 2) ? hour : `0${hour}`
        return {sec: sec, min: min, hour: hour}
    }

    let startRecord = g("#startRecord");
    let stopRecord = g("#stopRecord");
    let recordedAudio = g("#recordedAudio");
    let sendVoiceBt = g("#send_voice_bt")


    startRecord.onclick = e => {
        mutePage(true);
        startRecord.disabled = true;
        stopRecord.disabled = false;
        g("#reset_voice_bt").disabled = true;
        timerInterval = setInterval(() => {
            let {sec, min, hour} = timerConvertor(++voiceRecorderTimer);
            g("#voice_timer").innerHTML = `${hour}:${min}:${sec}`;
        }, 1000);
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                audioChunks = [];
                rec = new MediaRecorder(stream);

                rec.ondataavailable = e => {
                    audioChunks.push(e.data);
                    if (rec.state === "inactive") {
                        blob = new Blob(audioChunks, {type: 'audio/ogg'}); // audio/x-mpeg-3
                        recordedAudio.src = URL.createObjectURL(blob);
                        monsole.log("blob", blob);
                        recordedAudio.controls = true;
                        recordedAudio.autoplay = true;
                        // audioDownload.href = recordedAudio.src;
                        // audioDownload.download = 'mp3';
                        // audioDownload.innerHTML = 'download';
                    }
                }
                rec.start();
            })
            .catch(e => console.log(e));
    }
    stopRecord.onclick = e => {
        mutePage(false);
        startRecord.disabled = true;
        stopRecord.disabled = true;
        sendVoiceBt.disabled = false;
        g("#reset_voice_bt").disabled = false;
        rec.stream.getTracks()
            .forEach(track => track.stop());
        clearInterval(timerInterval);
        document.querySelector("#host_voice_result_bt").classList.remove("hide");
    }

    g("#reset_voice_bt").onclick = () => {
        startRecord.disabled = false;
        recordedAudio.controls = false;
        sendVoiceBt.disabled = true;
        g("#reset_voice_bt").disabled = true;
        g("#voice_timer").innerHTML = `00:00:00`;
        voiceRecorderTimer = 0;
    }


    sendVoiceBt.onclick = () => {
        accessSendVoiceToServer.accessToSend(blob);
    }

    let mutePage = (mute) => {
        document.querySelectorAll('audio, video').forEach(item => {
            item.muted = mute;
        });
    }


}


let accessSendVoiceToServer = (() => {
    let file = new Blob();

    let accessToSendFile = (blobFile) => {
        if (typeof blobFile === "object" &&
            blobFile instanceof Blob) {
            if (blobFile.size < 5242880) {
                file = blobFile;
                let j = {
                    data: {
                        username: myInfo.viewerUsername,
                        userTalkSession: myInfo.talkSession,
                        fileSize: Number(blobFile.size)
                    }
                }
                participantEncryptAgent(CMD.ACCESS_SEND_VOICE_TO_SERVER, j)
            } else {
                toast.error("حجم فایل ارسالی برای سوال زیاده")
            }
        }
    }
    let sendFile = (res) => {
        let formData = new FormData();
        formData.append("token", res.token || "");
        formData.append("username", myInfo.viewerUsername);
        formData.append("talkSession", myInfo.talkSession);
        formData.append("serverSession", myInfo.serverSession || "");
        formData.append("supporterId", myInfo.supporterId || 0);
        formData.append("size", file.size || 0);
        formData.append("file", file, "test.ogg");
        let pathUrl = `${res["serverAddress"]}/media-question/voice/viewer-upload`

        // requestSender(pathUrl, formData, "POST", (res) => {
        //     (res.valid) ? toast.success(res["pMessage"]) : toast.error(res["pMessage"]);
        // })
        let option = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData
        }

        fetch(pathUrl, option).then((obj) => {
            return obj.json();
        }).then((res) => {

            if (res.valid) {
                toast.success(res["pMessage"]);
                g("#reset_voice_bt").click()
                ntrx.slideCloseQuestion();
            } else {
                toast.error(res["pMessage"]);
            }
        }).catch((err) => {
            console.error(err);
        });

    }

    return {
        accessToSend: accessToSendFile,
        sendFile: sendFile
    }
})()
