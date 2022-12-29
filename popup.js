"use strict";



function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    //input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
};

document.addEventListener('DOMContentLoaded', () => {
    let sendMessage = {
        'message': 'retrievePaperInfo',
    }
    chrome.runtime.sendMessage(sendMessage, function (response) {
        let info = response.data;
        copyToClipboard(info);
        document.getElementById("result").textContent = "Copied information from " + info;

        // hide popup automatically
        setTimeout(function () {
            window.close();
        }, 3000);
    });
});
