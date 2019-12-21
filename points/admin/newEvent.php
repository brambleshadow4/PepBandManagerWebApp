<?php include "../check_admin.php" ?>
<?php include "../sqlConnect.php" ?>
<?php

$result = $conn->query("SELECT MAX(id) AS max FROM Events");

if ($result->num_rows == 0) 
{
	die("something bad happend with the query :(");
}

$next_id = $result->fetch_assoc()["max"] + 1;


if (!isset($_POST["token"]) || !hash_equals($_POST["token"], $_SESSION["token"]))
{
	die("bad crsf token");
}


if (!isset($_POST["season"]) || !is_numeric($_POST["season"])){
	die("bad season");
}



$season = $_POST["season"];
$date = date('Y-m-d');


$q = "INSERT INTO Events (id, season_id, name, default_points, event_type_id, date, description) ".
	"VALUES ($next_id, $season, 'New Event', 2, 0, '$date', '')";
$conn->query($q);



header("Location: editEvent.php?$next_id");


?>
