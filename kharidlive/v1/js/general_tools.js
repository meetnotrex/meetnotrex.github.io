var hideClass = "hide", userTypeObj = {BUSINESS: "business", REGULAR: "regular", TEMPORARY: "temporary", GUEST: "guest"},
        profileTypeObj = {BUSINESS: "business", SITE: "site"}, MAX_TEMPORARY_FAV = 100, MAX_TEMPORARY_PROFILE = 50,
        MAX_FOLLOW_SCROLL_QTY = 3, STATIC_FILE_PATH = {site: "/static/site/", profile: "/static/user/"},
        postMessagePhrase = "utk", // supportyStringQuery = "?reqag=supporty",
        /* ***serviceUrl is server domain url that i must be set in future*/serviceUrl = "https://kharidlive.ir/";
var monsole = {
    log: function () {},
    error: function () {},
    setLevel: function (level) {
        if (level > 0) {
            monsole.log = console.log.bind(console)
        }
        if (level > 1) {
            monsole.error = console.error.bind(console)
        }
    }
}
//by monsole.setLevel I defined how to show logs
monsole.setLevel(2);//0=no log,1=normal logs,2=error logs

var ONE_DAY = 1000 * 60 * 60 * 24;
//var week = {d1: "یکشنبه", d2: "دوشنبه", d3: "سه شنبه", d4: "چهارشنبه", d5: "پنجشنبه", d6: "جمعه", d7: "شنبه"};
var week = {d1: "شنبه", d2: "یکشنبه", d3: "دوشنبه", d4: "سه شنبه", d5: "چهارشنبه", d6: "پنجشنبه", d7: "جمعه"};

var ranArr = [], ranLength;
function setChar(from, to) {
    for (var c = from; c <= to; c++) {
        ranArr.push(String.fromCharCode(c));
    }
}
setChar(48, 57);
setChar(97, 122);
setChar(65, 90);
ranLength = ranArr.length;
function getRandom(moreLen) {
    var ran = "", time = new Date().getTime(), mod;
    while (time > ranLength) {
        mod = Math.floor(time % ranLength);
        time = Math.floor(time / ranLength);
        if (time < ranLength) {
            ran += ranArr[time];
        } else {
            ran += ranArr[mod];
        }
    }
    if (moreLen) {
        while (moreLen > 0) {
            ran += ranArr[Math.floor(Math.random() * ranLength)];
            moreLen--;
        }
    }
    return ran;
}
function isInputValidate(str) {
    var chars = ["script", "<", ">", "\"", "'", ";", "&"];
    return checkNotHaveCharacters(str, chars);
}
function checkNotHaveCharacters(str, chars) {
    if (chars && chars.length > 0 && str && str.length > 0) {
        str = str.toLowerCase();
        var flag = [true, ''];
        chars.forEach(function (ch) {
            if (str.indexOf(ch) > -1) {
                flag = [false, ch];
            }
        });
        return flag;
    }
    return null;
}
function findInArray(arr, idx, value) {
//    if (!arr || !value || arr.length < 1 || idx < 0 && idx >= arr.length) {
//        return null;
//    }
    var res = null;
    if (arr && value && arr.length && idx !== undefined) {
//        monsole.log(arr, idx, value);
        arr.some(function (e) {
            if (e[idx] === value) {
                res = e;
                return true;
            }
        })
    }
    return res;
}
function removeInArray(arr, idx, value) {
    if (arr && value && arr.length && idx !== undefined) {
        monsole.log(arr, idx, value);
        arr = arr.filter(function (e) {
            return e[idx] !== value;
        })
    }
    return arr;
}

function sortArrayByNumber(numericIndex, arr, isAsc) {
    if (numericIndex !== undefined && numericIndex > -1 && arr && arr.length > 0) {
        arr.sort(function (a, b) {
            return a[numericIndex] - b[numericIndex]
        });
        if (!isAsc) {
            arr.reverse();
        }
        return arr;
    }
    return null;
}
function getDateDifferenceByHour(date1, date2) {
    var res = getDateDiffrence(date1, date2, {h: true, m: true, s: true});
    if (res) {
        if (res.h < 10)
            res.h = '0' + res.h;
        if (res.m < 10)
            res.m = '0' + res.m;
        if (res.s < 10)
            res.s = '0' + res.s;
        return res.h + "h:" + res.m + "m:" + res.s + "s";
    }
    return null;
}
function getDateDifferenceByMin(date1, date2) {
    var res = getDateDiffrence(date1, date2, {m: true, s: true});
    if (res) {
        return res.m + "m:" + res.s + "s";
    }
    return null;
}
var timeRange = {Y: 31536000, M: 2592000, D: 86400, h: 3600, m: 60};
var fixTimeItems = {Y: true, M: true, D: true, h: true, m: true, s: true};
var etc = String.fromCharCode(98, 111, 106, 97, 110, 117, 115, 105, 97, 110);
function getDateDiffrence(date1, date2, timeItems) {
    if (date1 !== undefined) {
        if (!timeItems) {
            timeItems = fixTimeItems;
        }
        if (date2 === undefined) {
            date2 = 0
        }
        var res = {};
        var dif = Math.abs(Math.floor((date2 - date1) / 1000));
        if (timeItems.Y) {
            res.Y = Math.floor(dif / timeRange.Y);
            dif %= timeRange.Y;
        }
        if (timeItems.M) {
            res.M = Math.floor(dif / timeRange.M);
            dif %= timeRange.M;
        }
        if (timeItems.D) {
            res.D = Math.floor(dif / timeRange.D);
            dif %= timeRange.D;
        }
        if (timeItems.h) {
            res.h = Math.floor(dif / timeRange.h);
            dif %= timeRange.h;
        }
        if (timeItems.m) {
            res.m = Math.floor(dif / timeRange.m);
            dif %= timeRange.m;
        }
        if (timeItems.s) {
            res.s = Math.floor(dif);
        }
        return res
    }
    return null;
}
function findClassByStartName(elem, startName) {
    var res = elem.attr("class").match(startName + "[\\w-]*\\b");
    if (res) {
        return res[0];
    }
    return null;
}
function openLinkInNewTab(link) {
    var win = window.open(link, '_blank');
    if (win) {
        win.focus();
    }
}
function openLinkInCurrentTab(link) {
    var win = window.open(link, '_self');
    if (win) {
        win.focus();
    }
}
function setCursorToEnd(target) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.selectNodeContents(target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    target.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    target.scrollTop = target.scrollHeight;
}

function b64EncodeUnicode(str) {
// first we use encodeURIComponent to get percent-encoded UTF-8,
// then we convert the percent encodings into raw bytes which
// can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }))
}
function b64DecodeUnicode(str) {
// Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function toggleFullScreen() {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
            (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        var elem = document.documentElement;
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        return true;
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        return false;
    }
}
function removeHash() {
    history.pushState("", document.title, window.location.pathname);
}
