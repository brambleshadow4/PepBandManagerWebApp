var enumLookup = makeEnumLookup(enums);


async function run()
{
	var data = await loadJsonP("api/getProfile" + location.search);

	document.getElementById('main-row').innerHTML = `
		<h1>${data.member.name}</h1>
		<table>
			<tr class='points-row'><td class='season-pts'>${data.season_points}</td><td>/</td><td class='lifetime-pts'>${data.lifetime_points}</td><tr>
			<tr><td class='season-pts'>Season Points</td><td></td><td class='lifetime-pts'>Lifetime Points</td><tr>
		</table>
	`;

	document.getElementById('main-row').style.display = "inline-block";


	loadEventSignups(data);

	// load history

	data.seasons.sort(function(a,b){
		return Number(b.id) - Number(a.id)
	})

	console.log(data.seasons.slice());

	for(var i = 0; i < data.seasons.length; i++)
	{
		let seasonDiv = document.createElement('div');
		seasonDiv.classList.add("season")
		let header = document.createElement('div');
		let body = document.createElement('div');
		body.className = "body";


		var seasonPts = 0;
		for(var j=0; j < data.seasons[i].events.length; j++)
		{
			var event = data.seasons[i].events[j];
			var dateTxt = formatDate(event.date);
			var evType = enumLookup.event_types[event.event_type_id];

			seasonPts += event.points;

			body.innerHTML += `
				<div class='line'>
					<div class='line-r'>
						<span class='points'>${event.points}pt</span>
					</div>
					<div class='line-l'>
						<span class='date'>${dateTxt}</span>
						<span class='eventType'>${evType}</span>
						<span>${event.name}</span>
					</div>
				</div>`;
		}

		if(seasonPts >= 150)
			unlockAchievement(8);

		var seasonName = enumLookup.seasons[data.seasons[i].id] + " Season";
		if (data.seasons[i].id == enums.default_season)
		{
			seasonName = "Current Season";
			seasonDiv.classList.add('open')
		}

		header.innerHTML = `<div class='line-r'>${seasonPts}pt</div><div class='line-l'>${seasonName}</div>`

		
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

		document.getElementById('history').appendChild(seasonDiv);
	}


	// load achievements

	if(data.lifetime_points >= 500)
		unlockAchievement(10);

	if(data.lifetime_points >= 250)
		unlockAchievement(9);


	var allEvents = [];
	var dates = {};
	var eventTypes = {};
	var mensHockeyGames = 0;
	var womensGames = 0;

	for(var i=0; i < data.seasons.length; i++)
	{
		allEvents = allEvents.concat(data.seasons[i].events);
	}

	for(var i=0; i < allEvents.length; i++)
	{
		var event = allEvents[i];

		eventTypes[event.event_type_id] = true;


		if(event.event_type_id != 2)
		{
			if(dates[event.date])
				unlockAchievement(1)
			else
			dates[event.date] = true;
		}


		if(new Date(event.date).getFullYear() > data.member.class_year)
			unlockAchievement(11);


		if(event.location_id == 1 || event.location_id == 4)
			unlockAchievement(3);

		var name = event.name.toLowerCase();

		if(name.indexOf("phonathon") >= 0 || name.indexOf("phoneathon") >= 0)
			unlockAchievement(5)

		if(event.event_type_id == 4 || event.event_type_id == 10)
			unlockAchievement(2)

		if([11,12,13,14,15].indexOf(event.event_type_id) > -1)
			womensGames++;

		if(event.event_type_id == 6)
			mensHockeyGames++;

		//check if it's an away tirp.
	}

	if(Object.keys(eventTypes).length >= 10)
		unlockAchievement(4)

	if(mensHockeyGames >= 14)
		unlockAchievement(7)

	if(womensGames >= 20)
		unlockAchievement(6);

	document.getElementById('achievement-count').innerHTML = Object.keys(unlocked).length + "/12";
}

var unlocked = {0: true}

function unlockAchievement(no)
{
	if(!unlocked[no])
	{
		var div = document.getElementsByClassName('achievement')[no];
		div.classList.remove('locked');
		var img = div.getElementsByTagName('img')[0];

		img.src = img.src.replace("locked--", "");

		unlocked[no] = true;
	}
	
}

function formatDate(dte)
{
	var day = dte.substring(8);
	var month = Number(dte.substring(5,7));
	var year = dte.substring(2,4);
	return month + "/" + day + "/" + year;
}

function formatDateShort(dte)
{
	var dateObj = new Date(dte);
	var userTimezoneOffset = dateObj.getTimezoneOffset() * 60000 + 5000;
	dateObj = new Date(dateObj.getTime() + userTimezoneOffset);

	var dayName = ["Sunday", "Monday","Tuesday","Wednesday","Thursday", "Friday" ,"Saturday"][dateObj.getDay()];

	var day = Number(dte.substring(8));
	var month = Number(dte.substring(5,7));
	return dayName + " " + month + "/" + day;
}

function loadEventSignups(data)
{
	var div = document.getElementById('signups');
	div.innerHTML = "";

	if(data.signups.length == 0)
	{
		div.innerHTML = "There are no events to sign up for at this time. Stay faithful!";
		return;
	}


	

	var first = true;

	for(var event of data.signups)
	{
		var evDate = formatDateShort(event.date);
		var description = "";

		if(event.description.trim() != "")
			description = "<div>" + event.description + "</div>";

		var signup;

		if(!event.open_signup)
		{
			signup = `<div class='signup-form'>Signup closed. Keep an eye out for the posted list.</div>`
		}
		else
		{
			if(event.status == 1 || event.status == 3)
			{
				var instrument = enumLookup.instruments[event.instrument_id]
				signup = `<div class='signup-form'>
					<div>You have signed up (${instrument})</div>
					<div><button onclick="cancelSignup(${event.id})">Cancel</button></div>
					</div>`
			}
			else
			{
				signup = `<div class='signup-form'>
					<span class='instrument-container' id='${event.id}-instrument-container'></span>
					<button onclick="signup(${event.id})">Sign up!</button>
				</div>`
			}
		}
		


		var eventHTML = `
			<div>
				<div class='event-header'>${evDate} - ${event.name} - ${event.default_points}pt</div>
				${description}
				${signup}
			</div>
		`;


		if(!first) div.innerHTML += "<hr>";
		div.innerHTML += eventHTML;
		first = false;
	}

	var instrumentContainers = document.getElementsByClassName('instrument-container')
	for(var i=0; i<instrumentContainers.length; i++)
	{
		instrumentContainers[i].appendChild(makeInstrumentSelect(enums, data.member.instrument_id))
	}
}


function signup(eventId)
{
	var instrumentSelect = document.getElementById(eventId+'-instrument-container').getElementsByTagName('select')[0]

	var data = {
		token: document.getElementById('token').value,
		instrument: instrumentSelect.value,
		event_id: eventId
	};
	
	sendJSON("api/updateSignup", JSON.stringify(data), async function(){
		
		loadEventSignups( await loadJsonP("api/getProfile"));
	
	});
}

function cancelSignup(eventId)
{
	var data = {
		token: document.getElementById('token').value,
		event_id: eventId,
		delete: true
	};
	
	sendJSON("api/updateSignup", JSON.stringify(data), async function(){
		loadEventSignups( await loadJsonP("api/getProfile"));
	});
}

run();