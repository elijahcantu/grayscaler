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
        } else if (val[type].indexOf(site) == -1) {
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





function removeSite(type, site, tabs, callback) {
    chrome.storage.sync.get(['gsSites', 'gsAll', 'gsTabs', 'gsExcluded'], function (val) {
        console.log(type + ' in removeSite', val);
        if (val[type] && val[type].indexOf(site) > -1) {
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
        }
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
        } else if (val.gsTabs.indexOf(tabId) == -1) { //tab not there
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



function removeTab(tabId, hostname, callback) {
    chrome.storage.sync.get(['gsSites', 'gsAll', 'gsTabs'], function (val) {
        if (val.gsTabs && val.gsTabs.indexOf(tabId) > -1) {
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
        }
    });
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




function updateOptionsSiteList() {
    chrome.storage.sync.get(['gsSites', 'gsExcluded'], function (val) {
        var savedUl = document.getElementById('saved-site-list');
        var excludedUl = document.getElementById('excluded-site-list');
        savedUl.innerHTML = "";
        excludedUl.innerHTML = "";

        if (!val.gsSites || val.gsSites.length < 1) {
            document.getElementById('empty-enabled').style.display = "block";
        } else {
            document.getElementById('empty-enabled').style.display = "none";

            val.gsSites.forEach(function (el) {
                var savedLi = document.createElement('li');
                var itemText = `<button class="remove-button red" data-site="${el}">x</button> ${el}`
                savedLi.innerHTML = itemText;
                savedUl.appendChild(savedLi);
            })
            if (val.gsSites.length > 1) {
                document.getElementById('clear-site-values').style.display = "block";
            }
        }

        if (!val.gsExcluded || val.gsExcluded.length < 1) {
            document.getElementById('empty-disabled').style.display = "block";

        } else {
            document.getElementById('empty-disabled').style.display = "none";

            val.gsExcluded.forEach(function (el) {
                var excludedLi = document.createElement('li');
                var itemText = `<button class="remove-button red" data-site="${el}">x</button> ${el}`
                excludedLi.innerHTML = itemText;
                excludedUl.appendChild(excludedLi);
            })
            if (val.gsExcluded.length > 1) {
                document.getElementById('clear-excluded-site-values').style.display = "block";
            }
        }

    });
}









