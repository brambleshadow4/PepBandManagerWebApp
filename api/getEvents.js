const sqlite3 = require('node:sqlite');
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	
	let events = [];

	if (req.query.season == undefined || isNaN(Number(req.query.season)))
	{
		res.writeHead(400);
		res.send("Must specify season as a URL parameter, e.g. getEvents.php?season=42");
	}

	let rows = db.prepare("SELECT * FROM Events WHERE season_id = ? ORDER BY date").all({} ,Number(req.query.season));
	

	rows.forEach((row) => {
		events.push(row);
	});

	res.setHeader("Content-Type", "text/json");
	res.writeHead(200);
	res.end(JSON.stringify(events, undefined, 4));

	// close the database connection
	db.close();

};

 
