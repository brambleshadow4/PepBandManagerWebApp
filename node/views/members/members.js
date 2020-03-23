var members = [];
var defaultSet = new Set();
var enumLookup = {}; // 
var searchTrie = new Trie(); // trie for searching members

var outbox = new Outbox("../api/updateMember", setFeedbackBox, setFeedbackBoxFail);

loadJSON("../api/getMembers?season=all", function(allMembers){

	var select = makeInstrumentSelect(enums);
	select.id = "instrument_id";
	select.onchange = updateMember;
	document.getElementById('instrument_id-container').appendChild(select);

	enumLookup = makeEnumLookup(enums);

	for(var i in allMembers)
	{
		members[allMembers[i].id] = allMembers[i];
		defaultSet.add(allMembers[i].id);
	}

	console.log("building trie");
	buildSearchTrie(members);
	
	console.log("done");
	loadTable(defaultSet);
});

function buildSearchTrie(allMembers)
{
	var trie = new Trie();

	for(var i in allMembers)
	{
		if (i === null) continue;

		var member = allMembers[i];
		members[member.id] = member;
		defaultSet.add(member.id);

		var keys = [
			...member.first_name.split(/\s/),
			...member.last_name.split(/\s/),
			"" + member.class_year,
			enumLookup.instruments[member.instrument_id],
			member.nick_name,
			member.netid
		];

		for(var key of keys)
		{
			key = key.toLowerCase();
			var l = key.length;
			while(l > 0)
			{
				trie.add(key.substring(0,l), member.id);
				l--;
			}
		}
	}

	searchTrie = trie; 
}


function deleteMember()
{
	if(confirm("Are you sure you want to delete this member? This cannot be undone"))
	{
		var data ={};
		data.id = Number(document.getElementById('id').value);
		data.token = document.getElementById('token').value;
		data.delete = "true";	
		
		buildSearchTrie(members);

		sendJSON("../api/updateMember", JSON.stringify(data), function(){

			var row = document.getElementById('tr-' + data.id);

			if(row)
			{
				row.parentNode.removeChild(row);
			}

			delete members[data.id];
			defaultSet.delete(data.id);

			document.getElementById('col2').style.display = "flex";

		})
		
	}
}

function onNetidButtonClick()
{
	if (document.getElementById('netid').disabled)
	{
		editNetid();
		return;
	}
	
	var data ={};
	data.id = Number(document.getElementById('id').value);
	data.token = document.getElementById('token').value;
	data.new_netid = document.getElementById('netid').value;

	data.first_name = document.getElementById('first_name').value; 
	data.last_name = document.getElementById('last_name').value; 
	data.nick_name = document.getElementById('nick_name').value; 
	data.class_year = Number(document.getElementById('class_year').value); 
	data.instrument_id = Number(document.getElementById('instrument_id').value);

	var box = document.getElementById('feedback-box');
	box.setAttribute('icon',"loading");

	sendJSON("../api/updateMember", JSON.stringify(data), 
		function(response)
		{
			box.setAttribute('icon',"success");
			data.netid = data.new_netid;

			response = JSON.parse(response);
			if (response.id)
			{
				data.id = response.id;
				members[data.id] = {};
			}

			var row = document.getElementById('tr-' + data.id);

			if(row)
			{
				row.getElementsByClassName('name')[0].innerHTML = data.first_name + " " + data.last_name;
				row.getElementsByClassName('class_year')[0].innerHTML = data.class_year;
				row.getElementsByClassName('nickname')[0].innerHTML = data.nick_name;
				row.getElementsByClassName('instrument')[0].innerHTML = enumLookup.instruments[data.instrument_id];
				row.getElementsByClassName('netid')[0].innerHTML = data.netid;
			}

			var member = members[data.id];

			//update members
			for(var key in data)
			{
				members[data.id][key] = data[key];
			}

			buildSearchTrie(members);

			editMember(data);
		}, 
		function(){
			box.setAttribute('icon',"error");
			alert("Error: NetID/email already in use");
		}
	);


}

