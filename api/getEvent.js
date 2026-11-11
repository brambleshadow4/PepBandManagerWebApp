const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	
	let data = {};

	if (req.query.id == undefined || isNaN(Number(req.query.id)))
	{
		res.writeHead(400);
		res.end("Must specify an event ID, e.g. getEvents?id=42");
		return;
	}

	db.all("SELECT * FROM Events WHERE id = ?", [Number(req.query.id)], (err, rows) => 
	{
		if (err) 
			throw err;

		if(rows.length > 0)
		{
			data = rows[0];

			db.all("SELECT * FROM Event_Attendance WHERE event_id = ?", [Number(req.query.id)], (err, rows) => 
			{
				if (err) 
					throw err;

				data.attendees = {};

				rows.forEach((row) => {
			
					if(row.status == undefined || row.status == null)
						row.status = 2;

					data.attendees[row.member_id] = row;
				});

				res.setHeader("Content-Type", "text/json");
				res.writeHead(200);
				res.end(JSON.stringify(data, undefined, 4));
			});

		}
		else
		{
			res.setHeader("Content-Type", "text/json");
			res.writeHead(404);
			res.end("{}");
		}
	});

	// close the database connection
	db.close();
};

 
