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

function grayToggle( tab ) {
  chrome.storage.sync.get( ['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function ( val ) {
    var url = tab.url;
    var hostname = new URL( url ).hostname;

    if ( tab.id !== -1 ) {
      // Check if all sites toggle on
      if ( val.gsAll ) {
        if ( val.gsExcluded && val.gsExcluded.indexOf( hostname ) > -1 ) {
          chrome.tabs.sendMessage( tab.id, { type: 'disable' } );
          turnIconOff();
        } else {
          chrome.tabs.sendMessage( tab.id, { type: 'enable' } );
          turnIconOn();
        }
      } else {
        // Nothing's on, make sure gray is off
        chrome.tabs.sendMessage( tab.id, { type: 'disable' } );
        turnIconOff();
      }

      // Check for base domains in gsSites
      var baseDomains = val.gsSites.filter( site => {
        const siteParts = site.split( '.' );
        return siteParts.length <= 2; // Indicates it’s a base domain (e.g., google.com)
      } );

      // Check if the hostname matches any site or if www.site matches a base domain
      if ( val.gsSites && ( val.gsSites.indexOf( hostname ) > -1 ||
        baseDomains.some( baseDomain => hostname === `www.${baseDomain}` ) ) ) {
        chrome.tabs.sendMessage( tab.id, { type: 'enable' } );
        turnIconOn();
      }
      // Check if this tab is on
      else if ( val.gsTabs && val.gsTabs.indexOf( tab.id ) > -1 ) {
        if ( val.gsExcluded && ( val.gsExcluded.indexOf(hostname) > -1  || 
          baseDomains.some( baseDomain => hostname === `www.${baseDomain}` ) ) ) {
          chrome.tabs.sendMessage( tab.id, { type: 'disable' } );
          turnIconOff();
        } else {
          chrome.tabs.sendMessage( tab.id, { type: 'enable' } );
          turnIconOn();
        }
      }
    }
  } );
}


chrome.webNavigation.onCommitted.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    if (tab.url && !tab.url.startsWith('chrome')) {
      grayToggle(tab);
    }
  });
});

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    if (tab.url && !tab.url.startsWith('chrome')) {
      grayToggle(tab);
    }
  });
});
