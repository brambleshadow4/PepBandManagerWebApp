<?php include "../check_admin.php" ?>
<?php include "../sqlConnect.php" ?>
<html>
	<head>
		<title>BRPB: Points Lists</title>
		<style>
			span[icon]
			{
				width: .7in;
				height: .7in;
				display: inline-block;
	
				background-repeat: no-repeat;
			}

			h2 span {vertical-align: middle;}

			span[icon='pdf']
			{
				background-image: url("../icons/pdf-file.svg");
			}

			h2 a {text-decoration: none;
				color: black;
			}

			h3 {margin-bottom: 5px;}

			#point-lists{ margin-left: 1cm; }
		</style>
	</head>
	<body>
		<h1>BRPB Online Manager</h1>
		<h2><a href="points.php"><span>Current Season's Points</span><span icon='pdf'></span></a></h2>
		<h3>All Points Lists:</h3>
		<div id='point-lists'>
			<?php
				$seasons = $conn->query("SELECT * FROM Seasons ORDER BY start_date DESC");


				if ($seasons->num_rows > 0) 
				{
					while($row = $seasons->fetch_assoc())
					{
						echo "<div><a href='points.php?season=" . $row['id'] . "'>" . $row['name'] . "</a></div>";
					}
				}	
			?>
		</div>
	</body>
</html>