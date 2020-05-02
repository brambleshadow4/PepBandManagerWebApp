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

	
	async function getMemberId(netId)
	{
		let rows = await query("SELECT id FROM Members WHERE netid=?", [netId]);
		return rows[0].id;
	}

	async function getCurrentSeasonId()
	{
		let rows = await query("SELECT MAX(id) as id FROM Seasons", []);
		return rows[0].id
	}

	async function getMemberInfo(userId)
	{
		let rows = await query("SELECT first_name, last_name, instrument_id, class_year FROM Members WHERE id= ?", [userId]);

		if(rows.length)
			return {
				name: rows[0].first_name + " " + rows[0].last_name,
				instrument_id: rows[0].instrument_id,
				class_year: rows[0].class_year
			}
		else
			return {};
	}


	async function getSeasonPoints(memberId, seasonId)
	{
		let rows = await query(`
			SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) as points
			FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
			WHERE member_id = ? AND e.season_id = ? AND e.date < date('now') AND att.status > 1`, [memberId, seasonId]);

		if(rows.length)
			return rows[0].points
		else
			return null;
	}

	async function getLifetimePoints(memberId)
	{
		let rows = await query(`
			SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) as points
			FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
			WHERE member_id = ? AND e.date < date('now') AND att.status > 1`, [memberId]);

		if(rows.length)
			return rows[0].points
		else
			return null;
	}


	async function getSeasonHistory(memberId)
	{
		let rows = await query(`
			SELECT e.name, e.event_type_id, e.date, COALESCE(att.points, e.default_points) points, e.season_id, e.location_id
			FROM Members m
			INNER JOIN Event_Attendance att ON att.member_id = m.id
			INNER JOIN Events e ON att.event_id = e.id
			WHERE m.id = ? AND att.status > 1
			ORDER BY e.date DESC`, [memberId]);

		
		var eventList = {}
		for(var i=0; i<rows.length; i++)
		{
			var row = rows[i];

			if(eventList[row.season_id] == undefined)
			{
				eventList[row.season_id] = [] 
			}

			eventList[row.season_id].push(row)
		}

		var eventListArray = [];

		for(var key in eventList)
		{
			eventListArray.push({id: key, events: eventList[key]})
		}

		return eventListArray;
	}

	async function getSignups()
	{
	
		let openEvents = await query(`
			SELECT * 
			FROM Events
			WHERE open_signup = 1`, []);

		let eventsSignedUpFor = await query(`
			SELECT *
			FROM Event_Attendance ea INNER JOIN Events e ON ea.event_id = e.id
			WHERE ea.member_id = ? AND (((ea.status == 1 OR ea.status == 3) AND e.date >= date('now')) OR e.open_signup = 1)
			`, [memberId]);


		var events = {};

		for(var i=0; i<openEvents.length; i++)
		{
			var ev = openEvents[i];
			if (events[ev.id] == undefined)
			{
				events[ev.id] = ev;
				ev.status = -1;
				ev.instrument = null;
			}
		}

		for(var i=0; i<eventsSignedUpFor.length; i++)
		{
			var ev = eventsSignedUpFor[i];
			if (events[ev.id] == undefined)
			{
				events[ev.id] = ev;
			}
			else
			{
				events[ev.id].status = ev.status;
			events[ev.id].instrument_id = ev.instrument_id;
			}
		}

		var rows = [];
		for(var key in events)
		{
			rows.push(events[key]);
		}

		rows.sort(function(a,b)
		{
			return a.date < b.date;
		})

		rows = rows.map(function(ev){ return { status: ev.status, instrument_id: ev.instrument_id,
			description: ev.description,
			date: ev.date,
			default_points: ev.default_points,
			name: ev.name,
			open_signup: ev.open_signup,
			id: ev.id
		}});

		return rows
	}

	var netId = req.session.netID;
	var data;

	try{
		data = await Promise.all([getCurrentSeasonId(), getMemberId(netId)])
	}
	catch(e)
	{
		res.setHeader("Content-Type", "text/json");
		res.writeHead(400);
		res.end("{}");
		return;
	}


	var seasonId = data[0];
	var memberId = data[1];

	if(req.session.role == 1 && req.query.id != undefined && !isNaN(Number(req.query.id)))
	{
		memberId = Number(req.query.id);
	}
	
	var profile = {
		member: getMemberInfo(memberId),
		season_points: getSeasonPoints(memberId, seasonId),
		lifetime_points: getLifetimePoints(memberId),
		signups: getSignups(),
		seasons: getSeasonHistory(memberId),
	}



	await Promise.all([profile.name]);

	for(var key in profile)
	{
		profile[key] = await profile[key];
	}

	res.setHeader("Content-Type", "text/json");
	res.writeHead(200);
	res.end(JSON.stringify(profile, undefined, 4));

	// close the database connection*/
	db.close();
	return;



	/*res.setHeader("Content-Type", "text/json");
	res.writeHead(400);
	res.end(JSON.stringify(errors));*/
};

