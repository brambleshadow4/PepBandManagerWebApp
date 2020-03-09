const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let members = [];
	var sql;
	var season = 0;

	do
	{
		if(!req.body)
			break;

		if(!req.body.token || req.body.token != req.session.crsf)
			{ console.log("token problem"); break;}

		if(isNaN(Number(req.body.event_id)) 
			|| isNaN(Number(req.body.member_id)))
		{
			break;
		}

		if(req.body.delete !== undefined)
		{
			let db = new sqlite3.Database('./db/pepband.db');
			db.all("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?", [req.body.member_id, req.body.event_id], (err, rows) => 
			{
				if(err) throw err;

				res.setHeader("Content-Type", "text/json");
				res.writeHead(200);
				res.end();
			});

			db.close();
			return;
		}

		if(isNaN(Number(req.body.note)) || isNaN(Number(req.body.instrument_id)) || isNaN(Number(req.body.status)))
		{ 
			console.log("something's not a number"); 
			break;
		}

		var points = null;

		if(req.body.points !== undefined)
		{
			if(isNaN(req.body.points))
				break;
			points = req.body.points;
		}

	
		params = [
			req.body.member_id,
			req.body.event_id,
			points,
			req.body.note,
			req.body.instrument_id,
			req.body.status
		];

		params2 = 
		[
			req.body.member_id,
			req.body.event_id,
			
		]

	
		let db = new sqlite3.Database('./db/pepband.db');
	
		db.all("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?", [req.body.member_id, req.body.event_id], (err, rows) => 
		{
			if(err) throw err;

			db.all("INSERT INTO Event_Attendance (member_id, event_id, points, note, instrument_id, status) VALUES (?, ?, ?, ?, ?, ?)", params, (err,rows) => {

				if (err) throw err;

				res.setHeader("Content-Type", "text/json");
				res.writeHead(200);
				res.end();
					
			});
		});

		// close the database connection*/
		db.close();
		return;

	}
	while(false);


	res.writeHead(400);
	res.end();
};

 
