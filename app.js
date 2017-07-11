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

app.listen(3001, function () {
  console.log("Success! Now let's use AntPost");
});