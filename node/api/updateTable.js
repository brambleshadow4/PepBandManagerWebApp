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

	function checkInt(value)
	{
		if(/\d+/.exec(value))
			return Number(value)
		return undefined;
	}

	function checkDate(value)
	{
		if (/\d\d\d\d-\d\d-\d\d/.exec(value) && !isNaN(new Date(value).getTime()))
			return value
		else
			return undefined
	}

	function checkString(value)
	{
		if(value !== undefined)
			return value;
		return undefined
	}

	let errors = [];

	main: do
	{
		if(!req.body)
			break;

		if(!req.body.token || req.body.token != req.session.crsf)
		{
			console.log("crsf problem"); 
			break;
		}

		var schema;
		var deleteValidation;
		var selector;
		var itemName;

		switch(req.body.table)
		{
			case "Seasons":
				schema = {
					"id": checkInt,
					"start_date": checkDate,
					"name": checkString,
				}
				selector = "id";
				deleteValidation = [
					"SELECT * FROM Events WHERE season_id = ?"
				];
				itemName = "season";
				break;
			case "Admins":
				schema = {
					"netid": checkString,
					"role": checkInt,
				}
				selector = "netid";
				deleteValidation = [];
				itemName = "admin";
				break;
			case undefined:
			default: 
				break main;
		}

		var allUpdates = [];

		updates: for(var j in req.body.updates)
		{
			let row = req.body.updates[j]

			for(var key in schema)
			{
				var validate = schema[key];

				if(row[key] === undefined || validate(row[key]) === undefined)
				{
					errors.push(key + " failed validation. Value=" + row[key])
					continue updates;
				}

				row[key] = validate(row[key])
			}

			let deleteSQL = `DELETE FROM ${req.body.table} WHERE ${selector} = ?`

			var keyOrder = Object.keys(schema);
			var qs = keyOrder.map( x => "?").join(", ")
			var columns = keyOrder.join(", ");
			let values = keyOrder.map(x => row[x]);

			let insertSQL = `INSERT INTO ${req.body.table} (${columns}) VALUES (${qs})`

			async function group()
			{
				await query(deleteSQL, row[selector]);
				await query(insertSQL, values);
				return;
			}
			
			allUpdates.push(group());
		}

		deletes: for(var j in req.body.deletes)
		{
			let row = req.body.deletes[j]
			let deleteID = row[selector];

			var validate = schema[selector];

			if(deleteID === undefined || validate(deleteID) === undefined)
			{
				errors.push(selector + " failed validation. Value=" + deleteID)
				continue deletes;
			}

			deleteID = validate(deleteID);
			console.log(deleteID);

			let deleteSQL = `DELETE FROM ${req.body.table} WHERE ${selector} = ?`

			for(var i in deleteValidation)
			{
				var rows = await query(deleteValidation[i], deleteID)
				if(rows.length > 0)
				{
					errors.push(`Cannot delete ${itemName} ${deleteID}; ${itemName} still in use.`)
					continue deletes;
				}
			}
			
			allUpdates.push(query(deleteSQL, row[selector]));
		}

		await Promise.all(allUpdates);

		if(errors.length > 0)
			break;


		res.setHeader("Content-Type", "text/json");
		res.writeHead(200);
		res.end();

		// close the database connection*/
		db.close();
		return;

	}
	while(false);

	res.setHeader("Content-Type", "text/json");
	res.writeHead(400);
	res.end(JSON.stringify(errors));
};

