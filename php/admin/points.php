<?php
require('../check_admin.php');
require('../sqlConnect.php');
require('../fpdf181/fpdf.php');

date_default_timezone_set("America/New_York");



$instrumentResults = $conn->query("SELECT * FROM Instruments");
$instruments = array();

if ($instrumentResults->num_rows > 0) 
{
	while($row = $instrumentResults->fetch_assoc())
	{
		$instruments[$row["id"]] = $row["name"];
	}
}

if(isset($_GET["season"]) && is_numeric($_GET["season"]))
	$seasonId = $_GET["season"];
else
	$seasonId = $conn->query("SELECT * FROM Seasons WHERE start_date = (SELECT MAX(start_date) FROM Seasons)")->fetch_assoc()["id"];

$query = <<<SQL
SELECT m.id, m.first_name, m.last_name, m.instrument_id, 
( 
    SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
    FROM Event_Attendance att INNER JOIN Events e ON att.event_id = e.id 
    WHERE member_id = m.id AND e.season_id = $seasonId 
) AS points 
FROM Members m 
WHERE m.id IN 
( 
    SELECT att.member_id 
    FROM Event_Attendance att INNER JOIN Events e on att.event_id = e.id 
    WHERE e.season_id = $seasonId
) 
ORDER BY m.instrument_id ASC, points DESC
SQL;

$xStart = 25;
$xMid = 100;
$yStart = 25;
$yLimit = 280;
$height = $yStart;


$pdf = new FPDF();

function newPage()
{
	global $pdf, $height, $yStart;
	$pdf->AddPage();
	$height = $yStart;
}

newPage();

$pdf->SetFont('Arial', 'B', 14);
$pdf->Text($xStart, $height,'Pep Band Points');
$height += 5;

$pdf->SetFont('Arial', 'B', 10);
$pdf->Text($xStart, $height,'Reported ' . date("F d, Y, g:i A"));
$height += 5;


$results = $conn->query($query);

if ($results->num_rows > 0) 
{
	$instrumentId = -1;
	while($row = $results->fetch_assoc())
	{
		if($row["instrument_id"] != $instrumentId)
		{
			$height += 10;

			if($height > $yLimit - 20) newPage();

			$instrumentId = $row["instrument_id"];

			$pdf->SetFont('Arial', 'B', 14);
			$pdf->Text($xStart, $height, $instruments[$instrumentId]);
			$pdf->Line($xStart, $height+1, 185, $height+1);

			$pdf->SetFont('Arial', '', 10);

			$height += 5;

			if($height > $yLimit) newPage();
		}

		$pdf->Text($xStart, $height, $row["first_name"] . " " . $row["last_name"]);
		$pdf->Text($xMid, $height, $row["points"]);
		$height += 5;

		if($height > $yLimit) newPage();
	}

}

$pdf->Output();
?>