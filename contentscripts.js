function url_add() {
    var url = location.href;
    var title = document.getElementsByTagName("title")[0].innerText;
    var web_st = document.body.innerText.toLowerCase().replace(/\s+/g, " ");

    if (web_st === null ||
        web_st === "" ||
        web_st === undefined) {
    }
    else {
        chrome.runtime.sendMessage({ name: "db_add", web_st: web_st, url: url, title: title }, function (response) {
        });
    }
}
url_add();