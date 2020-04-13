var memberSearch = new Trie(); //data loaded from API for use by member search bar
var memberLookup = {}; //data loaded from API for use by member search bar


// member_id -> {status: , instrument: }
// 0:
// 1: self-sign up
// 2: added to event
// 3: self-sign up & added to event
var signupStatus = {}; 

var season = -1; 
var event_id = location.search.substring(1);

document.getElementById('printout').setAttribute('href',"editEvent/printout.pdf?id=" + event_id);

var eventOutbox = new Outbox("../api/updateEvent", setFeedbackBox, setFeedbackBoxFail);
var attendeeOutboxes = {};

var isPlanningView = false;

var enumLookup = makeEnumLookup(enums);

for(var instrument in enums.instruments)
{
	var option = document.createElement('option');
	option.value = instrument;
	option.innerHTML = "Filter: " + enumLookup.instruments[instrument];
	document.getElementById('instrument-filter').appendChild(option);
}

var thisSeason;



// Data Loading Functions

var pointsLoaded = false;
var seasonMembersLoaded = false;
var allMembersLoaded = false;

async function dataloadAllMembers()
{
	if(allMembersLoaded) return;

	var response = await loadJsonP("../api/getMembers?season=all");

	for(var i=0; i<response.length; i++)
	{
		let member = response[i];

		if(memberLookup[member.id] === undefined)
		{
			memberLookup[member.id] = member;

			if(pointsLoaded)
				memberLookup[member.id].points = 0;
		}
	}


	allMembersLoaded = true;
	return;
}

async function dataloadSeasonMembers(seasonId)
{
	if(allMembersLoaded) return;

	var response = await loadJsonP("../api/getMembers?season=" + seasonId);
	
	for(var i=0; i<response.length; i++)
	{
		let member = response[i];

		memberLookup[member.id] = member;
		memberLookup[member.id].isSeasonMember = true;
	}

	seasonMembersLoaded = true;
	return;
}

async function dataloadSeasonPoints(seasonId)
{
	if(pointsLoaded) return;

	var response = await loadJsonP("../api/getSeasonPoints?season=" + seasonId);

	for(var i=0; i < response.length; i++)
	{
		memberLookup[response[i].id].points = response[i].points;
	}

	for(var key in memberLookup)
	{
		if(memberLookup[key].points === undefined || memberLookup[key].points === null)
			memberLookup[key].points = 0
	}
	
	pointsLoaded = true;
	return;
}

// Page Loading Functions

/*
 * Takes the members from the API call and enalbe the serach box to use them.
 */
function searchbarLoadMembers(seasonMembersOnly)
{
	//create a trie to enable a quick search of people who match search critiera
	memberSearch = new Trie();

	for(var i in memberLookup)
	{
		var record = memberLookup[i];

		if(seasonMembersOnly && !record.isSeasonMember)
			continue;

		//the keys that can be searched.
		var searchKeys = [
			record.netid.toLowerCase(),
			record.first_name.toLowerCase(),
			record.last_name.toLowerCase(),
			record.nick_name.toLowerCase(),
			"" + record.class_year
		];

		//add keys + ids to trie
		for(var j in searchKeys)
		{
			var key = searchKeys[j];
			var l = key.length;

			while(l > 0)
			{
				memberSearch.add(key, record.id);
				l--;
				key = key.substring(0,l);
			}
		}
	}

	displaySearchResults();
}

// Load data into the page

loadPage();
async function loadPage()
{
	var data;
	try
	{
		data = await loadJsonP("../api/getEvent?id=" + location.search.substring(1));
	}
	catch(exception)
	{
		closeEvent();
	}
	
	let eventData = data;

	//fill event-info inputs w/ values
	document.getElementById('default_points').value = eventData.default_points;
	document.getElementById('name').value = eventData.name;
	document.getElementById('date').value = eventData.date;
	document.getElementById('description').value = eventData.description;

	document.getElementsByTagName('title')[0].innerHTML = "BRPB: " + eventData.name;

	var select = makeEventTypeSelect(enums);
	select.id="event_type";
	select.value = eventData.event_type_id;
	select.onchange = updateEvent;
	document.getElementById('event_type_container').appendChild(select);
	
	select = makeLocationSelect(enums);
	select.id = "location_id";
	select.value = eventData.location_id;
	select.onchange = updateEvent;
	document.getElementById('location_container').appendChild(select);


	thisSeason = eventData.season_id;

	await dataloadSeasonMembers(eventData.season_id);

	for(var key in eventData.attendees)
	{
		signupStatus[key] = eventData.attendees[key];
	}

	renderPointsView();
	searchbarLoadMembers(true);
}


