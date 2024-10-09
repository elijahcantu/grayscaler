chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.type === 'enable') {
        document.querySelector('html').style.setProperty('filter', 'grayscale(100%)', 'important');
    }
    if (request.type === 'disable') {
        document.querySelector('html').style.filter = "";
    }
});