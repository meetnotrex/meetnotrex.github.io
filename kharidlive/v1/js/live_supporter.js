if (typeof String.prototype.replaceAll === "undefined") {
    String.prototype.replaceAll = function (match, replace) {
        return this.replace(new RegExp(match, 'g'), () => replace);
    }
}
//*** uncomment in production
//if (window.top === window.self) {
//    document.addEventListener('DOMContentLoaded', function () {
//===============================================general section===============================================

var hide = "hide", mHide = "m_hide",
        message_input_js = g("#message"), messageInputFirstTime = true,
        textDiv = g("#text_div"), viewerNumber = g("#viewer_number"),
        itemBarDiv = g(".item_bar_div"), talkNumber = 1,
        iframe = g("#iframe"), chatSub2 = g("#chat_sub2"), isChatShow = true,
        mobilePmBt = g("#mobile_pm_bt"), mobilePmTxt = g("span", mobilePmBt),
        mobilePmIcon = g("img", mobilePmBt), mobilePmQty = 0, chatDiv = g(".chat_div"),
        iframeDiv = g(".iframe_div"), talkQueueQty = g("#add_remove_customer_bt>span"),
        amICustomer = false, offerBt = g("#offer_bt"), offer = {}, msgLock = 0,
        msgLockTimeOut, customerVideo = g("#customer_video"),
        customerMessageNum = 1, customerMsgBuffer = {}, messageAntiDuplicate = new Set(),
        msgNumber = 1, currentMyMsg, viewerCount = g("#viewer_count"),
        myMsgForAck, maxPmQty = 100, currentParticipant, previousActiveParticipant,
        lastPublicOfferLink = null, publicChatMode = false;//, questionMode = false;

message_input_js.contentEditable = false;
setTimeout(a => {
    clearMsgLock(0);
    message_input_js.contentEditable = true;
    message_input_js.focus();
}, 8000);


function getFirstOfferLink(arr) {
    let offer = findInArray(arr, 0, "offer");
    if (offer && offer.length > 1) {
        lastPublicOfferLink = offer[1];
    }
    //        if (arr && typeof arr === 'object' && arr.length > 0) {
    //            for (let k = 0; k < arr.length; k++) {
    //                if (arr[k][0] === "offer") {
    //                    lastPublicOfferLink = arr[k][1];
    ////                    return arr[k][1];
    //                    break;
    //                }
    //            }
    //        }
    ////        return null;
}
//    function getFirstOfferLink(arr) {
//        let offer = findInArray(arr, 0, "offer");
//        if (offer && offer.length > 1) {
//            lastPublicOfferLink = offer[1];
//        } else {
//            offer = findInArray(arr, 0, "page");
//            if (offer && offer.length > 1) {
//                lastPublicOfferLink = offer[1];
//            }
//        }
g("#close_live_bt").onclick = function () {
    var j = {title: ' آیا میخواهید اتاق را ببندید؟'};
    j.control = '<span id="close_live_page" class="button_ctr2 bg-css-red bt">بله صفحه لایو را میبندم</span>';
    showDialog(j);
    g("#close_live_page").onclick = function () {
        destroySession();
    }
}
g("#close_customer_bt").onclick = function () {
    if (currentParticipant) {
        var j = {title: ' میخواهید به گفتگو خاتمه دهید ؟'};
        j.body = '<span>شماره مشتری جاری : ' + currentParticipant.talkNumber + '</span>';
        j.control = '<span id="close_customer_live" class="button_ctr2 bg-css-red bt">بله گفتگو را میبندم</span>';
        showDialog(j);
        g("#close_customer_live").onclick = function () {
            //                monsole.log("current participant Number : " + currentParticipant.talkNumber);
            endParticipantTalk();
            cleanChatBox();
            if (currentParticipant) {
                orchesterSend({publisherId: currentParticipant.userRoomId}, SERVER_ENDPOINT.KICK_USER);
            }
            //                currentParticipant = null; //it will be null when user leaved the room in participantCounterCallback
            closeDialog();
        }
    } else {
        toast.info("هیچ مخاطبی پیدا نشد");
    }
}

offerBt.onclick = function () {
    if (messageInputFirstTime) {
        messageInputFirstTime = false;
        clearMsgLock(0);
    }
    if (!msgLock && offer) {
        if (offer.img) {
            message_input_js.insertAdjacentHTML("beforeend", "<img src='" + offer.img + "' data-title='" + offer.title + "' data-link='" + offer.host + offer.path + "'>");
            setCursorToEnd(message_input_js);
        } else if (offer.title) {
            message_input_js.insertAdjacentHTML("beforeend", "<p data-title='" + offer.title + "' data-link='" + offer.host + offer.path + "'>" + offer.title + "</p>");
            setCursorToEnd(message_input_js);
        }
    } else {
        toast.error("لطفا ابتدا یک صفحه محصول معتبر را لود کنید تا پیشنهاد فعال شود");
    }
}
mobilePmBt.onclick = function () {
    if (isChatShow) {
        isChatShow = false;
        mobilePmIcon.src = "./i/message.svg";
        chatSub2.classList.add(mHide);
        mobilePmTxt.classList.remove(hide);
        mobilePmTxt.textContent = mobilePmQty;
        chatDiv.classList.add("heigth_auto");
        iframeDiv.classList.remove(mHide);
    } else {
        isChatShow = true;
        mobilePmIcon.src = "./i/monitor.svg";
        chatSub2.classList.remove(mHide);
        mobilePmTxt.classList.add(hide);
        chatDiv.classList.remove("heigth_auto");
        iframeDiv.classList.add(mHide);
    }
}
g("#private_bt").onclick = function () {
    if (currentParticipant) {
        var body = packMessage();
        if (body) {
            if (checkMsgLock()) {
                var j = {receiverId: currentParticipant.userRoomId, data: {body: body, userType: USER_TYPE.SUPPORTER, talkSession: currentParticipant.talkSession, mid: getRandom(4), viewerUsername: myInfo.supporterName}};
                currentMyMsg = j;
                supporterEncryptAgent(CMD.PRIVATE_MSG, j);
            }
        } else {
            toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
        }
    } else {
        toast.error("مخاطب مستقیم برای گفتگوی خصوصی در اتاق وجود ندارد");
    }
}

window.addEventListener('message', function (e) {
    monsole.log("parent message received", e);
    monsole.log("parent message", "data: ", e.data, "origin: ", e.origin, e.data.hasOwnProperty("c"), e.data.c === "url", e.data.path);
    offer = null;
    if (e.origin === window.location.origin && e.data.hasOwnProperty("c") && e.data.c === "url" && e.data.isvalid) {
        offer = e.data;
//        monsole.log("offer", offer);
    }
    setOfferKeys();
});


