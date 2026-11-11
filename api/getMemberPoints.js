const sqlite3 = require('sqlite3').verbose();
exports.run = async function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');

	function query(sql, args)
	{
		return new Promise(function(success, fail)
		{
			db.all(sql, args, (err, rows) => 
			{

				if(err)
				{
					db.close()
					fail(err);
				}
				success(rows);
			})

		});
	}

	var queryStr = req.originalUrl.substr(req.originalUrl.indexOf('?')+1);
	var memberId = Number(queryStr.replace("member=",""))

	if(isNaN(memberId))
	{
		res.setHeader("Content-Type", "text/json");
		res.writeHead(400);
		res.end("\"bad id\"");
		return;
	}

	let rows = await query("SELECT MAX(id) as current_season FROM Seasons")
	if(rows.length < 0)
	{
		res.setHeader("Content-Type", "text/json");
		res.writeHead(500);
		res.end('"No seasons error"');
		return;
	}

	var season = rows[0].current_season;

	var sql = `
	SELECT 
	(
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0)
		FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
		WHERE member_id = ? AND e.season_id = ? AND e.date < date('now') AND att.status > 1
	) 
	AS season_points, 
	(
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0)
		FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
		WHERE member_id = ? AND e.date < date('now') AND att.status > 1
	) 
	AS lifetime_points
	`;

	rows = await query(sql, [memberId, season, memberId]);

	if(rows.length < 0)
	{
		res.setHeader("Content-Type", "text/json");
		res.writeHead(500);
		res.end('"Member doesn\'t exit error"');
		return;
	}

	res.setHeader("Content-Type", "text/json");
	res.writeHead(200);
	res.end(JSON.stringify(rows[0], undefined, 4));
};

 
