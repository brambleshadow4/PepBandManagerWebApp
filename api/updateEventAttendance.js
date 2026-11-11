const sqlite3 = require('node:sqlite');
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
			db.prepare("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?").all({}, req.body.member_id, req.body.event_id);
			
			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end();

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
	
		db.prepare("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?").all({}, req.body.member_id, req.body.event_id)
		
		db.prepare("INSERT INTO Event_Attendance (member_id, event_id, points, note, instrument_id, status) VALUES (?, ?, ?, ?, ?, ?)").all({}, ...params)


		res.setHeader("Content-Type", "text/json");
		res.writeHead(200);
		res.end();
					

		// close the database connection*/
		db.close();
		return;

	}
	while(false);


	res.writeHead(400);
	res.end();
};

 
