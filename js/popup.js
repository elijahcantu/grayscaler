function toggleAllSites() {
    var checkbox = document.getElementById('all-sites-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            var hostname = getDomainFromTabs(tabs);
            if (val.gsAll) {
                checkbox.checked = false;
                chrome.storage.sync.set({ 'gsAll': false });
                if (val.gsSites.indexOf(hostname) == -1 && val.gsTabs.indexOf(tabs[0].id) == -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
                    turnIconOff();
                }
            } else {
                checkbox.checked = true;
                chrome.storage.sync.set({ 'gsAll': true });
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
                    turnIconOn();
                }                
            }
        });
    });
}

function toggleTab() {
    var checkbox = document.getElementById('this-tab-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        if (checkbox.checked) {
            addCurrentTab();
        } else {
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                var hostname = getDomainFromTabs(tabs);
                removeCurrentTab();
            });
        }
    });
    
}

function openOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

updatePopUpDetails();


document.getElementById('this-tab-toggle').addEventListener('change', toggleTab)
document.getElementById('all-sites-toggle').addEventListener('change', toggleAllSites)

document.getElementById('add-saved-site').addEventListener('click', addCurrentSite)
document.getElementById('remove-saved-site').addEventListener('click', removeCurrentSite)

document.getElementById('add-excluded-site').addEventListener('click', addCurrentSiteExcluded)
document.getElementById('remove-excluded-site').addEventListener('click', removeCurrentSiteExcluded)

document.querySelector('.manage-sites').addEventListener('click', openOptionsPage)