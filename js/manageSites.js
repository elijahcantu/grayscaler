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
            chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
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
                chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
                turnIconOff();
            }
            updatePopUpDetails();
        });
    });
}


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
        var hostname = extractHostname(url);
        removeSite('gsSites', hostname, tabs, function (gsAll, gsTabs, gsSites) {
            if (!gsAll && gsTabs.indexOf(tabs[0].id) == -1) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'disable' });
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
        var hostname = extractHostname(url);
        removeSite('gsExcluded', hostname, tabs, function (gsAll, gsTabs, gsSites) {
            if ((gsAll || gsTabs.indexOf(tabs[0].id) > -1) && gsSites.indexOf(hostname) == -1) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
                turnIconOn();
            }
            updatePopUpDetails();
        });
    });
}

function addTab(tabId, hostname, callback) {
    chrome.storage.sync.get(['gsTabs', 'gsExcluded'], function (val) {

        if (!val.gsTabs || val.gsTabs.length < 1) {
            console.log('gsTabs doesnt exist yet, lets add it');
            chrome.storage.sync.set({ 'gsTabs': [tabId] }, function () {
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    callback();
                }
            });
        } else if (val.gsTabs.indexOf(tabId) > -1) { //tab there
        } else {
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
            chrome.tabs.sendMessage(tabs[0].id, { type: 'enable' });
            turnIconOn();
            updatePopUpDetails();
        });
    });
}

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
                    chrome.tabs.sendMessage(tabId, { type: 'disable' });
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


function handleOptionsAdd(e, inputId, errorMessageId, siteType) {
    e.preventDefault();
    var newSite = document.getElementById(inputId).value;
    var errorMessage = document.getElementById(errorMessageId);

    if (/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(newSite)) {
        errorMessage.classList.remove('error-message--show');
        addSite(siteType, newSite, false, updateOptionsSiteList);
        document.getElementById(inputId).value = '';
        document.getElementById(inputId).blur();
        document.getElementById(inputId).focus();
    } else {
        errorMessage.classList.add('error-message--show');
        document.getElementById(inputId).blur();
        document.getElementById(inputId).focus();
    }
}

function handleOptionsRemove(e, siteType) {
    var siteName = e.target.getAttribute('data-site');
    if (siteName) {
        removeSite(siteType, siteName, false, updateOptionsSiteList);
    }
}

function handleOptionsRemoveAll(siteType, confirmationMessage) {
    if (confirm(confirmationMessage)) {
        chrome.storage.sync.get(siteType, function (val) {
            console.log(`showing ${siteType} before clearing`, val[siteType]);
            chrome.storage.sync.set({ [siteType]: [] });
            updateOptionsSiteList();
        });
        if (siteType === 'gsExcluded') {
            document.getElementById('clear-excluded-site-values').style.display = "none";

        }
        else{
            document.getElementById('clear-site-values').style.display = "none";

        }
    }
}



function turnIconOn() {
    chrome.action.setIcon({
        path: {
            "16": "../icons/16on.png",
            "32": "../icons/32on.png",
            "48": "../icons/48on.png",
            "128": "../icons/128on.png"
        }
    });
}

function turnIconOff() {
    chrome.action.setIcon({
        path: {
            "16": "../icons/16off.png",
            "32": "../icons/32off.png",
            "48": "../icons/48off.png",
            "128": "../icons/128off.png"
        }
    });
}





function updatePopUpDetails() {
    var allSitesCheckbox = document.getElementById('all-sites-toggle');
    var thisTabCheckbox = document.getElementById('this-tab-toggle');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);

        var website = document.getElementById('website');
        website.innerText = hostname;


        var includeButton = document.getElementById("add-saved-site");

        var removeIncludeButtom = document.getElementById("remove-saved-site");

        var excludeButton = document.getElementById("add-excluded-site");

        var removeExcludeButton = document.getElementById("remove-excluded-site");


        var popUpContainer = document.querySelector('body');
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
                includeButton.classList.remove("show");
                removeIncludeButtom.classList.add("show");
            } else {
                console.log('site is not saved')
                includeButton.classList.add("show");
                removeIncludeButtom.classList.remove("show");
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
        });
    });
}

// options.js, and here in others
function updateOptionsSiteList() {
    chrome.storage.sync.get(['gsSites', 'gsExcluded', /*'gsBgToggle'*/], function (val) {
        console.log('gsSites', val.gsSites)
        console.log('gsExcluded', val.gsExcluded);
        /*  console.log('gsBgToggle', val.gsBgToggle);*/
        var savedUl = document.getElementById('saved-site-list');
        var excludedUl = document.getElementById('excluded-site-list');
        //  var bgToggle = document.getElementById('background-toggle');
        savedUl.innerHTML = "";
        excludedUl.innerHTML = "";

        if (!val.gsSites || val.gsSites.length < 1) {
            document.getElementById('empty-enabled').style.display = "block";
        } else {
            document.getElementById('empty-enabled').style.display = "none";

            val.gsSites.forEach(function (el) {
                var savedLi = document.createElement('li');
                var itemText = `<button class="remove-button" data-site="${el}">X</button> ${el}`
                savedLi.innerHTML = itemText;
                savedUl.appendChild(savedLi);
            })
            if (val.gsSites.length > 1){
                document.getElementById('clear-site-values').style.display = "block";
            }
        }

        if (!val.gsExcluded || val.gsExcluded.length < 1) {
            document.getElementById('empty-disabled').style.display = "block";

        } else {
            document.getElementById('empty-disabled').style.display = "none";

            val.gsExcluded.forEach(function (el) {
                var excludedLi = document.createElement('li');
                var itemText = `<button class="remove-button" data-site="${el}">X</button> ${el}`
                excludedLi.innerHTML = itemText;
                excludedUl.appendChild(excludedLi);
            })
            if (val.gsExcluded.length > 1) {
                document.getElementById('clear-excluded-site-values').style.display = "block";
            }
        }

    });
}






function getDomainFromTabs(tabs) {
    return extractHostname(tabs[0].url);
}

function extractHostname(url) {
    var hostname;

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

