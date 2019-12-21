<?php
require_once "../ENV.PHP";

header('Content-Type: application/json');

# flushes JSON to the page and stops execuation of other scripts.
function returnJSON($status, $data)
{
	echo "{\"status\":$status, \"data\":\r\n$data\r\n}";
	exit();
}


$conn = new mysqli(ENV::DB_HOST, ENV::DB_USERNAME, ENV::DB_PASSWORD, ENV::DB_NAME);

// Check connection
if ($conn->connect_error) 
{
    returnJSON(400, '"Connection to database failed: ' . $conn->connect_error . '"');
}

?>