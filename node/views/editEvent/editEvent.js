var memberSearch = new Trie(); //data loaded from API for use by member search bar
var memberLookup = {}; //data loaded from API for use by member search bar
var eventAttendees = new Set(); //used by search bar

var season = -1; 
var event_id = location.search.substring(1);

var eventOutbox = new Outbox("../api/updateEvent", setFeedbackBox, setFeedbackBoxFail);
var attendeeOutboxes = {};



/*
 * Takes the members from the API call and enalbe the serach box to use them.
 */
function loadMembers(membersObj)
{
	//create a trie to enable a quick search of people who match search critiera
	memberSearch = new Trie();

	for(var i in membersObj)
	{
		var record = membersObj[i];

		memberLookup[record.id] = record;

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

loadJSON("../api/getEvent?id=" + location.search.substring(1), 
	function(data)
	{
		let eventData = data;

		//fill event-info inputs w/ values
		document.getElementById('default_points').value = eventData.default_points;
		document.getElementById('name').value = eventData.name;
		document.getElementById('date').value = eventData.date;
		document.getElementById('description').value = eventData.description;

		document.getElementsByTagName('title')[0].innerHTML = "BRPB: " + eventData.name;

		var select = makeEventTypeSelect(enums);
		select.id="event_type";
		select.onchange = updateEvent;
		document.getElementById('event_type_container').appendChild(select);

		select.value = eventData.event_type_id;

		// Set the season for the members search bar
		document.getElementById('allMembersFalse').onchange = function(e)
		{
			loadJSON("../api/getMembers?season=" + eventData.season_id, loadMembers, function(){ alert("Failed to load band members")});
		}

		//Call API to load member data for searchbar + attendees list
		loadJSON("../api/getMembers?season=" + eventData.season_id, 
			function(members)
			{
				loadMembers(members);
				
				for(let entry of eventData.attendees)
				{
					addAttendeeToHTML(entry);
				}
			},
			function(stuff)
			{
				alert("Failed to get members");
			}
		);
	}, 
	closeEvent
);


// adds an attendee to the webpage
function addAttendeeToHTML(entry)
{
	//create the new row in the table
	eventAttendees.add(entry.member_id);
	let member = memberLookup[entry.member_id];	

	var row = document.createElement('tr');

	row.innerHTML = "<td>" + member.first_name + " " + member.last_name + "</td><td></td><td></td>";

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
		var data = {};
		data.token = document.getElementById('token').value;
		data.event_id = Number(event_id);
		data.member_id = Number(entry.member_id);

		if(this.value != "")
			data.points = Number(this.value);

		data.note = Number(this.parentNode.parentNode.getElementsByTagName('select')[0].value);

		//send data to db
		if(attendeeOutboxes[data.member_id] == undefined)
			attendeeOutboxes[data.member_id] = new Outbox("../api/updateEventAttendance", setFeedbackBox, setFeedbackBoxFail);

		attendeeOutboxes[data.member_id].send(data);
		setFeedbackBox();

	}

	row.getElementsByTagName('td')[1].appendChild(pointsBox);

	//create the select element
	var select = makeAttendanceNoteSelect(enums);
	select.className = "attendance_note";
	select.value = entry.note;

	// code to update database entry when note is changed
	select.oninput = function(){

		var data = {};
		data.token = document.getElementById('token').value;
		data.event_id = Number(event_id);
		data.member_id = Number(entry.member_id);
		data.note = Number(this.value);

		var points = this.parentNode.parentNode.getElementsByTagName('input')[0].value;
		if(points != "")
			data.points = Number(points);	

		if(attendeeOutboxes[data.member_id] == undefined)
			attendeeOutboxes[data.member_id] = new Outbox("../api/updateEventAttendance", setFeedbackBox, setFeedbackBoxFail);

		attendeeOutboxes[data.member_id].send(data);
		setFeedbackBox();

	
	}

	row.getElementsByTagName('td')[2].appendChild(select);

	//create the remove button
	var span = document.createElement("span");
	span.innerHTML = "&#10060;";
	span.className = "remove-button";

	//Delete attendee button code
	span.onclick = function()
	{
		var nameText = this.parentNode.parentNode.getElementsByTagName('td')[0].innerHTML;

		if(confirm("Are you sure you want to remove " + nameText + "?"))
		{
			var data = {};
			data.token = document.getElementById('token').value;
			data.event_id = Number(event_id);
			data.member_id = Number(entry.member_id);
			data.delete = "true";

			sendJSON("../api/updateEventAttendance", JSON.stringify(data), setFeedbackBox, setFeedbackBoxFail);

			var element = this.parentNode.parentNode;
			element.parentNode.removeChild(element);
			
			eventAttendees.delete(data.member_id);
		}
		
	}
	row.getElementsByTagName('td')[2].appendChild(span);	
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


	eventOutbox.send(data); //send the data to the server
	setFeedbackBox();
}

function setFeedbackBox()
{
	console.log("update");
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
document.getElementById('allMembersTrue').onchange = function(e)
{
	loadJSON("../api/getMembers?season=all", loadMembers);
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

					span.onmousedown = function(e)
					{
						if(e.button == 0) addMemberToEvent(i);
					}

					if (eventAttendees.has(i))
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
					span.innerHTML = "<em>Create a new member</em>";
					span.onmousedown = function(e)
					{
						if(e.button == 0) document.getElementById('new-member').click();
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
					results.appendChild(span);
				}
				
			}
		}
	}

	document.getElementById('searchbox').oninput = displaySearchResults;

	document.getElementById('searchbox').onkeydown = function(e)
	{
		if(e.key == "Enter" && this.hasAttribute("selected_id"))
		{
			addMemberToEvent(Number(this.getAttribute("selected_id")));
		}
	}

	function addMemberToEvent(memberId)
	{
		if(!eventAttendees.has(memberId))
		{
			//alert('adding member ' + memberId);
			var data = {};
			data.token = document.getElementById('token').value;
			data.event_id = Number(event_id);
			data.member_id = memberId;
			data.note = 0

			sendJSON("../api/updateEventAttendance", JSON.stringify(data), setFeedbackBox, setFeedbackBoxFail);

			addAttendeeToHTML(data);

			var parent = document.getElementById('atendees-container');
			parent.scrollTop = parent.scrollHeight;
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

