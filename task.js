const request = require('request-promise');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const cookieStr = 'dpr=1; wd=1600x769; datr=sp3cWUdsKvUVS1wjE3W7xOSp; sb=vbLcWbc_-hj_TngSX4BGQcCI; c_user=100016523881582; xs=1%3A-yj4-dcu9PLbjg%3A2%3A1507635928%3A6501%3A14064; fr=0qBqg1V3itONpbGxT.AWXzqcSqm2hCqSUEmaLIUCOsGSM.BZ3LK9.Qt.AAA.0.0.BZ3LLY.AWWO8ss9; pl=n;';

// Put cookie in an jar which can be used across multiple requests
let cookiejar = request.jar();
cookiejar.setCookie(cookieStr, 'https://mbasic.facebook.com');
// ...all requests to https://api.mydomain.com will include the cookie

const fetch = async (phone) => {
    let options = {
        uri: 'https://mbasic.facebook.com/search/?search=people&search_source=search_bar&query=' + phone,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
        },
        jar: cookiejar // Tells rp to include cookies in jar that match uri
    };

    return await request(options);
};

const delay = (time) => {
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, time);
    });
};

let count = 0;
let max = 1000;
const initPhone = '0165611'; // 0165611 + 1001
let next = 1001;
let successCount = 0;

const run = async () => {
    for(let i = 0; i < max; i ++) {
        count ++;
        let phone = initPhone + next;
        const body = await fetch(phone);

        const dom = new JSDOM(body);
        const document = dom.window.document;

        if(body.indexOf('objects_container') >= 0 && body.indexOf('/search/pages/') >= 0) {
            const userElem = document.querySelector(`a[href*="fref=search"]`);

            if(userElem) {
                const name = userElem.textContent;
                successCount ++;

                console.log(`${count}. ${phone} => ${name} (${successCount})`);
            } else {
                console.log(`${count}. ${phone} => khong tim thay`);
            }

            await delay(1000);
            next++;
        } else {
            fs.writeFile('log.txt', body, function (err) {
                console.log('Something error, stop to check it');
            });
            break;
        }
    }
};

run();