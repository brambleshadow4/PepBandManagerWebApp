var default_season = sessionStorage.season || enums.default_season;
sessionStorage.season = default_season;

var enumLookup;
var events;

loadJSON("../api/getEvents?season=" + default_season, function(stuff)
{
	console.log("me");

	enumLookup = makeEnumLookup(enums);

	var lastestSeasonId = enums.default_season;

	var select = makeSeasonSelect(enums);
	select.id = "season";
	select.name = "season";
	select.value = default_season;
	select.onchange = function()
	{
		loadJSON("../api/getEvents?season="+ this.value, loadEventsFromSeason);
		sessionStorage.season = this.value;
	}
	document.getElementById('season-select-container').appendChild(select);

	loadEventsFromSeason(stuff);
})

function loadEventsFromSeason(eventsLocal)
{
	events = eventsLocal;

	console.log('events loaded');

	var eventList = document.getElementById('event-list');
	eventList.innerHTML = "";

	document.getElementById('collapse-groups-button').innerHTML = "Collapse Groups";

	var groupByDate = document.getElementById('groupRadio1').checked;

	if(groupByDate)
		eventList.classList.add("by-date");
	else
		eventList.classList.remove('by-date');
	
	var groups = {};

	for(var i in eventsLocal)
	{
		var event = eventsLocal[i];
		var group = groupByDate ? event.date.substring(0,7) : event.event_type_id;

		var div = document.createElement('a');
		div.className = "event";
		div.onclick = openEvent;
		div.href = `editEvent?${event.id}`
		div.target = "editFrame";
		var dte = groupByDate ? formatDate(event.date) : formatDate2(event.date);
		var evType = enumLookup.event_types[event.event_type_id];

		
		div.innerHTML = `
			<span class='date'>${dte}</span>
			<span class='name'>${event.name}</span>`;

		if(groupByDate)
			div.innerHTML += `<span class='type'>${evType}</span>`;
		
		if(groups[group] === undefined)
			groups[group] = [];

		groups[group].push(div);
	}

	for(var i in groups)
	{	
		var g = groups[i];
		var div = document.createElement('div');
		div.className = "event-group";
		div.id = "group-" + i;

		var heading = document.createElement('h3');
		heading.className = "open";
		heading.innerHTML = groupByDate ? monthHeading(i) : enumLookup.event_types[i];
		heading.onclick = expandHideSection;
		heading.setAttribute('for', 'group-'+i)

		while(g.length)
			div.appendChild(g.shift());

		eventList.appendChild(heading);
		eventList.appendChild(div);
	}
}

function monthHeading(yyyy_mm)
{
	var year = yyyy_mm.substring(0,4)
	switch(yyyy_mm.substring(5))
	{
		case "01": return "January " + year;
		case "02": return "February " + year;
		case "03": return "March " + year;
		case "04": return "April " + year;
		case "05": return "May " + year;
		case "06": return "June " + year;
		case "07": return "July " + year;
		case "08": return "August " + year;
		case "09": return "September " + year;
		case "10": return "October " + year;
		case "11": return "November " + year;
		case "12": return "December " + year;
	}
}

function formatDate2(dte)
{
	var day = dte.substring(8);
	var month = Number(dte.substring(5,7));
	var year = dte.substring(2,4);
	return month + "/" + day + "/" + year;
}

function formatDate(dte)
{
	var day = Number(dte.substring(8));
	var month = Number(dte.substring(5,7));
	return month + "/" + day;
}


function expandHideSection()
{
	var target = document.getElementById(this.getAttribute('for'));
	if(this.classList.contains('open'))
	{
		this.classList.remove('open');
		this.classList.add('closed');
		target.style.display = "none";
	}
	else
	{
		this.classList.remove('closed');
		this.classList.add('open');
		target.style.display = "block";
	}
}

function collapseGroups(button)
{
	var collapse = (button.innerHTML == "Collapse Groups");

	console.log(collapse);
	console.log(button);
	if(collapse)
	{
		button.innerHTML = "Expand Groups";
	}
	else
	{
		button.innerHTML = "Collapse Groups";
	}

	var h3s = document.getElementsByTagName('h3');

	for(var i=0; i< h3s.length; i++)
	{
		console.log(h3s[i]);
		if((h3s[i].classList.contains('open') && collapse) || (!h3s[i].classList.contains('open') && !collapse) )
			expandHideSection.call(h3s[i]);
	}
}


function openEvent()
{
	var selected = document.getElementById('selected');
	if(selected)
		selected.id = "";
	this.id = "selected";
	openPane();
}

function newEvent()
{
	var data = {};
	data.token = document.getElementById('token').value;
	data.season = document.getElementById('season').value;
	
	sendJSON("events/new", JSON.stringify(data), function(response)
	{
		var url = JSON.parse(response);
		document.getElementById('editFrame').src = url;
		openPane();
	})
}


function openPane()
{
	var iframeContainer = document.getElementById('iframe-container');
	iframeContainer.style.display = "flex";
	iframeContainer.classList.remove("full");
	resizeHandler();
}

function closePane()
{
	document.getElementById('iframe-container').style.display = "none";
	document.body.classList.remove("full-iframe");
}


window.addEventListener("message", function(e)
{
	var iframeContainer = document.getElementById('iframe-container');
	if(e.data == "closeEvent")
	{
		closePane();
	}
	if(e.data == "openPlan")
	{
		//document.location = "plan";
		document.body.classList.add("full-iframe");
		resizeHandler();
	}
	if(e.data == "closePlan")
	{
		//document.location = "plan";
		document.body.classList.remove("full-iframe");
		resizeHandler();
	}
});


function resizeHandler(e)
{
	var iframeContainer = document.getElementById('iframe-container');

	if(window.innerWidth < 800 || document.body.classList.contains("full-iframe"))
	{
		iframeContainer.style.width = "100vw";
	}
	else
	{
		iframeContainer.style.width = "800px";
	}
}

resizeHandler();
window.addEventListener('resize',resizeHandler);