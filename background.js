"use strict";

// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
    console.log("disabled!!")
    // Page actions are disabled by default and enabled on select tabs
    chrome.action.disable();

    // Clear all rules to ensure only our expected rules are set
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let onlyShowOnArxiv = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostSuffix: 'arxiv.org' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        let rules = [onlyShowOnArxiv];
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
});

function _retrievePaperInfo(arxiv_url) {
    let abst = document.getElementById("abs");
    let title = abst.querySelector("h1").textContent.split("Title:")[1].trim();
    let authors = abst.querySelector('.authors').textContent.split('Authors:')[1].replace(/\n/g, '').trim();
    let comment = abst.querySelector('.metatable tr:first-child td:nth-child(2)');
    if (comment !== undefined) {
        comment = comment.textContent.replace(/\n/g, '').trim();
    }

    let info = null;
    if (comment != '') {
        info = [title, authors, comment, arxiv_url].join('\n');
    } else {
        info = [title, authors, arxiv_url].join('\n');
    }
    return info
}

function retrievePaperInfo(sendResponse) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: _retrievePaperInfo,
            args: [tabs[0].url]
        },
            (results) => {
                if (results.length > 0) {
                    console.log("sendResponse: " + results[0].result);
                    sendResponse({ data: results[0].result });
                }
            })
    });
    return true;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
        case 'retrievePaperInfo':
            return retrievePaperInfo(sendResponse);

        default:
            sendResponse({ data: 'Invalid arguments' });
            break;
    }
});