loadJSON("../api/getEvent?id=" + location.search.substring(1), 
	function(data)
	{
		
	}, 
	closeEvent
);


function renderPointsView()
{
	isPlanningView = false;

	window.parent.postMessage("closePlan","*");
	document.getElementById('attendees-container').style.display = "flex";
	document.getElementById('available-container').style.display = "none";
	document.getElementById('going-container').style.display = "none";

	document.getElementById('attendees').innerHTML = "";
	document.getElementById('toggle-plan-button').innerHTML = "Planning View";

	var sortedKeys = [];
	for(var key in signupStatus)
	{
		if(signupStatus[key].instrument_id == null)
		{
			signupStatus[key].instrument_id = memberLookup[key].instrument_id;
		}

		if(signupStatus[key].status >= 2)
		{
			sortedKeys.push(key);
		}
	}

	sortedKeys.sort(function(a,b){
		var nameA = memberLookup[a].first_name + " " + memberLookup[a].last_name;
		var nameB = memberLookup[b].first_name + " " + memberLookup[b].last_name;

		return nameA.toLowerCase() > nameB.toLowerCase()
	})

	for(var i = 0; i<sortedKeys.length; i++)
	{
		addAttendeeToHTML(sortedKeys[i]);
	}
}


async function renderPlanningView()
{
	await dataloadSeasonPoints(thisSeason);

	isPlanningView = true;

	window.parent.postMessage("openPlan","*");
	document.getElementById('attendees-container').style.display = "none";
	document.getElementById('available-container').style.display = "flex";
	document.getElementById('going-container').style.display = "flex";

	document.getElementById('available').innerHTML = "";
	document.getElementById('going').innerHTML = "";

	document.getElementById('toggle-plan-button').innerHTML = "Points View";

	for(var instrument in enums.instruments)
	{
		var h4 = document.createElement('h4');
		var instrumentName = enumLookup.instruments[instrument];
		h4.innerHTML = `${instrumentName} (<span id="instrument-${instrument}-count">0</span>)`;

		document.getElementById('going').appendChild(h4);

		var div = document.createElement('div');
		div.id = "instrument-" + instrument;
		document.getElementById('going').appendChild(div);
	}


	for(var key in signupStatus)
	{
		if(signupStatus[key].status >= 2)
		{
			addMemberToGoing(key);
		}
		else
		{
			addMemberToAvailable(key);
		}
	}
}


// adds an attendee to the webpage
function addAttendeeToHTML(member_id)
{
	//create the new row in the table
	let member = memberLookup[member_id];

	let entry = signupStatus[member_id];

	var row = document.createElement('tr');

	row.innerHTML = "<td>" + member.first_name + " " + member.last_name + "</td><td></td><td></td><td></td>";

	document.getElementById('attendees').appendChild(row);

	//create the point box form
	var pointsBox = document.createElement('input');
	pointsBox.className = "points";
	pointsBox.value = entry.points == undefined ? "" : entry.points;
	pointsBox.placeholder = document.getElementById('default_points').value + " (default)";

	// code to update database entry when individual points are changed
	pointsBox.oninput = function(){

		// adjust input in case a non-number is typed in.
		if (this.value != "" && !(/^-?[0-9]*$/.exec(this.value)))
		{
			this.value = this.value[0].replace(/[^0-9\-]/,"") + this.value.substring(1).replace(/[^0-9]/g,"");
		}

		//"-"" is not a valid number, but it is valid to type, so return
		if(this.value == "-")
		{
			return;
		}

		//update database 
		signupStatus[member_id].points = (this.value == "" ? undefined : Number(this.value));
		updateAttendee(member_id);
	}

	row.getElementsByTagName('td')[1].appendChild(pointsBox);

	//create the select element
	var select = makeAttendanceNoteSelect(enums);
	select.className = "attendance_note";
	select.value = entry.note;

	// code to update database entry when note is changed
	select.oninput = function(){
		signupStatus[member_id].note = this.value;
		updateAttendee(member_id);
	}

	row.getElementsByTagName('td')[2].appendChild(select);

	//create the remove button
	var span = document.createElement("span");
	//span.innerHTML = "&#10060;";
	span.setAttribute('icon',"close");
	span.className = "remove-button";

	//Delete attendee button code
	span.onclick = function()
	{
		var nameText = this.parentNode.parentNode.getElementsByTagName('td')[0].innerHTML;

		if(confirm("Are you sure you want to remove " + nameText + "?"))
		{
			delete signupStatus[member_id];
			updateAttendee(member_id);

			var element = this.parentNode.parentNode;
			element.parentNode.removeChild(element);			
		}
	}
	row.getElementsByTagName('td')[3].appendChild(span);	
}

