const sqlite3 = require('node:sqlite');
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	
	let data = {};

	if (req.query.id == undefined || isNaN(Number(req.query.id)))
	{
		res.writeHead(400);
		res.end("Must specify an event ID, e.g. getEvents?id=42");
		return;
	}

	try 
	{
		let rows = db.prepare("SELECT * FROM Events WHERE id = ?").all({}, Number(req.query.id))
		
		if(rows.length > 0)
		{
			data = rows[0];

			let rows2 = db.prepare("SELECT * FROM Event_Attendance WHERE event_id = ?").all({}, Number(req.query.id)); 
			

			data.attendees = {};

			rows2.forEach((row) => {
		
				if(row.status == undefined || row.status == null)
					row.status = 2;

				data.attendees[row.member_id] = row;
			});

			res.setHeader("Content-Type", "text/json");
			res.writeHead(200);
			res.end(JSON.stringify(data, undefined, 4));
		}
	}
	catch(e)
	{
		console.error(e);
		res.setHeader("Content-Type", "text/json");
		res.writeHead(404);
		res.end("{}");
	}


	// close the database connection
	db.close();
};

 
