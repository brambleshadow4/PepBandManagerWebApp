DROP TABLE IF EXISTS Instruments;
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS Event_Attendance;
DROP TABLE IF EXISTS Attendance_Notes;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Event_Types;
DROP TABLE IF EXISTS Seasons;
DROP TABLE IF EXISTS Suckpoint_Members;
DROP TABLE IF EXISTS Locations;

CREATE TABLE Instruments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(255)
);

CREATE TABLE Members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    netid varchar(255) UNIQUE NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    nick_name varchar(255) NOT NULL,
    class_year int NOT NULL, 
    instrument_id int  NOT NULL -- People play many instruments, but this is the one to sort them in.
); 

CREATE TABLE Event_Attendance (

	member_id int,
	event_id int,
	points int NULL, -- If null, user will gain the default points for the event
	note int,
	instrument_id tinyint NULL, -- what they played
	status tinyint
	-- 1 self signed signed up
	-- 2 manager sign up
	-- 3 self signed up going
	-- 4 going
);


CREATE INDEX memberIndex ON Event_Attendance (member_id);
CREATE INDEX eventIndex ON Event_Attendance (event_id);

CREATE TABLE Attendance_Notes (
	id INTEGER PRIMARY KEY,
	name varchar(255)
);

INSERT INTO Attendance_Notes (id, name) VALUES 
(0, ""),
(1, "Suck Point"),
(2, "Late/Left Early"),
(3, "No Show");


CREATE TABLE Events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name varchar(255),
	season_id int,
	event_type_id TINYINT,
	location_id tinyint,
	date date,
	default_points int,
	open_signup BOOLEAN,
	description varchar(255)
);

CREATE TABLE Locations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name varchar(255)
);

INSERT INTO Locations (id, name) VALUES 
(0, "Home"),
(1, "Away"),
(2, "Playoff"),
(3, "Renegade"),
(4, "Away + Playoff");


CREATE INDEX seasonIndex ON Events (season_id);

CREATE TABLE Event_Types (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name varchar(255)
);

CREATE TABLE Seasons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	start_date date,
	name varchar(255)
);

CREATE TABLE Suckpoint_Members (
	member_id int NOT NULL -- represents who's currently signed up for suck points.
);

CREATE TABLE Admins (
	netid varchar(255) NOT NULL,
	role int NOT NULL 
);

