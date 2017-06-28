/**
 * Created by Nguyen Manh Cuong on 6/28/2017.
 */

const phantom = require('phantom');

module.exports = () => {
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
            console.log(`Load Finished ${status}`);

            if(step == 2) {
                if(currentUrl.indexOf('mbasic.facebook.com/login/save-device')) {
                    //console.log(page);
                    let cookies = await page.cookies();
                    resolve(JSON.stringify(cookies));
                } else {
                    resolve("Login failed!");
                }

                setTimeout(async () => {
                    await instance.exit();
                }, 2000);
            }

            step++;
        });

        await page.on("onUrlChanged", function(targetUrl) {
            console.log('New URL: ' + targetUrl);
            currentUrl = targetUrl;
        });

        const status = await page.open('https://mbasic.facebook.com/');

        if(status === 'success') {
            step++;
            await page.evaluate(function() {
                document.querySelector("input[name='email']").value = "100016488426267";
                document.querySelector("input[name='pass']").value = "bgbggb1";
                document.querySelector("#login_form").submit();
            });
        }

    });
};