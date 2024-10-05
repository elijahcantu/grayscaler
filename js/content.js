chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.type === 'enable') {
        document.querySelector('html').style.filter = "grayscale(100%)";
    }
    if (request.type === 'disable') {
        document.querySelector('html').style.filter = "";
    }
});