const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let members = [];
	var sql;
	var season = 0;

	do
	{
		if(!req.body)
			break;

		if(req.body.token === undefined || req.body.token != req.session.crsf)
			{console.log ("crsf problem"); break;}


		console.log(req.body);

		if(req.body.new_netid !== undefined && (typeof req.body.new_netid) == "string")
		{
			if(req.body.new_netid.trim() == "")
				break;


			req.body.new_netid = req.body.new_netid.trim();

			let db = new sqlite3.Database('./db/pepband.db');
			if(req.body.id === -1)
			{
				db.all(
					`INSERT INTO Members (netid, first_name, last_name, nick_name, class_year, instrument_id)
					VALUES (?, '', '', '', ?, 0);`, [req.body.new_netid, new Date().getFullYear()], (err, rows) => 
				{
					if(err)
					{
						console.log(err);
						res.setHeader("Content-Type", "text/json");
						res.writeHead(400);
						res.end('{"error": "netid already in use"}');

						db.close();
						return; 
					}

					db.all("SELECT id FROM Members WHERE netid = ?", [req.body.new_netid], (err, rows) => 
					{
						if(err) throw err;

						res.setHeader("Content-Type", "text/json");
						res.writeHead(200);
						res.end('{"id": ' + rows[0].id + '}');

						db.close();
					});
				});

				return;
			}
			else
			{
				db.all("UPDATE Members SET netid=? WHERE id= ?", [req.body.new_netid, req.body.id], (err, rows) => 
				{
					if(err)
					{
						res.setHeader("Content-Type", "text/json");
						res.writeHead(400);
						res.end('{"error": "netid already in use"}');
					}

					else
					{
						res.setHeader("Content-Type", "text/json");
						res.writeHead(200);
						res.end('{}');
					}
				});
			}

			db.close();
			return;
		}


		if(req.body.id === undefined || isNaN(Number(req.body.id)))
		{
			console.log ("id problem"); 
			console.log(req.body.id);
			break;
		};

		if(req.body.delete !== undefined)
		{
			let db = new sqlite3.Database('./db/pepband.db');
			db.all("DELETE FROM Event_Attendance WHERE member_id=?", [req.body.id], (err, rows) => 
			{
				if(err) throw err;

				db.all("DELETE FROM Members WHERE id=?", [req.body.id], (err,rows) => {

					if (err) throw err;

					res.setHeader("Content-Type", "text/json");
					res.writeHead(200);
					res.end();

				});
			});

			db.close();

			return;
		}

		

		if(req.body.first_name === undefined
			|| req.body.last_name === undefined
			|| req.body.nick_name === undefined
			|| req.body.class_year === undefined
			|| req.body.instrument_id === undefined
		)
		{
			console.log ("undefied field problem"); 
			break;
		};

		if(isNaN(Number(req.body.class_year)) || isNaN(Number(req.body.instrument_id)))
		{
			console.log ("not a number problem"); 
			break;
		};


		let db = new sqlite3.Database('./db/pepband.db');

		var sql = 
		`UPDATE Members
		SET first_name=?, last_name=?, nick_name=?, class_year=?, instrument_id=?
		WHERE id=?`;

		params = [
			req.body.first_name,
			req.body.last_name,
			req.body.nick_name,
			req.body.class_year,
			req.body.instrument_id,
			req.body.id
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

