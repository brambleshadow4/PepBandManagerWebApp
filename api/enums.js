const sqlite3 = require('node:sqlite');
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	var data = {
		"seasons": [],
		"default_season": null,
		"instruments": [],
		"event_types": [],
		"attendance_notes": [],
		"locations": [],
	};

	var tasks = 5;
	function done()
	{
		tasks--;
		if(tasks == 0)
		{
			res.setHeader("Content-Type", "text/javascript"); //Solution!
  			res.writeHead(200);
			res.end("var enums = " + JSON.stringify(data, undefined, 4));
		}
	}

	let rows = db.prepare("SELECT * FROM Seasons").all([])

	rows.forEach((row) => {
	data.seasons.push(row);
	if(data.default_season === null || data.default_season < row.id)
		data.default_season = row.id;	
	});

	
	rows = db.prepare("SELECT * FROM Instruments").all([])
	
	rows.forEach((row) => {
		data.instruments.push(row)
	});

	rows = db.prepare("SELECT * FROM Event_Types").all([])

	rows.forEach((row) => {
		data.event_types.push(row)
	});

	rows = db.prepare("SELECT * FROM Attendance_Notes").all([])
	rows.forEach((row) => {
		data.attendance_notes.push(row);
	});

	rows = db.prepare("SELECT * FROM Locations").all([]);
	rows.forEach((row) => {
		data.locations.push(row);
	});

	res.setHeader("Content-Type", "text/javascript"); //Solution!
	res.writeHead(200);
	res.end("var enums = " + JSON.stringify(data, undefined, 4));

	// close the database connection
	db.close();
};

 
