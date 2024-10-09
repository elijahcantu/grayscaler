updateOptionsSiteList();

async function handleOptionsAdd(e, inputId, errorMessageId, siteType) {
    e.preventDefault();
    var newSitesInput = document.getElementById(inputId).value;
    var errorMessage = document.getElementById(errorMessageId);
    var newSites = newSitesInput.split(/[, ]+/).map(site => site.trim().toLowerCase()).filter(Boolean);
    let validSites = [];
    let invalidSites = [];

    newSites.forEach(newSite => {
        if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(newSite)) {
            validSites.push(newSite);
        } else {
            invalidSites.push(newSite);
        }
    });

    if (validSites.length > 0) {
        errorMessage.classList.remove('show');
        for (const site of validSites) {
            await addSite(siteType, site, false, updateOptionsSiteList);
        }
        document.getElementById(inputId).value = '';
        document.getElementById(inputId).blur();
        document.getElementById(inputId).focus();
    }

    if (invalidSites.length > 0) {
        errorMessage.classList.add('show');
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
        else {
            document.getElementById('clear-site-values').style.display = "none";

        }
    }
}

document.getElementById('add-site-form').addEventListener('submit', function (e) {
    handleOptionsAdd(e, 'new-site', 'save-site-error', 'gsSites');
});
document.getElementById('add-excluded-site-form').addEventListener('submit', function (e) {
    handleOptionsAdd(e, 'new-excluded-site', 'excluded-site-error', 'gsExcluded');
});
document.getElementById('saved-site-list').addEventListener('click', function (e) {
    handleOptionsRemove(e, 'gsSites');
});
document.getElementById('excluded-site-list').addEventListener('click', function (e) {
    handleOptionsRemove(e, 'gsExcluded');
});

document.getElementById('clear-site-values').addEventListener('click', function () {
    handleOptionsRemoveAll('gsSites', 'Are you sure you want to remove all of your saved sites?');
});

document.getElementById('clear-excluded-site-values').addEventListener('click', function () {
    handleOptionsRemoveAll('gsExcluded', 'Are you sure you want to remove all of your excluded sites?');
});