function addMemberToAvailable(memberId)
{ 
	console.log(memberId);

	var memberObj = memberLookup[memberId]
	var points = (memberLookup[memberId].points === undefined ? 0 : memberObj.points);
	var div = document.createElement('div');
	
	div.id = "available-" + memberId;
	div.className = "memberRow";

	div.setAttribute('points', points);

	
	//var instrument = enumLookup.instruments[memberObj.instrument_id];

	var iid = signupStatus[memberId].instrument_id;
	var instrument = enumLookup.instruments[iid];

	div.innerHTML = 
		`<span class="points">${points}</span>
		<span class='name'>${memberObj.first_name} ${memberObj.last_name}</span>
		<span class='instrument'>${instrument}</span>
		<span class="actions">
			<span icon="close" title="Remove"></span>
			<span icon="edit"></span>
			<span icon="add" title="Add to Going"></span>
		</span>
		`;

	if (iid != memberObj.instrument_id)
	{
		div.classList.add("flag");
	}

	div.setAttribute('instrument', iid);

	var actionSpans = div.getElementsByClassName('actions')[0].getElementsByTagName('span');

	actionSpans[0].onclick = function(e)
	{
		removeMemberFromAvailable(memberId);
		delete signupStatus[memberId];
		updateAttendee(memberId);
	}

	actionSpans[1].onclick = function(e)
	{
		editInstrumentPopup(memberId);
	}

	actionSpans[2].onclick = function(e)
	{
		console.log(memberId + " moving back to going")

		removeMemberFromAvailable(memberId);
		addMemberToGoing(memberId);

		signupStatus[memberId].status += 2;
		updateAttendee(memberId);
	}

	var divs = document.getElementById('available').getElementsByClassName("memberRow");
	var i=0;
	while(true)
	{
		if(i == divs.length)
		{
			document.getElementById('available').appendChild(div);
			break;
		}
		if(Number(divs[i].getAttribute('points')) < points)
		{
			document.getElementById('available').insertBefore(div, divs[i]);
			break;
		}
		
		i++;
	}

	document.getElementById('available-count').innerHTML = document.getElementById('available').getElementsByClassName("memberRow").length;
}

function removeMemberFromAvailable(memberId)
{
	var div = document.getElementById('available-' + memberId);
	div.parentNode.removeChild(div);

	document.getElementById('available-count').innerHTML = document.getElementById('available').getElementsByClassName("memberRow").length;
}



