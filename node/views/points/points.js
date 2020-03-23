
for(let i=enums.seasons.length-1; i >= 0; i--)
{
	var seasonDiv = document.createElement('div');
	seasonDiv.className = 'season-div';

	var heading = document.createElement("h3");
	heading.innerHTML = enums.seasons[i].name;
	seasonDiv.appendChild(heading);

	var items = document.createElement('div');

	var pointPDF = document.createElement('a');

	pointPDF.href = "points/points.pdf?season=" + enums.seasons[i].id;
	pointPDF.innerHTML = "Season Points List";
	items.appendChild(pointPDF);

	var s500ptClub = document.createElement('a');
	s500ptClub.innerHTML = "500pt club";
	s500ptClub.href="javascript:lifetimePoints(" + enums.seasons[i].id + ")";

	items.appendChild(s500ptClub);
	seasonDiv.appendChild(items);
	document.getElementById('seasons').appendChild(seasonDiv);
}



async function lifetimePoints(seasonId)
{
	var data = await Promise.all([
		loadJsonP("api/getMembers?season=" + seasonId),
		loadJsonP("api/getLifetimePoints?season=" + seasonId),
	])

	var points = data[1];
	var members = data[0];
	var memberLookup = {};

	for(var i=0; i< members.length; i++)
	{
		var member = members[i];
		memberLookup[member.id] = member;
	}
	
	var div = document.getElementById('lifetime-points');
	div.innerHTML = "";

	var divider = false;
	
	for(var i=0; i< points.length; i++)
	{
		var member = memberLookup[points[i].id];
		var line = "<span class='points'>" + points[i].points + "</span> " + member.first_name + " " + member.last_name;

		if(!divider && points[i].points < 500)
		{
			div.innerHTML += "<hr>";
			divider = true;
		}

		div.innerHTML += line + "<br>";
	}
}