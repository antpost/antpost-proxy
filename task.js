const request = require('request-promise');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const cookieStr = 'datr=c3vcWX2KyLtxgURCzmE7ceVr; sb=c3vcWb-gUMEbX4QxNssENXUe; pl=n; act=1507621874948%2F8; c_user=100016523881582; xs=18%3AO4a2_CRCKqcR3g%3A2%3A1507621798%3A6501%3A14064; fr=0ec8gCEFCkd5lhia5.AWW0wdPfndPtGdhePeutMrftvOE.BZ3Htz.NZ.AAA.0.0.BZ3Im8.AWWfZPda; dpr=1; presence=EDvF3EtimeF1507628863EuserFA21B16523881582A2EstateFDutF1507628863784CEchFDp_5f1B16523881582F2CC; wd=1600x769;'

// Put cookie in an jar which can be used across multiple requests
let cookiejar = request.jar();
cookiejar.setCookie(cookieStr, 'https://mbasic.facebook.com');
// ...all requests to https://api.mydomain.com will include the cookie

const fetch = async (phone) => {
    let options = {
        uri: 'https://mbasic.facebook.com/search/?search=people&search_source=search_bar&query=' + phone,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
        }
        // jar: cookiejar // Tells rp to include cookies in jar that match uri
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

                console.log(`${count}. ${phone} => ${name}`);
            } else {
                console.log(`${count}. ${phone} => khong tim thay`);
            }

            await delay(1000);
        } else {
            fs.writeFile('log.txt', body, function (err) {
                console.log('Something error, stop to check it');
            });
            break;
        }
    }
};

run();