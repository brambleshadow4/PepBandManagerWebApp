<?php include "../check_admin.php" ?>


<!DOCTYPE html>
<html>
	<head>
		<title>BRPB: Members</title>
		<script src="Trie.js"></script>
		<script src="../api.js"></script>
		<script src="../enums.js"></script>
		<script src="../sets.js"></script>

		<link href="members.css" type="text/css" rel="stylesheet" />
	</head>
	<body>
		
		<div><h1>BRPB Online Manager</h1></div>

		<div id='cols' class='vertical-expander'>
			
			

			<div id='col1'>

				<h2>Members</h2>
				
				<div>Search list <input id='searchbox' type='search'>

					<form method="POST" action="newMember.php">
						<input type="hidden" name='redirect' value="members.php"/>
						<input type="submit" value="Create New Member"/>
					</form>
				</div>
				
				<div class='vertical-expander-auto'>
					<div id='results-container'>
						<table id='results'>
							<tr><th>Name</th><th>NetID</th><th>Class</th><th>Instrument</th><th id='nickname_header'>Nickname</th></tr>
						</table>
					</div>
				</div>
				
			</div>

			<div id=col2>
				
				<h2><span>Edit Member </span><span id='feedback-box' icon="none"></span></h2>
				<div id='form-container'>
					<input type="hidden" id="id" />

					<?php $token = $_SESSION["token"]; echo "<input type='hidden' id='token' value='$token'/>" ?>

					<div><label>First Name</label><input oninput='updateMember()' id="first_name" /></div>

					<div><label>Last Name</label><input oninput='updateMember()' id="last_name" /></div>

					<div><label>Net ID/label</label><input disabled id="netid"/></div>

					<div><label>Class Year</label><input oninput='updateMember()' id="class_year" type="number"/></div>				

					<div><label>Instrument</label><span id='instrument_id-container'></span></div>

					<div><label>Nick Name (optional)</label><input oninput='updateMember()' id="nick_name" /></div>

					<div id='delete-container'><button onclick='deleteMember();'>Delete Member</button></div>
				</div>
			</div>

		</div>

		<script>
			
			var members = [];
			var defaultSet = new Set();
			var enumLookup = {}; // 
			var searchTrie = new Trie(); // trie for searching members

			var outbox = new Outbox("../api/updateMember.php", setFeedbackBox, setFeedbackBoxFail);


			multiloadJSON(["../api/getMembers.php?season=all", "../api/getEnums.php"], function(returns){
				var allMembers, enums;
				[allMembers, enums] = returns;

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

				buildSearchTrie(members);
				

				loadTable(defaultSet);
			});

			function buildSearchTrie(allMembers)
			{
				var trie = new Trie();

				for(var i in allMembers)
				{
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

					sendJSON("../api/updateMember.php", JSON.stringify(data), function(){

						var row = document.getElementById('tr-' + data.id);

						if(row)
						{
							row.parentNode.removeChild(row);
						}

						delete members[data.id];
						defaultSet.delete(data.id);

						document.getElementById('col2').style.visibility = "hidden";

					})
					
				}
			}

			function setFeedbackBox()
			{
				var box = document.getElementById('feedback-box');

				if(box.getAttribute('icon') != "error")
				{
					if(boxesSending == 0)
					{
						box.setAttribute('icon', "check");
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
						document.getElementById('col2').style.visibility = "visible";

						for(var key of ["first_name","last_name", "class_year", "netid", "nick_name", "instrument_id", "id"])
						{
							document.getElementById(key).value = member[key];
						}

						
					}

					table.appendChild(row);
				}
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


		</script>


		
		
	</body>
</html>