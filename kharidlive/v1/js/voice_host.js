ntrx.closeMediaQuestion = () => {

}

ntrx.openMediaQuestion = () => {

}

ntrx.openVoiceQuestion = ()=>{

}
ntrx.closeVoiceQuestion = () => {

}

ntrx.voice_host = (() => {
    let fileSend = new Blob();
    let accessForSend = (file) => {
        if (typeof file === "object") {
            if (file.size < 0 || file.size > 5242880) {
                fileSend = file;
                let j = {
                    userTalkSession: myInfo.talkSession,
                    file: fileSend,
                    fileLength: fileSend.size
                }
            } else {
                toast.error();
            }
        } else {
            toast.error();
        }
    }

    let sendFile = () => {

    }

    return {
        accessForSend: accessForSend,
        sendFile: sendFile
    }
})()