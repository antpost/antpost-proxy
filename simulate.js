/**
 * Created by Nguyen Manh Cuong on 6/28/2017.
 */

const phantom = require('phantom');

const actionType = {
    accessUrl: 1,
    input: 2,
    click: 3,
    submit: 4,
    upload: 5
};

/**
 * add cookies to page
 * @param page
 * @param cookies
 * @returns {*}
 */
const addCookies = (page, cookies) => {
    if(!cookies) {
        return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
        let allPromises = [];

        cookies.forEach((cookie) => {
            allPromises.push(page.addCookie(cookie));
        });

        Promise.all(allPromises).then(() => {
            resolve();
        })
    });
};

function evaluateInput(actionStep) {
    var selector = document.querySelector(actionStep.params.selector);
    if(!selector) {
        return false;
    }

    if(actionStep.params.value) {
        selector.value = actionStep.params.value;
    }

    return true;
}

function evaluateClick(actionStep) {
    var selector = document.querySelector(actionStep.params.selector);
    if(!selector) {
        return false;
    }

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    selector.dispatchEvent(event);

    return true;
}

function evaluateSumit(actionStep) {
    var selector = document.querySelector(actionStep.params.selector);
    if(!selector) {
        return false;
    }

    selector.submit();

    return true;
}

module.exports = (procedure) => {

    return new Promise(async (resolve, reject) => {
        var log = console.log;
        var nolog = function() {};
        const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no'], {
            phantomPath: 'phantomjs.exe',
            logger: { warn: log, debug: nolog, error: log, info: log }
        });
        const page = await instance.createPage();

        /*await page.on("onResourceRequested", function(requestData) {
            console.info('Requesting', requestData.url)
        });*/
        let step = 0;
        let currentUrl = '';

        await page.on("onLoadFinished", async function(status) {
            //console.log(`Load Finished ${status}`);

            if(step == 2 || procedure.formActions.length == 0) {
                if(!procedure.completeRule || currentUrl.indexOf(procedure.completeRule.finalUrl) >= 0) {
                    let cookies = await page.cookies();
                    procedure.responseElement = procedure.responseElement || 'body';
                    let content = await page.invokeMethod('evaluate', function (element) {
                        var selector = document.querySelector(element);
                        return selector ? selector.innerHTML : null;
                    }, procedure.responseElement);

                    resolve({
						cookies: cookies,
						content: content
					});
                } else {
                    //console.log("Failed!");
                    reject("Failed!");
                }

                setTimeout(async () => {
                    //await page.render('capture.png');
                    await instance.exit();
                }, 2000);
            }

            step++;
        });

        await page.on("onUrlChanged", function(targetUrl) {
            console.log('New URL: ' + targetUrl);
            currentUrl = targetUrl;
        });

        await addCookies(page, procedure.requestAction.params.cookies);

        const status = await page.open(procedure.requestAction.params.url);
        //await page.render('post.png');

        if(status === 'success') {
            step++;

            for(let i = 0; i < procedure.formActions.length; i ++) {
                let actionStep = procedure.formActions[i];
                let ok = true;

                switch (actionStep.action) {
                    case actionType.input:
                        ok = await page.invokeMethod('evaluate', evaluateInput, actionStep);
                        break;
                    case actionType.click:
                        ok = await page.invokeMethod('evaluate', evaluateClick, actionStep);
                        break;
                    case actionType.upload:
                        await page.uploadFile(actionStep.params.selector, 'uploads/' + actionStep.params.value);
                        break;
                    case actionType.submit:
                        ok = await page.invokeMethod('evaluate', evaluateSumit, actionStep);
                        break;
                }

                if(!ok) {
                    reject("Failed!");
                    await instance.exit();
                    break;
                }
            }

            if(!procedure.completeRule && procedure.formActions.length > 0) {
                resolve({});

                setTimeout(async () => {
                    //await page.render('capture.png');
                    await instance.exit();
                }, 2000);
            }
        }

    });
};