function addMemberToGoing(member_id)
{
	var memberObj = memberLookup[member_id];

	var points = (memberLookup[member_id] === undefined ? 0 : memberObj.points);
	
	var div = document.createElement('div');
	div.id = "going-" + memberObj.id;
	div.className = "memberRow";

	div.setAttribute('points', points);

	var instrument = enumLookup.instruments[signupStatus[member_id].instrument_id];

	if (signupStatus[member_id].instrument_id != memberObj.instrument_id)
	{
		div.classList.add("flag");
	}

	div.innerHTML = 
		`<span class="points">${points}</span>
		<span class='name'>${memberObj.first_name} ${memberObj.last_name}</span>
		<span class="actions">
			<span icon="close" title="Remove"></span>
		</span>
		`;



	var actionSpans = div.getElementsByClassName('actions')[0].getElementsByTagName('span');

	actionSpans[0].onclick = function(e)
	{
		removeMemberFromGoing(member_id);
		addMemberToAvailable(member_id);

		signupStatus[member_id].status -= 2;
		updateAttendee(member_id);
	}

	

	var instrumentDivId="instrument-" + signupStatus[member_id].instrument_id;
	
	document.getElementById(instrumentDivId).appendChild(div);

	document.getElementById(instrumentDivId+"-count").innerHTML = document.getElementById(instrumentDivId).getElementsByClassName("memberRow").length;
	document.getElementById('going-count').innerHTML = document.getElementById('going').getElementsByClassName("memberRow").length;
}

function removeMemberFromGoing(memberId)
{
	var div = document.getElementById('going-' + memberId);
	div.parentNode.removeChild(div);

	// update counts
	var instrumentDivId="instrument-" + signupStatus[memberId].instrument_id;
	document.getElementById(instrumentDivId+"-count").innerHTML = document.getElementById(instrumentDivId).getElementsByClassName("memberRow").length;
	document.getElementById('going-count').innerHTML = document.getElementById('going').getElementsByClassName("memberRow").length;
}


// updates points boxes when default points changes
document.getElementById('default_points').onchange = function()
{
	var pointBoxes = document.getElementsByClassName('points');
	for(var box of pointBoxes)
	{
		box.placeholder = this.value + " (default)";
	}

	updateEvent();
}



function updateDate(obj)
{
	var dateText = obj.value;

	if(isNaN(new Date(dateText).getTime()))
	{
		obj.classList.add("invalid");
	}
	else
	{
		obj.classList.remove("invalid");
		updateEvent();
	}
}


// updates event in DB 
function updateEvent()
{
	var data = {};
	data.default_points = Number(document.getElementById('default_points').value);
	data.name = document.getElementById('name').value;
	data.date = document.getElementById('date').value;
	data.description = document.getElementById('description').value;
	data.token = document.getElementById('token').value;
	data.event_type = Number(document.getElementById('event_type').value);
	data.event_id = Number(event_id);
	data.location_id = Number(document.getElementById('location_id').value);

	eventOutbox.send(data); //send the data to the server
	setFeedbackBox();
}

// Sends the updated info abount an attendee to the server.
function updateAttendee(memberId)
{
	var data = signupStatus[memberId];
	if(data === undefined)
	{
		data = {
			delete: true,
			member_id: memberId,
			event_id: event_id
		}
	}
	
	data.token = document.getElementById('token').value;

	if(attendeeOutboxes[memberId] == undefined)
		attendeeOutboxes[memberId] = new Outbox("../api/updateEventAttendance", setFeedbackBox, setFeedbackBoxFail);

	attendeeOutboxes[memberId].send(data);
	setFeedbackBox();
}

function setFeedbackBox()
{
	var box = document.getElementById('feedback-box');
	
	if(box.getAttribute('icon') != "error")
	{
		if(boxesSending == 0)
		{
			box.setAttribute('icon', "success");
		}
		else
		{
			box.setAttribute('icon', "loading");
		}
	}
	
}

function togglePlan()
{
	if(isPlanningView)
	{
		renderPointsView();
	}
	else
	{
		renderPlanningView();
	}
}

function editInstrumentPopup(memberId)
{
	var backdrop = document.createElement('div');
	backdrop.id='popup'

	document.body.appendChild(backdrop);

	var form = document.createElement('div');

	var member = memberLookup[memberId];

	console.log(member);
	var name = member.first_name + " " + member.last_name;

	form.innerHTML = `<p>Change ${name}'s instrument</p>`;

	var iid = member.instrument_id; //enumLookup.
	var iname = enumLookup.instruments[iid]

	form.innerHTML += `<div> Default: <button onclick="changePlannedInstrument(${memberId}, ${iid})">${iname}</button></div><br>`;

	for(var i=0; i < enums.instruments.length; i++)
	{
		if(enums.instruments[i].id != member.instrument_id)
		{
			iid = enums.instruments[i].id;
			iname = enums.instruments[i].name;
			form.innerHTML += `<div><button onclick="changePlannedInstrument(${memberId}, ${iid})">${iname}</button></div>`;
		}
	}

	form.id = 'popup-form';

	backdrop.appendChild(form);
}

