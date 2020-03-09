import pickle

f = open("PepBandDatabase.pickle","rb")
databaseData = pickle.load(f)

def makeSafe(s):
	if s == None:
		return ""
	return s.replace("'","''")

with open('members_import.sql', 'w', newline='\r\n') as f:

	s = "INSERT INTO Members (id, netid, first_name, last_name, nick_name, class_year, instrument_id) VALUES ({0}, '{1}', '{2}', '{3}', '{4}', {5}, {6});\n"
	
	for member in databaseData["members"]:

		member = databaseData["members"][member]

		member["netid"] = makeSafe(member["netid"])
		member["first_name"] = makeSafe(member["first_name"])
		member["last_name"] = makeSafe(member["last_name"])
		member["nick_name"] = makeSafe(member["nick_name"])

		f.write(s.format(member["id"],member["netid"],member["first_name"],member["last_name"],member["nick_name"],member["class_year"],member["instrument_id"]))

		
with open('events_import.sql', 'w', newline='\r\n') as f:
	s = "INSERT INTO Events (id, name, season_id, event_type_id, date, default_points, description, open_signup) VALUES ({0}, '{1}', {2}, {3}, '{4}', {5}, '{6}', 0);\n"

	for event in databaseData["events"]:

		event["name"] = makeSafe(event["name"])
		event["description"] = makeSafe(event["description"])

		f.write(s.format(event["id"], event["name"], event["season_id"], event["event_type_id"], event["date"], event["default_points"], event["description"]))



with open('event_attendance_import.sql','w', newline='\r\n') as f:


	s = "INSERT INTO Event_Attendance (member_id, event_id, points, note, status) VALUES ({0}, {1}, {2}, {3}, 2);\n"	

	for item in databaseData["event_attendance"]:
		f.write(s.format(item["member_id"], item["event_id"], item["points"], item["note"]))


with open('instruments_import.sql',"w", newline="\r\n") as f:

	s = "INSERT INTO Instruments (id, name) VALUES ({0}, '{1}');\n"

	for inst in databaseData["instruments"]:
		f.write(s.format(inst["id"], makeSafe(inst["name"])))


with open('event_types_import.sql',"w", newline="\r\n") as f:

	s = "INSERT INTO Event_Types (id, name) VALUES ({0}, '{1}');\n"

	for eventType in databaseData["eventTypes"]:
		f.write(s.format(eventType["id"], makeSafe(eventType["name"])))
	

with open('seasons_import.sql',"w", newline="\r\n") as f:

	s = "INSERT INTO Seasons (id, start_date, name) VALUES ({0}, '{1}', '{2}');\n"

	for season in databaseData["seasons"]:
		f.write(s.format(season["id"], makeSafe(season["start_date"]), makeSafe(season["name"])))
	



