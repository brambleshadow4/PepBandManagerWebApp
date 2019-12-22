
<?php ob_start(); include "../check_admin.php"; ?>
<?php include "../sqlConnect.php" ?>

<?php
	header("Location: members.php");

	
	function checkInt($var)
	{
		return (is_numeric($var) && intval($var) == $var);
	}

	$token = $_SESSION["token"];

	$success = false;
	$errors = "";

	if(isset($_POST["token"]))
	{
		if(!isset($_POST["first_name"]) || $_POST["first_name"] == "")
		{
			$errors .= "Please fill in first name. ";
		}

		if(!isset($_POST["last_name"]))
		{
			$errors .= "Please fill in last name. ";
		}

		if(!isset($_POST["nick_name"]))
		{
			$_POST["nick_name"] = "";	
		}

		if(!isset($_POST["netid"]) || $_POST["netid"] == "")
		{
			$errors .= "Please fill in a netid or email. ";
		}

		if(!isset($_POST["class_year"]))
		{
			$errors .= "Please fill in a class year. ";
		}

		if(!isset($_POST["instrument_id"]) || !checkInt($_POST["instrument_id"]))
		{
			$errors .= "Please select an instrument. ";
		}

		if(!checkInt($_POST["class_year"]))
		{
			$errors .= "Make sure class year is an integer. ";
		}

		if($errors === "")
		{
			$netid = mysqli_real_escape_string($conn, $_POST["netid"]);
			$class_year = intval($_POST["class_year"]);
			$first_name = mysqli_real_escape_string($conn, $_POST["first_name"]);
			$last_name = mysqli_real_escape_string($conn, $_POST["last_name"]);
			$nick_name = mysqli_real_escape_string($conn, $_POST["nick_name"]);
			$instrument_id = intval($_POST["instrument_id"]);

			if(!$conn->query("INSERT INTO Members (netid, class_year, first_name, last_name, nick_name, instrument_id)".
				" VALUES ('$netid',$class_year,'$first_name','$last_name','$nick_name', $instrument_id)"))
			{
				$errors .= $conn->error . ". Make sure your value for Net ID is unique.";
			}

			if($errors === "")
			{
				$success = true;

				if(isset($_POST["redirect"]) && $_POST["redirect"] == "members.php")
				{
					header("Location: members.php");
					exit();
				}

				if(isset($_POST["redirect"]) && substr($_POST["redirect"], 0, 13)  == "editEvent.php")
				{
					header("Location:" . $_POST["redirect"]);
					exit();
				}	
			}
		}
	}

	//var_dump($_POST);

	function postVal($varName)
	{
		if(isset($_POST[$varName]))
		{
			echo("value='$_POST[$varName]'");
		}
	}
?>

<!DOCTYPE html>
<html>
	<head>
		<title>BRPB: New Member</title>
		<style>
			form label{
				display: inline-block;
				width: 2in;	
			}

			form div
			{
				margin-bottom: 2px;
			}
			
		</style>

		<script src="../enums.js" ></script>
		<script src="../api.js" ></script>
	</head>
	<body>

		<h1>Create a new member</h1>

		<?php
			if ($errors != "")
				echo "<p class='errors'>$errors</p>";
		?>

		<form action="newMember.php" method="POST">

			<input type='hidden' name='redirect' <?php postVal("redirect") ?>/>
			<input type='hidden' name='token' value='<?php echo $token; ?>' />

			<div><label>First Name</label><input name="first_name" id="first_name" <?php postVal("first_name"); ?>/></div>

			<div><label>Last Name</label><input name="last_name" id="last_name" <?php postVal("last_name"); ?> /></div>

			<div><label>Net ID (or email address)</label><input name="netid" <?php postVal("netid"); ?> id="netid"/></div>

			<div><label>Class Year</label><input id="class_year" name="class_year" type="number" <?php postVal("class_year"); ?>/></div>

			<input type="hidden" id='instrument_id-duplicate' <?php postVal("instrument_id"); ?> />
			<div><label>Instrument</label><span id='instrument_id-container'></span></div>

			<script>
				loadJSON("../api/getEnums.php", function(enums){
					var select  = makeInstrumentSelect(enums);
					select.id   = "instrument_id";
					select.name = "instrument_id";

					var duplicate = document.getElementById('instrument_id-duplicate');

					if(duplicate.hasAttribute('value'))
						select.value = duplicate.value;

					document.getElementById('instrument_id-container').appendChild(select);
				});
			</script>

			<div><label>Nick Name (optional)</label><input id="nick_name" /></div>

			<input <?php if($success) echo "disabled"?> type="submit" />
		</form>
	</body>
</html>