// ****************************
// Add saved and excluded sites
// ****************************

function addSite(type, site, tabs, callback) {
    var paramObj;
    chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsTabs', 'gsAll'], function (val) {
        console.log(type + ' in addSite', val);
        if (!val[type] || val[type].length < 1) {
            console.log(type + ' doesnt exist yet, lets add it');
            paramObj = {};
            paramObj[type] = [site];
            chrome.storage.sync.set(paramObj, function () {
                callback(val.gsAll, val.gsTabs, val.gsSites);
            });
        } else if (val[type].indexOf(site) > -1) {
            console.log(type + 'sites is already added there')
        } else {
            console.log(type + 'site not there, add it')
            var newSiteList = val[type];
            newSiteList.push(site);
            newSiteList.sort();
            paramObj = {};
            paramObj[type] = newSiteList
            chrome.storage.sync.set(paramObj, function () {
                callback(val.gsAll, val.gsTabs, val.gsSites);
            });
        }
    });
}

function addCurrentSite() {
    console.log('add current site');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        addSite('gsSites', hostname, tabs, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            turnIconOn();
            updatePopUpDetails();
        });
    });
}

function addCurrentSiteExcluded() {
    console.log('add current site excluded');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        addSite('gsExcluded', hostname, tabs, function (gsAll, gsTabs, gsSites) {
            if ((gsAll || gsTabs.indexOf(tabs[0].id) > -1) && gsSites.indexOf(hostname) == -1) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                turnIconOff();
            }
            updatePopUpDetails();
        });
    });
}

function addSiteToList(e) {
    e.preventDefault();
    console.log('addSiteToList form')
    var newSite = document.getElementById('new-site');
    var errorMessage = document.getElementById('save-site-error');
    if (/^[a-zA-Z0-9]{1,}\.[a-zA-Z]{2,}$/.test(newSite.value)) {
        errorMessage.classList.remove('error-message--show');
        var newDomain = extractRootDomain(newSite.value);
        addSite('gsSites', newDomain, false, updateOptionsSiteList);
        newSite.value = '';
        newSite.blur();
        newSite.focus();
    } else {
        errorMessage.classList.add('error-message--show');
        newSite.blur();
        newSite.focus();
    }
}

function addExcludedSiteToList(e) {
    e.preventDefault();
    console.log('addExcludedSiteToList form');
    var newSite = document.getElementById('new-excluded-site');
    var errorMessage = document.getElementById('excluded-site-error');
    if (/^[a-zA-Z0-9]{1,}\.[a-zA-Z]{2,}$/.test(newSite.value)) {
        errorMessage.classList.remove('error-message--show');
        var newDomain = extractRootDomain(newSite.value);
        addSite('gsExcluded', newDomain, false, updateOptionsSiteList);
        newSite.value = '';
        newSite.blur();
        newSite.focus();
    } else {
        errorMessage.classList.add('error-message--show');
        newSite.blur();
        newSite.focus();
    }
}


// ****************************
// Remove saved and excluded sites
// ****************************

function removeSite(type, site, tabs, callback) {
    chrome.storage.sync.get(['gsSites', 'gsAll', 'gsTabs', 'gsExcluded'], function (val) {
        console.log(type + ' in removeSite', val);
        if (!val[type]) {
            console.log(type + ' doesnt exist yet do nothing');
        } else if (val[type].indexOf(site) > -1) {
            console.log(type + ' sites is already added there, remove it')
            var newSiteList = val[type];
            var index = newSiteList.indexOf(site);
            newSiteList.splice(index, 1);
            var paramObj = {};
            paramObj[type] = newSiteList;
            chrome.storage.sync.set(paramObj, function () {
                if (callback) {
                    callback(val.gsAll, val.gsTabs, val.gsSites);
                }
            });
        } else {
            console.log('site not there, do nothing')
        }
    });
}

function removeCurrentSite() {
    console.log('remove current site')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        var hostname = extractRootDomain(url);
        removeSite('gsSites', hostname, tabs, function (gsAll, gsTabs, gsSites) {
            if (!gsAll && gsTabs.indexOf(tabs[0].id) == -1) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                turnIconOff();
            }
            updatePopUpDetails();
        });
    });
}

function removeCurrentSiteExcluded() {
    console.log('remove current site excluded')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        var hostname = extractRootDomain(url);
        removeSite('gsExcluded', hostname, tabs, function (gsAll, gsTabs, gsSites) {
            if ((gsAll || gsTabs.indexOf(tabs[0].id) > -1) && gsSites.indexOf(hostname) == -1) {                
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
                turnIconOn();
            }
            updatePopUpDetails();
        });
    });
}