function changePlannedInstrument(memberId, instrumentId)
{
	var popup = document.getElementById('popup');
	if(popup)
		popup.parentNode.removeChild(popup);

	signupStatus[memberId].instrument_id = instrumentId;
	updateAttendee(memberId)

	removeMemberFromAvailable(memberId);
	addMemberToAvailable(memberId);
}



function setFeedbackBoxFail()
{
	var box = document.getElementById('feedback-box');

	if(box.getAttribute('icon') != "error")
	{
		alert("Failed to connect to server. The data on this page may be incorrect. Please refresh the page.")
	}

	box.setAttribute('icon', "error");	
}

function closeEvent()
{
	window.parent.postMessage("closeEvent","*"); 
}

function deleteEvent()
{
	if(confirm("Are you sure you want to delete this event? This cannot be undone."))
	{
		var data = {};
		data.token = document.getElementById('token').value;
		data.event_id = Number(event_id);
		data.delete = "true";

		sendJSON("../api/updateEvent", JSON.stringify(data), closeEvent, setFeedbackBoxFail);
	}
	
}

//when radio button is switched, load the correct members to search from.
document.getElementById('allMembersTrue').onchange = async function(e)
{
	await dataloadAllMembers();
	searchbarLoadMembers(false);
	console.log("loading all members")

}

document.getElementById('allMembersFalse').onchange = function(e)
{
	console.log("loading season members")
	searchbarLoadMembers(true)
}


document.getElementById('instrument-filter').onchange = function(e)
{
	var availableMembers = document.getElementById('available').getElementsByClassName('memberRow');

	for(var i=0; i < availableMembers.length; i++)
	{
		if(this.value == "-1" || this.value == availableMembers[i].getAttribute('instrument'))
		{
			availableMembers[i].style.display = "block";
		}
		else
		{
			availableMembers[i].style.display = "none";
		}
	}
}



