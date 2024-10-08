updateOptionsSiteList();


function handleOptionsAdd(e, inputId, errorMessageId, siteType) {
    e.preventDefault();
    var newSite = document.getElementById(inputId).value;
    var errorMessage = document.getElementById(errorMessageId);

    if (/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(newSite)) {
        errorMessage.classList.remove('show');
        addSite(siteType, newSite, false, updateOptionsSiteList);
        document.getElementById(inputId).value = '';
        document.getElementById(inputId).blur();
        document.getElementById(inputId).focus();
    } else {
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
