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

var Template  = {
	AdminNav: fs.readFileSync('components/navigation.template.html', 'utf8'),
	MemberNav: fs.readFileSync('components/navUser.template.html', 'utf8'),
}



app.use(require('cookie-parser')());
app.use(require('express-session')({
	secret: settings['COOKIE_SECRET'] || "idk what this does",
	unset: "destroy",
	resave: false,
	saveUninitialized: false,
	secure: settings['HTTPS']
}));

const port = settings["PORT"] || 80;

yep("/components/memberSearchBox.js");
yep("/components/memberSearchBox.css");


app.get('/pepband.db', checkAdmin, function (req, res) {
	sendIfExists("/db/pepband.db", res);
})

app.get('/.well-known/*', function(req, res) {
	sendIfExists("./" + req.url, res); 
});



// login & logout

	app.post('/login', bodyParser.urlencoded({extended: true}), function (req, res) {	
		req.settings = settings;
		require('./auth.js').run(req,res);
	});

	app.get('/logout', function (req, res) {	
		delete req.session;
		res.redirect("/");
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

	app.get('/editEvent/printout.pdf', checkAdmin, function (req, res) {
		require('../views/editEvent/createEventList.js').run(req,res);
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

// plan
	app.get('/plan', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/plan/plan.html', req, res);
	});

	app.get('/plan/*', checkAdmin, function (req, res) {
		sendIfExists("/views" + req.url, res);
	})

//join
	app.get('/join', function (req, res) {
		res.sendFile('./views/join/join.html', {root:"./"});
	});



// profile
	app.get('/profile', checkMember, function (req, res) {

		var fills = {"nav": Template.MemberNav};
		if(req.session.role === 1)
			fills = {"nav": Template.AdminNav}

		fills.crsf = req.session.crsf;

		templateResponse("./views/profile/profile.html", fills, req ,res);
	});

	app.get('/profile/*', function (req, res) {
		sendIfExists("/views" + req.url, res);
	})


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

	app.get('/landing/*', function (req, res) {
		sendIfExists("/views" + req.url, res);
	})

// Seasons
	app.get('/seasons', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/tableEdit/tableEdit.html', req, res);
	});

	app.get('/access', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/tableEdit/tableEdit.html', req, res);
	});

	app.get('/instruments', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/tableEdit/tableEdit.html', req, res);
	});

	app.get('/eventTypes', checkAdmin, function (req, res) {
		sendFileWithCRSF('./views/tableEdit/tableEdit.html', req, res);
	});

	app.get('/tableEdit/*', checkAdmin, function (req, res) {
		sendIfExists("./views" + req.url, res);
	})

// Get Apis
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

	app.get('/api/getSeasonPoints', checkAdmin, function (req, res) {
		require('../api/getSeasonPoints.js').run(req,res);
	})

	app.get('/api/getMemberPoints', checkAdmin, function (req, res) {
		require('../api/getMemberPoints.js').run(req,res);
	})

	app.get('/api/getLifetimePoints', checkAdmin, function (req, res) {
		require('../api/getLifetimePoints.js').run(req,res);
	})

	app.get('/api/getAdmins', checkAdmin, function (req, res) {
		require('../api/getAdmins.js').run(req,res);
	})

	app.get('/api/getProfile', function (req, res) {
		require('../api/getProfile.js').run(req,res);
	})


// Post APIs
app.post('/api/updateEventAttendance', checkAdmin, bufferPostData, function (req, res) {
	require('../api/updateEventAttendance.js').run(req,res);
})

app.post('/events/new', checkAdmin, bufferPostData, function (req, res) {
	require('../api/newEvent.js').run(req,res);
})

app.post('/api/updateEvent', bufferPostData, checkAdmin, function (req, res) {
	require('../api/updateEvent.js').run(req,res);
})

app.post('/api/updateMember', checkAdmin, bufferPostData, function (req, res) {
	require('../api/updateMember.js').run(req,res);
})

app.post('/api/updateTable', checkAdmin, bufferPostData, function (req, res) {
	require('../api/updateTable.js').run(req,res);
})

// this one is the only one that non-admins can run.
app.post('/api/updateSignup', bufferPostData, function (req, res) {
	require('../api/updateSignup.js').run(req,res);
})


app.get('/*', function (req, res) {
	res.redirect("/");
});

function yep(url)
{
	app.get(url, function(req,res){
		res.sendFile(url, {root:"./"})
	})
}


function checkAdmin(req,res,next)
{	
	if(req.session.role === 1)
		next();
	else
		res.redirect("/");
}

function checkMember(req,res,next)
{	
	if(req.session.netID === undefined || req.session.netID === "")
		res.redirect("/");
	else
		next();
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

function templateResponse(template, fills, req, res)
{
	fs.readFile(template, function(err, data) 
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

			for(var key in fills)
			{
				data = data.replace("{{" + key + "}}", fills[key]);
			}

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

