
for(var i=enums.seasons.length-1; i >= 0; i--)
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

	var s500ptClub = document.createElement('span');
	s500ptClub.innerHTML = "500pt club";
	items.appendChild(s500ptClub);

	seasonDiv.appendChild(items);


	document.getElementById('seasons').appendChild(seasonDiv);
}