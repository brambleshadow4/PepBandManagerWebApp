<?php include "../check_admin.php" ?>
<?php include "api.php" ?>
<?php

	#http_response_code(400);
	#exit();

	function checkInt($var)
	{
		return (is_numeric($var) && intval($var) === $var);
	}

	$vars = json_decode(file_get_contents('php://input'));
	
	if (!isset($vars->token) || !hash_equals($vars->token, $_SESSION["token"])
		|| !isset($vars->event_id) || !checkInt($vars->event_id)
		|| !isset($vars->member_id) || !checkInt($vars->member_id))
	{
		http_response_code(400);
		exit();
	}

	$mid = $vars->member_id;
	$eid = $vars->event_id;
	
	if(isset($vars->delete))
	{
		#delete the element
		$q = "DELETE FROM Event_Attendance WHERE member_id=$mid AND event_id=$eid";

		if(!$conn->query($q))
		{
			http_response_code(400);
			exit();
		}

		$conn->close();

		http_response_code(200);
		exit();
	}

	if( (isset($vars->points) &&  !checkInt($vars->points))
		|| !isset($vars->note) || !checkInt($vars->note))
	{
		http_response_code(400);
	
		exit();
	}

	
	$note = $vars->note;
	$points = isset($vars->points) ? $vars->points : "null";
	



	$conn->autocommit(false);
	$conn->begin_transaction();

	$q = "DELETE FROM Event_Attendance WHERE member_id=$mid AND event_id=$eid;";
	$q2 = "INSERT INTO Event_Attendance (member_id, event_id, points, note) VALUES ($mid,$eid,$points,$note)";

	$r1 = $conn->query($q);
	$r2 = $conn->query($q2);

	$conn->rollback();



	if(!$r1 || !r2)
	{
		http_response_code(400);
		$conn->close();
		exit();
	}

	$conn->close();

	http_response_code(200);

	#echo $q;
?>