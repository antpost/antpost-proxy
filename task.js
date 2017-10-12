const request = require('request-promise');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const cookieStr = 'datr=pyPfWV7-zxbDDfX7G2cmnWo2; locale=vi_VN; sb=pyPfWdofw3aKW3Am-BX9Z-7g; c_user=100016513052229; xs=12%3AFh5AqRrSiLgm5Q%3A2%3A1507799931%3A15299%3A13350; pl=n; fr=0CFKgdjJjPTKfsOj0.AWW5vn0i4KIB4rM9zhG0lZ9eP-E.BZ3yOn.Ju.Fnf.0.0.BZ3zN_.AWW50lmP; presence=EDvF3EtimeF15078B85EuserFA21B16513052229A2EstateFDutF15078B85137CEchFDp_5f1B16513052229F3CC; dpr=1; wd=1920x949; ';

// Put cookie in an jar which can be used across multiple requests
let cookiejar = request.jar();
cookiejar.setCookie(cookieStr, 'https://mbasic.facebook.com');
// ...all requests to https://api.mydomain.com will include the cookie

const fetch = async (phone) => {
    let options = {
        uri: 'https://mbasic.facebook.com/search/?search=people&search_source=search_bar&query=' + phone,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': cookieStr,
            'Upgrade-Insecure-Requests': '1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.8,vi;q=0.6,es;q=0.4'
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