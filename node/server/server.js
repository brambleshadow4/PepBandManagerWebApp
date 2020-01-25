const express = require('express');
const https = require('https')
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express()

var settings = {}
var settingsRaw = fs.readFileSync("server/settings.txt");
var settingsList = settingsRaw.toString().split(/\r?\n/g);

for (var line of settingsList)
{
	var eq = line.indexOf('=');
	if(eq != -1)
	{	
		var key = line.substring(0,eq);
		settings[key] = line.substring(eq+1);

		if(settings[key] === "true")
			settings[key] = true;
		if(settings[key] === "false")
			settings[key] = false;
	}
}

console.log(settings);

app.use(require('cookie-parser')());
app.use(require('express-session')(
	{secret: "idk what this does"}
));

const port = 80;

// login

	app.post('/login', bodyParser.urlencoded({extended: true}), function (req, res) {	
		req.settings = settings;
		require('./auth.js').run(req,res);
	});
	


// Always allow access to the assets folder; no login necessary.
app.get('/assets/*', function (req, res) {
	sendIfExists(req.url, res);
});


// events
	app.get('/events', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/events/events.html', req, res)
	});

	app.get('/events/*', checkAdmin, function (req, res) {
		sendIfExists("/views" + req.url, res);
	});

// editEvent
	app.get('/editEvent', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/editEvent/editEvent.html', req, res);
	});

	app.get('/editEvent/*', checkAdmin, function (req, res) {
		sendIfExists("/views" + req.url, res);
	})

// members
	app.get('/members', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/members/members.html', req, res);
	});

	app.get('/members/*', checkAdmin, function (req, res) {
		sendIfExists("/views" + req.url, res);
	})

//join
	app.get('/join', function (req, res) {
		res.sendFile('./views/join/join.html', {root:"./"});
	});

// profile
	app.get('/profile', function (req, res) {
		res.sendFile('./views/profile/profile.html', {root:"./"});
	});

// points
	app.get('/points', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/points/points.html', req, res);
	});

	app.get('/points/points.pdf', checkAdmin, function (req, res) {
		require('../views/points/createPointList.js').run(req,res);
	});

	app.get('/points/*', checkAdmin, function (req, res) {
		sendIfExists("/views" + req.url, res);
	})

// Landing Page
	app.get('/', function (req, res) {
		if(settings.HTTPS)
		{
			res.sendFile('/views/landing/landing.html', {root:"./"});
		}
		else if(settings.NO_AUTH)
		{
			res.sendFile("/views/landing/landingNoAuth.html", {root:"./"});
		}
		else
		{
			res.sendFile('/views/landing/landingDebug.html', {root:"./"});
		}
	})

// Apis
app.get('/api/enums.js', function (req, res) {
	require('../api/enums.js').run(req,res);
})

app.get('/api/getEvents', checkAdmin, function (req, res) {
	require('../api/getEvents.js').run(req,res);
})

app.get('/api/getEvent', checkAdmin, function (req, res) {
	require('../api/getEvent.js').run(req,res);
})

app.get('/api/getMembers', checkAdmin, function (req, res) {
	require('../api/getMembers.js').run(req,res);
})

app.post('/api/updateEventAttendance', checkAdmin, bufferPostData, function (req, res) {
	require('../api/updateEventAttendance.js').run(req,res);
})

app.post('/events/new', checkAdmin, bodyParser.urlencoded({extended: true}), function (req, res) {
	require('../api/newEvent.js').run(req,res);
})

app.post('/api/updateEvent', bufferPostData, checkAdmin, function (req, res) {
	require('../api/updateEvent.js').run(req,res);
})

app.post('/api/updateMember', checkAdmin, bufferPostData, function (req, res) {
	require('../api/updateMember.js').run(req,res);
})

app.get('/*', function (req, res) {
	res.redirect("/");
});


function checkAdmin(req,res,next)
{	
	if(req.session.role === 1)
		next();
	else
		res.redirect("/");
}

function sendIfExists(url, res)
{
	var modURL = url;

	if(modURL[0] == "/")
		modURL = "." + modURL;

	if(fs.existsSync(modURL))
	{
		res.sendFile(url, {root:"./"})
	}
	else
	{
		res.send("404 error sad");
	}
}

function sendFileWithCRSF(filename, req, res)
{
	fs.readFile(filename, function(err, data) 
	{
        if (err) 
        {
            res.send(404);
            return;
        } 
        else
        {
            res.contentType('text/html'); // Or some other more appropriate value
            data = data.toString('utf-8');
            data = data.replace("{{crsf}}", req.session.crsf);
            res.send(data);
            return;
        }
    });
}


function bufferPostData(req, res, next) 
{
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = JSON.parse(data);
        next();
    });
}



if(settings.HTTPS)
{
	https.createServer({
		key: fs.readFileSync(settings.KEY),
		cert: fs.readFileSync(settings.CERT),
		passphrase: settings.PASSPHRASE
	}, app)
	.listen(443, function () {
  		console.log('Example app listening on port 443!')
	});

	app2 = express();
	app2.get("/*", function(req,res){
		res.redirect("https://" + req.headers.host + req.url); 
	});

	app2.listen(port);
}
else
{
	app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

