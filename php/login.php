<?php 

session_start();

require_once "vendor/autoload.php";
require_once "ENV.php";

$netid = "";

if(ENV::NO_AUTH) { goto SUCCESS; }

// Get $id_token via HTTPS POST.

$success = 0;


if (isset($_POST["id_token"]))
{
	$id_token = $_POST["id_token"];
	$CLIENT_ID = "428252312756-djr3h6is5c0s8lfr5ev3pr1567rnnjat.apps.googleusercontent.com";

	//google code
	$client = new Google_Client(['client_id' => $CLIENT_ID]);  // Specify the CLIENT_ID of the app that accesses the backend
	$payload = $client->verifyIdToken($id_token);

	if ($payload) 
	{
		if(isset($payload["email_verified"]) && $payload["email_verified"])
		{
			$netid = $payload["email"];

			if(substr($netid,strlen($netid)-12,12) == "@cornell.edu")
			{
				$netid = substr($netid,0,strlen($netid)-12);
			}

			$success = 1;
		}
		else
		{
			$success = 2;
		}
	} 
}

if ($success != 1)
{
	echo "<h1>Uh oh!</h1>";
	echo "<p>Something went wrong... make sure you're logging in to google with your Cornell account. If things still don't work, please contact the pep band manager.</p>";
	echo "<p>ERROR CODE $success";
	exit(0);
}



SUCCESS:

# the id of the user as determined by their email
$_SESSION["user"] = $netid; 
$_SESSION['token'] = bin2hex(random_bytes(32));

if(ENV::NO_AUTH || $netid == "jdm389" || $netid=="nap68")
{
	$_SESSION["is_admin"] = true;	
}
else
{
	$_SESSION["is_admin"] = false;		
}



include "sqlConnect.php";

try
{
	$_SESSION['default_season'] = $conn->query("SELECT * FROM seasons WHERE start_date = (SELECT MAX(start_date) FROM seasons)")->fetch_assoc()["id"];	
}
catch(Exception $e)
{

}


$conn->close();


if($_SESSION["is_admin"])
{
	header("Location: admin/home.php");
}


?>

