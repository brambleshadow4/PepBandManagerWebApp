<?php include "../check_admin.php"; ?>
<?php include "api.php"; ?>
<?php

$data = "";


if (isset($_GET['season']) && is_numeric($_GET['season']))
{
	$seasonId = intval($_GET['season']);

	$result = $conn->query("SELECT * FROM Events WHERE season_id = $seasonId ORDER BY date");

	$data .= "[";

	if ($result->num_rows > 0) 
	{
		$row = $result->fetch_assoc();

		$entry = sprintf('{"id": %s, "name": "%s", "event_type_id": %s, "date": "%s", "default_points": %s, "description": "%s"}',  $row["id"], $row["name"], $row["event_type_id"], $row["date"],  $row["default_points"],  $row["description"]);

	    $data .= $entry;

	    // output data of each row
	    while($row = $result->fetch_assoc()) 
	    {
	    	$data .= ",\n";
	        $entry = sprintf('{"id": %s, "name": "%s", "event_type_id": %s, "date": "%s", "default_points": %s, "description": "%s"}', 
	        	$row["id"], $row["name"], $row["event_type_id"], $row["date"],  $row["default_points"],  $row["description"]);

	        $data .= $entry;
	    }
	} 
	
	$data .= "]";

	$conn->close();

	returnJSON(200, $data);
}
else
{
	returnJSON(400, '"Must specify season as a URL parameter, e.g. getEvents.php?season=42"');
}
?>