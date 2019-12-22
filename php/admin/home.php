<?php include "../check_admin.php" ?>

<!DOCTYPE HTML>
<html>
	<head>
		<title>BRPB: Home</title>
		<style>
			a { display: inline-block; 
				color: black;
				text-decoration: none;
				text-align: center;
			}
			span.icon-box
			{
				width: .8in;
				height: .8in;
				background-color: #FFAAAA;
				display: block;
				border: solid black 2px;

				border-radius: .125in;

				position: relative;
			}
			span[icon]
			{
				width: .7in;
				height: .7in;
				display: block;

				position: absolute;
				top: .05in;
				left: .05in;
				
				background-repeat: no-repeat;
			}
			span[icon='hockey']
			{
				background-image: url("../icons/hockey.svg");
			}

			span[icon='people']
			{
				background-image: url("../icons/ios-people.svg");
			}

			span[icon='pdf']
			{
				background-image: url("../icons/pdf-file.svg");
			}

			footer
			{
				position: fixed;
				bottom: 0px;
			}

			body a{
				vertical-align: top;
			}

		</style>

	</head>
	<body>
		<h1>BRPB Online Manager</h1>
		<div id='apps'>
			<a href="events.php">
				<span class='icon-box'><span icon='hockey'></span></span>
				<span>Events</span></a>
			<a href="members.php">
				<span class='icon-box'><span icon='people'></span></span>
				<span>Members</span>
			</a>
			<a href="pointsLists.php">
				<span class='icon-box'><span icon='pdf'></span></span>
				<span>Points List</span>
			</a>
		</div>

		<div><br>TODO: OAuth, allow netid editing, suck points, add seasons, member portal, event signups</div>

		<footer><div>Icons used from www.flaticon.com</div>

			<div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
		</footer>
	</body>
</html>