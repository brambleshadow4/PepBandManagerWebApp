<?php
	session_start();
	require "ENV.php";

	if (!isset($_SESSION["is_admin"]) || !$_SESSION["is_admin"])
	{
		header("Location: ".ENV::HOST);
	}
?>