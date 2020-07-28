function del() {
    var openReq = indexedDB.open("history_db");

    openReq.onerror = function (event) {
        console.log(request.onerror);
    };

    openReq.onsuccess = function (event) {
        var db = event.target.result;
        var trans = db.transaction('history', 'readwrite');
        var store = trans.objectStore('history');

        var request = store.clear();

        request.onsuccess = function (event) {
            console.log("clear success");
            document.getElementById("db_count").innerText = "历史数据总数：0";
            //db_count.innerHtml = "历史数据总数：0";
        };

        request.onerror = function (event) {
            console.log("clear failed:" + event.message);
        };
    }
}

function change() {
    //var openReq = indexedDB.open("history_db");
    //openReq.onsuccess = function (event) {
    //    var db = event.target.result;
    //    var trans = db.transaction('config', 'readwrite');
    //    var store = trans.objectStore('config');
    //    store.put({ item: "autoDel", value: autodel.value });
    //}
    localStorage.setItem("autoDel", autodel.value);
}
window.onload = function () {
    var a = localStorage.getItem("autoDel");
    if (a)
        autodel.value = a;
    else
        localStorage.setItem("autoDel", 0);
    document.getElementById('del').addEventListener('click', del);
    document.getElementById('autodel').addEventListener('change', change);
};