function checkMsgLock() {
    if (!msgLock) {
        msgLockTimeOut = setTimeout(function () {
            clearMsgLock(1);
            toast.error("بعد از 7 ثانیه هنوز پیام به مخاطب نرسیده میخوای دوباره بفرست یا بررسی کن ببین ارتباط برقرار است یا نه");
        }, 7000);
        msgLock = 1;
        message_input_js.contentEditable = false;
        return true;
    } else {
        toast.info("پیام جاری ارسال شده لطفا کمی صبر کنيد")
    }
    return false;
}
function clearMsgLock(withoutTextInputClear) {
    clearTimeout(msgLockTimeOut);
    msgLock = 0;
    message_input_js.contentEditable = true;
    if (!withoutTextInputClear) {
        removeHtml(message_input_js);
    }
}
function setOfferKeys() {
    if (offer) {
        offerBt.classList.remove(hide);
    } else {
        offerBt.classList.add(hide);
    }
}
ntrx.openOfferInIframe = function (e) {
    e = e.dataset.link;
    if (e && e.startsWith(myInfo.siteBaseUrl)) {
        iframe.src = e;
    }
}
function packMessage() {
    var r = [], slice, isCorrectStructure = {flag: true};
    var txt = message_input_js.innerHTML.replace(/&nbsp;/gim, "").split("<br>");
    monsole.log("pack message txt : " + txt);
    //        console.log("pack message txt : " + txt);
    for (var f = 0; f < txt.length; f++) {
        slice = txt[f].trim();
        if (slice.length < 1) {
            continue;
        }
        monsole.log("new Slice : " + slice);
        //            console.log("new Slice : " + slice);
        processPackSlice(r, slice, isCorrectStructure);
    }
    monsole.log(r, isCorrectStructure);
    //        console.log(r, isCorrectStructure);
    if (r.length > 0 && isCorrectStructure.flag) {
        return r;
    }
    return null;
}
function processPackSlice(res, slice, isCorrectStructure) {
    var i1, i2;
    //        console.log("processPackSlice :: res:", res, "slice:", slice, "slice len:", slice.length, "isCorrectStructure:", isCorrectStructure);
    if (slice.includes("<img src=")) {
        //            console.log("type of img");
        var arr, flag, str, src, link, title, check;
        for (var d = 0; d < slice.length; ) {//d++
            arr = [];
            i1 = slice.indexOf("<img src=", d);
            i2 = slice.indexOf(">", i1);
            if (i1 > d) {
                processPackSlice(res, slice.substring(d, i1).replace(/<br>/gim, ""), isCorrectStructure);
            }
            if (i1 < 0) {
                processPackSlice(res, slice.substring(d, slice.length).replace(/<br>/gim, ""), isCorrectStructure);
                d = slice.length;
            } else {
                i2 += 1;
                str = slice.substring(i1, i2);
                flag = true;
                var el = new DOMParser().parseFromString(str, 'text/html').body.firstChild;
                monsole.log("el : ", el, "typeof el : ", typeof el, 'el len; ', el.length, "str : " + str);
                if (typeof el === 'object') {
                    src = el.src;
                    title = el.dataset.title;
                    link = el.dataset.link;
                    if (!link.startsWith(myInfo.siteBaseUrl)) {
                        flag = false;
                        monsole.log("link : " + link)
                        toast.error("لینک پیشنهاد مربوط به این سایت نمیباشد");
                    }
                    check = isInputValidate(src);
                    if (!check) {
                        flag = false;
                        toast.error("عکس پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در آدرس عکس پیشنهاد حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                    check = isInputValidate(title);
                    if (!check) {
                        flag = false;
                        toast.error("عنوان پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در متن عنوان پیشنهاد حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                    check = isInputValidate(link);
                    if (!check) {
                        flag = false;
                        toast.error("لینک پیشنهاد ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در لینک پیشنهاد حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                    if (flag) {
                        res.push(["offer", link, title, src]);
                    } else {
                        isCorrectStructure.flag = false;
                    }
                } else {
                    isCorrectStructure.flag = false;
                    toast.error("پیشنهاد ساختار معتبری ندارد!");
                }
                d = i2;
            }
        }
    } else if (slice.includes("<p ")) {
        //            console.log("type of <p>");
        var arr, flag, str, link, title, check;
        for (var d = 0; d < slice.length; ) {//d++
            //                console.log("<p> for d:", d, "slice:", slice, "slice length:", slice.length);
            arr = [];
            i1 = slice.indexOf("<p ", d);
            i2 = slice.indexOf("</p>", i1);
            if (i1 > d) {
                //                    console.log("i1 > d <p>");
                processPackSlice(res, slice.substring(d, i1).replace(/<br>/gim, ""), isCorrectStructure);
            }
            if (i1 < 0) {
                //                    console.log("i1 < d <p>");
                processPackSlice(res, slice.substring(d, slice.length).replace(/<br>/gim, ""), isCorrectStructure);
                d = slice.length;
            } else {
                i2 += 4;
                str = slice.substring(i1, i2);
                //                    console.log("<p> str : ", str);
                flag = true;
                var el = new DOMParser().parseFromString(str, 'text/html').body.firstChild;
                monsole.log("el : ", el, "typeof el : ", typeof el, 'el len; ', el.length, "str : " + str);
                //                    console.log("el : ", el, "typeof el : ", typeof el, 'el len; ', el.length, "str : " + str);
                if (typeof el === 'object') {
                    title = el.dataset.title;
                    link = el.dataset.link;
                    //                        console.log("<p> title:", title, "link", link);
                    if (!link.startsWith(myInfo.siteBaseUrl)) {
                        flag = false;
                        monsole.log("link : " + link)
                        toast.error("لینک پیشنهاد مربوط به این سایت نمیباشد");
                    }
                    check = isInputValidate(title);
                    if (!check) {
                        flag = false;
                        toast.error("عنوان صفحه ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در متن عنوان صفحه حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                    check = isInputValidate(link);
                    if (!check) {
                        flag = false;
                        toast.error("لینک صفحه ساختار درستی ندارد");
                    } else if (!check[0]) {
                        flag = false;
                        toast.error("در لینک صفحه حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                    }
                    if (flag) {
                        res.push(["page", link, title]);
                    } else {
                        isCorrectStructure.flag = false;
                    }
                    // console.log("<p> res array:", res);
                } else {
                    isCorrectStructure.flag = false;
                    toast.error("صفحه ساختار معتبری ندارد!");
                }
                d = i2;
            }
        }
    } else if (slice.includes("http")) {
        //            console.log("type of http ");
        slice += "<br>";
        for (var d = 0; d < slice.length; d++) {
            monsole.log("link with http ", slice);
            i1 = slice.indexOf("http", d);
            i2 = slice.indexOf("<br>", i1);
            if (i1 > d) {
                str = slice.substring(d, i1).replace(/<br>/gim, "");
                check = isInputValidate(str);
                if (!check) {
                    isCorrectStructure.flag = false;
                    toast.error("جزییات ساختار درستی ندارد");
                } else if (!check[0]) {
                    isCorrectStructure.flag = false;
                    toast.error("در جزییات حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                } else {
                    str = str.replaceAll('\n', '').trim();
                    if (false && !str.startsWith(myInfo.siteBaseUrl)) {//ignore link validation , by ignoring this step any links with any source could be sent
                        isCorrectStructure.flag = false;
                        toast.error("لینک ارسال شده مربوط به این سایت نمیباشد");
                    } else {
                        res.push(["span", str]);
                    }
                }
            }
            if (i1 < 0 || i2 < 1) {
                continue;
            }
            str = slice.substring(i1, i2);
            check = isInputValidate(str);
            if (!check) {
                isCorrectStructure.flag = false;
                toast.error("لینک ارسالی ساختار درستی ندارد");
            } else if (!check[0]) {
                isCorrectStructure.flag = false;
                toast.error("در لینک ارسالی حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
//            } else if (!str.startsWith(myInfo.siteBaseUrl)) { //ignore link validation , by ignoring this step any links with any source could be sent
//                isCorrectStructure.flag = false;
//                toast.error("لینک ارسال شده مربوط به این سایت نمیباشد");
            } else {
                res.push(["a", str]);
            }
            d = i2 + 3;
        }
    } else {
        //            console.log("type of else (span) ! slice:", slice);
        monsole.log("span    ", slice);
        str = slice;
        check = isInputValidate(str);
        if (!check) {
            isCorrectStructure.flag = false;
            toast.error("متن ارسالی ساختار درستی ندارد");
        } else if (!check[0]) {
            isCorrectStructure.flag = false;
            toast.error("در متن ارسالی حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
        } else {
            res.push(["span", str.replaceAll('\n', '').trim()]);
        }
    }
}
function unpackMessage(body) {
    var msgArr = [], check, flag = true;
    if (body && body.length > 0) {
        body.forEach(function (e) {
            if (e[0] === "span") {
                check = isInputValidate(e[1]);
                if (check == undefined) {
                    flag = false;
                    toast.error("پیام دریافت شده خالی است!");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در پیام دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                } else {
                    msgArr.push(["span", e[1]]);
                }
            } else if (e[0] === "a") {
                check = isInputValidate(e[1]);
                if (check == undefined) {
                    flag = false;
                    toast.error("لینک دریافت شده خالی است!");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در لینک دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
//                } else if (!e[1].startsWith(myInfo.siteBaseUrl)) {
//                    flag = false;
//                    toast.error("لینک ارسال شده به این سایت مرتبط نمی باشد");
                } else {
                    msgArr.push(["a", e[1]]);
                }
            } else if (e[0] === "offer") {
                if (!e[1].startsWith(myInfo.siteBaseUrl)) {
                    flag = false;
                    toast.error("لینک دریافت شده مربوط به این سایت نمیباشد و دارای ریسک بیشتری است : " + e[1]);
                }
                check = isInputValidate(e[1]);
                if (!check) {
                    flag = false;
                    toast.error("لینک پیشنهاد ساختار درستی ندارد");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در لینک پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
                check = isInputValidate(e[2]);
                if (!check) {
                    flag = false;
                    toast.error("عنوان پیشنهاد ساختار درستی ندارد");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در عنوان پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
                check = isInputValidate(e[3]);
                if (!check) {
                    flag = false;
                    toast.error("لینک عکس پیشنهاد ساختار درستی ندارد");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در لینک عکس پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
                if (flag) {
                    msgArr.push(["offer", e[1], e[2], e[3]]);
                }
            } else if (e[0] === "page") {
                if (!e[1].startsWith(myInfo.siteBaseUrl)) {
                    flag = false;
                    toast.error("لینک دریافت شده مربوط به این سایت نمیباشد و دارای ریسک بیشتری است : " + e[1]);
                }
                check = isInputValidate(e[1]);
                if (!check) {
                    flag = false;
                    toast.error("لینک پیشنهاد ساختار درستی ندارد");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در لینک پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
                check = isInputValidate(e[2]);
                if (!check) {
                    flag = false;
                    toast.error("عنوان پیشنهاد ساختار درستی ندارد");
                } else if (!check[0]) {
                    flag = false;
                    toast.error("در عنوان پیشنهاد دریافت شده حروف غیر مجاز پیدا شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
                if (flag) {
                    msgArr.push(["page", e[1], e[2]]);
                }
            } else {
                flag = false;
            }
        });
        return flag ? msgArr : null;
    } else {
        return null;
    }
}
function processUnpackHtmlMessage(userType, body, customerMsgNum, viewerUsername) {//, withoutFirstOffer
    if (userType && body) {
        var flag = true, firstOffer, isSupporterType = userType === USER_TYPE.SUPPORTER;
        monsole.log("processUnpackHtmlMessage ", isSupporterType, amICustomer, userType, body, customerMsgNum);
        var h = '<div class="msg ' + (isSupporterType ? 'supporter"' : 'customer" data-id="' + customerMsgNum + '"') + '>' +
                '<div class="msg_header">' +
                //'<span class="name">' + (isSupporterType ? ' کارشناس مشاور ' : ' مشتری ') + '</span>' +
                '<span class="name">' + viewerUsername + '</span>' +
                (!isSupporterType && !amICustomer ?
                        '<span class="unlockbt button_ctr" onclick="ntrx.unlockPm(this)">نمایش عمومی</span>' : '') +
                '<img src="./i/' + (isSupporterType ? 'support-48.png' : 'user_chat.png') + '">' +
                '</div>';
        body.forEach(function (e) {
            if (e[0] === "span") {
                h += '<span class="msg_txt">' + e[1] + '</span>';
            } else if (e[0] === "a") {
                //                    h += '<a class="msg_link" href="' + e[1] + '" target="_blank"><i class="fas fa-external-link-alt"></i>' + e[1] + '</a>';
                h += '<a class="msg_link" href="' + e[1] + '" target="_blank"><img src="./i/external_link.svg">' + e[1] + '</a>';

            } else if (e[0] === "offer") {//link, title, src
                if (currentParticipant && userType === USER_TYPE.SUPPORTER) {
                    currentParticipant.offerQty++;
                }
                if (!firstOffer) {
                    firstOffer = e[1];
                }
                h += '<div class="msg_offer" data-link="' + e[1] + '" onclick="ntrx.openOfferInIframe(this)"><img src="' + e[3] + '"><span>' + e[2] + '</span></div>'
            } else if (e[0] === "page") {//link, title
                if (currentParticipant && userType === USER_TYPE.SUPPORTER) {
                    currentParticipant.offerQty++;
                }
                if (!firstOffer) {
                    firstOffer = e[1];
                }
                h += '<div class="msg_offer" data-link="' + e[1] + '" onclick="ntrx.openOfferInIframe(this)"><span>' + e[2] + '</span></div>'
            } else {
                flag = false;
            }
        });
        h += '</div>';
        if (flag && body.length > 0) {
            textDiv.insertAdjacentHTML("afterbegin", h);
            removeChildren(g(".msg", textDiv, 1), maxPmQty);
            return true;
        }
    }
    return false;
}
function sendDataChannelCallback(isSuccessful, data) {
    if (isSuccessful) {
        myMsgForAck = data;
    } else {
        toast.error("پیام ارسال نشد ارتباط با سرور را چک کنید")
    }
}
function ackMsgCallback(j) {
    monsole.log("ackMsgCallback", currentMyMsg, j);
    if (j && currentMyMsg && j.data.mid && j.data.mid === currentMyMsg.data.mid) {
        var body = unpackMessage(currentMyMsg.data.body);
        var flag = false;
        if (body) {
            flag = processUnpackHtmlMessage(currentMyMsg.data.userType, body, currentMyMsg.data.msgNumber, currentMyMsg.data.viewerUsername);
        }
        currentMyMsg = null;
        clearMsgLock(0);
        if (!flag) {
            toast.error("پیام شما ساختار درستی ندارد و قابل نمایش نیست");
        }
    }
}
function writeMsgToChatList(j) {
    if (j && j.data.mid && !messageAntiDuplicate.has(j.data.mid)) {
        messageAntiDuplicate.add(j.data.mid);
        //console.log("writeMsgToChatList  ", j, typeof j);
        var body = unpackMessage(j.data.body);
        if (body) {
            var num = msgNumber++;
            if (!amICustomer) {
                customerMsgBuffer["num-" + num] = {data: {body: j.data.body, msgNumber: num, userType: USER_TYPE.PARTICIPANT, mid: j.data.mid, viewerUsername: j.data.viewerUsername}};
            }
            var flag = processUnpackHtmlMessage(j.data.userType, body, num, j.data.viewerUsername);
            //            monsole.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  flag", flag);
            if (flag) {
                if (currentParticipant && !publicChatMode) {
                    var j2 = {receiverId: currentParticipant.userRoomId, data: {mid: j.data.mid, msgNumber: num, talkSession: currentParticipant.talkSession}};
                    //                monsole.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD  j2", j2);
                    supporterEncryptAgent(CMD.MSG_ACK, j2);
                } else if (publicChatMode) {
                    var j2 = {receiverId: j.userRoomId, data: {mid: j.data.mid, msgNumber: num, talkSession: j.data.talkSession}};
                    //console.log("publicChatMode   DDDDDDDDDDDDDDDDDDDDDDDDDDD  j2", j2);
                    supporterEncryptAgent(CMD.MSG_ACK, j2);
                }
            } else {
                toast.error("پیام دریافت شد اما ساختار درستی ندارد");
            }
        } else {
            toast.error("ساختار پیام فرستنده استاندارد نبود و قابل نمایش نیست");
        }
    }
}
//=============================================== supporter section ===============================================
if (!amICustomer) {
    var statisticsLock = false;
    //[img src,title,count,duration,link]
    var visitedItemList = null;

    g("#public_bt").onclick = function () {
        var body = packMessage();
        if (body) {
            if (!currentParticipant || checkMsgLock()) {
                getFirstOfferLink(body);
                var j = {data: {body: body, userType: USER_TYPE.SUPPORTER, mid: getRandom(4), msgNumber: msgNumber++, viewerUsername: myInfo.supporterName}};
                //                    monsole.log("+++++++++++++++++++++++ public bt 1 +++++++++ currentMyMsg", currentMyMsg);
                supporterEncryptAgent(CMD.PUBLIC_MSG, j);
                //                    monsole.log("+++++++++++++++++++++++ public bt 2 +++++++++ currentMyMsg", currentMyMsg);
                currentMyMsg = j;
                if (!currentParticipant) {
                    ackMsgCallback(j);
                }
            }
        } else {
            toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
        }
    }
    g("#clean_bt").onclick = function () {
        cleanChatBox();
        closeDotMenuOpen();
    }
    g("#item_bar_close").onclick = function () {
        itemBarDiv.classList.add(hide);
        removeHtml(".item_bar_wrapper", itemBarDiv);
    }

    g("#item_bar_refresh").onclick = sendStatisticsRequest;

    g("#visited_bt").onclick = function () {
        if (myInfo.isAnalyseAllowed) {
            if (visitedItemList && visitedItemList.length > 0) {
                receiveStatisticsResponse();
            } else {
                sendStatisticsRequest();
            }
        }
    }
    function sendStatisticsRequest() {
        if (currentParticipant && currentParticipant.talkSession) {
            if (!statisticsLock) {
                statisticsLock = true;
                visitedItemList = null;
                checkViewerStatistics(currentParticipant.talkSession);
                //                    encapsulateMsg(CHAT_CMD.STATISTICS_REQUEST, ["list"]);
                //                    toast.info("درخواست آمار بازدید کاربر ارسال شد لطفا صبور باشید ممکن است دریافت پاسخ آن زمان زیادی نیاز داشته باشد");
                toast.info("تا زمان دریافت آمار بازدید مشتری کمی صبر کنید");
                setTimeout(function () {
                    statisticsLock = false;
                }, 60000);
            } else {
                toast.info("لطفا صبور باشید این یک درخواست تحلیل و آنالیز است و اگر کاربر صفحات زیادی را بازدید کرده باشد طبیعتا بدست آوردن آن کمی بیشتر طول خواهد کشید");
            }
        } else {
            toast.error("ابتدا یکی از مشتریان در kharidlive انتظار برای گفتگو را تایید کنید");
        }
    }

    function receiveStatisticsResponse() {
        if (currentParticipant && visitedItemList) {
            statisticsLock = false;
            var elem = "";
            //[[hash,link,title,image,totalTime,days],...]
            visitedItemList.forEach(function (e) {
                e[4] *= 1000;
                elem += '<div class="item_bar_item" data-link="' + e[1] + '">' +
                        '<img src="' + e[3] + '" class="item_bar_img" loading="lazy">' +
                        '<div class="item_bar_txt">' +
                        '<span class="item_bar_title">' + e[1] + '</span>' +
                        '<span>تعداد روز : ' + e[5] + '</span>' +
                        '<span>زمان : ' + (getDateDifferenceByHour(e[4])) + '</span>' +
                        '<span> میانگین : ' + (getDateDifferenceByMin(e[4] / e[5])) + '</span>' +
                        '</div>' +
                        '<div class="item_bar_inner_control">' +
                        //                            '<i class="fas fa-eye open_here"></i>' +
                        //                            '<i class="fas fa-external-link-alt open_new"></i>' +
                        '<img src="./i/eye.svg" class="open_here">' +
                        '<img src="./i/external_link.svg" class="open_new">' +
                        '</div>' +
                        '</div>';
            });
            itemBarDiv.classList.remove(hide);
            g(".item_bar_wrapper", itemBarDiv).innerHTML = elem;
            g(".open_here", itemBarDiv, 1).forEach(function (i) {
                i.onclick = function () {
                    var link = this.closest(".item_bar_item").dataset.link;
                    monsole.log("link is : " + link);
                    if (!link.startsWith("http") || link.startsWith(myInfo.siteBaseUrl)) {
                        iframe.src = link;
                    } else {
                        toast.error("لینک اشتباه است لینک باید با آدرس " + myInfo.siteBaseUrl + " شروع شده باشد");
                    }
                }
            });
            g(".open_new", itemBarDiv, 1).forEach(function (i) {
                i.onclick = function () {
                    var link = this.closest(".item_bar_item").dataset.link;
                    monsole.log("link is : " + link);
                    if (!link.startsWith("http") || link.startsWith(myInfo.siteBaseUrl)) {
                        openLinkInNewTab(link);
                    } else {
                        toast.error("لینک اشتباه است لینک باید با آدرس " + myInfo.siteBaseUrl + " شروع شده باشد");
                    }
                }
            });
        } else {
            toast.error("ابتدا یکی از مشتریان در kharidlive انتظار برای گفتگو را تایید کنید");
        }
    }
    g("#ban_customer_bt").onclick = function () {
        if (previousActiveParticipant) {
            var j = {title: ' مطمئنی میخوای این کاربر را مسدود کنی ؟'};
            j.body = '<span>شماره مشتری : ' + previousActiveParticipant.talkNumber + '</span>' +
                    '<span>علت : <sub>(حداکثر 250 حرف)</sub></span>' +
                    '<textarea maxlength="250"></textarea>';
            j.control = '<span id="ban_user" class="button_ctr2 bg-css-red bt">بله مسدود میکنم</span>';
            var dialog = showDialog(j);
            g("textarea", dialog).focus();
            g("#ban_user", dialog).onclick = function () {
                monsole.log("accepted username is : " + previousActiveParticipant);

                var reasons = g("textarea", dialog).value.trim();
                var check = isInputValidate(reasons);
                if (!check) {
                    toast.error("لطفا علت مسدود شدن را بفرمایید");
                } else if (check[0]) {
                    if (reasons.length < 10) {
                        toast.error("متن علت مسدود کردن کاربر خیلی کوتاه است");
                    } else if (reasons.length > 250) {
                        toast.error("متن علت مسدود کردن کاربر خیلی زیاد است");
                    } else {
                        toast.info("کمی صبر کنید");
                        var json = {talkSession: previousActiveParticipant.talkSession, publisherId: previousActiveParticipant.userRoomId, reason: reasons};
                        orchesterSend(json, SERVER_ENDPOINT.BAN_USER, function (isSuccess, result) {
                            if (isSuccess) {
                                if (result.status === "ok") {
                                    toast.success("کاربر با موفقیت مسدود شد");
                                    closeDialog();
                                }
                            }
                        });
                    }
                } else {
                    toast.error("در متن علت مسدود کردن کاربر حروف غیر مجاز دیده شده : " + check[1] + " لطفا اصلاح کنید یا از گزینه پاک کن کنار چت باکس استفاده کنید");
                }
            }
        } else {
            toast.error("هنوز کسی به گفتگو با شما نپرداخته است");
        }
    }
    var talkLock = 0, talkLockTimeOut;
    function checkTalkLock() {
        if (!talkLock) {
            if (!currentParticipant) {
                talkLockTimeOut = setTimeout(function () {
                    clearTalkLock();
                    toast.error("بعد از 12 ثانیه هنوز مشتری دعوت به گفتگو را تایید نکرده است");
                    currentParticipant = null;
                }, 12000);
                talkLock = 1;
                return true;
            } else {
                toast.info("با مشتری شماره " + currentParticipant.talkNumber + " در حال گفتگو هستید و وقتی گفتگو به پایان رسید میتوانید نوبت گفتگو را به مشتری بعدی بدهید");
            }
        } else {
            toast.info("دعوت به گفتگو ارسال شده لطفا کمی صبر کنيد");
        }
        return false;
    }
    function clearTalkLock() {
        clearTimeout(talkLockTimeOut);
        talkLock = 0;
    }
    g("#open_link_bt").onclick = function () {
        var j = {title: ' باز کردن یک صفحه از سایت خود:'};
        j.body = '<input type="url" id="site_link" class="ltr" placeholder="آدرس را وارد کنید">';
        j.control = '<span id="enter_link_bt" class="button_ctr2 bg-css-blue bt">صفحه باز شود</span>';
        var dialog = showDialog(j);
        g("#site_link", dialog).focus();
        g("#enter_link_bt", dialog).onclick = function () {
            var link = g("#site_link", dialog).value.trim();
            if (link.length < 10) {
                toast.error("لینک ورودی خیلی کوتاه است");
            } else if (!link.startsWith(myInfo.siteBaseUrl)) {
                toast.error("لینک باید متعلق به این سایت باشد");
            } else {
                iframe.src = link;
                closeDialog();
            }
        }
    }
    g("#add_remove_customer_bt").onclick = function () {
        if (currentParticipant) {
            toast.error("در حال حاضر در حال گفتگو هستید لطفا ابتدا مکالمه را خاتمه دهید");
        } else {
            if (talkWaitingQueue && talkWaitingQueue.length > 0) {
                var nowTime = new Date() * 1;
                var j = {title: 'برای گفتگو یکی رو از kharidlive انتخاب کنید:'};
                var elem = '<div class="w_item_wrapper">';
                talkWaitingQueue.forEach(function (e) {
                    //{data: {talkSession: myInfo.talkSession,itemCount:qty,totalDuration:time,userType:myInfo.userType}}
                    elem += '<div class="waiting_item" data-participantUsername="' + e.viewerUsername + '  data-name="' + e.name + '" data-talkSession="' + e.talkSession + '" data-talkNumber="' + e.talkNumber + '">' +
                            //                        '<span class="w_i_title">شماره: ' + e.talkNumber + '</span>' +
                            '<span class="w_i_time">' + (getDateDifferenceByHour(e.time, nowTime)) + ' قبل</span>' +
                            '<div class="w_i_statistics">' +
                            '<div class="waiting_username_div"><span> نام کاربر : </span><span class="waiting_username">&nbsp;' + e.viewerUsername + '&nbsp;</span></div>' +
                            '<span> شماره : ' + e.talkNumber + '</span>' +
                            '<span>نوع کاربری : ' + getUserType(e.userType) + '</span>' +
                            '<span>تعداد صفحات : ' + e.itemCount + '</span>' +
                            '<span>زمان کل بازدید : ' + (e.totalDuration > 0 ? getDateDifferenceByHour(e.totalDuration) : 0) + '</span>' +
                            '<span>میانگین بازدید از صفحات : ' + (e.totalDuration > 0 && e.itemCount > 0 ? getDateDifferenceByMin(e.totalDuration / e.itemCount) : 0) + '</span>' +
                            '</div><div class="controller_div">' +
                            '<span class="button_ctr2 bg-css-blue accept_talk_bt">تایید</span>' +
                            '<span class="button_ctr2 bg-css-green check_talk_bt">بررسی</span>' +
                            '<span class="button_ctr2 bg-css-red remove_talk_bt">حذف</span>' +
                            '</div></div>';
                });
                elem += '</div>';
                j.body = elem;
                var dialog = showDialog(j);
                g(".accept_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {

                        var who = this.closest(".waiting_item").dataset, talkNumber = Number(who.talknumber), talkSession = who.talksession, participantUsername = who.participantUsername;
                        monsole.log("accept_talk_bt", who, talkNumber, talkSession);
                        if (talkNumber && talkSession) {
                            var waitViewer = findInArray(talkWaitingQueue, "talkSession", talkSession);
                            if (waitViewer && waitViewer.talkNumber === talkNumber) {
                                if (checkTalkLock()) {
                                    messageAntiDuplicate.clear();
                                    currentParticipant = waitViewer;
                                    currentParticipant.startTalkTime = new Date() * 1;
                                    currentParticipant.offerQty = 0;
                                    currentParticipant.participantUsername = participantUsername;
                                    previousActiveParticipant = currentParticipant;
                                    monsole.log("accepted user, talkNumber", talkNumber, "talkSession", talkSession);
                                    var j = {receiverId: waitViewer.userRoomId, talkNumber: talkNumber, data: {talkSession: talkSession}};
                                    supporterEncryptAgent(CMD.ACCEPT_VIEWER_TALK, j);
                                    toast.info("دعوت به گفتگو ارسال شد");
                                }
                            } else {
                                toast.error("احتمالا مشتری از مکالمه منصرف شده یا در اتاق موجود نیست میتوانید این درخواست را حذف کنید");
                            }
                        }
                    }
                });
                g(".check_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {
                        var who = this.closest(".waiting_item").dataset, talkNumber = Number(who.talknumber), talkSession = who.talksession;
                        if (talkNumber && talkSession) {
                            //                        var talkSession = this.closest(".waiting_item").dataset.talksession;
                            var waitViewer = findInArray(talkWaitingQueue, "talkSession", talkSession);
                            if (waitViewer && waitViewer.talkNumber === talkNumber) {
                                monsole.log("check_talk_bt", talkSession);
                                checkViewerIsExist(talkSession);
                            } else {
                                toast.error("احتمالا مشتری از مکالمه منصرف شده یا در اتاق موجود نیست میتوانید این درخواست را حذف کنید");
                            }
                        }
                    }
                });
                g(".remove_talk_bt", dialog, 1).forEach(function (i) {
                    i.onclick = function () {
                        //                            currentParticipant = null;
                        var talkSession = this.closest(".waiting_item").dataset.talksession;
                        monsole.log("remove_talk_bt", talkSession);
                        removeTalkRequestToCustomer(talkSession);
                    }
                })
            } else {
                toast.info("هنوز کسی درخواست گفتگو نداده است");
            }
        }
    }
    function getUserType(type) {
        switch (type) {
            case 8:
                return "مهمان";
            case 7:
                return "اجتماعی";
                //                case 3:
                //                    return "اجتماعی";
            default:
                return "هیچی پیدا نشد";
        }
    }
    ntrx.unlockPm = function (e) {
        var parent = e.closest(".customer.msg");
        var msgId = Number(parent.dataset.id);
        //console.log("unlockPm msgId" , msgId);
        if (msgId && msgId > 0) {
            var data = customerMsgBuffer["num-" + msgId];
            //console.log("unlockPm data" , data);
            if (data && data.data) {
                // data.data.mid = getRandom(4);
                parent.querySelector(".unlockbt").remove();
                supporterEncryptAgent(CMD.PUBLISH_CUSTOMER_MSG, data);
            } else {
                toast.error("شاید عجیب باشه ولی ما این پیام رو در حافظه پیدا نکردیم اگر پیام مهمی بوده که میخواستید برای دیگران هم ارسال کنید به مخاطبتون بگید که دوباره ارسال کند")
            }
        }
    }
}
function cleanChatBox() {
    removeHtml(message_input_js);
    var j = {data: {body: "erase"}};
    supporterEncryptAgent(CMD.CLEAN_CHAT_BOX, j);
    removeChildren(g(".msg", textDiv, 1), 0);
}

g("#open_chat_bt").onclick = () => {
    publicChatMode = !publicChatMode;
    g("#open_chat_bt span").textContent = publicChatMode ? "بستن پیام عمومی" : "باز کردن پیام عمومی";
    closeDotMenuOpen();
    var j = {data: {publicchatmode: publicChatMode}};
    //console.log("updateQuestionAnswer j:",j);
    supporterEncryptAgent(CMD.ACTIVE_AND_DEACTIVE_CHAT, j);
}



// g("#question_bt").onclick = () => {
//     closeDotMenuOpen();
//     var j = {title: ' ایجاد نظرسنجی و سوال:'};
//     j.body = '<div id="question_parent">' +
//             '<div class="question_radio_group">' +
//             '<p>نوع :</p>' +
//             '<input type="radio" id="single_option" name="selector" value="1" checked onclick="ntrx.clearQuestionBox()">' +
//             '<label for="single_option">تک جوابی</label>' +
//             '<input type="radio" id="multiple_option" name="selector" value="2" onclick="ntrx.clearQuestionBox()">' +
//             '<label for="multiple_option">چند جوابی</label>' +
//             '<input type="radio" id="text_option" name="selector" value="3" onclick="ntrx.clearQuestionBox()">' +
//             '<label for="text_option">متنی</label>' +
//             '</div>' +
//             '<div>' +
//             '<div class="question_box">' +
//             '<textarea placeholder="متن سوال را وارد کنید" id="question_text_box" cols="35" rows="3" onkeyup="ntrx.qustionBoxOnKeyUpForNextOption()"></textarea>' +
//             '</div>' +
//             '<div id="answer_box"></div>' +
//             '<div class="accept_question_box">' +
//             '</div>' +
//             '</div>' +
//             '</div>';


//     j.control = '<span id="accept_question_bt" class="button_ctr2 bg-css-blue bt">ارسال</span>';
//     var dialog = showDialog(j);
//     questionSwithOption = true;
//     questionTextBox = g("#question_text_box");
//     g("textarea", dialog).focus();
//     g("#accept_question_bt", dialog).onclick = function () {
//         sendQuestionData();
//         toast.info("سوال دریافت و در حال پردازش است اگر مشکلی نباشد برای بینندگان ارسال می گردد");
//         closeDialog();
//     }
// }






var questionTextBox, questionBoxArr = [];



let questionSwithOption = true, questionTypeOption, questionId;
ntrx.qustionBoxOnKeyUpForNextOption = function () {
    //console.log("keyup fired questionSwithOption:",questionSwithOption);
    if (questionTextBox.value.trim() != "" && questionSwithOption) {
        questionSwithOption = false;
        questionTypeOption = Number(g('input[name="selector"]:checked').value);
        switch (questionTypeOption) {
            case QUESTION_CONFIG.radioButton.type:
                answerTagCreator();
                break;
            case QUESTION_CONFIG['checkBox']["type"]:
                answerTagCreator();
                break;
            case QUESTION_CONFIG['textBox']["type"]:
                removeAllSubTag();
                break;
        }
    } else if (questionTextBox.value === "" && !questionSwithOption) {
        questionSwithOption = true;
        removeAllSubTag();
    }
}


function answerTagCreator(inputValue = "") {
    const answerBox = g("#answer_box");
    let inputField = createRadioButton();
    answerBox.appendChild(inputField);

    let input = inputField.querySelector(".question_option_input");
    input.checked = true;
    input.value = inputValue

    input.addEventListener("keyup", (e) => {
        if (e.target.checked && e.target.value.trim() !== "") {
            answerTagCreator("");
            e.target.checked = false;
        } else if (!e.target.checked && e.target.value.trim() === "") {
            answerBox.removeChild(inputField);
        }
    })
}


function createRadioButton() {
    let div = document.createElement("div");
    div.classList.add("question_option");

    let img = document.createElement("img");
    img.src = "./i/close.svg";
    img.setAttribute("onclick", "removeInput(this)");

    let input = document.createElement("input");
    input.type = "text";
    input.name = "fill";
    input.classList.add("question_option_input")
    input.placeholder = "گزینه جدید";
    div.appendChild(input);
    div.appendChild(img)

    return div;
}

function removeInput(e) {
    let input = e.parentNode.querySelector("input").value.trim();
    if (input !== "") {
        const answerBox = g("#answer_box");
        answerBox.removeChild(e.parentNode);
    }
}

ntrx.clearQuestionBox = function () {
    questionTextBox.value = "";
    removeAllSubTag()
}

function removeAllSubTag() {
    let baseTag = g('#answer_box > div', 0, 1);
    baseTag.forEach(elem => {
        elem.remove()
    });
    questionSwithOption = true;
}


function sendQuestionData() {
//    let qId = getRandom(5);
//    let questionObject = {
//        questionId: qId,
//        type: questionTypeOption,
//        question: "",
//        option: []
//    }

    let surveyObject = {
        surveyId: '',
        surveyBody: {
            question: "",
            option: [],
            type: questionTypeOption
        },
        surveyAnswer: []
    }


    let questionTitle = questionTextBox.value.trim();

    if (questionTitle.length !== 0 && isInputValidate(questionTitle)[0]) {

        surveyObject.surveyBody["question"] = questionTitle;

        let questionTypeValid = false;
        switch (questionTypeOption) {
            case QUESTION_CONFIG["radioButton"]["type"]:
            case QUESTION_CONFIG["checkBox"]["type"]:
                questionTypeValid = true;

                let allAnswerOptions = g('input[name="fill"]', 0, 1);
                let validateAnswerArr = [];

                allAnswerOptions.forEach(item => {
                    let i = item.value.trim();
                    if (i.length !== 0) {
                        if (isInputValidate(i)[0]) {
                            validateAnswerArr.push(i);
                        }
                    }
                });

                const arrayUniqueByKey = [...new Map(validateAnswerArr.map(item => [item, item])).values()];

                if (arrayUniqueByKey.length > 0) {
                    let value = 1;
                    for (const iterator of arrayUniqueByKey) {
                        let o = {
                            value: value++,
                            answer: iterator
                        }
                        surveyObject.surveyBody["option"].push(o);
                    }
                    removeAllSubTag();
                } else {
                    toast.error("سوال بدون گزینه های انتخابی قابل ارسال نیست");
                }
                break;

            case QUESTION_CONFIG["textBox"]["type"]:
                questionTypeValid = true;
                break;
        }

        if (questionTypeValid) {
            let formData = new FormData();
            formData.append("supporterId", myInfo.supporterId);
            formData.append("siteId", myInfo.siteId);
            formData.append("serverSession", myInfo.serverSession);
            formData.append("talkSession", myInfo.talkSession);
            formData.append("surveyBody", JSON.stringify(surveyObject["surveyBody"]));
            formData.append("roomId", myInfo.roomId);
            let pathUrl = `${hostServerAddress}/supporter/insert-survey-question`

            requestSender(pathUrl, formData, "POST", (res) => {
                if (res.valid) {
                    surveyObject.surveyId = res["data"];
                    toast.success(res["pMessage"]);
                    postQuestionToUsers({
                        questionId: surveyObject["surveyId"],
                        type: surveyObject.surveyBody["type"],
                        question: surveyObject.surveyBody["question"],
                        option: surveyObject.surveyBody["option"]
                    });
                    questionBoxArr.push(surveyObject);
                    ntrx.clearQuestionBox();
                } else {
                    toast.error(res["pMessage"]);
                }
            })
        }
    } else {
        toast.error("از حروف غیر مجاز استفاده نکنید");
    }
}

function getPreviousQuestion() {
    let previousQuestionArr = [];
    if (questionBoxArr.length && questionBoxArr.length > 0) {
        for (const iterator of questionBoxArr) {
            previousQuestionArr.push({
                questionId: iterator["surveyId"],
                type: iterator.surveyBody["type"],
                question: iterator.surveyBody["question"],
                option: iterator.surveyBody["option"]
            })
        }
    }
    return previousQuestionArr;
}

function postQuestionToUsers(questionObject) {
    var j = {data: questionObject};
    supporterEncryptAgent(CMD.SEND_NEW_SURVEY_TO_VIEWERS, j);
    //console.log("postQuestionToUsers",questionObject);
}


// g("#answer_bt").onclick = () => {
//     g("#survey_div").classList.remove(hideClass);
//     closeDotMenuOpen();
//     showQuestionBox();
// }

function showQuestionBox() {
    let surveyListDiv = g("#survey_list_div");
    surveyListDiv.innerHTML = "";
    let questionItems = "";
    for (let i = 0; i < questionBoxArr.length; i++) {
        questionItems += `<div class="question_item">`
                + `<p onclick="ntrx.showQuestion('${questionBoxArr[i].questionId}')">`
                + questionBoxArr[i].question
                + `</p>`
                + `</div>`;
    }
    surveyListDiv.innerHTML = questionItems;
}

let selectedQuestionId;
ntrx.showQuestion = function (questionId) {
    showQuestionBox();
    let selectedQuestion = getKeyByValue(questionBoxArr, "questionId", questionId);
    switch (selectedQuestion.type) {
        case QUESTION_CONFIG.radioButton.type:
        case QUESTION_CONFIG.checkBox.type:
            showVoteResultQuestion(selectedQuestion,
                    selectedQuestion.answer, "pie");
            break;
        case QUESTION_CONFIG.textBox.type:
            showTextResultQuestion(selectedQuestion, selectedQuestion.answer);
            break;
    }
    selectedQuestionId = questionId;
}

function showTextResultQuestion(selectedQuestion, dataObject) {
    var j = {title: selectedQuestion.question};
    j.body = "";
    for (let i = 0; i < dataObject.length; i++) {
        j.body += `<div class="text_question_result">`
                + `<div class="waiting_username_div"><span> نام کاربر : </span><span class="waiting_username">&nbsp;${dataObject[i].userStringId}&nbsp;</span></div><p>پاسخ : ${dataObject[i].value}</p>`
                + `</div>`;
    }

    //j.control = '<span id="accept_question_bt" class="button_ctr2 bg-css-blue bt">ارسال</span>';
    var dialog = showDialog(j);
    g("#close_bt", dialog).textContent = "اوکی دیدم";
}


function showVoteResultQuestion(questionObject, dataObject, chartType) {

    var j = {title: questionObject.question};
    j.body = '<canvas id="vote_question_result"></canvas>';
    j.control = '<span id="change_chart_type_bt" data-charttype="pie" class="button_ctr2 bg-css-blue bt">نمایش میله ای</span>';
    var dialog = showDialog(j);
    g("#close_bt", dialog).textContent = "اوکی دیدم";
    var canvas = g("#vote_question_result");

    function redrawChartCanvas(chartType) {
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        let resultObject;
        switch (chartType) {
            case 'pie':
                resultObject = createPieChart(questionObject.option, dataObject);
                break;
            case 'bar':
                resultObject = createBarChart(questionObject.option, dataObject);
                break;
        }
        new Schart("vote_question_result", resultObject);
    }


    var changeChartTypeBt = g("#change_chart_type_bt", dialog);

    changeChartTypeBt.onclick = function () {
        let chartType = changeChartTypeBt.dataset.charttype;
        if (chartType === "pie") {
            changeChartTypeBt.dataset.charttype = "bar";
            changeChartTypeBt.textContent = "نمایش دایره ای";
        } else {
            changeChartTypeBt.dataset.charttype = "pie";
            changeChartTypeBt.textContent = "نمایش میله ای";
        }
        redrawChartCanvas(changeChartTypeBt.dataset.charttype);

    }
    redrawChartCanvas("pie");

}

function createBarChart(options, data) {
    let answerObject = {};
    let option = {
        type: 'bar',
        title: {
            text: "",
        },
        labels: ["نتایج"],
        bgColor: '#fbfbfb',
        datasets: []
    }

    for (let i = 0; i < options.length; i++) {
        answerObject[options[i]["value"]] = [];
    }

    data.filter(elem => {
        Object.keys(answerObject).forEach(key => {
            for (const iterator of elem["value"]) {
                if (iterator == key) {
                    answerObject[key].push(iterator);
                }
            }
        })
    });
    for (let i = 0; i < options.length; i++) {
        let o = {
            label: options[i]["answer"],
            data: [answerObject[options[i]["value"]].length]
        }
        option["datasets"].push(o);
    }
    return option;
}


function createPieChart(questionAnswer, data) {
    let answerObject = {};
    let options = {
        type: 'pie',
        title: {
            text: "",
            font: "bold 18px Vazir"
        },
        legend: {
            position: 'bottom'
        },
        bgColor: '#fff',
        labels: [],
        datasets: [
            {data: []}
        ]
    };

    for (let i = 0; i < questionAnswer.length; i++) {

        options["labels"].push(questionAnswer[i]["answer"]);
        answerObject[questionAnswer[i]["answer"]] = [];

        data.filter(elem => {
            for (const iterator of elem["value"]) {
                if (iterator === questionAnswer[i]["value"]) {
                    answerObject[questionAnswer[i]["answer"]].push(elem["value"]);
                }
            }

        })
    }
    Object.keys(answerObject).forEach(key => {
        options["datasets"][0]["data"].push(answerObject[key].length)
    });
    return options;
}

function showResultChart(chartType) {
    let selectedQuestion = getKeyByValue(questionBoxArr, "questionId", selectedQuestionId);
    showVoteResultQuestion(selectedQuestion, selectedQuestion.answer, chartType);
}

function updateQuestionAnswer(answerObject, userId) {
    //console.log("updateQuestionAnswer answerObject:",answerObject);
    if (answerObject) {
        let selectedQuestion = getKeyByValue(questionBoxArr, 'questionId', answerObject.questionId);
        let selectedQuestionAnswer = getKeyByValue(selectedQuestion.answer, 'userStringId', answerObject.userStringId);
        if (!selectedQuestionAnswer) {
            let isUserStringIdValid = isInputValidate(answerObject.userStringId);
            let isAnswerValid = isInputValidate(answerObject.answer + "");
            if (selectedQuestion && isUserStringIdValid[0] && isAnswerValid[0]) {
                let o = {
                    userStringId: answerObject.userStringId,
                    value: answerObject.answer
                }
                selectedQuestion.answer.push(o);
            }
        }
        var j = {receiverId: userId, data: {questionId: answerObject.questionId}};
        // console.log("updateQuestionAnswer j:",j);
        supporterEncryptAgent(CMD.SEND_SURVEY_ANSWER_TO_SUPPORTER_ACK, j);
    }
}

g("#open_chat_bt").onclick = () => {
    publicChatMode = !publicChatMode;
    g("#open_chat_bt span").textContent = publicChatMode ? "بستن پیام عمومی" : "باز کردن پیام عمومی";
    closeDotMenuOpen();
    let j = {data: {publicchatmode: publicChatMode}};
    //console.log("updateQuestionAnswer j:",j);
    supporterEncryptAgent(CMD.ACTIVE_AND_DEACTIVE_CHAT, j);
}

g(".media_question_div_close").onclick = () => {
    g("#media_question_div").classList.add("hide");
}


// ! live hosting code 


const MEDIA_QUESTION_STATE_TYPE = Object.freeze({
    UN_READ_QUESTION: "unread",
    READ_QUESTION: "read",
    SPAM_QUESTION: "spam",
    DELETE_QUESTION: "delete"
});
var mediaQuestionArr = [];
//        spamUsersArr = [];

let hostServerAddress = "https://help.kharidlive.ir:8443/api",
        fileServerAddress = "https://fetch.kharidlive.ir/api",
        hostStorageFile = {updated: false, media: ""},
        mediaHistory = {
            latestMediaName: "",
            latestMediaData: null,
            history: {}
        }, questionMediaID = 0;

//g("#open_host_bt").onclick = () => {
////    questionMode = false;
//    closeDotMenuOpen();
//    var j = {title: 'kharidlive فایل های ذخیره شده'};
//    j.body = '<div id="host_container_box">'
//            + '<div id="host_container_bt">'
//            + '<label for="upload_single_file" class="insert_bt_file">اضافه کردن تک فایل<input type="file" id="upload_single_file"></label>'
//            + '<label for="upload_slide_file" class="insert_bt_file" id="slide_up_input_bt">اضافه کردن اسلاید<input type="file" id="upload_slide_file" webkitdirectory mozdirectory accept="image/*"></label>'
//            + '</div>'
//            + '<div id="file_size_gradinat"><span id="file_size_gradiant_text"></span></div>'
//            + '<div id="host_container_items"></div></div>';
//    var dialog = showDialog(j);
//    g("#close_bt", dialog).textContent = "بستن";
//    questionSwithOption = true;
//
//    requestToHostServer();
//    g("#slide_up_input_bt").onclick = () => {
//        toast.info("اسلاید ها چه بصورت pdf و چه پاورپونت باید بصورت عکس تبدیل شده باشد(پاورپونت خروجی عکس دارد همچنین از تبدیل کننده های آنلاین هم می توانید استفاده کنید) و شاخه آنرا آدرس دهی کنید");
//    }
//    g("#upload_single_file").addEventListener("change", (e) => {
//        let pathUrl = `${hostServerAddress}/live/upload/single-upload`,
//                formData = new FormData();
//        formData.append("supporterId", myInfo.supporterId);
//        formData.append("siteId", myInfo.siteId);
//        formData.append("serverSession", myInfo.serverSession);
//        formData.append("talkSession", myInfo.talkSession);
//        formData.append("file", e.target.files[0]);
//        formData.append("roomId", myInfo.roomId);
////        formData.append("mediaType", MEDIA_MIME_TYPE.IMAGE.code);
//
//        requestSender(pathUrl, formData, "POST", (res) => {
//            if (res["valid"]) {
//                toast.success(res["pMessage"]);
//                hostStorageFile.updated = false;
//                requestToHostServer();
//            } else {
//                toast.error(res["pMessage"]);
//            }
//        });
//
//        g("#upload_single_file").value = null;
//    })
//
//    g("#upload_slide_file").addEventListener("change", (e) => {
//        let pathUrl = `${hostServerAddress}/live/upload/multi-upload`,
//                formData = new FormData();
//        formData.append("supporterId", myInfo.supporterId);
//        formData.append("siteId", myInfo.siteId);
//        formData.append("serverSession", myInfo.serverSession);
//        formData.append("talkSession", myInfo.talkSession);
//        formData.append("roomId", myInfo.roomId);
//        for (let iterator of e.target.files) {
//            formData.append("files", iterator);
//        }
//
//        requestSender(pathUrl, formData, "POST", (res) => {
//            if (res["valid"]) {
//                hostStorageFile.updated = false;
//                requestToHostServer();
//                toast.success(res["pMessage"]);
//            } else {
//                toast.error(res["pMessage"]);
//            }
//        })
//        g("#upload_slide_file").value = null;
//    })
//}

g("#close_host_media_bt").onclick = () => {
    g("#middle_wrapper").classList.remove("host_container_mode_2");
    let fileState = {state: MEDIA_STATE.CLOSE_MEDIA},
            j = {data: fileState};
    supporterEncryptAgent(CMD.CHANGE_HOST_MEDIA_STATE, j);
    changeMediaState(fileState);
    mediaHistory.latestMediaData = null;
}

function requestToHostServer(withoutShow) {
    if (!withoutShow && hostStorageFile && hostStorageFile.updated) {
        insertFileInMediaDiv(hostStorageFile.media.files, hostStorageFile.media["hostSize"], hostStorageFile.media["remindHostSize"]);
    } else {
        let pathUrl = `${hostServerAddress}/live/get-all`,
                formData = new FormData();
        formData.append("supporterId", myInfo.supporterId);
        formData.append("siteId", myInfo.siteId);
        formData.append("serverSession", myInfo.serverSession);
        formData.append("talkSession", myInfo.talkSession);
        formData.append("roomId", myInfo.roomId);

        requestSender(pathUrl, formData, "POST", (res) => {
            if (res["valid"]) {
//                monsole.log("============================================================");
//                monsole.log(res);
//                monsole.log("============================================================");
                toast.success(res["pMessage"]);
                hostStorageFile.updated = true;
                hostStorageFile.media = res["data"];
                if (!withoutShow) {
                    insertFileInMediaDiv(res.data["files"], res.data["hostSize"], res.data["remindHostSize"]);
                }
            } else {
                toast.error(res["pMessage"]);
            }
        });
    }
}


function insertFileInMediaDiv(data = [], maxHostSize, remindHostSize) {
    let content = "";
    for (const iterator of data) {
        if (iterator.type !== null) {
            content += '<div class="file_item">'
                    + `<span class="file_item_name">${(Number(iterator["qty"]) === 1) ? iterator["fileList"].fileName : iterator["folderName"]}</span>`
                    + '<div class="file_item_bt">'
                    + `<span class="file_item_qty">${iterator["qty"]}</span>`
                    + `<button class="file_show_bt" data-file="${iterator.name}" data-mime="${iterator.type}" onclick="ntrx.showHostFile(this)">نمایش</button>`
                    + `<button class="file_delete_bt" data-file="${iterator.name}" data-mime="${iterator.type}" onclick="ntrx.deleteHostFile(this)">حذف</button>`
                    + '</div></div>';
        }
    }
    g("#host_container_items").innerHTML = content;
    g("#file_size_gradinat").style = `background : linear-gradient(to right , #fff ${parseInt((remindHostSize * 100) / maxHostSize)}% , skyBlue ${parseInt(100 - ((remindHostSize * 100) / maxHostSize))}%)`;
    g("#file_size_gradiant_text").textContent = convertByteSize(remindHostSize) + " فضای خالی دارید";
}

function convertByteSize(bytes, decimals = 2) {
    const k = 1024,
            dm = decimals < 0 ? 0 : decimals,
            sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


ntrx.showHostFile = function (evt) {
    let fileName = evt.getAttribute("data-file"),
            mimeType = Number(evt.getAttribute("data-mime")),
            fileAddressUrl = `${fileServerAddress}/`,
            query = "",
            slideArr = (mimeType === MEDIA_MIME_TYPE.SLIDE.code) ? getSlideFileAddress(fileName) : null,
            pointer = 0;

//
//    switch (mimeType) {
//        case MEDIA_MIME_TYPE.IMAGE.code:
//            query = `live/file/get/img/${myInfo.supporterId}/${myInfo.siteId}/${fileName}`;
//            break;
//        case MEDIA_MIME_TYPE.MOVIE.code:
//            query = `live/file/get/movie/${myInfo.supporterId}/${myInfo.siteId}/${fileName}`;
//            break;
//    }

    switch (mimeType) {
        case MEDIA_MIME_TYPE.IMAGE.code:
            query = `live/file/get/${myInfo.supporterId}/${fileName}`;
            break;
        case MEDIA_MIME_TYPE.MOVIE.code:
            query = `live/file/get/${myInfo.supporterId}/${fileName}`;
            break;
    }
    
    let mediaInfo = {
        mimeType: mimeType,
        fileName: fileName,
        fileAddressUrl: fileAddressUrl + query,
        slideArr: slideArr,
        pointer: pointer
    };

    monsole.log("fileName", fileName, "mimeType", mimeType, "fileAddressUrl", fileAddressUrl, "slideArr", slideArr, "query", query, "mediaInfo", mediaInfo);
    if (slideArr) {
        mediaInfo.pointer = mediaHistory.history[fileName] ? mediaHistory.history[fileName].pointer : 0;
    } else if (mimeType === MEDIA_MIME_TYPE.MOVIE.code) {
        mediaInfo.pointer = mediaHistory.history[fileName] ? mediaHistory.history[fileName].pointer : 0;
    }
    showMediaStorage(mediaInfo, true, mediaInfo);
    supporterEncryptAgent(CMD.SEND_HOST_MEDIA_TO_CUSTOMERS, {data: mediaInfo});
    // mediaHistory.latestMediaData = mediaInfo;

}


function getSlideFileAddress(folderPath) {
    if (folderPath) {
        let slideFiles = getKeyByValue(hostStorageFile.media.files, "name", folderPath)["fileList"],
                slideArr = [];
        for (const iterator of slideFiles) {
            let fileAddressUrl = `${fileServerAddress}/live/file/get/${myInfo.supporterId}/${iterator.path}`;
            slideArr.push(fileAddressUrl);
        }
        return slideArr;
    }
}

ntrx.deleteHostFile = function (evt) {
    let attr = evt.getAttribute("data-file"),
            pathUrl = `${hostServerAddress}/live/delete`,
            formData = new FormData();
    formData.append("supporterId", myInfo.supporterId);
    formData.append("siteId", myInfo.siteId);
    formData.append("serverSession", myInfo.serverSession);
    formData.append("talkSession", myInfo.talkSession);
    formData.append("file", attr);
    formData.append("roomId", myInfo.roomId);

    requestSender(pathUrl, formData, "POST", (res) => {
//        monsole.log(res);
        if (res["valid"]) {
            toast.success(res["pMessage"]);
            hostStorageFile.updated = false;
            requestToHostServer();
        } else {
            toast.error(res["pMessage"]);
        }
    });
}

function requestSender(pathUrl = "", body = null, method = "GET", callBack) {
    if (typeof pathUrl === "string" && pathUrl.startsWith("https://")) {
        let option = {
            method: method,
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer"
        }
        if (body) {
            option.body = body
        }
        fetch(pathUrl, option).then((obj) => {
            return obj.json();
        }).then((res) => {
            if (callBack) {
                callBack(res);
            }
        }).catch((err) => {
            console.error(err);
        });
}
}

//
//function requestSender(pathUrl, query = null, method = "GET", callBack, isFileSend) {
//    const request = new XMLHttpRequest();
//    request.open(method, pathUrl);
//    request.setRequestHeader("Access-Control-Allow-Origin", "*");
//    request.setRequestHeader("Access-Control-Allow-Credentials", true);
//    request.setRequestHeader("Access-Control-Allow-Methods", 'GET,POST');
//    request.setRequestHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization');
//    if (!isFileSend) {
//        request.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
//    }
//    request.send(query);
//    request.onload = () => {
//        if (callBack) {
//            callBack(JSON.parse(request.response));
//        }
//    }
//}


//g("#open_media_question_bt").onclick = () => {
////    questionMode = true;
//    closeDotMenuOpen();
//    var delay = 2000;
//    if (!hostStorageFile || !hostStorageFile.updated) {
//        requestToHostServer(true);
//        toast.info("اندکی صبر کنید تا kharidlive فایل و سوالات دریافت شود");
//        delay = 2000;
//    }
//    setTimeout(() => {
//        g("#media_question_div").classList.remove(hideClass);
//
//        let pathUrl = `${hostServerAddress}/supporter/get-media-question`;
//        let formData = new FormData();
//        formData.append('supporterId', myInfo.supporterId);
//        formData.append("siteId", myInfo.siteId);
//        formData.append("serverSession", myInfo.serverSession);
//        formData.append("talkSession", myInfo.talkSession);
//        formData.append("roomId", myInfo.roomId);
//        requestSender(pathUrl, formData, "POST", (res) => {
////        monsole.log(res);
//            if (res.state === 105) {
//                if (res.data.length) {
//                    mediaQuestionArr = [];
//                    let c = 1;
//                    res.data.forEach(a => {
//                        a = JSON.parse(a);
//                        a.questionId = "qid" + c++;
//                        a.fileName = b64DecodeUnicode(a.fileName);
//                        mediaQuestionArr.push(a);
//                    });
//                    showMediaQuestion(mediaQuestionArr);
//                } else {
//                    toast.info("سوالی ثبت نشده است ");
//                }
//            }
//            res["valid"] ? toast.success(res["pMessage"]) : toast.error(res["pMessage"]);
//        });
//    }, delay);
//}


// ! question box code


//function receiveNewMediaQuestion(uuid, userData) {
//    console.log("uuid : ", uuid, "user data : ", userData);
//    if (uuid && userData) {
//        let newMediaQuestionObj = {
////            questionId: questionMediaID++,
//            questionState: MEDIA_QUESTION_STATE_TYPE.UN_READ_QUESTION,
//            userName: userData.userName,
////            uuid: uuid,
////            questionDateTime: getDateTime(),
//            questionType: userData.questionType.code,
//            questionPointer: userData.questionPointer,
//            questionTextContent: userData.questionText,
//            fileAddress: userData.fileAddress,
//            fileName: b64DecodeUnicode(userData.fileName)
//        }
//        console.log("newMediaQuestionObj : ", newMediaQuestionObj);
////        if (spamUsersArr.filter(key => {
////            if (key === newMediaQuestionObj.userName)
////                return key;
////        }).length > 0) {
////            newMediaQuestionObj.questionState = MEDIA_QUESTION_STATE_TYPE.SPAM_QUESTION;
////        }
////        mediaQuestionArr.push(newMediaQuestionObj);
//    }
////    showMediaQuestion();
//}

function getDateTime() {
    let date = new Date(),
            hour = (String(date.getHours()).length === 1) ? "0" + String(date.getHours()) : date.getHours(),
            min = (String(date.getMinutes()).length === 1) ? "0" + String(date.getMinutes()) : date.getMinutes();
    return `${hour}:${min}`;
}

//ntrx.deleteQuestion = function (evt) {
//    var j = {title: 'این پیام پاک شود ؟'};
//    j.control = '<span id="remove_pm_bt" class="button_ctr2 bg-css-red bt">بله پاک کن</span>';
//    showDialog(j);
//    g("#remove_pm_bt").onclick = function () {
//        let questionID = Number(evt.getAttribute("data-question-id")),
//                question = getKeyByValue(mediaQuestionArr, "questionId", questionID);
//        if (question) {
//            question.questionState = MEDIA_QUESTION_STATE_TYPE.DELETE_QUESTION;
//        }
//        closeDialog();
//        showMediaQuestion();
//    }
//}
//ntrx.reportSpamQuestion = function (evt) {
//    var j = {title: 'این پیام اسپم است و از دریافت دیگر پیام های کاربر جلوگیری شود'};
//    j.control = '<span id="spam_pm_bt" class="button_ctr2 bg-css-red bt">پیام های کاربر اسپم است</span>';
//    showDialog(j);
//    g("#spam_pm_bt").onclick = function () {
//        let userName = evt.getAttribute("data-username");
//        if (spamUsersArr.filter(user => user === userName).length > 0) {
//            let messages = getKeyByValue(mediaQuestionArr, "userName", userName);
//            for (const iterator of messages) {
//                iterator.state = MEDIA_QUESTION_STATE_TYPE.SPAM_QUESTION;
//            }
//        } else {
//            spamUsersArr.push(userName);
//            let messages = mediaQuestionArr.filter(key => {
//                if (key.userName === userName) {
//                    return key;
//                }
//            });
//            for (const iterator of messages) {
//                iterator.questionState = MEDIA_QUESTION_STATE_TYPE.SPAM_QUESTION;
//            }
//        }
//        closeDialog();
//        showMediaQuestion();
//    }
//}
//function showMediaQuestion() {
//    var messagesTextContent = "", mediaMessages = mediaQuestionArr.filter(k => {
//                if (k.questionState === MEDIA_QUESTION_STATE_TYPE.UN_READ_QUESTION ||
//                        k.questionState === MEDIA_QUESTION_STATE_TYPE.READ_QUESTION) {
//                    return k;
//                }
//            });
//    for (const iterator of mediaMessages) {
//
//        let filePosition = iterator.questionPointer;
//        if (iterator.questionType === MEDIA_MIME_TYPE.IMAGE.code) {
//            filePosition = 1;
//        } else if (iterator.questionType === MEDIA_MIME_TYPE.SLIDE.code) {
//            filePosition++;
//        } else if (iterator.questionType === MEDIA_MIME_TYPE.MOVIE.code) {
//            filePosition = toHoursAndMinutes(filePosition);
//        }
//        messagesTextContent += '<div class="media_question_data">'
//                + '<div class="question_media_info">'
//                + '<div class="question_info_div">'
//                + '<span class="question_info_item">'
//                + '<span class="question_thumb_icon" title="نام کاربر"><img alt="" src="./i/user.svg"></span>'
//                + `<span class="question_info_txt">${iterator.userName}</span>`
//                + '</span>'
//                + '<span class="question_info_item">'
//                + '<span class="question_thumb_icon" title="زمان ارسال"><img alt="" src="./i/time.svg"></span>'
//                + `<span class="question_info_txt">${iterator.questionDateTime}</span>`
//                + '</span>'
//                + '</div>'
//
//                + '<div class="question_info_div">'
//                + '<span class="question_info_item">'
//                + '<span class="question_thumb_icon" title="نام فایل"><img alt="" src="./i/file.svg"></span>'
//                + `<span class="question_info_txt">${iterator.fileName}</span>`
//                + '</span>'
//                + '<span class="question_info_item">'
//                + '<span class="question_thumb_icon" title="موقعیت"><img alt="" src="./i/hashtag.svg"></span>'
//                + `<span class="question_info_txt">${filePosition}</span>`
//                + '</span></div>'
//
//                + '</div><div class="question_media_content"><div class="question_media_text">'
//                + `<p class="question_text_mode_1" onclick="ntrx.showTextQuestion(this)" data-text-state="1">${iterator.questionTextContent}</p>`
//                + '</div><div class="question_media_bt">'
//                + `<span class="thumb_bt bg-css-green" data-question-id="${iterator.questionId}" data-username="${iterator.userName}" onclick="ntrx.showMediaAnswerQuestion(this)" title="نمایش"><img alt="" src="./i/eye2.svg"></span>`
//                
//                //*** below codes commented because must be affect on the DB and i dont want implement yet        
////                + `<span class="thumb_bt bg-css-orange" data-question-id="${iterator.questionId}" data-username="${iterator.userName}" onclick="ntrx.reportSpamQuestion(this)" title="اسپم"><img alt="" src="./i/spider.svg"></span>`
////                + `<span class="thumb_bt bg-css-red" data-question-id="${iterator.questionId}" data-username="${iterator.userName}" onclick="ntrx.deleteQuestion(this)" title="حذف"><img alt="" src="./i/delete.svg"></span>`
//                
//        + '</div></div></div>';
//    }
//    g("#media_question_list_div").innerHTML = messagesTextContent;
//}
//
function showMediaQuestion(mediaMessages) {
    if (mediaMessages && mediaMessages.length > 0) {
        var messagesTextContent = "";
        for (const iterator of mediaMessages) {

            let filePosition = iterator.questionPointer;
            if (iterator.questionType === MEDIA_MIME_TYPE.IMAGE.code) {
                filePosition = 1;
            } else if (iterator.questionType === MEDIA_MIME_TYPE.SLIDE.code) {
                filePosition++;
            } else if (iterator.questionType === MEDIA_MIME_TYPE.MOVIE.code) {
                filePosition = toHoursAndMinutes(filePosition);
            }
            messagesTextContent += '<div class="media_question_data">'
                    + '<div class="question_media_info">'
                    + '<div class="question_info_div">'
                    + '<span class="question_info_item">'
                    + '<span class="question_thumb_icon" title="نام کاربر"><img alt="" src="./i/user.svg"></span>'
                    + `<span class="question_info_txt">${iterator.userName}</span>`
                    + '</span>'
                    + '<span class="question_info_item">'
                    + '<span class="question_thumb_icon" title="زمان ارسال"><img alt="" src="./i/time.svg"></span>'
                    + `<span class="question_info_txt">${iterator.questionDateTime}</span>`
                    + '</span>'
                    + '</div>'

                    + '<div class="question_info_div">'
                    + '<span class="question_info_item">'
                    + '<span class="question_thumb_icon" title="نام فایل"><img alt="" src="./i/file.svg"></span>'
                    + '<span class="question_info_txt">' + iterator.fileName + '</span>'
                    + '</span>'
                    + '<span class="question_info_item">'
                    + '<span class="question_thumb_icon" title="موقعیت"><img alt="" src="./i/hashtag.svg"></span>'
                    + `<span class="question_info_txt">${filePosition}</span>`
                    + '</span></div>'

                    + '</div><div class="question_media_content"><div class="question_media_text">'
                    + `<p class="question_text_mode_1" onclick="ntrx.showTextQuestion(this)" data-text-state="1">${iterator.questionTextContent}</p>`
                    + '</div><div class="question_media_bt">'
                    + `<span class="thumb_bt" data-question-id="${iterator.questionId}" data-username="${iterator.userName}" onclick="ntrx.showMediaAnswerQuestion(this,false)" title="نمایش"><img alt="" src="./i/eye2.svg"></span>`
                    + `<span class="thumb_bt" data-question-id="${iterator.questionId}" data-username="${iterator.userName}" onclick="ntrx.showMediaAnswerQuestion(this,true)" title="نمایش عمومی"><img alt="" src="./i/check.svg"></span>`
                    + '</div></div></div>';
        }
        g("#media_question_list_div").innerHTML = messagesTextContent;
    }
}

ntrx.showTextQuestion = function (evt) {
    let textState = evt.getAttribute("data-text-state");
    switch (textState) {
        case "1":
            evt.setAttribute("data-text-state", "2");
            evt.classList.add("question_text_mode_2");
            evt.classList.remove("question_text_mode_1");
            break;
        case "2":
            evt.setAttribute("data-text-state", "1");
            evt.classList.add("question_text_mode_1");
            evt.classList.remove("question_text_mode_2");
            break;
    }
}

ntrx.showMediaAnswerQuestion = function (evt, isPublic) {
    g("#close_host_media_bt").click();

    let questionId = evt.getAttribute("data-question-id"),
            question = getKeyByValue(mediaQuestionArr, "questionId", questionId);
    monsole.log("ntrx.showMediaAnswerQuestion questionId:", questionId, "question:", question);
    if (question) {
//        question.questionState = MEDIA_QUESTION_STATE_TYPE.READ_QUESTION;
//        switch (question.questionType) {
//            case MEDIA_MIME_TYPE.IMAGE.code:
//                showImageMedia(question.fileAddress, question.fileAddress, true, question.questionTextContent);
//                break;
//            case MEDIA_MIME_TYPE.SLIDE.code:
//                showSlideMedia(question.fileAddress, question.questionPointer, true, question.questionTextContent);
//                // console.log("question.questionPointer : ", question.questionPointer, "question.fileAddress : ", question.fileAddress);
//                hosthostSlideSupporterPageIndex = question.questionPointer;
////                changeSlidePage(question.questionPointer, question.fileAddress);
//                // console.log("question.questionPointer : " , question.questionPointer);
//                break;
//            case MEDIA_MIME_TYPE.MOVIE.code:
//                showVideoMedia(question.fileAddress, question.questionPointer, true, question.questionTextContent);
//                hostVideoElem.currentTime = question.questionPointer;
//                showVideoTime();
//                break;
//        }
        if (isPublic) {
            let slideArr = (question.questionType === MEDIA_MIME_TYPE.SLIDE.code) ? getSlideFileAddress(question.fileName) : null;
            let mediaInfo = {
                mimeType: question.questionType,
                fileName: question.fileName,
                fileAddressUrl: question.fileAddress,
                slideArr: slideArr,
                questionText: question.questionTextContent,
                pointer: question.questionPointer
            };
            supporterEncryptAgent(CMD.SEND_HOST_MEDIA_TO_CUSTOMERS, {data: mediaInfo});
            showMediaStorage(mediaInfo, true, mediaInfo);
        }
    }

//    showMediaQuestion();
}


// ! ==================================== start live pin text ======================================    

const LIVE_PIN_TEXT = {
    text: "",
    update: false,
    allowToSend: false
}

// g("#open_live_pin_text_bt").onclick = () => {
//     let j = {title: 'متن شروع لایو برای بینندگان'};
//     j.body = '<div style="width: 400px;">' +
//             '        <div>' +
//             '            <textarea id="live_pin_text" style="width: 100%; padding: 10px;"  cols="30" rows="25"' +
//             '                maxlength="1500"></textarea>' +
//             '        </div>' +
//             '        <div style="width: 100%; display: flex;align-items: center;justify-content: space-around;flex-direction: column">' +
//             '           <div>' +
//             '               <button id="live_text_update_bt" class="host_bt" >آپدیت کردن</button>' +
//             '               <button id="live_text_send_bt" class="host_bt" >اکنون ارسال کن</button><br>' +
//             '           </div>' +
//             '           <label for="live_text_send_all_bt" style="display: flex;align-items: center;justify-content: center;height: 60px">' +
//             '               <input type="checkbox" name="" id="live_text_allow_send_bt">' +
//             '               <span style="padding: 0 3px;">برای بینندگان قابل نمایش باشد</span>' +
//             '           </label>' +
//             '        </div>' +
//             '    </div>';
//     let dialog = showDialog(j);

//     g("#live_text_allow_send_bt").onclick = (evt) => {
//         console.log(evt.target.checked)
//         LIVE_PIN_TEXT.allowToSend = evt.target.checked;
//     }

//     g("#live_text_send_bt").onclick = () => {
//         let livePinText = g("#live_pin_text").value;
//         LIVE_PIN_TEXT.textFile = livePinText;
//         supporterEncryptAgent(CMD.SEND_LIVE_PIN_TEXT_TO_ALL_USER, {data: {livePinText: livePinText}});
//     }

//     g("#live_text_update_bt").onclick = () => {
//         let livePinText = g("#live_pin_text").value;
//         if (livePinText.length >= 10) {
//             let formData = new FormData();
//             formData.append("supporterId", myInfo.supporterId);
//             formData.append("siteId", myInfo.siteId);
//             formData.append("serverSession", myInfo.serverSession);
//             formData.append("talkSession", myInfo.talkSession);
//             formData.append("livePinText", livePinText);
//             formData.append("roomId", myInfo.roomId);

//             let pathUrl = `${hostServerAddress}/supporter/pin-live-text/update`;
//             requestSender(pathUrl, formData, "POST", (res) => {
//                 if (res.valid) {
//                     toast.success(res["pMessage"]);
//                     LIVE_PIN_TEXT.text = livePinText;
//                     LIVE_PIN_TEXT.update = true;
//                 } else {
//                     toast.error(res["pMessage"]);
//                 }
//             })
//         }
//     }

//     if (!LIVE_PIN_TEXT.update) {
//         let formData = new FormData();
//         formData.append("supporterId", myInfo.supporterId);
//         formData.append("siteId", myInfo.siteId);
//         formData.append("serverSession", myInfo.serverSession);
//         formData.append("talkSession", myInfo.talkSession);
//         formData.append("roomId", myInfo.roomId);

//         let pathUrl = `${hostServerAddress}/supporter/pin-live-text/get`;
//         requestSender(pathUrl, formData, "POST", (res) => {
//             if (res.valid) {
//                 toast.success(res["pMessage"]);
//                 LIVE_PIN_TEXT.update = true;
//                 LIVE_PIN_TEXT.text = res["data"]["livePinText"];
//                 g("#live_pin_text").value = res["data"]["livePinText"];
//             } else {
//                 toast.error(res["pMessage"]);
//             }
//         })
//     } else {
//         g("#live_pin_text").value = LIVE_PIN_TEXT.text;
//     }
// }