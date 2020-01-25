const sqlite3 = require('sqlite3').verbose();
const uuidv4 = require('uuid/v4');

exports.run = async function(req, res) 
{
	/**
	 * Roles:
	 * -1 Not in pepband
	 *  0 Pepband Member 
	 *  1 Admin
	 */
	if(req.settings.HTTPS)
	{
		req.session.netID = await verify().catch(function(arg)
		{
			console.error(arg);
			return "";
		});

		req.session.role = await getRoleFromDb(req.session.netID);

	}
	else if(req.settings.NO_AUTH)
	{
		req.session.netID = "";
		req.session.role = 1;
	}
	else //ROLE DEBUG MODE
	{
		console.log(req.body);
		req.session.netID = req.body.netID;

		req.session.role = await getRoleFromDb(req.session.netID);
	}

	req.session.crsf = uuidv4();

	if(req.session.role === 1)
		res.redirect("/events");
	else if(req.session.role === 0)
		res.redirect("/profile");
	else
		res.redirect("/join");
}


async function verify() 
{
	const OAuth2Client = require('google-auth-library');
	const client = new OAuth2Client(CLIENT_ID);

	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID,	
		// Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	const userid = payload['sub'];

	console.log(payload);

	return "";
	// If request specified a G Suite domain:
	//const domain = payload['hd'];
}

async function getRoleFromDb(netID)
{
	let db = new sqlite3.Database('./db/pepband.db');

	async function getAdminRole()
	{
		return new Promise(
			function(resolve, reject)
			{
				db.all("SELECT * FROM Admins WHERE netid=?", [netID], (err, rows) => 
				{
					if (err) 
						reject(err);

					if(rows.length > 0)
						resolve(rows[0].role);
					else
						resolve(null);
				});
			}
		)
	}

	async function isMember(netID)
	{
		return new Promise(
			function(resolve, reject)
			{
				db.all("SELECT * FROM Members WHERE netid=?", [netID], (err, rows) => 
				{
					if (err) 
						reject(err);

					if(rows.length > 0)
						resolve(true);
					else
						resolve(false);
				});
			}
		)
	}

	async function allQueries(netID) 
	{
		return {
			isMember: await isMember(netID),
			role: await getAdminRole(netID)
	  	}
	}

	
	try
	{
		var roles = await allQueries(netID);
		db.close();

		if(roles.role === null)
			return roles.isMember ? 0 : -1; 
		return roles.role;
	}
	catch(e)
	{
		console.log(e);
		db.close();
		return -1;
	}
}
