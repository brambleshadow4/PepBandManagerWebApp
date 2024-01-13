var enumLookup = makeEnumLookup(enums);

async function buildTable(season_id) {
	var points = await loadJsonP("../api/getMembersByPoints?season=2");
	let seasonDiv = document.createElement('div');
	seasonDiv.classList.add("season")
	let header = document.createElement('div');
	let body = document.createElement('div');
	body.className = "body";
	console.log(points.length);
	for(var j=0; j < points.length; j++)
	{
		var name = points[j]["first_name"] + ' ';
		if (points[j]["nick_name"] != "")
		{
			name += ' \"' + points[j]["nick_name"] + '\" ';
		}
		name += points[j]["last_name"];

		body.innerHTML += `
			<div class='line'>
				<div class='line-r'>
					<span class='points'>${points[j]["points"]}pt</span>
				</div>
				<div class='line-l'>
					<span class='date'>uhh</span>
					<span class='eventType'>joe</span>
					<span>${name}</span>
				</div>
			</div>`;
	}

	if (season_id == "all") {
		seasonName = "Lifetime Season";
	} else {
		seasonName = "Current Season";
		seasonDiv.classList.add('open')
	}

	header.innerHTML = `<div class='line-r'></div><div class='line-l'>${seasonName}</div>`

		
	header.classList.add('header');
	header.classList.add('line');

	header.onclick = function()
	{
		if(seasonDiv.classList.contains("open"))
		{
			seasonDiv.classList.remove("open")
		}
		else
		{
			seasonDiv.classList.add("open")
		}
	}

	seasonDiv.appendChild(header);
	seasonDiv.appendChild(body);

	document.getElementById('leaderboard').appendChild(seasonDiv);
	
}

async function run() 
{
	buildTable("all");
	buildTable(enums.current_season);
}


run();
