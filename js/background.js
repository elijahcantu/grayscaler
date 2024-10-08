importScripts('manageSites.js');

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install" || details.reason == "update") {

    chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {

      if (val.gsSites === undefined) {
        chrome.storage.sync.set({ 'gsSites': [] });
      }
      if (val.gsExcluded === undefined) {
        chrome.storage.sync.set({ 'gsExcluded': [] });
      }
      if (val.gsTabs === undefined) {
        chrome.storage.sync.set({ 'gsTabs': [] });
      }
      if (val.gsAll === undefined) {
        chrome.storage.sync.set({ 'gsAll': false });
      }

    });
  }
});

// Clear out gsTabs when chrome is closed
chrome.storage.sync.set({ 'gsTabs': [] });

function grayToggle(tabId) {
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {
    chrome.tabs.get(tabId, function (tab) {
      var url = tab.url;
      var hostname = new URL(url).hostname;
      if (tab.id !== -1) {
        // Check if all sites toggle on
        if (val.gsAll) {
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            chrome.tabs.sendMessage(tab.id, { type: 'disable' });
            turnIconOff();
          } else {
            chrome.tabs.sendMessage(tab.id, { type: 'enable' });
            turnIconOn();
          }
        }
        // Nothing's on, make sure gray is off
        else {
          chrome.tabs.sendMessage(tab.id, { type: 'disable' });
          turnIconOff();
        }

        // Check if options page
        if (url === chrome.runtime.getURL('options.html')) {
          console.log("opened options");
          updateOptionsSiteList();
        }
        // Check if this site is saved
        else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
          chrome.tabs.sendMessage(tab.id, { type: 'enable' });
          turnIconOn();
        }
        // Check if this tab is on
        else if (val.gsTabs && val.gsTabs.indexOf(tab.id) > -1) {
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            chrome.tabs.sendMessage(tab.id, { type: 'disable' });
            turnIconOff();
          } else {
            chrome.tabs.sendMessage(tab.id, { type: 'enable' });
            turnIconOn();
          }
        }

      }
    });
  });
}

chrome.webNavigation.onCommitted.addListener(function (info) {
  grayToggle(info.tabId);
});

chrome.tabs.onActivated.addListener(function (info) {
  grayToggle(info.tabId);
});