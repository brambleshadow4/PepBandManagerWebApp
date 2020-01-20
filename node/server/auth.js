const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	const OAuth2Client = require('google-auth-library');
	const client = new OAuth2Client(CLIENT_ID);
	async function verify() 
	{
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID,	// Specify the CLIENT_ID of the app that accesses the backend
			// Or, if multiple clients access the backend:
			//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
		});
		const payload = ticket.getPayload();
		const userid = payload['sub'];

		console.log(payload);


		//load appropriate data into session.
		req.session.netid = "";
		req.session.role = -1;

		/**
		 * Roles:
		 * -1 Not in pepband
		 *  0 Pepband Member 
		 *  1 Admin
		 */

		let db = new sqlite3.Database('./db/pepband.db');
		var doneCounter = 2;


		db.all("SELECT * FROM Admins WHERE netid=?", [req.session.netid], (err, rows) => 
		{
			if (err) 
				throw err;

			if(rows.length > 0)
			{
				req.session.role = rows[0].role;
			}

			after();
		});

		db.all("SELECT * FROM Members WHERE netid=?", [req.session.netid], (err, rows) => 
		{
			if (err) 
				throw err;

			if(rows.length > 0)
			{
				if(req.session.role == -1)
					req.session.role = 0;
			}

			after();
		});


		function after()
		{
			doneCounter--;
			if(doneCounter > 0) 
				return;

			if(req.session.role === 1)
			{
				res.redirect("/events");
				return
			}

			if(req.session.role === 0)
			{
				res.redirect("/profile");
				return;
			}

			res.redirect("/join");
		}

		// If request specified a G Suite domain:
		//const domain = payload['hd'];
	}
	verify().catch(console.error);
}
