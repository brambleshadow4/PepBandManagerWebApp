const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let members = [];
	var sql;
	var season = 0;

	console.log(req.body);

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
			db.all("DELETE FROM Event_Attendance WHERE event_id=?", [req.body.event_id], (err, rows) => 
			{
				if(err) throw err;

				db.all("DELETE FROM Events WHERE id=$id", [req.body.event_id], (err,rows) => {

					if (err) throw err;

					res.setHeader("Content-Type", "text/json");
					res.writeHead(200);
					res.end();

				});
			});

			db.close();

			return;
		}

		if(req.body.name === undefined
			|| req.body.default_points === undefined
			|| req.body.date === undefined
			|| req.body.description === undefined
			|| req.body.event_type === undefined
		)
		{
			console.log ("undefied field probelm"); 
			break;
		};

		if(isNaN(Number(req.body.event_type)) || isNaN(Number(req.body.default_points)))
		{
			console.log ("not a number problem"); 
			break;
		};

		if(!(/\d\d\d\d-\d\d-\d\d/.exec(req.body.date)))
			break;

		let db = new sqlite3.Database('./db/pepband.db');

		var sql = 
		`UPDATE Events 
		SET name= ?, event_type_id= ?, date=?, default_points= ?, description= ?
		WHERE id= ?`;

		params = [
			req.body.name,
			req.body.event_type,
			req.body.date,
			req.body.default_points,
			req.body.description,
			req.body.event_id
		];
	
		db.all(sql, params, (err, rows) => 
		{
			if(err) throw err;

			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end();
		});

		// close the database connection*/
		db.close();
		return;

	}
	while(false);


	res.writeHead(400);
	res.end();
};

