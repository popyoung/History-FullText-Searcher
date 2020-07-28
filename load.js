function read() {
    var request = indexedDB.open("history_db");

    request.onerror = function (event) {
        console.log(request.onerror);
    };
    request.addEventListener("error", function (e) {
        console.error(request.error);
    });
    //request.onupgradeneeded = function (event) {
    //    db = event.target.result;
    //    var history = db.createObjectStore("history", { keyPath: 'url' });
    //    var config = db.createObjectStore("config", { keyPath: 'item' });
    //    config.transaction.oncomplete = function (event) {
    //        var store = db.transaction("config", "readwrite").objectStore("config");
    //        store.put({ item: "autoDel", value: 0 });
    //    }
    //};
    request.onsuccess = function (event) {
        var db = event.target.result;
        //console.log(db);
        var transaction = db.transaction("history", "readonly");
        var store = transaction.objectStore("history");
        var count_request = store.count();

        count_request.onsuccess = function (event) {
            var count = event.target.result;
            document.getElementById("db_count").innerText = "历史数据总数：" + count;

            //db_count.value = "历史数据总数：" + count;
        }
    }
}
read();