const express = require('express');
const app = express();
const request = require('request-promise');
const bodyParser = require('body-parser');
const phantom = require('phantom');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

const allowCrossDomain = (req, res, next) => {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

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

app.get('/simulate', (req, res) => {
	var _ph, _page, _outObj;

	phantom.create().then(ph => {
		_ph = ph;
		return _ph.createPage();
	}).then(page => {
		_page = page;
		return _page.open('https://stackoverflow.com/');
	}).then(status => {
		console.log(status);
		return _page.property('content')
	}).then(content => {
		//console.log(content);
		_page.close();
		_ph.exit();
		res.status(200).send(content);
	}).catch(e => console.log(e));
});

app.listen(3001, function () {
  console.log("Success! Now let's use AntPost");
});