var express = require('express')
var fs = require('fs')
var app = express()
const port = 80;

//load other modules
const enums = require('../api/enums.js');
const getEvents = require('../api/getEvents.js');
const getEvent = require('../api/getEvent.js');
const getMembers = require('../api/getMembers.js');

// Always allow access to the assets folder; no login necessary.
app.get('/assets/*', function (req, res) {
	sendIfExists(req.url, res);
});


app.get('/events', checkAdmin, function (req, res) {
	res.sendFile('/views/events/events.html', {root:"./"})
});

app.get('/events/*', checkAdmin, function (req, res) {
	sendIfExists("/views" + req.url, res);
})

// editEvent
app.get('/editEvent', checkAdmin, function (req, res) {
	res.sendFile('/views/editEvent/editEvent.html', {root:"./"})
});

app.get('/editEvent/*', checkAdmin, function (req, res) {
	sendIfExists("/views" + req.url, res);
})


app.get('/', function (req, res) {
	res.sendFile('/views/landing/landing.html', {root:"./"})
})

app.get('/api/enums.js', function (req, res) {
	enums.run(req,res);
})

app.get('/api/getEvents', checkAdmin, function (req, res) {
	getEvents.run(req,res);
})

app.get('/api/getEvent', checkAdmin, function (req, res) {
	getEvent.run(req,res);
})

app.get('/api/getMembers', checkAdmin, function (req, res) {
	getMembers.run(req,res);
})


function checkAdmin(req,res,next)
{
	if(true)
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



app.listen(port, () => console.log(`Example app listening on port ${port}!`))