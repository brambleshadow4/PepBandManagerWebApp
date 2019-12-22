<?php include "../check_admin.php" ?>
<?php include "api.php" ?>
<?php

	#http_response_code(400);
	#returnJSON(400, '""');

	function checkInt($var)
	{
		return (is_numeric($var) && intval($var) === $var);
	}

	$vars = json_decode(file_get_contents('php://input'));
	
	if (!isset($vars->token) || !hash_equals($vars->token, $_SESSION["token"])
		|| !isset($vars->event_id) || !checkInt($vars->event_id)
		)
	{
		http_response_code(400);
		exit();
	}

	$id = $vars->event_id;
	
	if(isset($vars->delete))
	{
		#delete the element
		$q = "DELETE FROM Events WHERE id=$id";

		if(!$conn->query($q))
		{
			http_response_code(400);
			echo $q;
			exit();
		}

		$q = "DELETE FROM Event_Attendance WHERE event_id=$id";

		if(!$conn->query($q))
		{
			http_response_code(400);
			echo $q;
			exit();
		}

		$conn->close();
		exit();
	}

	if( !isset($vars->name) || !isset($vars->default_points) 
		|| !isset($vars->date) || !isset($vars->description) || !isset($vars->event_type))
	{
		http_response_code(400);
	
		exit();
	}

	if(!checkInt($vars->event_type) || !checkInt($vars->default_points) )
	{
		http_response_code(400);
		exit();
	}

	if (DateTime::createFromFormat('Y-m-d', $vars->date) === FALSE)
	{
		http_response_code(400);
		exit();
	}

	$default_points = $vars->default_points;
	$event_type = $vars->event_type;
	$date = $vars->date;
	$name = mysqli_real_escape_string($conn, $vars->name);
	$description = mysqli_real_escape_string($conn, $vars->description);
	

	$q = "UPDATE Events SET name='$name', event_type_id=$event_type, date='$date', default_points=$default_points, description='$description' ".
	"WHERE id=$id";

	if(!$conn->query($q))
	{
		http_response_code(400);
		exit();
	}

	$conn->close();

	#echo $q;
?>