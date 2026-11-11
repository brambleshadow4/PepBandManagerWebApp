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
			{console.log ("crsf problem"); break;}

		if(!req.body.event_id || isNaN(Number(req.body.event_id)))
			{console.log ("event id problem"); break;};

		if(req.body.delete !== undefined)
		{
			let db = new sqlite3.Database('./db/pepband.db');
			db.prepare("DELETE FROM Event_Attendance WHERE event_id=?").all({}, req.body.event_id)
			db.prepare("DELETE FROM Events WHERE id=?").all({}, req.body.event_id)
			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end();


			db.close();

			return;
		}

		if(req.body.name === undefined
			|| req.body.default_points === undefined
			|| req.body.date === undefined
			|| req.body.description === undefined
			|| req.body.event_type === undefined
			|| req.body.location_id === undefined
			|| req.body.open_signup === undefined
		)
		{
			console.log ("undefined field problem"); 
			break;
		};

		if(isNaN(Number(req.body.event_type)) || isNaN(Number(req.body.default_points)) || isNaN(Number(req.body.location_id)))
		{
			console.log ("not a number problem"); 
			break;
		};

		if(req.body.open_signup !== 1 && req.body.open_signup !== 0)
			break;

		if(!(/\d\d\d\d-\d\d-\d\d/.exec(req.body.date)))
			break;

		let db = new sqlite3.Database('./db/pepband.db');

		var sql = 
		`UPDATE Events 
		SET name = ?, event_type_id = ?, location_id = ?, date =?, default_points = ?, description = ?, open_signup = ?
		WHERE id = ?`;

		params = [
			req.body.name,
			req.body.event_type,
			req.body.location_id,
			req.body.date,
			req.body.default_points,
			req.body.description,
			req.body.open_signup,
			req.body.event_id
		];

		db.prepare(sql).all({}, ...params)



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

