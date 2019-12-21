<?php
require_once "ENV.php";

$conn = new mysqli(ENV::DB_HOST, ENV::DB_USERNAME, ENV::DB_PASSWORD, ENV::DB_NAME);

// Check connection
if ($conn->connect_error) 
{
	die("server unavailable :(");
}

?>