/* SEARCHBOX Events */

	/*
	 * Searches the list of members for a match
	 * PRECONDITION: memberSearch and memberLookup structures initialized.
	 */

	function displaySearchResults()
	{
		var searchbox = document.getElementById('searchbox');

		searchbox.removeAttribute("selected_id");

		var resultsDiv = document.getElementById('results');

		var keys = searchbox.value.toLowerCase().trim().split(" ");

		if(searchbox.value.trim() == "")
		{
			resultsDiv.className = "hidden";
			resultsDiv.innerHTML = "";
		}
		else
		{
			resultsDiv.className = "";
			resultsDiv.innerHTML = "";

			var idSet = new Set(memberSearch.at(keys[0]));

			for(var i=1; i < keys.length; i++)
			{
				idSet = new Set(memberSearch.at(keys[i]).filter(x => idSet.has(x)));
			}

			var count = 0;
			const maxResults = 5;
			for (let i of idSet.keys())
			{
				if (idSet.size == 1)
				{
					searchbox.setAttribute('selected_id', i);
				}

				if (count == maxResults)
				{
					var span = document.createElement('span');
					span.innerHTML = "...";	
					results.appendChild(span);
				}
				else if (count < maxResults)
				{
					var span = document.createElement('span');
					var record = memberLookup[i];
					span.className = "member"
					span.innerHTML = record.first_name + " " + record.last_name;

					span.onmouseenter = function(e)
					{
						var x = document.getElementById("keyboard_selected")
						if(x) x.id = "";
						this.id = "keyboard_selected";
					}

					span.onmousedown = function(e)
					{
						if(e.button == 0) addMemberToEvent(i);
					}

					if (signupStatus[i] != undefined && (signupStatus[i].status == 2 || isPlanningView))
					{
						var label = document.createElement('span');
						label.innerHTML = "Already added";
						label.className = "mini";
						span.appendChild(label);
					}

					results.appendChild(span);
				}
				count++;
			}

			if(count == 0)
			{
				if(document.getElementById("allMembersTrue").checked)
				{
					var span = document.createElement('span');
					span.className = 'new-member-span';
					span.innerHTML = "<em><a href='/members' target='_blank'>Create a new member<a></em>";
					
					span.onmousedown = function(e)
					{	
						this.getElementsByTagName('a')[0].click();
					}

					span.onmouseenter = function(e)
					{
						var x = document.getElementById("keyboard_selected")
						if(x) x.id = "";
						this.id = "keyboard_selected";
					}

					results.appendChild(span);
				}
				else
				{
					var span = document.createElement('span');
					span.className = 'new-member-span';
					span.innerHTML = "<em>Search all members</em>";
					span.onmousedown = function(e)
					{
						if(e.button == 0) 
						{
							document.getElementById('allMembersTrue').click();						
						}
					}	

					span.onmouseenter = function(e)
					{
						var x = document.getElementById("keyboard_selected")
						if(x) x.id = "";
						this.id = "keyboard_selected";
					}

					results.appendChild(span);
				}
				
			}
		}
	}

	document.getElementById('searchbox').oninput = displaySearchResults;

	document.getElementById('searchbox').onkeydown = function(e)
	{
		var selected = document.getElementById("keyboard_selected");

		if(e.key == "Enter")
		{
			if(this.hasAttribute("selected_id"))
			{
				addMemberToEvent(Number(this.getAttribute("selected_id")));
			}
			else if(selected)
			{
				selected.onmousedown({button: 0});
			}
			else if (document.getElementById('results').childNodes.length == 1)
			{
				console.log(document.getElementById('results').childNodes[0]);
				document.getElementById('results').childNodes[0].onmousedown({button: 0});
			}
			
		}

		if(e.key == "ArrowDown")
		{

			if(selected == undefined)
			{
				document.getElementById('results').childNodes[0].id = "keyboard_selected";
			}
			else
			{
				var parent = selected.parentNode;

				for(var i =0; i< parent.childNodes.length-1; i++)
				{
					if(parent.childNodes[i] == selected && parent.childNodes[i+1].classList.contains('member'))
					{
						selected.id= "";
						parent.childNodes[i+1].id = "keyboard_selected";
					}
				}
			}
		}

		if(e.key == "ArrowUp")
		{
			if(selected != undefined)
			{
				var parent = selected.parentNode;

				for(var i =1; i< parent.childNodes.length; i++)
				{
					if(parent.childNodes[i] == selected)
					{
						selected.id= "";
						parent.childNodes[i-1].id = "keyboard_selected";
					}
				}
			}
		}

	}

	/**
	 * Adds a member from the search control to the correct spot in the view.
	 */
	function addMemberToEvent(memberId)
	{
		if(isPlanningView)
		{
			if(signupStatus[memberId] == undefined)
			{
				signupStatus[memberId] = {
					event_id: Number(event_id),
					member_id: memberId, 
					instrument_id: memberLookup[memberId].instrument_id,
					status: 0,
					points: null,
					note: 0
				}		
			}

			updateAttendee(memberId);
			addMemberToAvailable(memberId);
		}
		else
		{
			if(signupStatus[memberId] == undefined || signupStatus[memberId].status < 2)
			{
				//alert('adding member ' + memberId);

				if(signupStatus[memberId] === undefined )
				{
					signupStatus[memberId] = {
						event_id: Number(event_id),
						member_id: memberId, 
						instrument_id: memberLookup[memberId].instrument_id,
						status: 0,
						points: null,
						note: 0
					}
				}

				signupStatus[memberId].status += 2;

				updateAttendee(memberId);
				addAttendeeToHTML(memberId);

				var parent = document.getElementById('atendees-container');
				parent.scrollTop = parent.scrollHeight;
			}
		}

		

		var searchbox = document.getElementById('searchbox');
		searchbox.value = "";
		document.getElementById('results').className = "hidden";
	}

	var MOUSE_IN_RESULTS = false;
	document.getElementById('searchbox').onblur = function(e)
	{
		document.getElementById('results').className = "hidden";
	}

	document.getElementById('searchbox').onfocus = document.getElementById('searchbox').oninput

