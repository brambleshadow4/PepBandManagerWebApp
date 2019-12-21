
-- Lifetime Events for each user --
SELECT m.first_name, e.name, e.date, COALESCE(att.points, e.default_points) points
FROM Members m
INNER JOIN Event_Attendance att ON att.member_id = m.id
INNER JOIN Events e ON att.event_id = e.id

WHERE m.first_name = "Lewis" AND m.last_name = "Haber"


-- Points gained within a season [Slow]--

SELECT m.id, m.first_name, m.last_name, 
(
	SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
	FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
	WHERE e.id IN 
	(
		SELECT id
		FROM events
		WHERE date BETWEEN '2018-01-01' AND '2019-01-01'
	) 
	AND member_id = m.id
)
AS points
FROM members m 
ORDER BY points DESC


--- Active Members ---

SELECT * FROM Members
WHERE member_id IN
(

	SELECT att.member_id 
	FROM event_attendance att INNER JOIN events e on att.event_id = e.id
	WHERE e.season_id IN (10) 
)


---- Points gained within a season 2 --

SELECT m.id, m.first_name, m.last_name, m.instrument_id,
(
	SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
	FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
	WHERE member_id = m.id AND e.season_id = 10
)
AS points
FROM members m
WHERE m.id IN (
	SELECT att.member_id 
	FROM event_attendance att INNER JOIN events e on att.event_id = e.id
	WHERE e.season_id = 10 )

ORDER BY m.instrument_id ASC, points DESC



--- Gets lifetime points for everyone! ---

SELECT m.id, m.first_name, m.last_name, (
	SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
	FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
	WHERE member_id = m.id)
AS points
FROM members m
ORDER BY points DESC

-- Gets 500 pt club --
SELECT m.id, m.first_name, m.last_name, (
	SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
	FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
	WHERE member_id = m.id)
AS points
FROM members m
WHERE (
	SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
	FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
	WHERE member_id = m.id ) 
>= 500


-- Find date when people made 500 pt club

SELECT m.id, (
	SELECT e.date 
	FROM events e
	WHERE (
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
		FROM event_attendance att INNER JOIN events e2 ON att.event_id = e2.id 
		WHERE member_id = m.id AND e2.date <= e.date
	) >= 500
	ORDER BY date ASC
	LIMIT 1

)
FROM members m
WHERE m.id in (
	-- people who made the 500 pt club
	SELECT m.id
	FROM members m
	WHERE (
		SELECT COALESCE(SUM(COALESCE(att.points, e.default_points)),0) 
		FROM event_attendance att INNER JOIN events e ON att.event_id = e.id 
		WHERE member_id = m.id ) 
	>= 500
)





