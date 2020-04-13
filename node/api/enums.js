const sqlite3 = require('sqlite3').verbose();
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

	db.all("SELECT * FROM Seasons", [], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			data.seasons.push(row);
			if(data.default_season === null || data.default_season < row.id)
				data.default_season = row.id;
			
		});

		done();
	});

	db.all("SELECT * FROM Instruments", [], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			data.instruments.push(row)
		});

		done();
	});

	db.all("SELECT * FROM Event_Types", [], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			data.event_types.push(row)
		});

		done();
	});

	db.all("SELECT * FROM Attendance_Notes", [], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			data.attendance_notes.push(row);
		});

		done();
	});

	db.all("SELECT * FROM Locations", [], (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			data.locations.push(row);
		});

		done();
	});
	 
	// close the database connection
	db.close();
};

 
