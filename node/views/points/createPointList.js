const sqlite3 = require('sqlite3').verbose();
exports.run = function(req, res) 
{
	let db = new sqlite3.Database('./db/pepband.db');

	var query = req.originalUrl.substr(req.originalUrl.indexOf('?')+1);
	var season = Number(query.replace("season=",""))

	if(isNaN(season))
	{
		var season = 0;
	}

	db.all("SELECT * FROM Instruments", [], (err, rows) =>
	{
		if (err) 
		{
			db.close();
			throw err;
		}

		var instruments = {};

		for (var i = 0; i < rows.length; i++) {
			instruments[rows[i].id] = rows[i].name;
		}
	

		var sql = `
		SELECT m.id, m.first_name, m.last_name, m.instrument_id,
		(
			SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
			FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
			WHERE member_id = m.id AND e.season_id = ? AND e.date < date('now') AND att.status > 1
		)
		AS points
		FROM members m
		WHERE m.id IN (
			SELECT att.member_id 
			FROM event_attendance att INNER JOIN events e on att.event_id = e.id
			WHERE e.season_id = ? 
		)
		ORDER BY m.instrument_id ASC, points DESC`;


		db.all(sql, [season, season], (err, rows) => 
		{
			if (err) 
			{
				db.close();
				throw err;
			}

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



			function newPage()
			{
				doc.addPage({margin: 10})
				height = yStart;
			}

			newPage();

			doc.font('Helvetica-Bold');
			doc.fontSize(18);
			doc.text("Pep Band Points", xStart, height, );
			height += yLineHeight*1.3;

			doc.font('Helvetica');
			doc.fontSize(10);
			var date = new Date();

			new Date().toLocaleString("en-US", 
			{
				timeZone: "America/New_York",
				dateStyle: "full"			
			})

			var month = date.toLocaleString("en-US", {timeZone: "America/New_York", month: "long"})
			var day =  date.toLocaleString("en-US", {timeZone: "America/New_York", day: "numeric"})
			var year = date.toLocaleString("en-US", {timeZone: "America/New_York", year: "numeric"})
			var hour = date.toLocaleString("en-US", {timeZone: "America/New_York", hour12: true, hour: "numeric"})
			var minute = date.toLocaleString("en-US", {timeZone: "America/New_York", minute: "numeric"});

			if(minute.length == 1)
				minute = "0" + minute;

			hour = hour.replace(" ", ":" + minute + " ")

			doc.text(`Reported ${month} ${day}, ${year}, ${hour}`, xStart, height);
			height += yLineHeight;



			var instrumentId = -1;
			for(var i =0; i<rows.length; i++ )
			{
				if(rows[i]["instrument_id"] != instrumentId)
				{
					height += yLineHeight*2;

					if(height > yLimit - yLineHeight*2) 
						newPage();

					instrumentId = rows[i]["instrument_id"];

					doc.font('Helvetica-Bold').fontSize(14);
					doc.text(instruments[instrumentId], xStart, height);
					//$pdf->Line($xStart, $height+1, 185, $height+1);

					doc.font('Helvetica').fontSize(10);

					height += yLineHeight*1.3;

					if(height > yLimit) 
						newPage();
				}

				doc.text(rows[i]["first_name"] + " " + rows[i]["last_name"], xStart, height);
				doc.text(rows[i]["points"], xMid, height);
				height += yLineHeight;

				if(height > yLimit) 
					newPage();
			}

			doc.end();
			db.close();


		});
	});
	// close the database connection
	
};

 
