// console.log('Background.js fired');

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('**************** on installed or updated ****************');
  // make sure values exist when plugin is installed or updated
  if (details.reason == "install" || details.reason == "update") {
    // alert('installed') - need to use alert and remove and reload the unpacked extension when testing this
    chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs', 'gsBgToggle'], function (val) {
      console.log('gsSites', val.gsSites);
      console.log('gsExcluded', val.gsExcluded);
      console.log('gsTabs', val.gsTabs);
      console.log('gsAll', val.gsAll);
      console.log('gsBgToggle', val.gsBgToggle);
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
      if (val.gsBgToggle === undefined) {
        chrome.storage.sync.set({ 'gsBgToggle': false });
      }
    });    
  }
});

// Clear out gsTabs when chrome is closed
chrome.storage.sync.set({ 'gsTabs': [] });

function grayToggle(info) {
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs', 'gsBgToggle'], function (val) {
    console.log('val', val);
    console.log('gsSites', val.gsSites);
    console.log('gsExcluded', val.gsExcluded);
    console.log('gsTabs', val.gsTabs);
    console.log('gsAll', val.gsAll);
    console.log('gsBgToggle', val.gsBgToggle);
    console.log('tabid', info.tabId);
    chrome.tabs.get(info.tabId, function (tab) {
      console.log('chrome.tabs.get tab', tab)
      var url = tab.url;
      var hostname = extractRootDomain(url);
      console.log('tab hostname', hostname);
      if (tab.id !== -1) {
        console.log('good to check')
        
        // Check if options page
        if (url === chrome.runtime.getURL('options.html')) {
          console.log('On the options page');
          chrome.runtime.sendMessage({ type: 'refreshOptions' });
        }
        // Check if this site is saved
        else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
          console.log('site saved')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
          turnIconOn();
        }
        // Check if this tab is on
        else if (val.gsTabs && val.gsTabs.indexOf(tab.id) > -1) {
          console.log('tab active')
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            console.log('tab is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            console.log('tab is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
        }
        // Check if all sites toggle on
        else if (val.gsAll) {
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            console.log('all sites is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            console.log('all sites is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
        }
        // Nothing's on, make sure gray is off
        else {
          console.log('not active')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
          turnIconOff();
        }
      } 
    });    
  });
}

chrome.webNavigation.onCommitted.addListener(function (info) {
  console.log('**************** on committed ****************');
  grayToggle(info);
});

chrome.tabs.onActivated.addListener(function (info) {  
  console.log('**************** on tab activated ****************');
  grayToggle(info);
});