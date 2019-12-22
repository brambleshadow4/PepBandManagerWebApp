<?php include "../check_admin.php"; ?>
<?php include "api.php"; ?>
<?php

if (isset($_GET['season']) && (is_numeric($_GET['season']) || $_GET['season'] == "all"))
{
	if ($_GET['season'] == "all") 
	{
		$result = $conn->query("SELECT * FROM Members");
	}
	else
	{
		$seasonId = intval($_GET['season']);
		$seasonIdEarly = $seasonId - 1;

		$query = 
			"SELECT * FROM Members ".
			"WHERE id IN (".
				"SELECT att.member_id ".
				"FROM Event_Attendance att INNER JOIN Events e on att.event_id = e.id ".
				"WHERE e.season_id IN ($seasonId, $seasonIdEarly))";

		$result = $conn->query($query);
	}

	$data = "[";

	if ($result->num_rows > 0) 
	{
		$row = $result->fetch_assoc();

		$entry = sprintf('{"id": %s, "netid": "%s", "first_name": "%s", "last_name": "%s", "nick_name": "%s", "class_year": "%s", "instrument_id": %s}',
			$row["id"], $row["netid"], $row["first_name"], $row["last_name"], $row["nick_name"],  $row["class_year"], $row["instrument_id"]);

	    $data .= $entry;

	    // output data of each row
	    while($row = $result->fetch_assoc()) 
	    {
	    	$data .= ",\n";
	       	$entry = sprintf('{"id": %s, "netid": "%s", "first_name": "%s", "last_name": "%s", "nick_name": "%s", "class_year": %s, "instrument_id": %s}',
				$row["id"], $row["netid"], $row["first_name"], $row["last_name"], $row["nick_name"],  $row["class_year"], $row["instrument_id"]);

	        $data .= $entry;
	    }
	} 
	
	$data .= "]";

	$conn->close();

	returnJSON(200, $data);
}

else
{
	returnJSON(400,'"Must specify a season, e.g. getMembers?season=4 or getMembers?season=all"');
}
?>