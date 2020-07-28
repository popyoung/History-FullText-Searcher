var db;
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.name === "db_add") {
        var web_st = request.web_st;
        var url = request.url;
        var title = request.title;
        var request = indexedDB.open("history_db", 2);

        request.onerror = function (event) {
            console.log(request.onerror);
        };
        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var history = db.createObjectStore("history", { keyPath: 'url' });
            history.createIndex("date", "date", { unique: false });
            //history.createIndex("html", "html", { unique: false, multiEntry: true });

            //var config = db.createObjectStore("config", { keyPath: 'item' });
            //config.transaction.oncomplete = function (event) {
            //    var store = db.transaction("config", "readwrite").objectStore("config");
            //    store.put({ item: "autoDel", value: 0 });
            localStorage.setItem("autoDel", "0");
        }

        //objectStore.createIndex("url", "url", { unique: true });
        //objectStore.createIndex("html", "html", { unique: false });
        //objectStore.createIndex("id", "id", { unique: false });
    };

    var data = { url: url, html: web_st, title: title, date: new Date() };

    //var openReq = indexedDB.open('history_db');

    request.onsuccess = function (event) {
        db = event.target.result;
        var trans = db.transaction('history', 'readwrite');
        var store = trans.objectStore('history');
        var putReq = store.put(data);

        putReq.onsuccess = function () {
            console.log('put data success');
        }

        trans.oncomplete = function () {
            console.log('transaction complete');
        }
    }
});

function openPage() {
    browser.tabs.create({
        //type: "detached_panel",
        url: "panel.html",
        //width: 360,
        //height: 800,
        //left: 10,
        //top: 10,
    });
}

browser.browserAction.onClicked.addListener(openPage);