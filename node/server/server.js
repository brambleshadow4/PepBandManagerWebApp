var express = require('express')
var fs = require('fs')
var app = express()
const port = 80;

function URLPattern(url, str)
{
	return url.substring(0, str.length)
}


// Always allow access to the assets folder; no login necessary.
app.get('/assets/*', function (req, res) {
	res.sendFile(req.url, {root:"./"});
});

app.get('/', function (req, res) {
	res.sendFile('/views/landing/landing.html', {root:"./"})
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))