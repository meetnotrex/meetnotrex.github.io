var s61ntrx={};
document.addEventListener('DOMContentLoaded', function () {

    const sceduleChartElement = s61Select(".s61_calendar"),WEEKLY_SCHEDULE = {
        d1: {name: "شنبه", dayOfWeek: 6, baseDate: ""},
        d2: {name: "یکشنبه", dayOfWeek: 0, baseDate: ""},
        d3: {name: "دوشنبه", dayOfWeek: 1, baseDate: ""},
        d4: {name: "سه شنبه", dayOfWeek: 2, baseDate: ""},
        d5: {name: "چهارشنبه", dayOfWeek: 3, baseDate: ""},
        d6: {name: "پنجشنبه", dayOfWeek: 4, baseDate: ""},
        d7: {name: "جمعه", dayOfWeek: 5, baseDate: ""}
    },eventTypeState = {
        interval: 1,
        specefic: 2,
        trafficAds: 3,
        withoutProgram: 4
    }





let textFitSizer2 = (element, isItParent=false, exceptedWidth = 0, minFontsize = 5, maxFontSize = 15) => {
// exceptedWidth is such as padding margin and etc to ignore with the same cross width
  setTimeout(() => {
	let sourceWidth = element.clientWidth - exceptedWidth, examWidth = 0;
    let p = document.createElement('p');
    p.style.position = "fixed";
    p.style.fontFamily = getCssProperty2(element, "font-family");
    p.style.fontWeight = getCssProperty2(element, "font-weight");
    let currentWhiteSpace = getCssProperty2(element, "white-space");

    if (isItParent) {
       

            element.style.whiteSpace = "nowrap";
            element.appendChild(p);
            let w = 0;
            for (const iterator of element.childNodes) {
                if (iterator.id) {
                    let style = iterator.currentStyle || window.getComputedStyle(iterator),
                        margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
                        padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
                        border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

                    examWidth += parseInt(iterator.offsetWidth);
                    w += margin + padding + border;
                }
            }

          //  console.log(w);
            let fs = parseInt(getComputedStyle(element).fontSize);

            p.remove();

            setFontSize2(element, fs, sourceWidth, examWidth, w, minFontsize, maxFontSize)

            element.style.whiteSpace = currentWhiteSpace;
        
    } else {
        p.textContent = element.textContent;

        p.style.whiteSpace = "nowrap";
        element.appendChild(p);

        let style = element.currentStyle || window.getComputedStyle(element),
            margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
            padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
            border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

        let w = margin + padding + border;


        let fs = parseInt(getComputedStyle(element).fontSize);
        examWidth = p.offsetWidth;
        p.remove();

        setFontSize2(element, fs, sourceWidth, examWidth, 0, minFontsize, maxFontSize)

        element.style.whiteSpace = currentWhiteSpace;
    }
	}, 200)
}, setFontSize2 = (elm, fontSize, sourceWidth, examWidth, w = 0, minFontsize, maxFontSize) => {
    let calc = Math.floor((fontSize * ((sourceWidth - w) / examWidth)) * 10) / 10

    //console.log(calc);
    if (calc > maxFontSize) {
        elm.style = `font-size : ${maxFontSize}px;`;
    } else if (calc < minFontsize) {
        elm.style = `font-size : ${minFontsize}px;`;
    } else {
        elm.style = `font-size : ${calc}px;`;
    }
}, getCssProperty2 = (element, property) => {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}





    var s61Day = Math.floor((new Date() * 1 - new Date(2023, 8, 23) * 1) / 86400000),// 1 mehr 1402
            s61w = s61Select("#s61w"),s61Parent=s61Select("#s61_parent"), //s61sId = -1, // Number(s61w.dataset.numid),
            s61im = s61Select(s61w.dataset.i), s61ti = s61Select(s61w.dataset.t),
            s61h1 = s61Select("h1"), s61i = s61Select("#s61i"),
            s61SiteBase = s61w.dataset.baseurl, s61ga = s61w.dataset.ga,
            s61Domain = s61w.dataset.domain, s61StateInt, s61Profile = s61Select("#s61profile"),
            s61ti = (s61ti !== null ? s61ti.textContent.trim() : null),
            s61Valid = (s61Day > 1 && s61im !== null && s61ti !== null && s61Domain !== undefined),
            s61ls = localStorage, s61b = "/kharidlive/v1/lib_assistant/",
            s61ProductPrefix = "S61P", s61ProductFavoritePrefix = "S61F",
            s61self = window.self.location.origin, s61url = decodeURIComponent(location.pathname),
            /*change my site in future*/s61Server = "https://kharidlive.ir/", s61ProductHash = s61hashCode(s61url),
            s61ProgramCheck = s61Server + "liveouter/v2/programlist?hash=" + s61hashCode(s61Domain),
            s61LiveCheck = s61Server + "liveouter/v2/livestatus?hash=" + s61hashCode(s61Domain) + "&adssiteandsupporterid=",
            s61m = s61Select("#s61m"), s61a = s61Select("#s61a"),// s61i1 = s61Select("#s61i1"),
            s61n = s61Select("#s61n"), s61s = s61Select("#s61s"), s61p = 1, //s61v = s61Select("#s61v"),
            s61WidgetPrograms = [], s61MaxProgramQtyInWidget = 30,//allSelfSupporterProgram = [],allAdsSupporterProgram = [],
			allSupporterProgramObj={},s61InfoState=s61Select(".s61_info_state"),s61o = "s61o",
            s61TimeStartLive = s61Select("#s61timestartlive"), s61SupporterName = s61Select("#s61supportername"),
			allSetTypeEvents = [], allOrderedEvents = {}, defaultDay;//, selfSupporter = [];
//s61Server = s61SiteBase; s61vBase = "/kharidlive/v1/",
//DOMException: Blocked a frame with origin , so I used window.top and window.self Objects to compare
//var s61top = window.top.location.origin;
//function localTest() {
//    if (location.origin.includes("localhost")) {
//        var baseLocal = "/lib_assistant_localstorage"
//        s61b = baseLocal + s61b;
//        s61vBase = baseLocal + s61vBase;
//        s61Check = baseLocal + '/not/supporters.json'
//        s61SiteBase = "http://localhost:8383";
//        s61Server = s61SiteBase;
//    }
//}
//localTest();

//    function getLivedList(l) {
//        let livedArr = [];
//        l.forEach((a) => {
//            if (a[0] === 1) {
//                livedArr.push(a);
//            }
//        });
//        return livedArr.length ? livedArr : l;
//    }
    function s61Select(e) {
        return document.querySelector(e);
    }
    function s61Deactive() {
        s61Parent.style.display = "none";
    }
    function s61Hide(e, b) {
        s61Class(e, s61o, b);
    }
    function s61Class(e, c, isRemove) {
        if(e&&e.classList){
        e = e.classList;
        if (isRemove) {
            e.remove(c);
        } else {
            e.add(c);
        }
    }
    }
    function s61GetDateLongByStartingDay(longDayValue){
        let dSamp= (longDayValue?new Date(longDayValue):new Date());dSamp =(dSamp.getMonth()+1)+"/"+dSamp.getDate()+"/"+dSamp.getFullYear(),dSamp=new Date(dSamp).getTime();
        return dSamp;
    }
    function s61Init() {

        var s61css = document.createElement("link");
        s61css.type = "text/css";
        s61css.rel = "stylesheet";
        s61css.href = s61b + "lib_assistant.css";
        document.head.appendChild(s61css);

        s61TimeCheckForLive(9);
    }


    function s61OnlineOfflineState(j) {
        updateCalendarEvents(j);
        //console.log("s61OnlineOfflineState j", j);
      
	  s61WidgetPrograms = [];
		//let  s61JustInLive=[];
        //let supprterQty =0;
        
//console.log("################# j:",j);
if(j.selflive&&j.selflive.length>0){
	//console.log("################# j.selflive:",j.selflive);
	//supprterQty+=j.selflive.length;
	j.selflive.forEach(a=>{
allSupporterProgramObj.list.find(b=>{
	if(a.isonline&&b.supporterid==a.supporterid){
		a.supportername= b.supportername;
		a.supporterstrid=b.supporterstrid;
		a.siteid= allSupporterProgramObj.siteid;
		a.sitestrid=allSupporterProgramObj.sitestrid;
		if(checkArrayHaveNotDuplicatedIndex(s61WidgetPrograms,[["sitestrid",a.sitestrid],["supporterid",a.supporterid]])){
			s61WidgetPrograms.push(a);
		}
			}
		})
	})
}
if(j.adslive&&j.adslive.length>0){
	//supprterQty+=j.adslive.length;
		//console.log("################# j.adslive:",j.adslive);
j.adslive.forEach(a=>{
allSupporterProgramObj.adslist.program.find(b=>{
	if(a.isonline&&b.supporterid==a.supporterid&&b.siteid==a.siteid){
		a.supportername= b.supportername;
		a.supporterstrid=b.supporterusername;
		a.siteid= b.siteid;
		a.sitestrid=b.sitestrid;
		a.title=b.title;
		if(checkArrayHaveNotDuplicatedIndex(s61WidgetPrograms,[["sitestrid",a.sitestrid],["supporterid",a.supporterid]])){
			s61WidgetPrograms.push(a);
	    }
	}
})
})}
//console.log("s61WidgetPrograms 1",s61WidgetPrograms);
//supprterQty = s61MaxProgramQtyInWidget - supprterQty;


	if((!j.adslive||j.adslive.length<1)&&(!j.selflive||j.selflive.length<1)){
	//console.log("################# j.adslive and j.selflive is empty");
//console.log("################# j:",j,"allOrderedEvents",allOrderedEvents);
let count =0;
	let orderKeys = Object.keys(allOrderedEvents);
			//Object.keys(allOrderedEvents).forEach(a=>{
				for( let f=0;f<orderKeys.length;f++){
					let iterator = allOrderedEvents[orderKeys[f]];
				if(iterator.events&&iterator.events.length>0){
					iterator.events.forEach(a=>{
						
						if(a.startEventTime>99){
							//console.log("################# a:",a);
							//s61WidgetPrograms.push(a);
							if(checkArrayHaveNotDuplicatedIndex(s61WidgetPrograms,[["sitestrid",a.sitestrid],["supporterid",a.supporterid]])){
								s61WidgetPrograms.push(a);
							}
					count++;
						}
					})
					if(count>0){
						//console.log("################# break count",count);
					break;
					}
				}
			  }
			  
				if(count<1){
					//console.log("################# count<1",count);
						let supportersWithoutProgram = allOrderedEvents["d1"];
						if(supportersWithoutProgram){
							supportersWithoutProgram=supportersWithoutProgram.events;
							if(supportersWithoutProgram){
								supportersWithoutProgram.forEach(a=>{
									if(checkArrayHaveNotDuplicatedIndex(s61WidgetPrograms,[["sitestrid",a.sitestrid],["supporterid",a.supporterid]])){
										s61WidgetPrograms.push(a);
									}
								})
							}
						}
					}
			}
            
//console.log("s61WidgetPrograms 2",s61WidgetPrograms);


        if (s61WidgetPrograms.length < 1) {
            s61Hide(s61a);
//                s61Hide(s61v);
            s61n.textContent = (j.msg ? j.msg : (j.status === -2 ? "خرید لایو غیر فعال است" : "برنامه ای قرار نگرفته است"));
			s61TimeStartLive.textContent="";
			textFitSizer2(s61n);
        } else {
            var c = 0;

            // freeze supporter info in widget while mouse is over  becuase nobody wants to click in next supporter while he wants to click on current one.
            s61m.onmouseenter = s61m.onmouseleave = function (e) {
                s61p = e.type === "mouseleave" ? 1 : 0;
            };

            s61LiveState(s61WidgetPrograms[c]);

            if (s61WidgetPrograms.length > 1) {
                clearInterval(s61StateInt);
                s61StateInt = setInterval(function () {
                    if (s61p) {
                        if (c >= s61WidgetPrograms.length-1) {
                            c = -1;
                        }
                        s61LiveState(s61WidgetPrograms[++c]);
                    }
                }, 10000);
            }


        }
    }
	
	

function checkArrayHaveNotDuplicatedIndex(mainArr,notDupliacatedKeyValue){
	let count = 0;
	if(mainArr.length==0){
	return true;
	}else{
	notDupliacatedKeyValue.forEach(a=>{
		if(a.length==2){
			//console.log("checkArrayHaveNotDuplicatedIndex mainArr",mainArr);
			mainArr.forEach(b=>{
			//console.log("checkArrayHaveNotDuplicatedIndex a[0]",a[0],"a[1]",a[1],"b[a[0]]",b[a[0]],"a[1]",a[1]);
			if(b[a[0]]==a[1]){
				count++;
				}
			})
		}
	});
	//console.log("checkArrayHaveNotDuplicatedIndex count",count);
	return !(count==notDupliacatedKeyValue.length);
	}
}


    function s61LiveState(r) {
        s61FadeLiveState();
		//console.log("s61LiveState r",r);
        setTimeout(function () {
            s61Profile.href = s61Server + "s/" + r.sitestrid + "?snum=" + r.supporterid;
            s61FadeLiveState();

			s61TimeStartLive.classList.remove("s61livemode");
            if (r.isonline) {
//                s61n.textContent = r.eventType == eventTypeState.trafficAds ? r.liveTitle : r.title;
//                s61Hide(s61v, 1);
//                s61v.textContent = r[5] + " بیننده";//"آنلاینم با " +
                s61Class(s61i, "s61anim");
                s61TimeStartLive.textContent = r.viewerqty + " بیننده";
		s61TimeStartLive.classList.add("s61livemode");
                s61Class(s61w,"s61_blink");
            } else {
                s61Class(s61w,"s61_blink",1);
				//s61n.textContent = r.title;
//                    s61s.textContent = "الان لایو نیستم اینجا یک نگاه به ساعت برنامه هام بنداز";
//                s61Hide(s61v);
//console.log("TP5 s61TimeStartLive.textContent r.startEventTime",r.startEventTime)
                s61TimeStartLive.textContent = r.startEventTime>999?changeLongToCustomeTime(r.startEventTime):"";
                s61Class(s61i, "s61anim", 1);
            }
			
			s61n.textContent = r.title;
//            s61m.dataset.i = r[1];
            s61a.src = r.supporterImage?r.supporterImage:s61Server + "user/" + r.supporterstrid + "/user_avatar.jpg";
            //s61a.src = r.supporterImage;
            s61SupporterName.textContent = r.supportername;

            textFitSizer2(s61n);
            textFitSizer2(s61InfoState,true,40);
		   
        }, 800);
    }

//    function s61Ran(l, h) {
//        l = Math.ceil(l);
//        return Math.floor(Math.random() * (Math.floor(h) - l + 1)) + l;
//    }
    function s61FadeLiveState() {
        s61m.classList.toggle('s61h')
    }

    function s61TimeCheckForLive(t) {
//            console.log("s61TimeCheck t:", t)
        setTimeout(function () {
            var s61Live = JSON.parse(s61ls.getItem("s61live")), s61Time, s61Dration, s61Now = new Date() * 1;
            if (s61Live) {
                s61Time = s61Live.last_check, s61Dration = s61Live.next_check;
            }
            if (s61Live && (s61Time + s61Dration) > s61Now) {
//        console.log("if");
                s61TimeCheckForLive(s61Live.next_check);
                s61OnlineOfflineState(s61Live);
            } else {
//        console.log("else");
                fetch(s61LiveCheck + getAllAdsSiteAndSupporterIdsInCurrentTime())
                        .then(function (r) {
                            return r.json();
                        }).then(function (j) {
//            console.log("fetch json", j);
                    j.last_check = s61Now;
                    s61TimeCheckForLive(j.next_check);
                    s61ls.setItem("s61live", JSON.stringify(j));
                    s61OnlineOfflineState(j);
                }).catch(function (e) {
                    console.error("دیتا دریافت نشد", e);
                    s61TimeCheckForLive(s61Live.next_check);
                });
            }
        }, t)
    }

    function s61SessionTracker() {
        if (s61Valid) {
            var t1 = new Date() * 1, t2, totalDuration = 0,
                    isPageVisited = false, intervalId;
            function cleanDB() {
                try {
                    var size = JSON.stringify(s61ls).length / 1024 / 1204;
                    if (size > 4.2) {
                        //is 30 days enough ?
                        var keys = Object.keys(s61ls), v, t, d = s61Day - 30;
                        for (var f = 0; f < keys.length; f++) {
                            if (keys[f].startsWith(s61ProductPrefix)) {
                                v = JSON.parse(s61ls.getItem(keys[f]));
                                t = Object.keys(v.time);
                                for (var g = 1; g < d; g++) {
                                    delete t.time["d" + g];
                                }
                                s61ls.setItem(keys[f], t);
                            }
                        }
                    }
                    var size = JSON.stringify(s61ls).length / 1024 / 1204;
                    if (size > 3.5) {
                        clearLs();
                    }
                } catch (r) {
                    console.error(r);
                    clearLs();
                }
            }
            function clearLs() {
                Object.keys(s61ls).forEach(function (e) {
                    if (e.startsWith(s61ProductPrefix)) {
                        s61ls.removeItem(e);
                    }
                });
                location.reload();
            }
            cleanDB();
            document.addEventListener('visibilitychange', function () {
                if (isPageVisited) {
                    if (document.visibilityState === 'hidden') {
                        setDuration();
                        setIntervalPersistence(false);

                    } else if (document.visibilityState === 'visible') {
                        t1 = new Date() * 1;
                        setIntervalPersistence(true);
                    }
                } else {
                    setDuration();
                    isPageVisited = true;
                    setIntervalPersistence(false);
                }
            });

            function setIntervalPersistence(isPageVisisble) {
                if (isPageVisisble) {
                    intervalId = setInterval(function () {
                        setDuration();
                        persistNewVisit();
                    }, 5000)//interval update current visit statistics
                } else if (intervalId) {
                    clearInterval(intervalId);
                    persistNewVisit();
                }
            }
            function persistNewVisit() {
                var ti = parseInt(totalDuration / 1000); //time in second not millisecond
                if (ti > 3) {//3 seconds is minimum valuable user visit that i could to count that handled by interval function
                    var obj = s61ls.getItem(s61ProductPrefix + s61ProductHash);
                    if (obj) {
                        obj = JSON.parse(obj);
                        var prevoiusTime = 0;
                        if (obj.time["d" + s61Day]) {
                            prevoiusTime = obj.time["d" + s61Day];
                            if (typeof prevoiusTime !== "number") {
                                prevoiusTime = 0;
                            }
                        }
                        obj.time["d" + s61Day] = prevoiusTime + ti;
                    } else {
                        obj = {
                            url: s61url,
                            img: s61im.src,
                            title: s61ti,
                            time: {}
                        }
                        obj.time["d" + s61Day] = ti
                    }
                    obj = JSON.stringify(obj);
                    s61ls.setItem(s61ProductPrefix + s61ProductHash, obj);
                }
            }
            function setDuration() {
                t2 = new Date() * 1;
                totalDuration = (t2 - t1);
                t1 = t2;
            }
            setIntervalPersistence(true);
        }
    }
    function s61hashCode(s) {
        s = s.toLowerCase();
        var h = 0, l = s.length, i = 0;
        if (l > 0)
            while (i < l) {
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
            }
        return h;
    }
    function s61ChangeAnchorTarget() {
        document.querySelectorAll("a").forEach(function (i) {
            i.setAttribute('target', '_self');
        });
    }
    if (s61self === s61SiteBase) {//true ||
        function setMessaging() {
            function pm(e) {
                // i comment it because postmessage and receiver are in same origin and makes infinity message loop
                window.top.postMessage(e, s61SiteBase);
            }
            window.addEventListener('message', function (e) {
                //console.log("lib_assistant message", "data: ", e.data, "origin: ", e.origin);
                if (e.origin === s61SiteBase) { //*** change origin url to my site
                    e = e.data;
                    //*** maybe not required because in any page load i send it immediately
                    if (e.c === "url") {
                        pm({c: "url", isvalid: s61Valid, host: location.origin, path: s61url, title: s61ti, img: s61im.src, hash: s61ProductHash});
                    } else if (e.c === "ga" && s61ga) {
//https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframes
                        ga('create', s61ga, 'auto', {clientId: e.gacid})
                    }
                }
            });
            if (s61Valid) {
                pm({c: "url", isvalid: s61Valid, host: location.origin, path: s61url, title: s61ti, img: s61im.src, hash: s61ProductHash});
            } else if (s61h1) {
                pm({c: "url", isvalid: true, host: location.origin, path: s61url, title: s61h1.textContent});//, hash: s61hash
            } else {
                pm({c: "url", isvalid: s61Valid});
            }
        }
        var isCrosFree = true;
        try {
            window.top.location.origin;
        } catch (e) {
            e = e.toString().toLowerCase();
            isCrosFree = !e.includes("cross") && !e.includes("blocked");
        }
        var isSameOriginWithoutIframe = isCrosFree && window.frameElement === null && window.top.location.origin === window.self.location.origin;//&& window.top.frames.length < 1
        var isSameOriginWithIframe = isCrosFree && window.frameElement !== null && window.top.location.origin === window.self.location.origin;//&& window.top.frames.length > 0
        var isProfileIframe = !isCrosFree || (window.frameElement === null && window.top.location.origin !== window.self.location.origin);//&& window.top.frames.length > 0

//        var isSameOriginWithoutIframe = window.frameElement === null  && window.top.location === window.self.location;//&& window.top.frames.length < 1
//        var isSameOriginWithIframe = window.frameElement !== null && window.top.location === window.self.location;//&& window.top.frames.length > 0
//        var isProfileIframe = window.frameElement === null && window.top.location !== window.self.location;//&& window.top.frames.length > 0
        if (isSameOriginWithoutIframe) {
            console.log("+++++++++++++++++++++++++ isSameOrigin and Not isInIFrame (Normal Statistics show) ++++++++++++++++++++++");
            s61SessionTracker();
//            s61Init();
            initProgram();



        } else if (isSameOriginWithIframe) {
            console.log("+++++++++++++++++++++++++ isSameOrigin and isInIframe (live iframe) ++++++++++++++++++++++");
            s61Deactive();
            s61ChangeAnchorTarget();
            setMessaging();
        } else if (isProfileIframe) {
            console.log("+++++++++++++++++++++++++ NOT sameOrigin (profile iframe) ++++++++++++++++++++++");
            s61Deactive();
            s61ChangeAnchorTarget();
            s61SessionTracker();
        }
    } else {
        console.log("library is not related to site");
    }









































    /**
     * ? fetch data of set in site
     * @function updateWeeklyScheduleDate this is update WEEKLY_SCHEDULE["baseDate"]
     * ? after @function(updateWeeklyScheduleDate) forEach in @param(obj) to get type of @param(obj)
     * @function(convertSupportersEvents) if @param(key) == list
     * @function(convertOtherSitesEvents) if @param(key) == adsList  
     * ? in this two @functions we serialize data together to read and better use
     */
    function initProgram() {


        function s61TimeCheck(t) {
            //console.log("s61TimeCheck t:", t)
            setTimeout(function () {
                var s61Program = JSON.parse(s61ls.getItem("s61program")), s61Time, s61Dration, s61Now = new Date() * 1;
                if (s61Program) {
                    s61Time = s61Program.last_check, s61Dration = s61Program.next_check;
                }
                if (s61Program && (s61Time + s61Dration) > s61Now) {
//        console.log("if");
                    s61TimeCheck(s61Program.next_check);
                    s61ProgramProcess(s61Program);
                } else {
//        console.log("else");
                    fetch(s61ProgramCheck).then(function (r) {
                        return r.json();
                    }).then(function (j) {
//            console.log("fetch json", j);
                        j.last_check = s61Now;
                        s61TimeCheck(j.next_check);
                        s61ls.setItem("s61program", JSON.stringify(j));
                        s61ProgramProcess(j);
                    }).catch(function (e) {
                        console.error("دیتا دریافت نشد", e);
                    });
                }
            }, t)
        }
        s61TimeCheck(9);


        function s61ProgramProcess(obj) {
			console.log("++++++++++++++++++++++++ s61ProgramProcess ++++++++++++++ obj:",obj);
            if (obj && Object.keys(obj).length > 0) {

                s61Parent.style.removeProperty("display");
                s61Hide(s61m, 1);

                if (s61Valid) {
                    var s61e = s61Select("#s61e");
                    s61Class(s61w, "s61u", 1);
                    var favs = s61ls.getItem(s61ProductFavoritePrefix + s61ProductHash);
                    if (!favs) {
                        s61Hide(s61e, 1);
                        s61e.onclick = function () {
                           // console.log("onclick");
                            var favJson = {hash: s61ProductHash, path: s61url, title: s61ti, img: s61im.src, time: new Date() * 1};
                            s61ls.setItem(s61ProductFavoritePrefix + s61ProductHash, JSON.stringify(favJson));
                            s61Hide(s61e, 0);
                        }
                    }
                }

                allSetTypeEvents = [], allOrderedEvents = {};//, selfSupporter = [];

                updateWeeklyScheduleDate();

                let selfSiteStrId = obj.sitestrid;
                let selfSiteId = obj.siteid;
                let list = obj.list;
				//allSelfSupporterProgram=obj.list;
				//allAdsSupporterProgram=obj.adslist;
				allSupporterProgramObj=obj;
//console.log("TP1",list,obj);
if(obj.list){
                for (let f = 0; f < list.length; f++) {
                    //console.log("f:"+f,list[f].program);
                    convertSupportersIntervalEvents(list[f], list[f].program.interval, selfSiteStrId, selfSiteId);
                    convertSupportsSpeceficEvents(list[f], list[f].program.specefic, selfSiteStrId, selfSiteId);
                    createEveryTimeSupporterSchedule(list[f], selfSiteStrId, selfSiteId);
                }
}             
			 convertOtherSitesEvents(obj.adslist);

                /**
                 * ? we need to create 28 days (4W * 7D) for calsender
                 * @function(getDateInfo) get some data from Date 
                 * @param(dayAttr) for select day of week in range of {d1 to d28}
                 */

				paginatedList.innerHTML="";
                for (let i = 0; i < 28; i++) {
                    let dayInfo = getDateInfo(i), dayAttr = `d${i + 1}`;

                    allOrderedEvents[dayAttr] = {
                        startDate: dayInfo.thisDay,
                        endDate: dayInfo.nextDay,
                        dayOfWeek: dayInfo.dayOfWeek,
                        day: dayInfo.day,
                        events: sortSceduleEvent(dayInfo.thisDay, dayInfo.nextDay, (dayAttr == "d1") ? true : false)
                    }

                    //let eventCount = allOrderedEvents[dayAttr].events.length;
					let eventCount = allOrderedEvents[dayAttr].events.filter(a=>{
					if(a.startEventTime!=-1){return a}
					}).length;
                    scheduleCreator(dayInfo.dayOfWeek, eventCount, dayInfo.day, dayAttr);
                    if (i == 0) {
                        s61Select(".s61_button_part_one").click();
                    }
                }

                (defaultDay) ? eventCreator(defaultDay) : eventCreator(allOrderedEvents.d1);
                s61Init();

            }
        }
    }




    function updateWeeklyScheduleDate() {
        let dSamp =s61GetDateLongByStartingDay();
        for (let i = 0; i < 7; i++) {
            let day = new Date(dSamp + (86400000 * i));
//            console.log("javad BUG : day:",day,"WEEKLY_SCHEDULE:",WEEKLY_SCHEDULE,"day.getDay():",day.getDay(),"getKeyByValue(WEEKLY_SCHEDULE, dayOfWeek, day.getDay()):",getKeyByValue(WEEKLY_SCHEDULE, "dayOfWeek", day.getDay()));
            let change = getKeyByValue(WEEKLY_SCHEDULE, "dayOfWeek", day.getDay());
            change.baseDate = day.getTime();
        }
    }


    function convertSupportersIntervalEvents(supporterInfo, supporterIntervalEventsObject, selfSiteStrId, selfSiteId) {
//console.log("convertSupportersIntervalEvents supporterInfo",supporterInfo);
        if (supporterIntervalEventsObject) {
            //let intervalEventObject = {};

            Object.keys(supporterIntervalEventsObject).forEach(key => {

                for (const iterator of supporterIntervalEventsObject[key]) {

                    let date = new Date(WEEKLY_SCHEDULE[key].baseDate)
                    let time = setTime(date, iterator.time),
                            sTime = time.sTime, eTime = time.eTime;
                    for (let i = 0; i < 4; i++) {
						let intervalEventObject = {};
                        intervalEventObject.startEventTime = sTime + ((86400000 * 7) * i);
                        intervalEventObject.endEventTime = eTime + ((86400000 * 7) * i);
                        intervalEventObject.eventType = eventTypeState.interval;
                        intervalEventObject.sitestrid = selfSiteStrId;
                        intervalEventObject.siteid = selfSiteId;
                        intervalEventObject.siteLogo = s61Server + `site/${selfSiteStrId}/site_logo.jpg`;
                        intervalEventObject.supporterImage = s61Server + `user/${supporterInfo.supporterstrid}/user_avatar.jpg`;
                        intervalEventObject.supportername = supporterInfo.supportername;
                        intervalEventObject.supporterid = supporterInfo.supporterid;
                        intervalEventObject.title = iterator.title;
                        intervalEventObject.eventRangeTime = createEventRangeTime(sTime, eTime);
//console.log("convertSupportersIntervalEvents intervalEventObject",intervalEventObject);

                        allSetTypeEvents.push(intervalEventObject);
                        //intervalEventObject = {};
                    }
                }
            })
        }
    }


    function createEveryTimeSupporterSchedule(supporterInfo, selfSiteStrId, selfSiteId) {
        let supporterSceduleObj = {};

        supporterSceduleObj.startEventTime = -1;
        supporterSceduleObj.endEventTime = -1;
        supporterSceduleObj.eventType = eventTypeState.withoutProgram;
        supporterSceduleObj.sitestrid = selfSiteStrId;
        supporterSceduleObj.siteid = selfSiteId;
        supporterSceduleObj.siteLogo = s61Server + `site/${selfSiteStrId}/site_logo.jpg`;
        supporterSceduleObj.supporterImage = s61Server + `user/${supporterInfo.supporterstrid}/user_avatar.jpg`;
        supporterSceduleObj.supportername = supporterInfo.supportername;
        supporterSceduleObj.supporterid = supporterInfo.supporterid;
        
        supporterSceduleObj.title = "بزودی لایو برگزار می شود";
        supporterSceduleObj.eventRangeTime = "الان وارد اتاق لایو شوید";

        //selfSupporter.push(supporterSceduleObj);
        allSetTypeEvents.push(supporterSceduleObj);
    }


    function setTime(date, timeArr) {
        let sTime, eTime;
        if (timeArr[1][1] == undefined || timeArr[1][0] == 0) {
            sTime = date.setHours(timeArr[0][0], timeArr[0][1]);
            eTime = date.setHours(24, 0);
        } else {
            sTime = date.setHours(timeArr[0][0], timeArr[0][1]);
            eTime = date.setHours(timeArr[1][0], timeArr[1][1]);
        }
        return {sTime, eTime}
    }


    function convertSupportsSpeceficEvents(supporterInfo, supporterSpeceficEventsObject, selfSiteStrId, selfSiteId) {
        if (supporterSpeceficEventsObject) {
            let speceficEventObject = {};

            for (const iterator of supporterSpeceficEventsObject) {
                speceficEventObject.startEventTime = iterator.time[0] * 1000;
                speceficEventObject.endEventTime = iterator.time[1] * 1000;
                speceficEventObject.eventType = eventTypeState.specefic;
                speceficEventObject.sitestrid = selfSiteStrId;
                speceficEventObject.siteid = selfSiteId;
                speceficEventObject.siteLogo = s61Server + `site/${selfSiteStrId}/site_logo.jpg`;
                speceficEventObject.supporterImage = s61Server + `user/${supporterInfo.supporterstrid}/user_avatar.jpg`;
                speceficEventObject.supportername = supporterInfo.supportername;
                speceficEventObject.supporterid = supporterInfo.supporterid;
                speceficEventObject.title = iterator.title;
                speceficEventObject.eventRangeTime = createEventRangeTime(speceficEventObject.startEventTime,
                        speceficEventObject.endEventTime);

                allSetTypeEvents.push(speceficEventObject);
                speceficEventObject = {};
            }
        }
    }


//function checkProgramEventIsLive(isLive, startEventTime, endEventTime) {
//    let date = new Date().getTime();
//    if (!isLive) {
//        return false;
//    } else {
//        return (startEventTime <= date && date <= endEventTime) ? true : false;
//    }
//}



    function convertOtherSitesEvents(trafficAdsEventObject) {
        if (trafficAdsEventObject) {
            let //liveList = trafficAdsEventObject.livelist,
                    programs = trafficAdsEventObject.program, adsEventObject = {};

            for (const iterator of programs) {
				//console.log("convertOtherSitesEvents iterator" , iterator);
//            adsEventObject.isonline = checkProgramAdsIsInLIve(iterator.programid, liveList);
                adsEventObject.startEventTime = iterator.time[0] * 1000;
                adsEventObject.endEventTime = iterator.time[1] * 1000;
                adsEventObject.eventType = eventTypeState.trafficAds;
                adsEventObject.siteLogo = s61Server + `site/${iterator.sitestrid}/site_logo.jpg`;
                adsEventObject.sitestrid = iterator.sitestrid;
                adsEventObject.siteid = iterator.siteid;
                adsEventObject.supporterImage = s61Server + `user/${iterator.supporterusername}/user_avatar.jpg`
                adsEventObject.supportername = iterator.supportername;
                adsEventObject.supporterid = iterator.supporterid;
                adsEventObject.title = iterator.title;
                adsEventObject.eventRangeTime = createEventRangeTime(iterator.time[0] * 1000, iterator.time[1] * 1000);

                allSetTypeEvents.push(adsEventObject);
                adsEventObject = {};
            }
        }
    }


//function checkProgramAdsIsInLIve(programId, liveList) {
//    for (const iterator of liveList) {
//        if (Number(iterator) === programId) {
//            return true;
//        }
//    }
//    return false;
//}


    function createEventRangeTime(startTime, endTime) {
        return `از ${createCustomeTime(startTime)} تا ${createCustomeTime(endTime)}`;
    }


    function createCustomeTime(time) {
        let date = new Date(time);
        let hour = (String(date.getHours()).length == 2) ? date.getHours() : `0${date.getHours()}`;
        let minute = (String(date.getMinutes()).length == 2) ? date.getMinutes() : `0${date.getMinutes()}`;
        return hour + ":" + minute;
    }


    function sortSceduleEvent(startDayTime, endDayTime, today) {
        let afterTime = Date.now(), min = 0, dailySchedule;
        if (today) {
            dailySchedule = allSetTypeEvents.filter(elem => {
                return elem.startEventTime == -1 && elem.endEventTime == -1 ||
                        elem.startEventTime >= startDayTime && elem.endEventTime <= endDayTime
                        && (afterTime < elem.endEventTime);//&& (afterTime < elem.endEventTime + 600000);
            })
        } else {
            dailySchedule = allSetTypeEvents.filter(elem => {
                return elem.startEventTime >= startDayTime && elem.endEventTime <= endDayTime
                        && (afterTime < elem.endEventTime + min);
            })
        }

        if (dailySchedule.length > 30) {
            dailySchedule = dailySchedule.sort(() => .5 - Math.random());
        }

        return dailySchedule.sort((a, b) => {
            return (a.startEventTime - b.startEventTime) || (a.endEventTime - b.endEventTime);
        })
    }


    function getDateInfo(dayIndex) {
//        let date = new Date(new Date().toLocaleDateString('IR')).getTime();
        let date =s61GetDateLongByStartingDay();
        let thisDay = date + (dayIndex * 86400000);
        let nextDay = date + ((dayIndex + 1) * 86400000);
        let day = new Date(thisDay).toLocaleDateString('fa-IR');
        let dayOfWeek = new Date(thisDay).getDay();
        return {thisDay, nextDay, day, dayOfWeek}
    }


    function scheduleCreator(dayOfWeek, eventCount, datetime, dateAttr) {
        let button = document.createElement("button")
        button.classList.add("s61_button_on_table")
        button.setAttribute("onclick", "s61ntrx.s61ShowDayDisplay(this)")
        button.setAttribute("day", dateAttr)

        button.innerHTML = `<div class="s61_button_part_one">`
                + `<span>${getKeyByValue(WEEKLY_SCHEDULE, "dayOfWeek", dayOfWeek).name}</span>`
                + `<span class="s61_show_number_of_day">${eventCount}</span>`
                + `</div>`
                + `<span class="s61_date_of_day">${datetime}</span>`;

        paginatedList.appendChild(button);
    }



    function eventCreator(dailyEventsObj) {

        let events = dailyEventsObj.events;

        s61Select(".s61_lives_table table > tbody").remove();

        let tbody = document.createElement('tbody');
        s61Select(".s61_lives_table table").appendChild(tbody);
		let countEvent = events.filter(a=>{
			if(a.startEventTime>99){
			return a;}
		});
        if (countEvent.length === 0) {
            changeVisibality(".s61_body_live_table_hidden",
                    ".s61_body_live_table_info");
			textFitSizer2(s61Select(".s61_body_live_table_hidden>div"),false,10);
        } else {
            changeVisibality(".s61_body_live_table_info",
                    ".s61_body_live_table_hidden");

            for (let i = 0; i < events.length; i++) {
               // console.log(events[i]);
                if (events[i].startEventTime != -1) {
                    let tr = document.createElement('tr');
                    let eventElementContext = '';
                    if (events[i].isonline) {
                        eventElementContext += '<td>'
//                        + `<a href="${createRedirectToLive(events[i].sitestrid, events[i].supporterid)}" target="_blank" class="program_live_bt">`
                                + '<a href="' + s61Server + 's/' + events[i].sitestrid + '?snum=' + events[i].supporterid + '" target="_blank" class="program_live_bt">'
                                + 'ورود'
                                + '<span class="s61_icon_animated_online"></span>'
                                + '</a>'
                                + '</td>'
                                + '</tr>';
                        tr.classList.add("program_is_live");
                    } else {
                        eventElementContext += '<td>'
//                        + `<a href="${addToGoogleCalendar(events[i].title, events[i].startEventTime, events[i].endEventTime, events[i].sitestrid, events[i].supporterid)}"  target="_blank" class="program_live_bt program_reserve_bt">`
                                + '<a href="http://www.google.com/calendar/render?action=TEMPLATE&text='
                                + events[i].title + '&dates=' + createGoogleCalendarCustomeTime(events[i].startEventTime) + 'Z/'
                                + createGoogleCalendarCustomeTime(events[i].endEventTime) + '&details=' + s61Server + 's/'
                                + events[i].sitestrid + '?snum=' + events[i].supporterid
                                + '" target="_blank" class="program_live_bt program_reserve_bt">'
                                + 'یادآوری<span>&#10133;</span>'
                                + `</a>`
                                + '</td>'
                                + '</tr>'
                    }
                    eventElementContext += '<tr class="program_is_live">'
                            + '<td>'
                            + `<img src="${events[i].siteLogo}" alt="">`
                            + '</td>'

                            + '<td class="s61ltr"><a target="_blank" rel="nofollow noopener noreferrer" href="'
                            + s61Server+'s/'+ events[i].sitestrid+'">'+ events[i].sitestrid+'</a>'
                            + '</td>'

                            + '<td>'
                            + `<img src="${events[i].supporterImage}" alt="">`
                            + '</td>'

                            + '<td>'
                            + `${events[i].supportername}`
                            + '</td>'

                            + '<td>'
                            + `${events[i].title}`
                            + '</td>'

                            + '<td>'
                            + `${events[i].eventRangeTime}`
                            + '</td>';

                    tr.innerHTML = eventElementContext;
                    tbody.appendChild(tr);
                }

            }
        }
    }


//function createRedirectToLive(domain, supporterId) {
//    let base = 
//    return base + query;
//}


    function changeVisibality(showSelector, hideSelector) {
        if (showSelector) {
			s61Hide(s61Select(showSelector),1)
        }
        if (hideSelector) {
			s61Hide(s61Select(hideSelector))
        }
    }


    function getKeyByValue(object, searchKey, value) {
        let o = Object.keys(object).find(key =>
            object[key][searchKey] === value);
        return object[o];
    }


    s61ntrx.s61ShowDayDisplay=function (arg) {
        document.querySelectorAll(".s61_button_on_table").forEach((a) => {
            a.classList.remove("program_is_live");
        });
        arg.classList.add("program_is_live");
        let attr = arg.getAttribute("day");
        if (attr !== null) {
            defaultDay = allOrderedEvents[attr];
            eventCreator(defaultDay);
        }
    }


    function createGoogleCalendarCustomeTime(time) {
        let date = new Date(time),dateStr =(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
//        let day = String(date.toLocaleDateString()).split("/"); // ? ['8', '27', '2023'] sample return
        let day = dateStr.split("/"); // ? ['8', '27', '2023'] sample return
        day = day[2] + "" + ((day[0].length == 1) ? "0" + day[0] : day[0]) + ((day[1].length == 1) ? "0" + day[1] : day[1]);
        let hour = chengeTimeFormet(date.getHours()) + "" + chengeTimeFormet(date.getMinutes()) + "" + chengeTimeFormet(date.getSeconds());
        return `${day}T${hour}`;
    }


    function chengeTimeFormet(time) {
        return (String(time).length == 1) ? "0" + time : time;
    }





	
// detect for (sceduleChartElement) when click out of sceduleChartElement
document.addEventListener("click", (evt) => {
    let targetEl = evt.target;
    do {
        if (targetEl == sceduleChartElement || targetEl == s61w) {
            return;
        }
        targetEl = targetEl.parentNode;
    } while (targetEl);
    if (!sceduleChartElement.classList.contains(s61o)) {
    s61ScheduleChartToggle();
    }
});



let snapScroll=0 ;
    s61Select(".s61_live_calendar_button").onclick = () => {
        s61ScheduleChartToggle()
    }
    s61Select("#s61programbt").onclick = () => {
        s61ScheduleChartToggle();
		textFitSizer2(s61Select(".s61_body_live_table_hidden>div"),false,10);
    }
    function s61ScheduleChartToggle() {
        if (Object.keys(allOrderedEvents).length>0) {
            sceduleChartElement.classList.toggle(s61o);
			snapScroll = parseFloat(getComputedStyle(paginatedList).width);			
//    if (s61w.classList.contains(s61o)) {
//        changeVisibality("#s61w", ".s61_calendar");
//    } else {
//        changeVisibality(".s61_calendar", "#s61w");
//    }
        }
    }

    /* scroll snap script code */

    let nextButton = s61Select("#s61_next_button"),
            prevButton = s61Select("#s61_prev_button"),
            paginatedList = s61Select("#s61_paginated_list");

paginatedList.scrollLeft = 0;
    nextButton.addEventListener('click', () => {
        changeVisibality("#s61_prev_button > img");
        if ((-1 * paginatedList.scrollLeft + (2.2 * snapScroll)) > paginatedList.scrollWidth) {
            changeVisibality("#s61_prev_button > img", "#s61_next_button > img");
        }
        paginatedList.scrollLeft -= snapScroll;
    });
    prevButton.addEventListener("click", () => {
        changeVisibality("#s61_next_button > img");
    if(-1*paginatedList.scrollLeft<1.2*snapScroll){
            changeVisibality("#s61_next_button > img", "#s61_prev_button > img");
        }
        paginatedList.scrollLeft += snapScroll;
    });
        changeVisibality("#s61_next_button > img", "#s61_prev_button > img");














    function setScrollingWithDragging(parentElem) {
        let mouseDown = false;
        let startX, scrollLeft, startY, scrollTop;

        let startDragging = function (e) {
            mouseDown = true;
            startX = e.pageX - parentElem.offsetLeft;
            startY = e.pageY - parentElem.offsetTop;
            scrollLeft = parentElem.scrollLeft;
            scrollTop = parentElem.scrollTop;
        };
        let stopDragging = function () {
            mouseDown = false;
        };

        parentElem.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!mouseDown) {
                return;
            }
            const x = e.pageX - parentElem.offsetLeft;
            const y = e.pageY - parentElem.offsetTop;
            const xScroll = x - startX;
            const yScroll = y - startY;
            parentElem.scrollLeft = scrollLeft - xScroll;
            parentElem.scrollTop = scrollTop - yScroll
        });

        // Add the event listeners
        parentElem.addEventListener('mousedown', startDragging, false);
        parentElem.addEventListener('mouseup', stopDragging, false);
        parentElem.addEventListener('mouseleave', stopDragging, false);
    }

    setScrollingWithDragging(s61Select(".s61_lives_table"));















    function getAllAdsSiteAndSupporterIdsInCurrentTime() {
        let adsprogram = "", date = new Date() * 1;
        let filterEvents = allSetTypeEvents.filter(elm => {
            if (elm.startEventTime <= date && date <= elm.endEventTime) {
                return elm;
            }
        })
        //console.log(filterEvents);
        for (const iterator of filterEvents) {
			
            if (iterator.eventType == eventTypeState.trafficAds) {
				//console.log("getAllAdsSiteAndSupporterIdsInCurrentTime iterator",iterator);
                adsprogram += `${iterator.siteid}:${iterator.supporterid},`
            }
        }
        return adsprogram.length > 1 ? adsprogram : "no";
    }


    function updateCalendarEvents(updateObjectResponse) {
		//console.log("updateCalendarEvents updateObjectResponse",updateObjectResponse);
        let date = new Date() * 1;

        if (updateObjectResponse) {
            let d1Events = allOrderedEvents.d1.events;
            d1Events.forEach(a => {
                a.isonline = 0;
            });
            if (updateObjectResponse.selflive&&updateObjectResponse.selflive.length>0) {
                for (let i = 0; i < updateObjectResponse.selflive.length; i++) {


                    let findEvent = d1Events.find(elm => {
                        if (elm.startEventTime <= date && date <= elm.endEventTime &&
                                elm.supporterid == updateObjectResponse.selflive[i].supporterid) {
                            return true
                        }
                    });
                    if (findEvent) {

                        d1Events.forEach(json => {
                            if (json.startEventTime <= date && date <= json.endEventTime &&
                                    json.supporterid == updateObjectResponse.selflive[i].supporterid) {
                                json.isonline = updateObjectResponse.selflive[i].isonline;
                                json.liveTitle = updateObjectResponse.selflive[i].title;
                                json.viewerqty = updateObjectResponse.selflive[i].viewerqty;
                            }
                        });

                    } else {
                        d1Events.forEach(json => {
                            if ((json.startEventTime == -1 || json.startEventTime == 0) &&
                                    json.supporterid == updateObjectResponse.selflive[i].supporterid) {

                                let isonline = updateObjectResponse.selflive[i].isonline;
                                json.startEventTime = (isonline) ? 0 : -1;
                                json.isonline = isonline;
                                json.liveTitle = updateObjectResponse.selflive[i].title;
                                json.viewerqty = updateObjectResponse.selflive[i].viewerqty;
                            }
                        })
                    }
                }
            }
            if (updateObjectResponse.adslive&&updateObjectResponse.adslive.length>0) {
                for (let i = 0; i < updateObjectResponse.adslive.length; i++) {
                    d1Events.forEach(key => {
						//console.log("key",key,"updateObjectResponse.adslive[i]",updateObjectResponse.adslive[i]);
                        if (key.startEventTime <= date && date <= key.endEventTime &&
                                key.siteid == updateObjectResponse.adslive[i].siteid &&
                                key.supporterid == updateObjectResponse.adslive[i].supporterid) {

                            key.isonline = updateObjectResponse.adslive[i].isonline;
//                            key.liveTitle = updateObjectResponse.adslive[i].title;
                            key.viewerqty = updateObjectResponse.adslive[i].viewerqty;
                        }
                    })
                }
            }
        }
		let d1dataInfo = allOrderedEvents["d1"];
		d1dataInfo.events = sortSceduleEvent(d1dataInfo.startDate, d1dataInfo.endDate, true);
		let d1ProgramLength=0;
		for(let f=0;f<d1dataInfo.events.length;f++){
			if(d1dataInfo.events[f].endEventTime>date){
				d1ProgramLength++;
			}
		}
		s61Select("#s61_paginated_list button:nth-child(1) .s61_show_number_of_day").textContent = d1ProgramLength;
        eventCreator(defaultDay);
    }

    function changeLongToCustomeTime(programDate) {
        let date = new Date(programDate);
		//console.log(" date.getDay()", date.getDay(),"programDate",programDate,"r",r)
        let dayOfWeek = getKeyByValue(WEEKLY_SCHEDULE, "dayOfWeek", date.getDay()).name;
        let min = (String(date.getMinutes()).length == 1) ? "0" + date.getMinutes() : date.getMinutes();
        let time = date.getHours() + ":" + min;

        return dayOfWeek + " " + time
    }

})

