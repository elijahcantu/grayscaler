updateOptionsSiteList();

chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.type === 'updateOptions') {
        updateOptionsSiteList();
    }
});

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
