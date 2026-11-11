var enumLookup = makeEnumLookup(enums);

var cur_table;

async function buildTable(season_id, instrument_id, class_year) {
	var points = await loadJsonP("../api/getMembersByPoints?season=" + season_id);
	let seasonDiv = document.createElement('div');
	cur_table = seasonDiv;
	seasonDiv.classList.add("season")
	let header = document.createElement('div');
	let body = document.createElement('div');
	body.className = "body";
	var offset = 0;
	var innerLeaderboard = '';
	for(var j=0; j < points.length; j++)
	{
		if (instrument_id != -1 && points[j]["instrument_id"] != instrument_id) 
		{
			offset += 1;
			continue;
		}
		if (class_year != "-1" && points[j]["class_year"] != class_year)
		{
			offset += 1;
			continue;
		}
		var name = points[j]["first_name"] + ' ';
		if (points[j]["nick_name"] != "")
		{
			name += ' \"' + points[j]["nick_name"] + '\" ';
		}
		name += points[j]["last_name"];

		innerLeaderboard += `
			<div class='line'>
				<div class='line-r'>
					<span class='points'>${points[j]["points"]}pt</span>
				</div>
				<div class='line-l'>
					<span class='date'>${j+1 - offset}</span>
					<span class='eventType'>${enumLookup.instruments[points[j]["instrument_id"]]}</span>
					<span class='class'>${points[j]["class_year"]}</span>
					<span>${name}</span>
				</div>
			</div>`;
	}


	body.innerHTML += innerLeaderboard;
	header.classList.add('header');
	header.classList.add('line');
	seasonDiv.classList.add("open")

	seasonDiv.appendChild(header);
	seasonDiv.appendChild(body);

	document.getElementById('leaderboard').appendChild(seasonDiv);
	
}

async function run() 
{
	var points = await loadJsonP("../api/getMembersByPoints?season=-1");
	var seasonDropdown = document.getElementById('season-list');
	var instrumentDropdown = document.getElementById('instrument-list');
	var classDropdown = document.getElementById('class-list');

	// Lifetime is a bit laggy, disable it for now pending rewrite, and replace it with current season
	seasonDropdown.innerHTML += "<option value=-1>Lifetime</option>";
	seasonDropdown.innerHTML += `<option value=${enums.default_season}>Current Season</option>`;
	for (var i = enums.seasons.length - 1; i >= 0; i--) 
	{
		seasonDropdown.innerHTML += "\n<option value=" + i + ">" + enumLookup.seasons[i] + "</option>";
	}
	seasonDropdown.value = enums.default_season;
	instrumentDropdown.innerHTML += "<option value=-1>All</option>";
	for (var i = 0; i < enums.instruments.length; i++ )
	{
		instrumentDropdown.innerHTML += "\n<option value=" + i + ">" + enumLookup.instruments[i] + "</option>";
	}
	classDropdown.innerHTML += "<option value=-1>All</option>";
	const classes = [];
	for (var i = 0; i < points.length; i++)
	{
		if (classes.indexOf(points[i]["class_year"]) === -1) 
		{
			classes.push(points[i]["class_year"]);
		}
	}
	classes.sort();
	for (var i = classes.length - 1; i >= 0; i--)
	{
		classDropdown.innerHTML += "<option value=" + (classes[i]) + ">" + classes[i] + "</option>";
	}

	buildTable(enums.default_season, -1, -1);
	function listQ()
	{
		cur_table.remove();
		buildTable(seasonDropdown.value, instrumentDropdown.value, classDropdown.value);
	}
	seasonDropdown.onchange = listQ;
	instrumentDropdown.onchange = listQ;
	classDropdown.onchange= listQ;
}


window.onload=run();
