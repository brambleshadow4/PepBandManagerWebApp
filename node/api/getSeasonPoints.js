const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');

	var query = req.originalUrl.substr(req.originalUrl.indexOf('?')+1);
	var season = Number(query.replace("season=",""))

	if(isNaN(season))
	{
		var season = 0;
	}

	var sql = `
	SELECT m.id,
	(
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
		FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
		WHERE member_id = m.id AND e.season_id = ? AND e.date < date('now') AND att.status > 1
	)
	AS points
	FROM members m
	WHERE m.id IN (
		SELECT att.member_id 
		FROM event_attendance att INNER JOIN events e on att.event_id = e.id
		WHERE e.season_id = ? )
	`;

	db.all(sql, [season, season], (err, rows) => 
	{
		db.close();
		if (err) 
		{
			throw err;
		}

		var members = [];

		rows.forEach((row) => {
			members.push(row);
		});

		res.setHeader("Content-Type", "text/json");
		res.writeHead(200);
		res.end(JSON.stringify(members, undefined, 4));
	});	
};

 
