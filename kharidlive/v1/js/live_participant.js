if (typeof String.prototype.replaceAll === "undefined") {
    String.prototype.replaceAll = function (match, replace) {
        return this.replace(new RegExp(match, 'g'), () => replace);
    }
}
//*** umcomment in production
//if (window.top === window.self) {
//    document.addEventListener('DOMContentLoaded', function () {
//    
//===============================================general section===============================================

var hide = "hide", mHide = "m_hide", modal = g("#modal_div"),
        message_input_js = g("#message"),
        textDiv = g("#text_div"), talkNumberDiv = g("#talk_number"),
        addRemoveTalkBt = g("#add_remove_request_bt"),
        iframe = g("#iframe"), chatSub2 = g("#chat_sub2"), isChatShow = true,
        mobilePmBt = g("#mobile_pm_bt"), mobilePmTxt = g("span", mobilePmBt),
        mobilePmIcon = g("img", mobilePmBt), mobilePmQty = 0, chatDiv = g(".chat_div"),
        iframeDiv = g(".iframe_div"), lockAutoOpenOffers = false,
        amICustomer = true, offerBt = g("#offer_bt"), offer = {}, msgLock = false,
        msgLockTimeOut, myMsgForAck, messageAntiDuplicate = new Set(),
        pmDiv = g(".pm_div"), currentMyMsg, customerVideo = g("#customer_video"),
        viewerCount = g("#viewer_count"), maxPmQty = 100,
        productFavoriteBt = g("#product_favorite_bt"), productFavoritePrefix = "S61F";

message_input_js.focus();


//    g("#close_live_bt").onclick = function () {
//
//        if (!talkObj.isTalkRightNow) {
//            var j = {title: ' آیا میخواهید از اتاق خارج شوید؟'};
//            j.control = '<span id="close_live_page" class="button_ctr2 bg-css-red bt">بله صفحه لایو را میبندم</span>';
//            showDialog(j);
//            g("#close_live_page").onclick = function () {
//                monsole.log("openProfile", new Date());
//                getBackToProfile();
//            }
//        } else {
//            toast.error("الان در حال گفتگو هستید ابتدا گفتگو را خاتمه دهید");
//        }
//    }
//    g("#close_customer_bt").onclick = function () {
//        if (talkObj.isTalkRightNow) {
//            var j = {title: ' میخواهید به گفتگو خاتمه دهید ؟'};
//            j.control = '<span id="close_customer_live" class="button_ctr2 bg-css-red bt">بله گفتگو را میبندم</span>';
//            showDialog(j);
//            g("#close_customer_live").onclick = function () {
//                closeDialog();
//                setEndTalk();
//            }
//        } else {
//            toast.info("اکنون در حال گفتگو با کارشناس مشاور نیستید");
//        }
//    }
g("#total_refresh_bt").onclick = function () {
    connectAgain();
}
g("#close_live_bt").onclick = function () {
    if (talkObj.isTalkRightNow) {
        var j = {title: ' میخواهید به گفتگو خاتمه دهید ؟'};
        j.control = '<span id="close_customer_live" class="button_ctr2 bg-css-red bt">بله گفتگو را میبندم</span>';
        showDialog(j);
        g("#close_customer_live").onclick = function () {
            closeDialog();
            setEndTalk();
        }
    } else {
        var j = {title: ' آیا میخواهید از اتاق خارج شوید؟'};
        j.control = '<span id="close_live_page" class="button_ctr2 bg-css-red bt">بله صفحه لایو را میبندم</span>';
        showDialog(j);
        g("#close_live_page").onclick = function () {
            monsole.log("openProfile", new Date());
            getBackToProfile();
        }
    }
}

