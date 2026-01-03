g("#favorite_item_hide_bt").onclick = hideFavoriteItems;
g("#favorite_item_bt").onclick = hideFavoriteItems;
function hideFavoriteItems() {
    g("#favorite_item_wrapper").classList.toggle("favorite_item_wrapper_hide");
}
var favoriteDiv = g("#favorite_item_div"), iframeDiv = g("#iframe_wrapper"),
        favoriteSelectedClass = "favorite_selected", cardList = [], productFavoritePrefix = "S61F";
function closeIframe(a) {
    a = a.closest(".iframe_item");
    var linkId = Number(a.dataset.linkid);
    cardList = cardList.filter(function (e) {
        return e !== linkId;
    });
    g(".favorite_item[data-linkid='" + linkId + "']").classList.remove(favoriteSelectedClass);
    a.remove();
}
function setFavoriteItems() {
    var keys = Object.keys(localStorage), isEmpty = true;
    if (keys) {
        var j;
        keys.forEach(function (key) {
            if (key.startsWith(productFavoritePrefix)) {
                isEmpty = false;
                j = JSON.parse(localStorage.getItem(key));
                favoriteDiv.insertAdjacentHTML("afterbegin", getFavoriteItem(j));
            }
        });
        afterFavoriteItemLoaded();
    }
    if (isEmpty) {
        toast.info("kharidlive محصولات منتخب شما خالی میباشد ، kharidlive منتخب تنها در مرورگری که با آن محصولات را به kharidlive اضافه کردید قابل مشاهده است");
    }
}
function getFavoriteItem(j) {
    return '<div class="favorite_item" data-linkid="' + j.hash + '">' +
            '<img src="' + j.img + '" loading="lazy">' +
            '<p>' + j.title + '</p>' +
            '<div class="favorite_item_ctr">' +
            '<img class="delete" src="./i/close.svg">' +
            '<img class="open_link" src="./i/external_link.svg">' +
            '</div></div>';
}
function afterFavoriteItemLoaded() {
    g(".favorite_item", favoriteDiv, 1).forEach(function (e) {
        e.onclick = function (a) {
            a = a.target;
            if (!a.classList.contains('delete') && !a.classList.contains('open_link')) {
                a = a.closest(".favorite_item");
                var obj = localStorage.getItem(productFavoritePrefix + a.dataset.linkid);
//                monsole.log(productFavoritePrefix + a.dataset.linkid, obj);
                if (obj) {
                    obj = JSON.parse(obj);
                    if (!cardList.includes(obj.hash)) {
                        a.classList.add(favoriteSelectedClass);
                        cardList.push(obj.hash);
                        iframeDiv.insertAdjacentHTML("beforeend", '<div class="iframe_item" data-linkid="' + obj.hash + '"><iframe src="' + obj.path + '"></iframe><img src="./i/close.svg" class="close" onclick="closeIframe(this)"></div>');
                        toast.success("صفحه محصول " + obj.title + " باز شد");
                    } else {
                        toast.info("این صفحه قبلا باز شده بود");
                    }
                }
            }
        }
    });
    g(".delete", favoriteDiv, 1).forEach(function (e) {
        e.onclick = function (a) {
            a = a.target.closest(".favorite_item");
            var key = productFavoritePrefix + a.dataset.linkid;
            var obj = localStorage.getItem(key);
            if (obj) {
                obj = JSON.parse(obj);
                localStorage.removeItem(key);
                a.remove();
                g(".iframe_item[data-linkid='" + obj.hash + "']").remove();
                toast.success("ایتم " + obj.title + " با موفقیت حذف شد");
            }
        }
    });
    g(".open_link", favoriteDiv, 1).forEach(function (e) {
        e.onclick = function (a) {
            a = a.target.closest(".favorite_item");
            var obj = localStorage.getItem(productFavoritePrefix + a.dataset.linkid);
            if (obj) {
                obj = JSON.parse(obj);
                openLinkInNewTab(obj.path);
            }
        }
    });
}
setFavoriteItems();