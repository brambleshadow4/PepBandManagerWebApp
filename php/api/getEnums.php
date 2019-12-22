
<?php include "api.php"; ?>
<?php


# verify the URL parameters


#Seasons


$result = $conn->query("SELECT * FROM Seasons");

$data = "{\"seasons\":[\n";

if ($result->num_rows > 0) 
{
	$row = $result->fetch_assoc();
	$data .= sprintf('{"id": %s, "start_date": "%s", "name": "%s"}',$row["id"], $row["start_date"], $row["name"]);
	
	while($row = $result->fetch_assoc()) 
    {
    	$data .= ",\n";
		$data .= sprintf('{"id": %s, "start_date": "%s", "name": "%s"}',$row["id"], $row["start_date"], $row["name"]);
    }
	 
}
$data .= "],\n";


# Instruments

$result = $conn->query("SELECT * FROM Instruments");

$data .= "\"instruments\":[\n";

if ($result->num_rows > 0) 
{
	$row = $result->fetch_assoc();
	$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
	
	while($row = $result->fetch_assoc()) 
    {
    	$data .= ",\n";
		$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
    }
	 
}
$data .= "],\n";

# Event types

$result = $conn->query("SELECT * FROM Event_Types");

$data .= "\"event_types\":[\n";

if ($result->num_rows > 0) 
{
	$row = $result->fetch_assoc();
	$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
	
	while($row = $result->fetch_assoc()) 
    {
    	$data .= ",\n";
		$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
    }
	 
}
$data .= "],\n";


# Attendance Notes

$result = $conn->query("SELECT * FROM Attendance_Notes");

$data .= "\"attendance_notes\":[\n";

if ($result->num_rows > 0) 
{
	$row = $result->fetch_assoc();
	$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
	
	while($row = $result->fetch_assoc()) 
    {
    	$data .= ",\n";
		$data .= sprintf('{"id": %s, "name": "%s"}',$row["id"], $row["name"]);
    }
	 
}
$data .= "]}";


$conn->close();

returnJSON(200, $data);