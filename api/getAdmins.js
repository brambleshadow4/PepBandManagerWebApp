const sqlite3 = require('node:sqlite');
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');
	let data = {};

	let rows = db.prepare("SELECT * FROM Admins").all()
	
	res.setHeader("Content-Type", "text/json");
	res.writeHead(200);
	res.end(JSON.stringify(rows));

	// close the database connection
	db.close();
};

 
