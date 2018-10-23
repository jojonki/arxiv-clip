ARXIV_URL = 'https://arxiv.org/*';

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
      callback(url);
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
  getCurrentTabUrl((url) => {
		chrome.tabs.executeScript({
			code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
		}, (results) => {
			var $dom = $($.parseHTML(results[0]));
			title = $dom.find('h1.title').text().split('Title:')[1];
			authors = $dom.find('div.authors').text().split('Authors:')[1];
			authors = authors.replace(/\n/g, '');

			info = [title, authors, url].join('\n');
			copyToClipboard(info);
			$('#result').text('copied!');

      // hide popup automatically
			setTimeout(function () {
					window.close();
      }, 3000);
		});
	});
});
