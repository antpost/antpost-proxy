/**
 * Created by Nguyen Manh Cuong on 6/28/2017.
 */

const phantom = require('./phantom/phantom/lib');

module.exports = async () => {
    const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']);
    const page = await instance.createPage();

    await page.on("onResourceRequested", function(requestData) {
        console.info('Requesting', requestData.url)
    });

    await page.on("onLoadFinished", function(status) {
        console.log('Load Finished: ' + status);
    });

    await page.on("onUrlChanged  ", function(status) {
        console.log('New URL: ' + targetUrl);
    });

    const status = await page.open('https://mbasic.facebook.com/');

    if(status === 'success') {
        await page.evaluate(function() {
            document.querySelector("input[name='email']").value = "100016488426267";
            document.querySelector("input[name='pass']").value = "bgbggb1";
            document.querySelector("#login_form").submit();

            console.log("Login submitted!");
        });
    }

    setTimeout(async function () {
        page.render('colorwheel.png');
        await instance.exit();
    }, 5000);

    return 'ok';
};