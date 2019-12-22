<?php include "../check_admin.php" ?>

<html>
	<head>
		<title>BRPB: Events</title>
		<script src="../api.js"></script>
		<script src="../enums.js"></script>
	</head>
	<body>
		<h1>BRPB Online Manager</h1>
		<h2>Events</h2>
		<form action="newEvent.php" method="POST">
			<?php $token = $_SESSION["token"]; echo "<input name='token' type='hidden' id='token' value='$token'/>" ?>
			<?php $token = $_SESSION["default_season"]; echo "<input type='hidden' id='default_season' value='$token'/>" ?>
			Season <span id='season-select-container'></span>
		
			<input type="submit" value="Create a new event"/>
		</form>

		<table id="table">
			<tr>
				
			</tr>
		</table>

		<script>

			var default_season = sessionStorage.season || document.getElementById('default_season').value;
			sessionStorage.season = default_season;

			var enumLookup;

			multiloadJSON(["../api/getEnums.php", "../api/getEvents.php?season=" + default_season], function(stuff){

				var [enums, events] = stuff;

				enumLookup = makeEnumLookup(enums);

				var lastestSeasonId = enums.seasons[enums.seasons.length-1];

				var select = makeSeasonSelect(enums);
				select.id = "season";
				select.name = "season";
				select.value = default_season;
				select.onchange = function()
				{
					loadJSON("../api/getEvents.php?season="+ this.value, loadEventsFromSeason);
					sessionStorage.season = this.value;
					
				}
				document.getElementById('season-select-container').appendChild(select);


				loadEventsFromSeason(events);
			})


			function loadEventsFromSeason(events)
			{
				var table = document.getElementById('table');
				var rows = table.getElementsByTagName('tr');

				table.innerHTML = "<th>Event Name</th><th>Type</th><th>Date</th><th>Actions</th>";

				for(var i in events)
				{
					var event = events[i];

					table.innerHTML += "<tr><td>" + event.name + " ("+  event.default_points + " points) </td>" +

						"<td>" + enumLookup.event_types[event.event_type_id] + "</td>" +
						"<td>" + event.date + "</td>" + 
						
						"<td><a href=editEvent.php?" + event.id + "> Edit </a></td>";
				}	
			}
			
		</script>
	</body>

</html>