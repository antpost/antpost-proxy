/**
 * Created by Nguyen Manh Cuong on 6/28/2017.
 */

const phantom = require('phantom');

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

module.exports = (procedure) => {

    return new Promise(async (resolve, reject) => {
        const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no'], {
            phantomPath: 'phantomjs.exe'
        });
        const page = await instance.createPage();

        /*await page.on("onResourceRequested", function(requestData) {
            console.info('Requesting', requestData.url)
        });*/
        let step = 0;
        let currentUrl = '';

        await page.on("onLoadFinished", async function(status) {
            //console.log(`Load Finished ${status}`);

            if(step == 2) {
                if(currentUrl.indexOf(procedure.completeRule.finalUrl) >= 0) {
                    let cookies = await page.cookies();
                    //console.log(cookies);
                    resolve(cookies);
                } else {
                    //console.log("Failed!");
                    reject("Failed!");
                }

                setTimeout(async () => {
                    await page.render('capture.png');
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
        await page.render('post.png');

        if(status === 'success') {
            step++;
            await page.invokeMethod('evaluate', function(formActions) {
                var actionType = {
                    accessUrl: 1,
                    input: 2,
                    click: 3,
                    submit: 4
                };

                formActions.forEach(function(actionStep) {
                    switch (actionStep.action) {
                        case actionType.input:
                            document.querySelector(actionStep.params.selector).value = actionStep.params.value;
                            break;
                        case actionType.submit:
                            document.querySelector(actionStep.params.selector).submit();
                            break;
                    }
                });
            }, procedure.formActions);
        }

    });
};