productFavoriteBt.onclick = function () {
    try {
        if (offer && offer.hash) {
            var favs = localStorage.getItem(productFavoritePrefix + offer.hash);
            if (favs) {
                toast.info("قبلا " + offer.title + " اضافه شده");
            } else {
                var j = {hash: offer.hash, path: offer.path, title: offer.title, img: offer.img, time: new Date() * 1};
                localStorage.setItem(productFavoritePrefix + offer.hash, JSON.stringify(j));
                toast.success(offer.title + " به kharidlive منتخب اضافه شد");
            }
        }
    } catch (e) {
        monsole.error(e);
        toast.error("اضافه شدن این محصول به kharidlive منتخب شما به مشکل خورد!!");
    }
}
//    offerBt.onclick = function () {
//        if (!msgLock && offer && offer.img) {
//            message_input_js.insertAdjacentHTML("beforeend", "<img src='" + offer.img + "' data-title='" + offer.title + "' data-link='" + offer.host + offer.path + "'>");
//            setCursorToEnd(message_input_js);
//        } else {
//            toast.error("لطفا ابتدا یک صفحه محصول معتبر را لود کنید تا پیشنهاد فعال شود");
//        }
//    }
offerBt.onclick = function () {
    if (talkObj.isTalkRightNow) {
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
    } else {
        toast.info("شما در حال گفتگو نیستید");
    }
}
mobilePmBt.onclick = function () {
    mobilePmQty = 0;
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
    if (talkObj.isTalkRightNow || isPublicChatFree) {//true || 
        var body = packMessage();
        if (body) {
            if (checkMsgLock()) {
                var j = {data: {body: body, userType: USER_TYPE.PARTICIPANT, talkSession: myInfo.talkSession, mid: getRandom(4), viewerUsername: myInfo.viewerUsername}};
                currentMyMsg = j;
                messageAntiDuplicate.add(j.data.mid);
                participantEncryptAgent(CMD.PRIVATE_MSG, j);
            }
        } else {
            toast.error("پیام شما ارسال نشد احتمالا هنوز چیزی ننوشتید یا متن پیام ساختار درستی ندارد");
        }
    } else {
        toast.error("پیام ارسال نشد، در حال حاضر وضعیت شما اجازه گفتگو را نمیدهد لطفا صبر کنید تا نوبت شما فرا برسد");
    }
}
window.addEventListener('message', function (e) {
    monsole.log("parent message received", e);
    monsole.log("parent message", "data: ", e.data, "origin: ", e.origin, e.data.hasOwnProperty("c"), e.data.c === "url", e.data.path);
    offer = null;
    if (e.origin === window.location.origin && e.data.hasOwnProperty("c") &&
            e.data.c === "url" && e.data.isvalid) {
        offer = e.data;
    }
    setOfferKeys();
});

