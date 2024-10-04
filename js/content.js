// console.log('content script running')

chrome.extension.onMessage.addListener(function (request, sender, response) {
    // console.log('content script message received')
    if (request.type === 'turnOnGray') {
        // console.log('turn on gray');
        document.querySelector('html').style.filter = "grayscale(100%)";
        chrome.storage.sync.get('gsBgToggle', function (val) {
            if (val.gsBgToggle) {
                var html = document.querySelector('html');                
                var htmlBackgroundColor;
                var htmlBackgroundImage;                

                if (html && !html.classList.contains('gs-modified-background')) {
                    htmlBackgroundColor = window.getComputedStyle(html, null).getPropertyValue('background-color');
                    htmlBackgroundImage = window.getComputedStyle(html, null).getPropertyValue('background-image');
                    // console.log('htmlBackgroundColor', htmlBackgroundColor);
                    // console.log('htmlBackgroundImage', htmlBackgroundImage);
                    // console.log('tinycolor htmlColor alpha', tinycolor(htmlBackgroundColor).getAlpha());

                    if (tinycolor(htmlBackgroundColor).getAlpha() === 0 && htmlBackgroundImage === "none") {
                        // console.log('html is actually transparent and has no image, do nothing');
                    } else if (tinycolor(htmlBackgroundColor).getAlpha() < .5 || tinycolor(htmlBackgroundColor).isLight()) {
                            // console.log('html is light, set to white')
                            document.querySelector('html').style.background = "#ffffff";
                    } else {
                        // console.log('html is not light, set to gray')
                        document.querySelector('html').style.background = "#525050";
                    }

                    setTimeout(() => {
                        var body = document.querySelector('body');
                        var bodyBackgroundColor;
                        var bodyBackgroundImage;                        
                        
                        if (body) {
                            bodyBackgroundColor = window.getComputedStyle(body, null).getPropertyValue('background-color');
                            bodyBackgroundImage = window.getComputedStyle(body, null).getPropertyValue('background-image');
                            // console.log('bodyBackgroundColor', bodyBackgroundColor);
                            // console.log('bodyBackgroundImage', bodyBackgroundImage);
                            // console.log('tinycolor bodyColor alpha', tinycolor(bodyBackgroundColor).getAlpha());

                            if (tinycolor(bodyBackgroundColor).getAlpha() === 0 && bodyBackgroundImage === "none") {
                                // console.log('body is actually transparent and has no image, do nothing');
                            } else if (tinycolor(bodyBackgroundColor).getAlpha() < .5 || tinycolor(bodyBackgroundColor).isLight()) {
                                // console.log('body is light, set to white')
                                document.querySelector('body').style.background = "#ffffff";
                            } else {
                                // console.log('body is not light, set to gray')
                                document.querySelector('body').style.background = "#525050";
                            }
                        } else {
                            // console.log('no body');
                        }
                    }, 100);

                    html.classList.add('gs-modified-background');
                } else {
                    // console.log('Backgrounds already changed, dont run');
                }
            }
        });        
    }
    if (request.type === 'turnOffGray') {
        // console.log('turn off gray');
        document.querySelector('html').style.filter = "";
    }
});