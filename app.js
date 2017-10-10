const express = require('express');
const app = express();
const request = require('request-promise');
const bodyParser = require('body-parser');
const simulate = require('./simulate');
const fs = require('fs');
const multipart  = require('connect-multiparty');
const multipartMiddleware = multipart();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

const allowCrossDomain = (req, res, next) => {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
};

app.use(allowCrossDomain);
app.use('/static', express.static('uploads'));// you can access image

app.get('/', function (req, res) {
	res.send("Success! Now let's use AntPost");
});

app.post('/fblogin', function (req, res) {
	const options = {
		method: 'POST',
        rejectUnauthorized: false,
		uri: 'https://api.facebook.com/restserver.php',
		form: req.body,
		json: true
	};

	request(options).then(fbRes => {
		res.status(200).json(fbRes);
	}).catch(err => {
		res.status(500).json(err);
	});
});

app.post('/post', function (req, res) {
	const options = {
		method: req.body.method,
        rejectUnauthorized: false,
		uri: req.body.api,
		qs: req.body.data,
		json: true
	};

	request(options).then(fbRes => {
		res.status(200).json(fbRes);
	}).catch(err => {
		res.status(500).json(err);
	});
});

app.post('/simulate', (req, res) => {
	const content = simulate(req.body).then((result) => {
        res.status(200).json({
            status: 0,
			data: result
        });
	}).catch ((error) => {
        res.status(200).json({
        	status: 1,
			data: error
		});
	});
});

app.post('/upload', multipartMiddleware, (req, res) => {
	var file = req.files.files;

	// Tên file
	var originalFilename = file.name;

	// File type
	var fileType = file.type.split('/')[1];

	// File size
	var fileSize = file.size;

	// Đường dẫn lưu ảnh
	var pathUpload = 'uploads/' + originalFilename;

	function checkDirectorySync(directory) {
		try {
			fs.statSync(directory);
		} catch(e) {
			fs.mkdirSync(directory);
		}
	}

	checkDirectorySync('uploads');

	// Đọc nội dung file tmp
	// nếu không có lỗi thì ghi file vào ổ cứng
	fs.readFile(file.path, function(err, data) {
		if(!err) {
			fs.writeFile(pathUpload, data, function() {
				// Return anh vua upload
				res.send(originalFilename);
				return;
			});

		}
	});
});

app.post('/remove', multipartMiddleware, (req, res) => {
    fs.unlink('uploads/' + req.body.fileNames, function(err){
        res.send('ok');
    });
});

app.get('/phone', function (req, res) {
    const cookieStr = 'datr=c3vcWX2KyLtxgURCzmE7ceVr; sb=c3vcWb-gUMEbX4QxNssENXUe; pl=n; act=1507621874948%2F8; c_user=100016523881582; xs=18%3AO4a2_CRCKqcR3g%3A2%3A1507621798%3A6501%3A14064; fr=0ec8gCEFCkd5lhia5.AWW0wdPfndPtGdhePeutMrftvOE.BZ3Htz.NZ.AAA.0.0.BZ3Im8.AWWfZPda; dpr=1; presence=EDvF3EtimeF1507628863EuserFA21B16523881582A2EstateFDutF1507628863784CEchFDp_5f1B16523881582F2CC; wd=1600x769;'

	// Put cookie in an jar which can be used across multiple requests
    let cookiejar = request.jar();
    cookiejar.setCookie(cookieStr, 'https://mbasic.facebook.com');
	// ...all requests to https://api.mydomain.com will include the cookie

    let options = {
        uri: 'https://mbasic.facebook.com/search/?search=people&search_source=search_bar&query=01656113560',
        // resolveWithFullResponse: true,
		// jar: cookiejar, // Tells rp to include cookies in jar that match uri
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
        }
    };

    request(options)
        .then(function (body) {
            // Request succeeded...
            if(body.indexOf('100010425909247') >= 0) {
                console.log('success');
            } else {
                console.log('error');
            }

            res.status(200).send(body);
        })
        .catch(function (err) {
            // Request failed...
            console.log('error request');
            res.status(500).json(err);
        });
});

app.listen(3001, function () {
  console.log("Success! Now let's use AntPost");
});