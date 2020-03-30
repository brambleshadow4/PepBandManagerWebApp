const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	let data = {};

	db.all("SELECT * FROM Admins", [], (err, rows) => 
	{
		if (err) 
			throw err;
		
		res.setHeader("Content-Type", "text/json");
		res.writeHead(200);
		res.end(JSON.stringify(rows));
		
	});

	// close the database connection
	db.close();
};

 
