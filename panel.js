var lists = []
function enterpressed() {
    if (event.keyCode == 13) {
        main();
    }
}
function main() {
    var write_st = "";
    var input_keyword = keyword.value.toLowerCase().split(" ");
    var input_keywords = new Array();
    var count = 0;
    for (x in input_keyword) {
        if (input_keyword[x] !== "")
            input_keywords[count++] = input_keyword[x];
    }
    if (input_keywords.length == 0) {
        console.log("未输入关键词");
        return;
    }
    var input_web = web.value;
    var input_datestart = new Date(datestart.value);
    input_datestart.setHours(0, 0, 0);
    var input_dateend = new Date(dateend.value);
    input_dateend.setHours(23, 59, 59, 999);

    var request = window.indexedDB.open("history_db");

    request.onerror = function (event) {
        console.log(request.onerror);
    };
    request.onsuccess = function (event) {
        var db = event.target.result;
        var transaction = db.transaction("history", "readonly");
        var store = transaction.objectStore("history");
        document.getElementById("div0").innerHTML = "";
        document.getElementById("delete").disabled = true;
        document.getElementById("msg").innerText = "";
        lists = [];
        if (isNaN(input_datestart.getTime()))
            input_datestart = new Date("1000-01-01");
        if (isNaN(input_dateend.getTime()))
            input_dateend = new Date("9999-01-01");
        if (input_dateend < input_datestart) { alert("开始日期不能大于结束日期！"); }
        store.index("date").openCursor(IDBKeyRange.bound(input_datestart, input_dateend)).onsuccess = f;
        //store.index("html").openCursor(input_keywords[x]).onsuccess = f;

        function f(event) {
            if (lists.length > 29) {
                p = document.createElement("p");
                p.innerText = "结果太多，只显示前30条！";
                document.getElementById("msg").appendChild(p);
                return;
            }
            var cursor = event.target.result;
            if (cursor) {
                var value = cursor.value;
                if ((input_web === "" || value.url.indexOf(input_web) != -1)
                    //&& (isNaN(input_datestart.getTime()) || input_datestart <= value.date)
                    //&& (isNaN(input_dateend.getTime()) || input_dateend >= value.date)
                ) {
                    var flag = true;
                    var pos = 0;
                    for (var i = input_keywords.length - 1; i >= 0; i--) {
                        if (input_keywords[i][0] === "-") {
                            var s = input_keywords[i].substr(1);
                            pos = value.html.indexOf(s);
                            if (pos > -1) {
                                flag = false;
                                break;
                            }
                            pos = value.url.indexOf(s);
                            if (pos > -1) {
                                flag = false;
                                break;
                            }
                        }
                        else {
                            pos = value.html.indexOf(input_keywords[i]);
                            if (pos == -1) {
                                pos = value.url.indexOf(input_keywords[i]);
                                if (pos == -1) {
                                    flag = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (flag) {
                        var url = value.url;
                        var title = value.title;
                        write_st = write_st + "<a href=\"" + url + "\" target='_blank'>" + title + "</a><br>";
                        //div0.value = write_st;
                        //div0.innerHtml = write_st;
                        //document.getElementById("div0").innerHTML = write_st;
                        var a = document.createElement("a");
                        a.href = url;
                        a.target = "_blank";
                        a.text = title;
                        a.className = "title";
                        var p1 = document.createElement("div");
                        p1.className = "content_child";
                        var date = value.date.getFullYear() + "年" + (value.date.getMonth() + 1) + "月" + value.date.getDate() + "日  -  ";
                        p1.innerText = date + value.html.substring(pos - 30, pos);
                        var p2 = document.createElement("div");
                        p2.className = "content_child";
                        p2.innerText = value.html.substring(pos + input_keywords[0].length, pos + 100);
                        var p = document.createElement("div");
                        p.className = "keyword";
                        p.innerText = value.html.substring(pos, pos + input_keywords[0].length);

                        var all = document.createElement("div");
                        all.appendChild(p1);
                        all.appendChild(p);
                        all.appendChild(p2);
                        all.className = "content "
                        //console.log(value.html);
                        document.getElementById("div0").appendChild(a);
                        document.getElementById("div0").appendChild(all);
                        //document.getElementById("div0").appendChild(document.createElement("br"));
                        lists.push(url);
                        document.getElementById("delete").disabled = false;
                    }
                }
                cursor.continue();
            }
        }
    };
}
function del() {
    if (lists.length > 0) {
        if (confirm("你确认要删除刚刚搜索到的的历史数据吗？该操作无法撤销")) {
            var request = indexedDB.open("history_db");
            request.onsuccess = function (event) {
                var db = event.target.result;
                var trans = db.transaction("history", "readwrite");
                var s = trans.objectStore("history");
                for (var x in lists) {
                    s.delete(lists[x]);
                }
                document.getElementById("div0").innerHTML = "";
            }
        }
    }
}
window.onload = function () {
    document.getElementById('send').addEventListener('click', main);
    document.getElementById('delete').addEventListener('click', del);
    document.getElementById('keyword').addEventListener('keypress', enterpressed, false);
    document.getElementById('web').addEventListener('keypress', enterpressed, false);
    document.getElementById('datestart').addEventListener('keypress', enterpressed, false);
    document.getElementById('dateend').addEventListener('keypress', enterpressed, false);
    //document.getElementById('dateend').value = new Date();
    var autoDel = parseInt(localStorage.getItem("autoDel"));
    if (autoDel > 0) {
        var request = indexedDB.open("history_db");
        request.onsuccess = function (event) {
            var db = event.target.result;
            var date = new Date() - 24 * 60 * 60 * 1000 * autoDel;
            var trans = db.transaction("history", "readwrite");
            var s = trans.objectStore("history").index("date");
            var r = s.openCursor(IDBKeyRange.upperBound(date));
            r.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    console.log(cursor.value);
                    cursor.delete();
                    cursor.continue();
                }
            }
        }
    }
};