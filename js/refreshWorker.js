function sendUpdateRequest() {
    postMessage('update');
    setTimeout("sendUpdateRequest()",5000);
}
sendUpdateRequest();