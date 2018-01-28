chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url:        chrome.extension.getURL('index.html'),
        selected:   true
    }); // chrome.tabs.create({ ... });
}); // chrome.browserAction.onClicked.addListener(function(tab) { ... });
