const sqlite3 = require('sqlite3').verbose();
const {v4: uuidv4} = require('uuid');

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "428252312756-djr3h6is5c0s8lfr5ev3pr1567rnnjat.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

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
		req.session.netID = await verify(req.body.token).catch(function(arg)
		{
			console.error(arg);
			return "";
		});

		var data = await getRoleFromDb(req.session.netID);
		req.session.role = data.role;
		req.session.member_id = data.member_id;

	}
	else if(req.settings.NO_AUTH)
	{
		req.session.netID = "";
		req.session.role = 1;
		req.session.member_id = -1;
	}
	else //ROLE DEBUG MODE
	{
		console.log(req.body);
		req.session.netID = req.body.netID;

		var data = await getRoleFromDb(req.session.netID);
		req.session.role = data.role;
		req.session.member_id = data.member_id;
	}

	req.session.crsf = uuidv4();

	if(req.session.role === 1)
		res.redirect("/events");
	else if(req.session.role === 0)
		res.redirect("/profile");
	else
		res.redirect("/join");
}


async function verify(token) 
{
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID,	
		// Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	const email = payload['email'];

	if(payload['email_verified'])
	{
		if(email.endsWith("@cornell.edu"))
		{
			return email.substring(0, email.length - "@cornell.edu".length);
		}

		return email;
	}
	else
	{
		return "";
	}
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
						resolve(rows[0].id);
					else
						resolve(-1);
				});
			}
		)
	}

	async function allQueries(netID) 
	{
		return {
			member_id: await isMember(netID),
			role: await getAdminRole(netID)
	  	}
	}

	
	try
	{
		var data = await allQueries(netID);
		db.close();

		if(data.member_id >= 0 && data.role === null)
			data.role = 0;

		return data;
	}
	catch(e)
	{
		console.log(e);
		db.close();
		return {
			role: -1,
			member_id: -1
		}
	}
}