function removeSiteFromList(e) {
    var siteName = e.target.getAttribute('data-site');
    removeSite('gsSites', siteName, false, updateOptionsSiteList);
}

function removeExcludedSiteFromList(e) {
    var siteName = e.target.getAttribute('data-site');
    removeSite('gsExcluded', siteName, false, updateOptionsSiteList);
}

// ****************************
// Add saved tabs
// ****************************

function addTab(tabId, hostname, callback) {
    chrome.storage.sync.get(['gsTabs', 'gsExcluded'], function (val) {
        console.log('addTab', val)
        if (!val.gsTabs || val.gsTabs.length < 1) {
            console.log('gsTabs doesnt exist yet, lets add it');
            chrome.storage.sync.set({ 'gsTabs': [tabId] }, function () {
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    callback();
                }                
            });
        } else if (val.gsTabs.indexOf(tabId) > -1) {
            console.log('tab is already added there')
        } else {
            console.log('tab is not there, add it')
            var newTabList = val.gsTabs;
            newTabList.push(tabId);
            chrome.storage.sync.set({ 'gsTabs': newTabList }, function () {
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    callback();
                }                
            });
        }
    });
}

function addCurrentTab() {
    console.log('add current tab')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var tabId = tabs[0].id;
        var hostname = getDomainFromTabs(tabs);
        addTab(tabId, hostname, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            turnIconOn();
            updatePopUpDetails();
        });
    });
}

// ****************************
// Remove saved Tabs
// ****************************

function removeTab(tabId, hostname, callback) {
    chrome.storage.sync.get(['gsSites', 'gsAll', 'gsTabs'], function (val) {
        console.log('removeTabs', val);
        if (!val.gsTabs) {
            console.log('gsTabs doesnt exist yet do nothing');
        } else if (val.gsTabs.indexOf(tabId) > -1) {
            console.log('tab is already added there, remove it')
            var newTabList = val.gsTabs;
            var index = newTabList.indexOf(tabId);
            newTabList.splice(index, 1);
            chrome.storage.sync.set({ 'gsTabs': newTabList }, function () {
                if (val.gsSites.indexOf(hostname) == -1 && !val.gsAll) {
                    console.log('should be good to make site color again');
                    chrome.tabs.sendMessage(tabId, { type: 'turnOffGray' });
                    turnIconOff();
                }
                if (callback) {
                    callback()
                }                
            });
        } else {
            console.log('tab not there, do nothing')
        }
    });
}

function removeCurrentTab() {
    console.log('remove current tab')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        var tabId = tabs[0].id;        
        removeTab(tabId, hostname, updatePopUpDetails);
    });
}

// ****************************
// Toggle icons
// ****************************

function turnIconOn() {
    chrome.browserAction.setIcon({
        path: {
            "16": "../img/16-gs-icon-on.png",
            "32": "../img/32-gs-icon-on.png",
            "48": "../img/48-gs-icon-on.png",
            "128": "../img/128-gs-icon-on.png"
        }
    });
}

function turnIconOff() {
    chrome.browserAction.setIcon({
        path: {
            "16": "../img/16-gs-icon-off.png",
            "32": "../img/32-gs-icon-off.png",
            "48": "../img/48-gs-icon-off.png",
            "128": "../img/128-gs-icon-off.png"
        }
    });
}

// ****************************
// Refresh options and popup pages
// ****************************

var toggleHelp = function (e) {    
    var toggle = e.target;
    var helpText = e.target.parentElement.parentElement.querySelector('.button-info__description');
    if (helpText.classList.contains('button-info__description--show')) {
        toggle.innerHTML = '<span>?</span>';
        helpText.classList.remove('button-info__description--show')
    } else {
        toggle.innerHTML = '<span>X</span>';
        helpText.classList.add('button-info__description--show')
    }
};

function toggleExcludedHelp() {
    var helpContainer = document.getElementById('excluded-description');
    helpContainer.classList.toggle('button-info__description--show');
}

