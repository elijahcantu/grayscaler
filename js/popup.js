var includeButton = document.getElementById("add-saved-site");
var removeIncludeButton = document.getElementById("remove-saved-site");
var excludeButton = document.getElementById("add-excluded-site");
var removeExcludeButton = document.getElementById("remove-excluded-site");
var allCheckbox = document.getElementById( 'all-sites-toggle');
var thisTabCheckbox = document.getElementById( 'this-tab-toggle' );



function updatePopUpDetails() {

    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = new URL(tabs[0].url).hostname;

        chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
            if (val.gsAll) {
                allCheckbox.checked = true;
            } else {
                allCheckbox.checked = false;
            }
            if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
                console.log('site is excluded')
                excludeButton.classList.remove("show");
                removeExcludeButton.classList.add("show");
            } else {
                console.log('site is not excluded')
                excludeButton.classList.add("show");
                removeExcludeButton.classList.remove("show");
            }
            if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
                console.log('site is saved')
                includeButton.classList.remove("show");
                removeIncludeButton.classList.add("show");
            } else {
                console.log('site is not saved')
                includeButton.classList.add("show");
                removeIncludeButton.classList.remove("show");
            }
            if (val.gsTabs && val.gsTabs.indexOf(tabs[0].id) > -1) {
                console.log('tab is on')
                thisTabCheckbox.checked = true;
            } else {
                console.log('tab is off')
                thisTabCheckbox.checked = false;
            }

        });
    });
}

updatePopUpDetails();











includeButton.addEventListener('click', function addCurrentSite() {
    console.log('add current site');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = new URL(tabs[0].url).hostname;
        removeSite('gsExcluded', hostname, tabs);
        addSite('gsSites', hostname, tabs, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
            turnIconOn();
            updatePopUpDetails();

        });
    });
});
excludeButton.addEventListener('click', function addCurrentSiteExcluded() {
    console.log('add current site excluded');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = new URL(tabs[0].url).hostname;
        removeSite('gsSites', hostname, tabs);
        addSite('gsExcluded', hostname, tabs, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
            turnIconOff();
            updatePopUpDetails();
        });
    });
});

removeIncludeButton.addEventListener('click', function removeCurrentSite() {
    console.log('remove current site');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = new URL(tabs[0].url).hostname;

        removeSite('gsSites', hostname, tabs, function (gsAll, gsTabs) {
            if ((!gsAll && gsTabs.indexOf(tabs[0].id) == -1)) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
                turnIconOff();
            }


            updatePopUpDetails();
        });
    });
});

removeExcludeButton.addEventListener('click', function removeCurrentSiteExcluded() {
    console.log('remove current site excluded');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = new URL(tabs[0].url).hostname;
        removeSite('gsExcluded', hostname, tabs, function (gsAll, gsTabs) {
            if ((gsAll || gsTabs.indexOf(tabs[0].id) > -1)) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
                turnIconOn();
            }
            updatePopUpDetails();
        });
    });
});










allCheckbox.addEventListener('change', function toggleAllSites() {
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            var hostname = new URL(tabs[0].url).hostname;
            if (val.gsAll) {
                allCheckbox.checked = false;
                chrome.storage.sync.set({ 'gsAll': false });
                if (val.gsSites.indexOf(hostname) == -1 && val.gsTabs.indexOf(tabs[0].id) == -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
                    turnIconOff();
                }
            } else {
                allCheckbox.checked = true;
                chrome.storage.sync.set({ 'gsAll': true });
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
                    turnIconOn();
                }
            }
        });
    });
});
thisTabCheckbox.addEventListener('change', function toggleTab() {
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        if (thisTabCheckbox.checked) {
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                var tabId = tabs[0].id;
                var hostname = new URL(tabs[0].url).hostname;
                addTab(tabId, hostname, function () {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
                    turnIconOn();
                    updatePopUpDetails();
                });
            });
        } else {
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                var hostname = new URL(tabs[0].url).hostname;
                var tabId = tabs[0].id;
                removeTab(tabId, hostname, updatePopUpDetails);
            });
        }
    });

});

document.getElementById('openOptionsPage').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
});