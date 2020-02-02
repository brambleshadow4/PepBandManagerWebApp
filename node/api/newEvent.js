const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');

	if(!req.body || !req.body.token || req.body.token != req.session.crsf)
	{
		res.writeHead(400);
		res.end();
		db.close();
		return;
	}

	if(req.body.season == undefined || isNaN(Number(req.body.season)))
	{
		res.writeHead(400);
		res.end();
		db.close();
		return;
	}

	db.all("SELECT MAX(id) AS max FROM Events", [], (err, rows) => 
	{
		if (err) 
			throw err;

		if(rows.length > 0)
		{
			max = rows[0].max+1;


			var sql =  `INSERT INTO Events (id, season_id, name, default_points, event_type_id, date, description)
						VALUES (?, ?, 'New Event', 2, 0, ?, '')`;
			db.all(sql, [max, req.body.season, new Date().toISOString().substring(0,10)], (err, rows) =>
			{
				if (err)
					throw err;
				
				res.setHeader("Content-Type", "text/json");
				res.writeHead(200);
				res.end("\"editEvent?" + max + '"');
			});

		}
		
	});

	// close the database connection
	db.close();
};

 