function getMsgFromBuffer(attrName, val, isRemovable) {
    var j;
    for (var f = 0; f < msgBuffer.length; f++) {
        j = msgBuffer[f];
        if (j[attrName] === val) {
            if (isRemovable) {
                msgBuffer.splice(f, 1);
            }
            return j;
        }
    }
    return null;
}
function checkMsgLock() {
    if (!msgLock) {
        msgLockTimeOut = setTimeout(function () {
            clearMsgLock(true);
            toast.error("بعد از 7 ثانیه هنوز پیام به مخاطب نرسیده میخوای دوباره بفرست یا بررسی کن ببین ارتباط برقرار است یا نه");
        }, 7000);
        msgLock = true;
        message_input_js.contentEditable = false;
        return true;
    } else {
        toast.info("پیام جاری ارسال شده لطفا کمی صبر کنيد")
    }
    return false;
}
function clearMsgLock(isNotText) {
    clearTimeout(msgLockTimeOut);
    msgLock = false;
    message_input_js.contentEditable = true;
    if (!isNotText) {
        removeHtml(message_input_js);
    }
}
function setOfferKeys() {
    if (offer) {
        offerBt.classList.remove(hide);
        productFavoriteBt.classList.remove(hide);
    } else {
        offerBt.classList.add(hide);
        productFavoriteBt.classList.add(hide);
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
                    //console.log("<p> res array:", res);
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
//            } else if (!str.startsWith(myInfo.siteBaseUrl)) {//ignore link validation , by ignoring this step any links with any source could be sent
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
                '<img src="./i/' + (isSupporterType ? 'support-48.png' : 'user_chat.png') + '">' +
                '</div>';
        body.forEach(function (e) {
            if (e[0] === "span") {
                h += '<span class="msg_txt">' + e[1] + '</span>';
            } else if (e[0] === "a") {
                //                    h += '<a class="msg_link" href="' + e[1] + '" target="_blank"><i class="fas fa-external-link-alt"></i>' + e[1] + '</a>';
                h += '<a class="msg_link" href="' + e[1] + '" target="_blank">' + e[1] + '</a>';
            } else if (e[0] === "offer") {//link, title, src
                if (talkObj.isTalkRightNow && userType === USER_TYPE.SUPPORTER) {
                    //                        if (talkObj.offerQty) {
                    talkObj.offerQty++;
                    //                        } else {
                    //                            talkObj.offerQty = 1;
                    //                        }
                }
                if (!firstOffer) {
                    firstOffer = e[1];
                }
                h += '<div class="msg_offer" data-link="' + e[1] + '" onclick="ntrx.openOfferInIframe(this)"><img src="' + e[3] + '"><span>' + e[2] + '</span></div>'

            } else if (e[0] === "page") {//link, title
                if (talkObj.isTalkRightNow && userType === USER_TYPE.SUPPORTER) {
                    //                        if (talkObj.offerQty) {
                    talkObj.offerQty++;
                    //                        } else {
                    //                            talkObj.offerQty = 1;
                    //                        }
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
            mobilePmQty++;
            mobilePmTxt.textContent = mobilePmQty;
            if (firstOffer && isSupporterType && amICustomer && !lockAutoOpenOffers) {
                iframe.src = firstOffer;
            }
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
    monsole.log("participant ackMsgCallback ", j);
    if (j && currentMyMsg && j.data.mid && j.data.mid === currentMyMsg.data.mid) {
        var body = unpackMessage(currentMyMsg.data.body);
        var flag = false;
        if (body) {
            flag = processUnpackHtmlMessage(currentMyMsg.data.userType, body, currentMyMsg.data.msgNumber, currentMyMsg.data.viewerUsername);
        }
        currentMyMsg = null;
        clearMsgLock(false);
        if (!flag) {
            toast.error("پیام شما ساختار درستی ندارد و قابل نمایش نیست");
        }
    }
}
function writeMsgToChatList(j) {
    //if (j && j.data.mid && (!talkObj.isTalkRightNow || (talkObj.isTalkRightNow && !messageAntiDuplicate.has(j.data.mid)))) {
    if (j && j.data.mid && !messageAntiDuplicate.has(j.data.mid)) {
        messageAntiDuplicate.add(j.data.mid);
        // console.log("writeMsgToChatList  ", j, typeof j,"j.data.viewerUsername",j.data.viewerUsername);
        var body = unpackMessage(j.data.body);
        if (body) {
            var flag = processUnpackHtmlMessage(j.data.userType, body, j.data.msgNumber, j.data.viewerUsername);
            if (talkObj.isTalkRightNow) {
                if (flag) {
                    var j2 = {data: {talkSession: myInfo.talkSession, mid: j.data.mid}};
                    participantEncryptAgent(CMD.MSG_ACK, j2);
                } else {
                    toast.error("پیام دریافت شد اما ساختار درستی ندارد");
                }
            }
        } else {
            toast.error("ساختار پیام فرستنده استاندارد نبود و قابل نمایش نیست");
        }
    }
}

//===============================================customer section===============================================

////    if (isCustomer) {
addRemoveTalkBt.onclick = function () {
    var j = {};
    if (!talkObj.isTalkRightNow) {
        if (talkObj.isTalkWaitingNow && talkObj.talkNumber) {
            j.title = ' آیا میخواهید درخواست گفتگوی خود را حذف کنید ؟';
            j.control = '<span id="talk_request_bt" class="button_ctr2 bg-css-red bt">بله درخواست گفتگو را حذف کن</span>';
            showDialog(j);
            g("#talk_request_bt").onclick = function () {
                toast.info("درخواست حذف کردن گفتگو در حال بررسی است و ممکن است کمی طول بکشد");
                removeTalkRequestToSupporter();
                closeDialog();
            }
        } else {
            j.title = ' میخواهید کارشناس مشاور با شما بصورت لایو ،گفتگویی داشته باشد ؟';
            j.control = '<span id="vs_talk_request_bt" class="button_ctr2 bg-css-blue bt">اجازه ارتباط ویدیو و صوت را می دهم</span><br>' +
                    '<span id="s_talk_request_bt" class="button_ctr2 bg-css-green bt">فقط اجازه ارتباط صوتی می دهم</span>';
            showDialog(j);
            g("#s_talk_request_bt").onclick = function () {
                toast.info("در حال بررسی وضعیت میکروفن");
                checkMediaPermission(function (r) {
                    //***
                    monsole.log("checkMediaPermission az");
                    if (r.canEnumerate) {
                        var flag = true;
                        if (!r.hasSpeakers) {
                            flag = false;
                            toast.error("این دستگاه فاقد خروجی صدا یا بلندگو برای مکالمه است");
                        }
                        if (!r.hasMicrophone) {
                            flag = false;
                            toast.error("این دستگاه فاقد ورودی صدا یا میکروفن برای مکالمه است");
                        }
                        if (flag) {
                            if (!r.withMicrophonePermission) {
                                flag = false;
                                toast.error("در این مرورگر دسترسی میکروفن داده نشده است لطفا آنرا فعال کنید");
                            }
                            if (flag) {
                                toast.success("اجازه دسترسی وجود دارد، در حال اتصال به اتاق");
                                setTalkRequestToSupporter(false);
                                closeDialog();
                            } else {
                                getCamAndMicPermission(function (isAllowed) {
                                    if (isAllowed) {
                                        toast.success("اجازه دسترسی داده شده است، در حال اتصال به اتاق");
                                        setTalkRequestToSupporter(false);
                                        closeDialog();
                                    } else {
                                        closeDialog();
                                        toast.error("اجازه دسترسی به میکروفن بسته شده است لطفا از طریق راهنما دسترسی را فعال کنید");
                                        var j = {title: ' راهنمای دسترسی میکروفن:'};
                                        j.control = '<span id="media_help" class="button_ctr2 bg-css-blue bt">راهنما را باز کن</span>';
                                        showDialog(j);
                                        g("#media_help").onclick = function () {
                                            openLinkInNewTab("https://kharidlive.ir/etc/help-start-to-talk-by-customer.html");
                                        }
                                    }
                                }, false);
                            }
                        }
                    } else {
                        toast.error("میکروفن و دوربین قابل شناسایی نبود! از آخرین ورژن مرورگر کروم و یا دستگاه دیگر استفاده کنید");
                    }
                });

                //                setTalkRequestToSupporter();
                //                closeDialog();
            }
            g("#vs_talk_request_bt").onclick = function () {
                toast.info("در حال بررسی وضعیت میکروفن و دوربین");
                checkMediaPermission(function (r) {
                    //***
                    monsole.log("checkMediaPermission az");
                    if (r.canEnumerate) {
                        var flag = true;
                        if (!r.hasSpeakers) {
                            flag = false;
                            toast.error("این دستگاه فاقد خروجی صدا یا بلندگو برای مکالمه است");
                        }
                        if (!r.hasMicrophone) {
                            flag = false;
                            toast.error("این دستگاه فاقد ورودی صدا یا میکروفن برای مکالمه است");
                        }
                        if (!r.hasWebcam) {
                            flag = false;
                            toast.error("این دستگاه فاقد ورودی تصویر یا دوربین برای مکالمه است");
                        }
                        if (flag) {
                            if (!r.withMicrophonePermission) {
                                flag = false;
                                toast.error("در این مرورگر دسترسی میکروفن داده نشده است لطفا آنرا فعال کنید");
                            }
                            if (!r.withWebcamPermission) {
                                flag = false;
                                toast.error("در این مرورگر دسترسی دوربین وبکم داده نشده است لطفا آنرا فعال کنید");
                            }
                            if (flag) {
                                toast.success("اجازه دسترسی وجود دارد، در حال اتصال به اتاق");
                                setTalkRequestToSupporter(true);
                                closeDialog();
                            } else {
                                getCamAndMicPermission(function (isAllowed) {
                                    if (isAllowed) {
                                        toast.success("اجازه دسترسی داده شده است، در حال اتصال به اتاق");
                                        setTalkRequestToSupporter(true);
                                        closeDialog();
                                    } else {
                                        closeDialog();
                                        toast.error("اجازه دسترسی به میکروفن و یا دوربین وبکم بسته شده است لطفا از طریق راهنما دسترسی را فعال کنید");
                                        var j = {title: ' راهنمای دسترسی میکروفن و دوربین:'};
                                        j.control = '<span id="media_help" class="button_ctr2 bg-css-blue bt">راهنما را باز کن</span>';
                                        showDialog(j);
                                        g("#media_help").onclick = function () {
                                            openLinkInNewTab("https://kharidlive.ir/help/media_permission");
                                        }
                                    }
                                }, true);
                            }
                        }
                    } else {
                        toast.error("میکروفن و دوربین قابل شناسایی نبود! از آخرین ورژن مرورگر کروم و یا دستگاه دیگر استفاده کنید");
                    }
                });

                //                setTalkRequestToSupporter();
                //                closeDialog();
            }
        }
    } else {
        toast.error("شما در حال گفتگو هستید و نیازی به درخواست گفتگو وجود ندارد");
    }
}
function getStatisticData() {
    var arr = [], k, v, j = {}, prefix = "S61P";
    var keys = Object.keys(localStorage);
    for (var b = 0; b < keys.length; b++) {
        k = keys[b];
        if (k.startsWith(prefix)) {
            v = JSON.parse(localStorage.getItem(k));
            if (v && v.url && v.img && v.title && v.time) {
                j[k] = v;
            } else {
                localStorage.removeItem(k);
            }
        }
    }
    keys = Object.keys(j);
    var timeKeys, totalTime;
    for (var b = 0; b < keys.length; b++) {
        k = keys[b];
        timeKeys = Object.keys(j[k].time);
        totalTime = 0;
        for (var p = 0; p < timeKeys.length; p++) {
            totalTime += j[k].time[timeKeys[p]];
        }
        if (totalTime > 0) {
            arr.push([k.substr(prefix.length), j[k].url, j[k].title, j[k].img, totalTime, timeKeys.length]);
        }
    }
    if (arr.length > 0) {
        arr = sortArrayByNumber(4, arr);
        arr = arr.slice(0, 100);
    }
    return arr;
}
//g("#lock_bt").onclick = function () {
//    var e = g("img", this), s = g("span", this);
//    if (lockAutoOpenOffers) {
//        lockAutoOpenOffers = false;
//        s.textContent = "قفل";
//        e.src = "./i/lock.svg";
//        toast.info("مشاهده پیشنهادهای مشاور خودکار شد");
//    } else {
//        lockAutoOpenOffers = true;
//        s.textContent = "آزاد";
//        e.src = "./i/unlock.svg";
//        toast.info("مشاهده خودکار پیشنهادهای مشاور لغو شد");
//    }
//}

function cleanChatBox() {
    removeHtml(message_input_js);
    removeChildren(g(".msg", textDiv, 1), 0);
}
//    }

function getIntervalInfo(data) {
    //console.log("getIntervalInfo data:",data);
    viewerCount.textContent = data.viewerCount;
    g("#customer_video .name").textContent = data.participantUsername;
}


let questionBoxArr = [], surveyBt = g("#survey_bt");

surveyBt.onclick = () => {
    g("#survey_div").classList.remove("hide");
    setQuestionItems();
}
function setQuestionItems() {
    let surveyListDiv = g("#survey_list_div");
    surveyListDiv.innerHTML = "";
    let textContext = '';
    for (let i = 0; i < questionBoxArr.length; i++) {
        textContext += `<div class="question_list_option" onclick="ntrx.showQuestionBox('${questionBoxArr[i].questionId}')" style="background:${questionBoxArr[i].checked ? 'lightgreen' : 'white'}"><p>${questionBoxArr[i].question}</p></div>`;
    }
    surveyListDiv.innerHTML = textContext;
}

let selectedQuestion;
ntrx.showQuestionBox = function (questionId) {
    selectedQuestion = getKeyByValue(questionBoxArr, "questionId", questionId);

    if (selectedQuestion) {
        selectedQuestion.checked = true;
        setQuestionItems();
        switch (Number(selectedQuestion.type)) {
            case (QUESTION_CONFIG.radioButton.type):
                createVoteBoxQuestion(selectedQuestion.question, selectedQuestion.option, QUESTION_CONFIG.radioButton.name);
                break;
            case (QUESTION_CONFIG.checkBox.type):
                createVoteBoxQuestion(selectedQuestion.question, selectedQuestion.option, QUESTION_CONFIG.checkBox.name);
                break;
            case (QUESTION_CONFIG.textBox.type):
                createTextBoxQuestion(selectedQuestion.question);
                break;
        }
    }
}


function createTextBoxQuestion(question) {


    var j = {title: question};
    j.body = '<div class="question_box">' +
            '<textarea maxlength="500" placeholder="متن سوال را وارد کنید" id="answer_text_box" cols="35" rows="3"></textarea>' +
            '</div>';

    j.control = '<span id="answer_question_bt" class="button_ctr2 bg-css-blue bt">ارسال</span>';
    var dialog = showDialog(j);

    var answerTextBox = g("#answer_text_box");
    g("textarea", dialog).focus();
    g("#answer_question_bt", dialog).onclick = function () {
        var answerTextBoxValue = answerTextBox.value.trim();
        var answerValidation = isInputValidate(answerTextBoxValue);
        if (answerTextBoxValue != "") {
            if (answerValidation[0]) {
                sendAnswerData(selectedQuestion.questionId, QUESTION_CONFIG.textBox.type, answerTextBoxValue);
                toast.info("جواب شما در حال پردازش است");
                closeDialog();
            } else {
                toast.error("در متن وارد شده از حروف غیر مجاز استفاده شده است ، حرف غیر مجاز : " + answerValidation[1]);
            }
        } else {
            toast.error("متنی وارد نشده است");
        }
    }

}

function createVoteBoxQuestion(question, options, type) {
    var j = {title: question};
    j.body = '<div id="sf_vote_box_container">';
    for (i = 0; i < options.length; i++) {
        j.body += `<div><input type="${type}" name="vote_question" value="${options[i]["value"]}" id="${options[i]["value"]}" >` +
                `<label for="${options[i]["value"]}">${options[i]["answer"]}</label></div>`;
    }
    j.body += '</div>';
    j.control = '<span id="answer_question_bt" class="button_ctr2 bg-css-blue bt">ارسال</span>';
    var dialog = showDialog(j);

    g("#answer_question_bt", dialog).onclick = function () {

        if (type === QUESTION_CONFIG.radioButton.name) {
            let selectedOption = g('input[name="vote_question"]:checked');
            if (selectedOption) {
                selectedOption = Number(selectedOption.value);
                if (selectedOption) {
                    sendAnswerData(selectedQuestion.questionId, QUESTION_CONFIG.radioButton.type, [selectedOption]);
                    toast.info("جواب شما در حال پردازش است");
                    closeDialog();
                }
            } else {
                toast.error("گزینه ای انتخاب نشده است");
            }
        } else if (type === QUESTION_CONFIG.checkBox.name) {
            let checkBox = g('input[name="vote_question"]:checked', 0, 1);
            let answers = [];
            for (const iterator of checkBox) {
                if (iterator.checked) {
                    answers.push(iterator.value);
                }
            }
            if (answers.length > 0) {
                sendAnswerData(selectedQuestion.questionId, QUESTION_CONFIG.checkBox.type, answers);
                toast.info("جواب شما در حال پردازش است");
                closeDialog();
            } else {
                toast.error("گزینه ای انتخاب نشده است");
            }
        }
    }
}
function getSupporterQuestionArr(questionObjArr) {
    if (questionObjArr && questionObjArr.length > 0) {
        for (let iterator of questionObjArr) {
            getSupporterQuestion(iterator);
        }
    }
}
function getSupporterQuestion(questionObj) {
    //console.log("getSupporterQuestion questionObj:",questionObj);
    if (questionObj) {


//        monsole.log("questionObj ===========================================");
//        monsole.log(questionObj);

        questionObj.checked = false;
        questionBoxArr.push(questionObj);
        updatesurveyBt();
    }
}

function updatesurveyBt() {
    if (questionBoxArr.length > 0) {
        surveyBt.classList.remove(hideClass);
    } else {
        surveyBt.classList.add(hideClass);
    }
    g("#survey_qty").textContent = questionBoxArr.length;
}

function sendAnswerData(questionId, type, answer, talkSession) {
    var j = {data: {questionId: questionId, type: type, answer: answer, userStringId: myInfo.viewerUsername}};
    monsole.log("sendAnswerData", j);
    participantEncryptAgent(CMD.SEND_SURVEY_ANSWER_TO_SUPPORTER, j);
    //console.log("sendAnswerData","questionId",questionId , "type",type , "value",value);
}

function sendAnswerAck(userId, questionId) {
//    console.log("sendAnswerAck questionId", questionId, "userId:", userId, "myInfo:", myInfo);
    if (userId && userId === myInfo.myUserRoomId && questionId) {
        questionBoxArr = removeInArray(questionBoxArr, "questionId", questionId);
        //	questionBoxArr.forEach((a,b)=>{
        //if(a.questionId==questionId){
        //		 delete questionBoxArr[b];
        //	  questionBoxArr.pop();
        // }
        //	});
        toast.success("نظر شما ثبت شد");
        g("#survey_div").classList.add("hide");
        updatesurveyBt();
    }
}



//    });
//} else {
//    document.querySelector("html").innerHTML = "";
//}