function updatePopUpDetails() {
    var allSitesCheckbox = document.getElementById('all-sites-toggle');
    var thisTabCheckbox = document.getElementById('this-tab-toggle');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        
        var siteTitle = document.getElementById('current-site-name');
        siteTitle.innerHTML = hostname;
        
        var savedSiteStatus = document.getElementById('saved-site-status');
        var excludedSiteStatus = document.getElementById('excluded-site-status');
        
        var savedAddRemoveContainer = document.getElementById('saved-container');
        var excludedAddRemoveContainer = document.getElementById('excluded-container');
        
        var popUpContainer = document.querySelector('.container');
        if (tabs[0].url === chrome.runtime.getURL('options.html')) {
            popUpContainer.classList.add('container--options');
        }    
        chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
            console.log('val', val)
            console.log('val.gsTabs', val.gsTabs)
            console.log('tabs[0].id', tabs[0].id)
            console.log('val.gsSites', val.gsSites)
            console.log('hostname', hostname);            
            if (val.gsAll) {
                allSitesCheckbox.checked = true;
            } else {
                allSitesCheckbox.checked = false;
            }
            if (val.gsTabs && val.gsTabs.indexOf(tabs[0].id) > -1) {
                console.log('tab is on')
                thisTabCheckbox.checked = true;
            } else {
                console.log('tab is off')
                thisTabCheckbox.checked = false;
            }
            if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
                console.log('site is saved')
                savedSiteStatus.innerHTML = 'Saved.'
                savedAddRemoveContainer.classList.add('add-remove-container--remove');
            } else {
                console.log('site is not saved')
                savedSiteStatus.innerHTML = 'Not saved.'
                savedAddRemoveContainer.classList.remove('add-remove-container--remove');
            }
            if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
                console.log('site is excluded')
                excludedSiteStatus.innerHTML = 'Excluded.'
                excludedAddRemoveContainer.classList.add('add-remove-container--remove');
            } else {
                console.log('site is not excluded')
                excludedSiteStatus.innerHTML = 'Not excluded.'
                excludedAddRemoveContainer.classList.remove('add-remove-container--remove');
            }
        });
    });
}

// options.js, and here in others
function updateOptionsSiteList() {
    chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsBgToggle'], function (val) {
        console.log('gsSites', val.gsSites)
        console.log('gsExcluded', val.gsExcluded);
        console.log('gsBgToggle', val.gsBgToggle);
        var savedUl = document.getElementById('saved-site-list');
        var excludedUl = document.getElementById('excluded-site-list');
        var bgToggle = document.getElementById('background-toggle');
        savedUl.innerHTML = "";
        excludedUl.innerHTML = "";

        if (!val.gsSites || val.gsSites.length < 1) {
            var savedLi = document.createElement('li');
            savedLi.innerHTML = "No sites saved yet. Use the form above or the extension pop up by clicking the icon in the chrome menu bar while browsing to add some!";
            savedUl.appendChild(savedLi);
        } else {
            val.gsSites.forEach(function (el) {
                var savedLi = document.createElement('li');
                var itemText = `<button class="remove-button" data-site="${el}">X</button> ${el}`
                savedLi.innerHTML = itemText;
                savedUl.appendChild(savedLi);
            })
        }

        if (!val.gsExcluded || val.gsExcluded.length < 1) {
            var excludedLi = document.createElement('li');
            excludedLi.innerHTML = "No excluded sites added yet. Use the form above to add some!";
            excludedUl.appendChild(excludedLi);
        } else {
            val.gsExcluded.forEach(function (el) {
                var excludedLi = document.createElement('li');
                var itemText = `<button class="remove-button" data-site="${el}">X</button> ${el}`
                excludedLi.innerHTML = itemText;
                excludedUl.appendChild(excludedLi);
            })
        }

        if (val.gsBgToggle) {
            bgToggle.checked = true;
        } else {
            bgToggle.checked = false;
        }
    });
}

function toggleBackground() {
    console.log('toggle background image/color');
    var checkbox = document.getElementById('background-toggle');
    chrome.storage.sync.get(['gsBgToggle'], function (val) {
        console.log('gsBgToggle', val.gsBgToggle);
        if (val.gsBgToggle) {
            console.log('checked, turn if off')
            chrome.storage.sync.set({ 'gsBgToggle': false });
            checkbox.checked = false;
        } else {
            console.log('not checked, turn it on');
            chrome.storage.sync.set({ 'gsBgToggle': true });
            checkbox.checked = true;
        }
    });
}

// ****************************
// Clear sites
// ****************************

// only options.js
function clearSiteValues(tabs) {
    if (confirm('Are you sure you want to remove all of your saved sites?')) {
        chrome.storage.sync.get('gsSites', function (val) {
            console.log('showing gsSites before clearing', val.gsSites);
            chrome.storage.sync.set({ 'gsSites': [] });
            updateOptionsSiteList();
        });
    }
}

function clearExcludedSiteValues(tabs) {
    if (confirm('Are you sure you want to remove all of your excluded sites?')) {
        chrome.storage.sync.get('gsExcluded', function (val) {
            console.log('showing gsExcluded before clearing', val.gsExcluded);
            chrome.storage.sync.set({ 'gsExcluded': [] });
            updateOptionsSiteList();
        });
    }
}

// ****************************
// URL Helpers
// ****************************

function getDomainFromTabs(tabs) {
    var url = tabs[0].url;
    var hostname = extractRootDomain(url);    
    return hostname;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}