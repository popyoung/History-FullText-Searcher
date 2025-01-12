function getQueryParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const text = searchParams.get('text');
    // 从url中获取参数text
    // 解码
    const snapshotDiv = document.getElementById('snapshot');
    // 获取快照div
    snapshotDiv.innerText = text;
    
  }
  window.onload = getQueryParams;