var url;
chrome.tabs.getSelected(null,function(tab) {
      url = tab.url;
});

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function modifyDOM() {
	return document.body.innerHTML;
}

$(function() {
	document.getElementById("test").addEventListener('click', () => {
		console.log("Popup DOM fully loaded and parsed");

		chrome.tabs.executeScript({
			code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
		}, (results) => {
			console.log(results[0]);
			var doc = results[0];
			var $dom = $($.parseHTML(results[0]));
			console.log($dom);
			title = $dom.find('h1.title').text().split('Title:')[1];
			authors = $dom.find('div.authors').text().split('Authors:')[1];
			authors = authors.replace(/\n/g, '');
			//alert(title + '\n' + authors);
			console.log(title);
			console.log(authors);
			console.log(url);
			$('#info').html([title, authors, url].join('\n'));
			
			//alert(doc.querySelectorAll('h1, .title, .mathjax'));
		});
	});
});

function copyToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
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
			console.log(results[0]);
			var doc = results[0];
			var $dom = $($.parseHTML(results[0]));
			console.log($dom);
			title = $dom.find('h1.title').text().split('Title:\n')[1];
			authors = $dom.find('div.authors').text().split('Authors:')[1];
			authors = authors.replace(/\n/g, '');
			//alert(title + '\n' + authors);
			console.log(title);
			console.log(authors);
			console.log(url);
			//$('#info').html([title, authors, url].join('\n'));
			//$('#info').focus(function() { $(this).select();});

			info = [title, authors, url].join('\n');
			copyToClipboard(info);
			$('#result').text('copied!');
			setTimeout(function () {
					window.close();
      }, 3000);
			
			//alert(doc.querySelectorAll('h1, .title, .mathjax'));
		});
	});
});
