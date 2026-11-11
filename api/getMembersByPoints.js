const sqlite3 = require('node:sqlite');
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
	SELECT m.first_name, m.last_name, m.instrument_id, m.nick_name, m.class_year,
	(
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
		FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
		WHERE member_id = m.id`;
	if(season != -1)
		sql += ` AND e.season_id = ?`;
	sql += `
	)
	AS points
	FROM members m
	WHERE m.id IN (
		SELECT att.member_id 
		FROM event_attendance att INNER JOIN events e on att.event_id = e.id`;
	if(season != -1)
	{
		sql += `
	WHERE e.season_id = ?`;
	} else {
		sql += `
		WHERE ? = ?`;
	}
	sql += `
	)
	ORDER BY points DESC, m.instrument_id ASC`;

	let rows = db.prepare(sql).all({}, season, season)


	var members = [];

	rows.forEach((row) => {
		members.push(row);
	});

	res.setHeader("Content-Type", "text/json");
	res.writeHead(200);
	res.end(JSON.stringify(members, undefined, 4));
	db.close();
};

 
