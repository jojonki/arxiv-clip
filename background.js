"use strict";

// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    let onlyShowOnArxiv = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: "arxiv.org" },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [onlyShowOnArxiv];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});

function openTab(url, sendResponse) {
  chrome.tabs.create({ url: url }, function (tab) {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
}

function _retrievePaperInfo(arxiv_url) {
  let abst = document.getElementById("abs");
  let title = abst.querySelector("h1").textContent.split("Title:")[1].trim();
  let authors = abst
    .querySelector(".authors")
    .textContent.split("Authors:")[1]
    .replace(/\n/g, "")
    .trim();
  let comment = abst.querySelector(".metatable tr:first-child td:nth-child(2)");
  if (comment !== undefined) {
    comment = comment.textContent.replace(/\n/g, "").trim();
  }

  let info = null;
  if (comment != "") {
    info = [title, authors, comment, arxiv_url].join("\n");
  } else {
    info = [title, authors, arxiv_url].join("\n");
  }
  return info;
}

function executePaperInfoRetrieval(tab, sendResponse) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: _retrievePaperInfo,
      args: [tab.url],
    },
    (results) => {
      if (results.length > 0) {
        console.log("sendResponse: " + results[0].result);
        sendResponse({ data: results[0].result });
      }
    }
  );
}

function retrievePaperInfo(sendResponse) {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      var url = tabs[0].url;
      if (url.startsWith("https://arxiv.org/pdf/")) {
        // if the page is a pdf, just open the entrance page.
        url = url.replace(".pdf", "");
        url = url.replace("pdf", "abs");
        openTab(url, sendResponse);
      } else {
        executePaperInfoRetrieval(tabs[0], sendResponse);
      }
    }
  );
  return true;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case "retrievePaperInfo":
      return retrievePaperInfo(sendResponse);
    default:
      sendResponse({ data: "Invalid arguments" });
      break;
  }
});
