var lists = []
function enterpressed() {
    if (event.keyCode == 13) {
        main();
    }
}

// 定义一个函数，用于处理用户的输入并显示搜索结果
function main() {
    // 初始化一个空字符串，用于存储最终的HTML内容
    var write_st = "";
    // 获取用户输入的关键词，并转换为小写，然后按空格分割成数组
    var input_keyword = keyword.value.toLowerCase().split(" ");
    // 初始化一个新数组，用于存储处理后的关键词
    var input_keywords = new Array();
    // 初始化计数器，用于记录有效关键词的数量
    var count = 0;
    // 遍历输入的关键词数组
    for (x in input_keyword) {
        // 如果关键词不为空，则将其添加到新数组中，并增加计数器
        if (input_keyword[x] !== "")
            input_keywords[count++] = input_keyword[x];
    }
    // 如果没有输入关键词，则输出提示信息并返回
    if (input_keywords.length == 0) {
        console.log("未输入关键词");
        return;
    }
    // 获取用户输入的网站地址
    var input_web = web.value;
    // 将用户输入的开始日期转换为日期对象，并设置时间为当天的0点0分0秒
    var input_datestart = new Date(datestart.value);
    input_datestart.setHours(0, 0, 0);
    // 将用户输入的结束日期转换为日期对象，并设置时间为当天的23点59分59秒
    var input_dateend = new Date(dateend.value);
    input_dateend.setHours(23, 59, 59, 999);

    // 打开IndexedDB数据库
    var request = window.indexedDB.open("history_db");

    // 如果打开数据库失败，输出错误信息
    request.onerror = function (event) {
        console.log(request.onerror);
    };
    // 如果打开数据库成功
    request.onsuccess = function (event) {
        // 获取数据库对象
        var db = event.target.result;
        // 开启一个只读事务
        var transaction = db.transaction("history", "readonly");
        // 获取历史记录对象仓库
        var store = transaction.objectStore("history");
        // 清空页面上的历史记录显示区域
        document.getElementById("div0").innerHTML = "";
        // 禁用删除按钮
        document.getElementById("delete").disabled = true;
        // 清空消息提示区域
        document.getElementById("msg").innerText = "";
        // 清空历史记录列表
        lists = [];
        // 如果开始日期无效，则设置为默认的最小日期
        if (isNaN(input_datestart.getTime()))
            input_datestart = new Date("2000-01-01");
        // 如果结束日期无效，则设置为默认的最大日期
        if (isNaN(input_dateend.getTime()))
            // 设置为默认的最大日期为今天的23点59分59秒
            input_dateend = new Date();
        // 如果结束日期小于开始日期，弹出提示框
        if (input_dateend < input_datestart) { alert("开始日期不能大于结束日期！"); }
        // 在历史记录对象仓库中，根据日期范围打开游标，并设置成功回调函数
        store.index("date").openCursor(IDBKeyRange.bound(input_datestart, input_dateend)).onsuccess = f;
        //定义 transaction 的completed回调，如果有进度条，则删除
        transaction.oncomplete = function () {
            var element = document.getElementById('progress');
            if (element) element.remove();
        }

        //store.index("html").openCursor(input_keywords[x]).onsuccess = f;
        var count = 0;
        // 定义成功回调函数
        function f(event) {
            // 如果结果列表长度超过29，则显示提示信息并返回
            if (lists.length > 29) {
                p = document.createElement("p");
                p.innerText = "结果太多，只显示前30条！";
                document.getElementById("msg").appendChild(p);
                return;
            }
            // 获取游标对象
            var cursor = event.target.result;
            // 如果游标存在
            if (cursor) {
                //判断是否存在进度标签，不存在则在永久删除旁添加一个，显示当前进度
                if (!document.getElementById("progress")) {
                    var p = document.createElement("p");
                    p.id = "progress";
                    p.innerText = "正在查询中...";
                    document.getElementById("msg").appendChild(p);
                }

                // 输出日期范围中的总天数和当前记录的count数，以此四舍五入计算进度百分比
                document.getElementById("progress").innerText = "正在查询中..." + Math.round((cursor.value.date - input_datestart) / (input_dateend - input_datestart) * 100) + "%";

                // 获取当前记录的值
                var value = cursor.value;

                // 如果网站地址为空或当前记录的URL包含输入的网站地址
                if ((input_web === "" || value.url.indexOf(input_web) != -1)
                    //&& (isNaN(input_datestart.getTime()) || input_datestart <= value.date)
                    //&& (isNaN(input_dateend.getTime()) || input_dateend >= value.date)
                ) {
                    // 初始化一个标志变量，用于标记是否匹配关键词
                    var flag = true;
                    // 初始化一个变量，用于记录关键词在HTML内容中的位置
                    var pos = -1;
                    var pos2 = -1;
                    // 从后向前遍历关键词数组
                    for (var i = input_keywords.length - 1; i >= 0; i--) {
                        // 如果关键词以-url:开头，表示要排除该网站
                        if (input_keywords[i].startsWith("-url:")) {
                            // 去除-url:前缀，获取真正的网站地址
                            var s = input_keywords[i].substr(5);
                            // 如果当前记录的URL包含该网站地址，则设置标志变量为false，并跳出循环
                            if (value.url.indexOf(s) != -1) {
                                flag = false;
                                break;
                            }
                        }
                        // 如果关键词以-title:开头，表示要排除该标题
                        else if (input_keywords[i].startsWith("-title:")) {
                            // 去除-title:前缀，获取真正的标题
                            var s = input_keywords[i].substr(7);
                            // 如果当前记录的标题包含该标题，则设置标志变量为false，并跳出循环
                            if (value.title.toLowerCase().indexOf(s) != -1) {
                                flag = false;
                                break;
                            }
                        }
                        // 如果关键词以减号开头，表示要排除该关键词
                        else if (input_keywords[i][0] === "-") {
                            // 去除减号，获取真正的关键词
                            var s = input_keywords[i].substr(1);
                            // 在HTML内容中查找该关键词的位置
                            pos = value.html.toLowerCase().indexOf(s);
                            // 如果找到了该关键词，则设置标志变量为false，并跳出循环
                            if (pos > -1) {
                                flag = false;
                                break;
                            }
                            // 在URL中查找该关键词的位置
                            pos = value.url.indexOf(s);
                        }
                        // 如果关键词不以减号开头，表示要包含该关键词
                        else {
                            // 在HTML内容中查找该关键词的位置
                            pos = value.html.toLowerCase().indexOf(input_keywords[i]);
                            // 如果没有找到该关键词，则在URL中查找
                            if (pos == -1) {
                                pos2 = value.title.toLowerCase().indexOf(input_keywords[i]);
                                // 如果在URL中也没有找到该关键词，则设置标志变量为false，并跳出循环
                                if (pos2 == -1) {
                                    flag = false;
                                    break;
                                }
                            }
                        }
                    }
                    // 如果标志变量为true，表示匹配了所有关键词
                    if (flag) {
                        // 获取当前记录的URL
                        var url = value.url;
                        // 获取当前记录的标题
                        var title = value.title;


                        // 创建一个链接元素
                        var a = document.createElement("a");
                        // 设置链接的URL
                        a.href = url;
                        // 设置链接在新窗口中打开
                        a.target = "_blank";
                        // 设置链接的类名为"title"
                        a.className = "title";
                        var p1 = highlightKeyword(value.title, pos2);
                        a.appendChild(p1);

                        var date = value.date.getFullYear() + "年" + (value.date.getMonth() + 1) + "月" + value.date.getDate() + "日  -  ";

                        var all = document.createElement("div");

                        var p1 = highlightKeyword(date + value.html, pos);
                        all.appendChild(p1);

                        all.className = "content "
                        //console.log(value.html);
                        document.getElementById("div0").appendChild(a);

                        // 添加一个空的 <div> 元素来增加横向空隙
                        var spacer = document.createElement("div");
                        spacer.style.width = "10px"; // 你可以根据需要调整这个值
                        spacer.style.display = "inline-block"; // 确保元素在同一行显示
                        document.getElementById("div0").appendChild(spacer);

                        // 添加一个a，文本内容为“打开快照”，打开一个snapshot.html，把value.html作为参数传入这个页面
                        var a = document.createElement("a");
                        a.href = "snapshot.html?text=" + encodeURIComponent(value.html);
                        a.target = "_blank";
                        a.innerText = "打开快照";
                        document.getElementById("div0").appendChild(a);

                        // 添加一个空的 <div> 元素来增加横向空隙
                        document.getElementById("div0").appendChild(spacer.cloneNode(true));

                        // 添加一个button，文本内容为“屏蔽该站点”，点击后在id="keyword"的元素中添加-url:+value.url
                        var button = document.createElement("button");
                        button.innerText = "屏蔽该网址";
                        button.onclick = function () {
                            document.getElementById("keyword").value += " -url:" + value.url;
                        }
                        document.getElementById("div0").appendChild(button);

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

    function highlightKeyword(text, pos) {
        var p1 = document.createElement("span");
        //遍历input_keywords，高亮所有关键词
        p1.innerText = text.substring(pos - 50, pos + input_keywords[0].length + 100);
        const range = document.createRange();
        for (var i in input_keywords) {
            let nodeToSearch = p1.firstChild;
            while (nodeToSearch) {
                if (nodeToSearch.nodeType === Node.TEXT_NODE) {
                    range.selectNodeContents(nodeToSearch);
                    const text = range.toString();
                    const index = text.toLowerCase().indexOf(input_keywords[i], 0);
                    if (index === -1) {
                        break;
                    }
                    range.setStart(nodeToSearch, index);
                    range.setEnd(nodeToSearch, index + input_keywords[i].length);
                    const highlightedNode = document.createElement('span');
                    highlightedNode.className = 'keyword';
                    highlightedNode.appendChild(range.extractContents());
                    range.insertNode(highlightedNode);
                    lastIndex = index + input_keywords[i].length;
                }
                nodeToSearch = nodeToSearch.nextSibling;
            }
        }

        return p1;
    }
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