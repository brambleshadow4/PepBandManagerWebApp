const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	
	let events = [];

	if (req.query.season == undefined || isNaN(Number(req.query.season)))
	{
		res.writeHead(400);
		res.send("Must specify season as a URL parameter, e.g. getEvents.php?season=42");
	}

	db.all("SELECT * FROM Events WHERE season_id = ? ORDER BY date", [Number(req.query.season)], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			events.push(row);
		});

		res.setHeader("Content-Type", "text/json");
		res.writeHead(200);
		res.end(JSON.stringify(events, undefined, 4));
	});

	// close the database connection
	db.close();

};

 
