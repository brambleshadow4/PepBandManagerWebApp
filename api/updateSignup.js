const sqlite3 = require('sqlite3').verbose();
exports.run = async function(req, res) 
{
	let members = [];
	var sql;
	var season = 0;

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

	do
	{
		if(req.session.role == undefined || req.session.role < 0)
			break;

		if(!req.body)
			break;

		if(!req.body.token || req.body.token != req.session.crsf)
		{ 
			console.log("token problem"); 
			break;
		}



		if(isNaN(Number(req.body.event_id))) break;

		var isOpen = await query("SELECT * FROM Events WHERE id=? AND open_signup = 1",[req.body.event_id]);

		if(isOpen.length != 1) break;


		if(req.body.delete !== undefined)
		{
			
			var rows = await query("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?", [req.session.member_id, req.body.event_id])
		
			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end("{}");
			

			db.close();
			return;
		}

		if(req.body.instrument !== undefined && !isNaN(Number(req.body.instrument)))
		{
			var instrumentRow = await query("SELECT * FROM Instruments WHERE id = ?", [req.body.instrument]);

			if(instrumentRow.length != 1) break;

			await query("DELETE FROM Event_Attendance WHERE member_id=? AND event_id=?", [req.session.member_id, req.body.event_id])

			await query("INSERT INTO Event_Attendance (event_id, member_id, status, instrument_id, note) VALUES (?, ?, 1, ?, 0)",
				[req.body.event_id, req.session.member_id, req.body.instrument]);

			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end("{}");
			db.close();
			return;
		}

		
		// close the database connection*/
		

	}
	while(false);

	db.close();
	res.writeHead(400);
	res.end("{}");
};

 
