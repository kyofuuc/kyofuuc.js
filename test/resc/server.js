
const express = require('express');
const app = express();
const port = 3009;
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);
app.use(express.json());

app.get('/greet', (req, res) => {
	res.send("Hello World!");
});

app.get('/origin', (req, res) => {
	res.send(JSON.stringify({
		origin: req.ip
	}));
});

app.get('/user-agent', (req, res) => {
	res.send(JSON.stringify({
		"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
	}));
});

app.get('/headers', (req, res) => {
	res.set('Content-Type', 'text/json');
	res.set('Cache-Control', 'max-age=0');
	res.set('host', req.hostname);
	res.set('url', req.url);
	res.send(JSON.stringify(res.getHeaders()));
});

app.get('/redirect/:status/:next_status_code', (req, res) => {
	res.status(req.params.status);
	if (req.params.status == 302 && req.params.next_status_code == 200) {
		res.set('location', `http://127.0.0.1:3009/redirect/200/200`);
	} else if (req.params.next_status_code) {
		res.set('location', `http://127.0.0.1:3009/redirect/${req.params.next_status_code}/200`);
	}
	res.end();
});

["post", "patch", "put"].map(method => {
	app[method](`/${method}`, (req, res) => {
		res.json(req.body);
		res.end();
	});
});

['delete', 'get', 'head', 'options'].map(method => {
	app[method](`/${method}`, (req, res) => {
		res.status(204);
		res.end();
	});
});

app.get('/profile', (req, res) => {
	if (!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
        return res.status(400).json({ message: "Missing Authorization Header" });
    }
	const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    if (!(username === "test@mail.com" && password === "password")) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }
	res.json({ message: 'Success' });
});

module.exports = app;
