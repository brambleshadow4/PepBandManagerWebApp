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

	var queryStr = req.originalUrl.substr(req.originalUrl.indexOf('?')+1);
	var eventId = Number(queryStr.replace("id=",""))

	if(isNaN(eventId))
	{
		return; 
	}

	var data = await Promise.all
	([
		query("SELECT * FROM Instruments", []), // 0
		query("SELECT * FROM Event_Types", []), // 1
		query("SELECT * FROM Events WHERE id=?", [eventId]), // 2
		query(`
			SELECT m.first_name, m.last_name, COALESCE(ea.instrument_id, m.instrument_id) as instrument_id, m.instrument_id as default_instrument_id
			FROM Event_Attendance as ea INNER JOIN Members as m ON ea.member_id = m.id 
			WHERE ea.event_id=? AND ea.status >= 2
			ORDER BY instrument_id, m.first_name, m.last_name ASC`, [eventId]) // 3
	]);

	db.close();


	var instruments = {};
	for (var i = 0; i < data[0].length; i++) 
	{
		instruments[data[0][i].id] = data[0][i].name;
	}

	var eventTypes = {};
	for (var i = 0; i < data[1].length; i++) 
	{
		eventTypes[data[1][i].id] = data[1][i].name;
	}

	var eventData = data[2][0];

	const PDFDocument = require('pdfkit');
	const doc = new PDFDocument({
		bufferPages: true,
		autoFirstPage: false
	});
	doc.pipe(res);

	var xStart = 25;
	var xMid = 300;
	var yStart = 25;
	var yLimit = 750;
	var yLineHeight = 15;


	var height = yStart;

	doc.addPage({margin: 10})
	height = yStart;

	
	doc.font('Helvetica-Bold');
	doc.fontSize(16);
	doc.text(eventData.name, xStart, height);
	height += yLineHeight*1.3;

	//doc.font('Helvetica');
	doc.fontSize(10);

	var date = new Date(eventData.date);

	var month = date.toLocaleString("en-US", {timeZone: "America/New_York", month: "long"})
	var day =  date.toLocaleString("en-US", {timeZone: "America/New_York", day: "numeric"})
	var year = date.toLocaleString("en-US", {timeZone: "America/New_York", year: "numeric"})
	
	doc.text(eventTypes[eventData.event_type_id] + ", " + eventData.default_points + " points", xStart, height);
	height += yLineHeight;

	doc.text(`${month} ${day}, ${year}`, xStart, height);
	height += yLineHeight;


	var colStartHeight = height + yLineHeight;
	var colEndHeight = colStartHeight;
	var colStops = [xStart, 163, 300, 438];
	var col = -1;
	var currentInstrument = -1;
	var row = 0;

	for(var i=0; i < data[3].length; i++)
	{
		var row = data[3][i];

		if(row.instrument_id != currentInstrument)
		{
			col++;
			colEndHeight = Math.max(colEndHeight, height);

			if(col == 4)
			{
				col = 0;
				colStartHeight = colEndHeight + yLineHeight;
			}

			currentInstrument = row.instrument_id;
			height = colStartHeight;

			doc.font('Helvetica-Bold');
			doc.fontSize(14);
			doc.text(instruments[row.instrument_id], colStops[col%colStops.length], height);
			height += yLineHeight * 1.2;

			doc.font('Helvetica');
			doc.fontSize(10);
		}

		var asterisk = "";

		if(row.instrument_id != row.default_instrument_id)
			asterisk = "***";

		doc.text(row.first_name + " " + row.last_name + asterisk, colStops[col%colStops.length], height);
		height += yLineHeight;
	}




	


	doc.end();
	
	// close the database connection
	
};

 
