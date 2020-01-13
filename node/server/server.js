const express = require('express');
const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express()


app.use(require('cookie-parser')());
app.use(require('express-session')(
	{secret: "idk what this does"}
));


const port = 80;


app.get('/login', function (req, res) {
	req.session.isAdmin = true;
	req.session.crsf = uuidv4();
	res.redirect("/events");
});

// Always allow access to the assets folder; no login necessary.
app.get('/assets/*', function (req, res) {
	sendIfExists(req.url, res);
});

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

app.get('/', function (req, res) {
	res.sendFile('/views/landing/landing.html', {root:"./"})
})

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


app.get('/*', function (req, res) {
	res.redirect("/");
});


function checkAdmin(req,res,next)
{	

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
	fs.readFile(filename, function(err, data) {
        if (err) {
            res.send(404);
        } else {
            res.contentType('text/html'); // Or some other more appropriate value
            data = data.toString('utf-8');
            data = data.replace("{{crsf}}", req.session.crsf);
            res.send(data);
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



app.listen(port, () => console.log(`Example app listening on port ${port}!`))