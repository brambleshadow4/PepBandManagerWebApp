DROP TABLE IF EXISTS Instruments;
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS Event_Attendance;
DROP TABLE IF EXISTS Attendance_Notes;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Event_Types;
DROP TABLE IF EXISTS Seasons;
DROP TABLE IF EXISTS Suckpoint_Members;

CREATE TABLE Instruments (
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(255)
);

CREATE TABLE Members (
    id int AUTO_INCREMENT PRIMARY KEY,
    netid varchar(255) UNIQUE,
    first_name varchar(255),
    last_name varchar(255),
    nick_name varchar(255),
    class_year int,
    instrument_id int -- People play many instruments, but this is the one to sort them in.
);

CREATE TABLE Event_Attendance (

	id int AUTO_INCREMENT PRIMARY KEY, 
	member_id int,
	event_id int,
	points int NULL, -- If null, user will gain the default points for the event
	note int
);

CREATE INDEX memberIndex ON Event_Attendance (member_id);
CREATE INDEX eventIndex ON Event_Attendance (event_id);

CREATE TABLE Attendance_Notes (
	id int PRIMARY KEY,
	name varchar(255)
);

INSERT INTO Attendance_Notes (id, name) VALUES 
(0, ""),
(1, "Suck Point"),
(2, "Late/Left Early"),
(3, "No Show");


CREATE TABLE Events (
	id int AUTO_INCREMENT PRIMARY KEY,
	name varchar(255),
	season_id int,
	event_type_id int,
	date date,
	default_points int,
	description varchar(255)
);

CREATE INDEX seasonIndex ON Events (season_id);

CREATE TABLE Event_Types (
	id int AUTO_INCREMENT PRIMARY KEY,
	name varchar(255)
);

CREATE TABLE Seasons (
	id int AUTO_INCREMENT PRIMARY KEY,
	start_date date,
	name varchar(255)
);

CREATE TABLE Suckpoint_Members (
	member_id int NOT NULL -- represents who's currently signed up for suck points.
);

