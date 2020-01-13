const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	
	let members = [];
	var sql;
	var season = 0;

	if (req.query.season == undefined || isNaN(Number(req.query.season)))
	{
		sql = "SELECT * FROM Members";
		params = [];
	}
	else
	{
		sql =  `SELECT * FROM Members
				WHERE id IN (
					SELECT att.member_id 
					FROM Event_Attendance att INNER JOIN Events e on att.event_id = e.id 
					WHERE e.season_id IN (?, ?)
				);`
		params = [Number(req.query.season), Number(req.query.season)-1];
	}

	db.all(sql, params, (err, rows) => 
	{
		if (err) 
			throw err;

		rows.forEach((row) => {
			members.push(row);
		});

		res.setHeader("Content-Type", "text/json");
		// res.writeHead(200);
		res.end(JSON.stringify(members, undefined, 4));
	});

	// close the database connection
	db.close();

};

 
