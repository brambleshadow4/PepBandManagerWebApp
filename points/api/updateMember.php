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
	
	if (!isset($vars->token) || !hash_equals($vars->token, $_SESSION["token"]))
	{
		
		echo("\n");
		echo($_SESSION["token"]);
		http_response_code(401);
		exit();
	}

	if(!isset($vars->id) || !checkInt($vars->id))
	{
		echo("err 1");
		http_response_code(400);
		exit();
	}

	$id = $vars->id;
	
	if(isset($vars->delete))
	{
		#delete the element
		$q = "DELETE FROM Members WHERE id=$id";

		if(!$conn->query($q))
		{
			http_response_code(400);
			echo "err2";
			exit();
		}

		$q = "DELETE FROM Event_Attendance WHERE member_id=$id";

		if(!$conn->query($q))
		{
			http_response_code(400);
			echo "err3";
			exit();
		}

		$conn->close();
		exit();
	}

	if( !isset($vars->first_name) || !isset($vars->last_name) 
		|| !isset($vars->nick_name) || !isset($vars->class_year) || !isset($vars->instrument_id))
	{
		http_response_code(400);
		echo "err4";
	
		exit();
	}

	if(!checkInt($vars->class_year) || !checkInt($vars->instrument_id))
	{
		http_response_code(400);
		echo "err5";
		exit();
	}

	
	$firstName = mysqli_real_escape_string($conn, $vars->first_name);
	$lastName = mysqli_real_escape_string($conn, $vars->last_name);
	$nickName = mysqli_real_escape_string($conn, $vars->nick_name);

	$classYear = $vars->class_year;
	$instrumentId = $vars->instrument_id;
	

	$q = "UPDATE Members SET first_name='$firstName', last_name='$lastName', nick_name='$nickName', ".
		"class_year=$classYear, instrument_id=$instrumentId WHERE id=$id";

	if(!$conn->query($q))
	{
		http_response_code(400);
		echo "err7";
		exit();
	}

	$conn->close();

	#echo $q;
?>