<?php include "../check_admin.php"; ?>
<?php include "api.php"; ?>
<?php

$data = "";

# verify the URL parameters
if (isset($_GET['event']) && is_numeric($_GET['event']))
{
	$eventId = intval($_GET['event']);

	$result = $conn->query("SELECT * FROM Events WHERE id = $eventId");

	if ($result->num_rows > 0) 
	{
		$row = $result->fetch_assoc();

		#output the event data
		$data = sprintf('{"id": %s, "season_id": %s, "name": "%s", "event_type_id": %s, "date": "%s", "default_points": %s, "description": "%s", "attendees":['."\n",
			$row["id"], $row["season_id"], $row["name"], $row["event_type_id"], $row["date"],  $row["default_points"],  $row["description"]);

		#output the attendee data
	    
		$result = $conn->query("SELECT * FROM Event_Attendance WHERE event_id = $eventId");

		if ($result->num_rows > 0) 
		{
			$row = $result->fetch_assoc();
			$data .= sprintf('{"member_id": %s, "points": %s, "note": %s}',
			  $row["member_id"], is_null($row["points"]) ? "null" : $row["points"], $row["note"]);

			while($row = $result->fetch_assoc()) 
		    {
		    	$data .= ",\n";
				$data .= sprintf('{"member_id": %s, "points": %s, "note": %s}',
					$row["member_id"], is_null($row["points"]) ? "null" : $row["points"], $row["note"]);
		    }
		} 
	
		$data .= "]}";

		$conn->close();

		returnJSON(200, $data);
	}
	else
	{
		returnJSON(400, '"Could not locate that event"');
	}
}
else
{
	returnJSON(400, '"Must specify an event id as a URL parameter, e.g. getEvent.php?event=42"');
}
?>