function createNewMember()
{
	editMember(
	{
		first_name: "",
		last_name: "",
		nick_name: "",
		netid: "",
		id: -1,
		instrument: 0,
		class_year: new Date().getFullYear()
	});

	editNetid();
}

function editNetid()
{
	for(var key of ["first_name","last_name", "class_year", "nick_name", "instrument_id", "id"])
	{
		document.getElementById(key).disabled = true;
	}

	document.getElementById('netid').removeAttribute('disabled');
	document.getElementById('netid-button').innerHTML = "Save";
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

function setFeedbackBoxFail()
{
	var box = document.getElementById('feedback-box');
	box.setAttribute('icon', "error");
}

function loadTable(memberIDs)
{
	var table = document.getElementById('results');
	var rows = table.getElementsByTagName('tr');

	while(rows.length > 1)
	{
		rows[1].parentNode.removeChild(rows[1]);
	}

	for (let i of memberIDs)
	{

		var row = document.createElement('tr');
		row.className = 'member-row';
		row.id="tr-" + i;

		let member = members[i];



		row.innerHTML = 
			"<td class='name'>" + member.first_name + " " + member.last_name + "</td>" + 
			"<td class='netid'>" + member.netid + "</td>" + 
			"<td class='class_year'>" + member.class_year + "</td>" + 
			"<td class='instrument'>" + enumLookup.instruments[member.instrument_id] + "</td>" + 
			"<td class='nickname'>" + member.nick_name + "</td>" ;
			;

		row.onclick = function()
		{
			editMember(member);
		}

		table.appendChild(row);
	}
}

async function editMember(member)
{
	document.getElementById('col2').style.display = "flex";

	for(var key of ["first_name","last_name", "class_year", "netid", "nick_name", "instrument_id", "id"])
	{
		document.getElementById(key).value = member[key];
		document.getElementById(key).removeAttribute("disabled");
	}

	document.getElementById('netid').setAttribute('disabled', true);
	document.getElementById('netid-button').innerHTML = "Edit";

	// load point data
	document.getElementById('lifetime-points').innerHTML = "";
	document.getElementById('season-points').innerHTML = "";

	var points = await loadJsonP("api/getMemberPoints?member=" + member.id);

	document.getElementById('lifetime-points').innerHTML = points.lifetime_points;
	document.getElementById('season-points').innerHTML = points.season_points;
}

document.getElementById('searchbox').oninput = function()
{
	var keys = this.value.trim().toLowerCase().split(/\s/);
	if (keys[0] == "")
	{
		var ids = defaultSet;
	}
	else{

		var ids = new Set(searchTrie.at(keys[0]));

		for(var i=1; i < keys.length; i++)
		{
			var l = searchTrie.at(keys[i]) || [];
			ids = new Set(l.filter(x => ids.has(x)));
		}
	}

	loadTable(ids);
}

function updateMember()
{
	var data ={};
	data.id = Number(document.getElementById('id').value);
	data.token = document.getElementById('token').value;

	data.first_name = document.getElementById('first_name').value; 
	data.last_name = document.getElementById('last_name').value; 
	data.nick_name = document.getElementById('nick_name').value; 
	data.class_year = Number(document.getElementById('class_year').value); 
	data.instrument_id = Number(document.getElementById('instrument_id').value);

	var row = document.getElementById('tr-' + data.id);

	if(row)
	{
		row.getElementsByClassName('name')[0].innerHTML = data.first_name + " " + data.last_name;
		row.getElementsByClassName('class_year')[0].innerHTML = data.class_year;
		row.getElementsByClassName('nickname')[0].innerHTML = data.nick_name;
		row.getElementsByClassName('instrument')[0].innerHTML = enumLookup.instruments[data.instrument_id];
	}

	var member = members[data.id];

	//update members
	for(var key in data)
	{
		members[data.id][key] = data[key];
	}

	buildSearchTrie(members);

	outbox.send(data); 
	setFeedbackBox();
}

