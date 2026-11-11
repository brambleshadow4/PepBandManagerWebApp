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

	db.all("SELECT * FROM Instruments", [], (err, rows) =>
	{
		if (err) 
		{
			db.close();
			throw err;
		}

		var instruments = {};

		for (var i = 0; i < rows.length; i++) {
			instruments[rows[i].id] = rows[i].name;
		}
	

		var sql = `
		SELECT m.id, m.netid, m.first_name, m.last_name, m.instrument_id, m.nick_name,
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
			WHERE e.season_id = ? 
		)
		ORDER BY m.instrument_id ASC, points DESC`;


		db.all(sql, [season, season], (err, rows) => 
		{
			if (err) 
			{
				db.close();
				throw err;
			}

			output = "Email,Points,Nickname,First,Last,Instrument" + '\n'

			for(var i =0; i<rows.length; i++ )
			{
				if(i != 0) 
				{
					output += '\n';
				}
				netid = rows[i]["netid"];
				if(!netid.includes("@ithaca.edu")) {
					netid = netid + "@cornell.edu";
				}
				output += netid.replace(',','.') + ',' + rows[i]["points"] + ',' + rows[i]["nick_name"] + ',' + rows[i]["first_name"].replace(',','.') + ',' + rows[i]["last_name"].replace(',','.') + ',' + instruments[rows[i]["instrument_id"]].replace(',','.');
			}

			res.attachment('points.csv');
			res.status(200).send(output);
		});
	});
	// close the database connection
	
};

 
