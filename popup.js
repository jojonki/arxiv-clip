"use strict";

let ARXIV_URL = 'https://arxiv.org/*';

function retrieveInfoFromArxiv(arxiv_url, tab) {
    $.ajax({
        type: "GET",
        url: arxiv_url,
        success: function (data) {
            let $dom = $($.parseHTML(data));
            let title = $dom.find('h1.title').text().split('Title:')[1];
            let authors = $dom.find('div.authors').text().split('Authors:')[1];
            authors = authors.replace(/\n/g, '');
            let comment = $dom.find('div.metatable').find('.comments').text();
            let info = null;
            if (comment != '') {
                info = [title, authors, comment, arxiv_url].join('\n');
            } else {
                info = [title, authors, arxiv_url].join('\n');
            }
            copyToClipboard(info);
            $('#result').text('copied!');

            // hide popup automatically
            setTimeout(function () {
                window.close();
            }, 3000);
        }
    });
}

function getCurrentTabUrl(callback) {
    var queryInfo = {
        url: ARXIV_URL,
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs.length > 0) {
            var tab = tabs[0];
            var url = tab.url;
            console.assert(typeof url == 'string', 'tab.url should be a string');
            callback(url, tab);
        } else {
            $('#result').text('not arXiv!');
        }
    });
}

function modifyDOM() {
    return document.body.innerHTML;
}

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
    getCurrentTabUrl((url, tab) => {
        if (url.startsWith("https://arxiv.org/pdf/")) {
            // from pdf page to abs page
            url = url.replace('\.pdf', '');
            url = url.replace('pdf', 'abs');
            retrieveInfoFromArxiv(url, tab);
        } else if (url.startsWith('https://arxiv.org/abs/')) {
            retrieveInfoFromArxiv(url, tab);
        } else {
            $('#result').text('Unknown arXiv page style');

            // hide popup automatically
            setTimeout(function () {
                window.close();
            }, 3000);
        }
    });
});
