function toggleAllSites() {
    // console.log('toggle all sites')
    var checkbox = document.getElementById('all-sites-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            var hostname = getDomainFromTabs(tabs);
            if (val.gsAll) {
                checkbox.checked = false;
                chrome.storage.sync.set({ 'gsAll': false });
                if (val.gsSites.indexOf(hostname) == -1 && val.gsTabs.indexOf(tabs[0].id) == -1) {
                    // console.log('tab not on and site not saved, turn off gray');
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                    turnIconOff();
                }
            } else {
                checkbox.checked = true;
                chrome.storage.sync.set({ 'gsAll': true });
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    // console.log('site not excluded, turn on gray');
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
                    turnIconOn();
                }                
            }
        });
    });
}

function toggleTab() {
    // console.log('toggle tab')
    var checkbox = document.getElementById('this-tab-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        if (checkbox.checked) {
            // console.log('toggle tab checked');
            addCurrentTab();
        } else {
            // console.log('toggle tab not checked');
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

function onLoad() {    
    var bodyEl = document.querySelector('body');
    updatePopUpDetails()
    setTimeout(() => {
        bodyEl.classList.remove('preload');
    }, 50);
}

onLoad();

document.getElementById('this-tab-toggle').addEventListener('change', toggleTab)
document.getElementById('all-sites-toggle').addEventListener('change', toggleAllSites)

document.getElementById('add-saved-site').addEventListener('click', addCurrentSite)
document.getElementById('remove-saved-site').addEventListener('click', removeCurrentSite)
document.getElementById('saved-help-toggle').addEventListener('click', toggleHelp);

document.getElementById('add-excluded-site').addEventListener('click', addCurrentSiteExcluded)
document.getElementById('remove-excluded-site').addEventListener('click', removeCurrentSiteExcluded)
document.getElementById('excluded-help-toggle').addEventListener('click', toggleHelp);

document.querySelector('.manage-sites').addEventListener('click', openOptionsPage)