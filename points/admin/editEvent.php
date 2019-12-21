<?php include "../check_admin.php" ?>


<!DOCTYPE html>
<html>
	<head>
		<title>BRPB: Edit Event</title>
		<script src="Trie.js"></script>
		<script src="../api.js"></script>
		<script src="../enums.js"></script>
		
		<link type="text/css" href="editEvent.css" rel="stylesheet" />

	</head>
	<body class="expander">
		
		<div><h1>BRPB Online Manager</h1></div>

		<div id='cols'>
			
			<div id='col1'>
				<h2><span>Edit Event </span><span id='feedback-box' icon="none"></span></h2>

				<div id='event-info'>

					<div>
						<label for='name'>Event Name</label>
						<input maxlength="255" id='name' oninput="updateEvent()"/> 
					</div>
					<div>
						<label>Type</label> <span id='event_type_container'></span>
					</div>
					<div><label>Points</label> <input id='default_points' oninput="updateEvent()" type="number"/> </div>
					<div><label>Date</label> <input maxlength="255" onchange="updateEvent()" id='date' type="date" /> </div>
					<?php $token = $_SESSION["token"]; echo "<input type='hidden' id='token' value='$token'/>" ?>
					
					<div>
						<label for='description'>Description</label>
						<input maxlength="255" id='description' oninput="updateEvent()"/>
					</div>
					
				</div>
				<hr>
				<div>Search for people to add</div>
				<div>
					<span class='no-wrap'><label for='allMembersFalse'>Season members</label> <input id='allMembersFalse' name='allMembers' checked type='radio'></span>
					<span class='no-wrap'><label for='allMembersTrue'>All members</label> <input id='allMembersTrue' name='allMembers' type='radio'></span>
				</div>

				<form action='newMember.php' method='POST' style="display:none">
					<input name='redirect' type='hidden' id='redirect' value='editEvent.php' />
					<script> document.getElementById('redirect').value += location.search; </script>
					<input type='submit' id='new-member'/>
				</form>

				<div id='searchbox-container'>
					<input id='searchbox' type='search'>
					<div id='results' class="hidden"></div>
				</div>
				<hr>

				<button id='delete' onclick="deleteEvent();">Delete Event</button>
				
			</div>

			<div id=col2>
				<table id='attendees'>
					<tr><th>Attendee</th><th>Points</th><th>Note</th></tr>
				</table>
			</div>
		
		</div>


		
		<script src="editEvent.js"></script>
	</body>
</html>