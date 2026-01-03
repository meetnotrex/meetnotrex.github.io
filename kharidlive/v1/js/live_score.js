var dialogInterval;
var scoreEmojiList = ["tired", "angry", "frown", "meh-blank", "meh-rolling-eyes", "grimace", "smile", "grin-alt", "grin-wink", "grin-beam", "grin-hearts", "grin-stars"];
var scoreEmojiColor = ["rosybrown", "#a0a28c", "#9ca7b4", "#8ca28f", "#b69aba", "#a9bd69", "#87b8da", "orchid", "#189fff", "yellowgreen", "dodgerblue", "blueviolet"];
var scoreMsg = ["اصلا قابل تحمل نیست", "شاکیم این چه وضعشه ؟ مزخرف بود", "ارزش نداشت", "علاقه ای نداشتم", "نا امیدم کرد انتظارم بیشتر بود", "بد نبود ولی میتونست بهتر بشه", "ای بگی نگی خوب بود", "به به خوب بود", "جالب بود همونی بود که انتظار داشتم", "لذت بردم خیلی خوب بود", "عالی بود حرف نداشت", "سوپرایز شدم اصلا یک وضعی"];
//var ttest;
// scoring to live discussion is just related to registered users NOT Anonymouses
function setEfficiencyScore(callback) {
    var j = {title: ' این گفتگو چطور بود؟', notClose: 1};
    j.body = '<div class="star_rating">' +
            '<img class="emoji far">' +
            '<span class="score_name"></span>' +
            '<div style="direction:ltr">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="1">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="2">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="3">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="4">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="5">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="6">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="7">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="8">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="9">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="10">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="11">' +
            '<img src="./i/star_gray.svg" class="star_score" data-score="12">' +
            '</div>' +
            '</div>';
    j.control = '<span id="score_bt" class="button_ctr2 bg-css-blue bt">ارسال امتیاز</span>' +
            '<span id="not_complete_bt" class="button_ctr2 bg-css-orangered bt">گفتگو کامل نبود</span>';
    var dialog = showDialog(j);
    g("#not_complete_bt", dialog).onclick = function () {
        closeDialog();
        callback(-1);
    }

    var starScore = g(".star_score", dialog, 1), scoreEmoji = g(".emoji", dialog), scoreName = g(".score_name", dialog), scoreVal;
//    ttest = starScore;
    starScore.forEach(function (i) {
//        i.onmouseenter = function () {
        i.onclick = function () {
            if (dialogInterval) {
                clearInterval(dialogInterval);
                dialogInterval = null;
            }
            scoreVal = Number(this.dataset.score);
            setScoreValue(scoreVal);
        }
    });

    var scoreIntervalMinRange = 6;
    setScoreValue(12);
    dialogInterval = setInterval(function () {
        setScoreValue(scoreIntervalMinRange++);
        if (scoreIntervalMinRange > 12) {
            scoreIntervalMinRange = 6;
        }
    }, 1500);

    function setScoreValue(val) {
        val--;
        scoreName.textContent = scoreMsg[val];
        scoreName.style.color = scoreEmojiColor[val];
        scoreEmoji.src = "./i/" + scoreEmojiList[val] + ".svg";
        scoreEmoji.style.color = scoreEmojiColor[val];
        starScore.forEach(function (i, idx) {
            i.src = idx > val ? "./i/star_gray.svg" : "./i/star_gold.svg";
        });
    }
    g("#score_bt", dialog).onclick = function () {
        if (scoreVal) {
            closeDialog();
            toast.success("خیلی ممنونیم که ما را در هر چه بهتر کردن کیفیت کارشناس مشاوران و سرویس دهیمون کمک میکنید");
            callback(scoreVal);
        } else {
            toast.info("لطفا با رفتن روی یکی از ستاره ها مقدار امتیاز را مشخص کنید");
        }
    }
}
