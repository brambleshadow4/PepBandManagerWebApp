const express = require('express');
const uuidv4 = require('uuid/v4');
const https = require('https')
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express()

var settings = {}
settings.raw = fs.readFileSync("server/settings.txt");
settings.online = settings.raw.indexOf("ONLINE=true") != -1;

app.use(require('cookie-parser')());
app.use(require('express-session')(
	{secret: "idk what this does"}
));

const port = 80;

app.get('/login', function (req, res) {

	if(!settings.online)
	{
		res.redirect("/events");
		return;
	}
	
	require('./server/auth.js').run(req,res);
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
		if(settings.online)
			res.sendFile('/views/landing/landing.html', {root:"./"})
		else
			res.redirect("/events");
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
	if(!settings.online)
	{
		next();
		return;
	}

	if(req.session.isAdmin)
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



if(settings.online)
{
	https.createServer({
		key: fs.readFileSync('server/server.key'),
		cert: fs.readFileSync('server/server.cert'),
		passphrase: 'jeremy'
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

