import sqlite3

def executeSqlFile(filename):
	conn = sqlite3.connect('pepband.db')
	cur = conn.cursor()
	cur.executescript(open(filename, 'r').read())
	#allLines = open(filename, 'r').read()
	#for line in allLines.split(";"):
	#	print(line)
	#	cur.execute(line)

	cur.close()
	conn.close()



executeSqlFile('createTables.sql')
executeSqlFile('instruments_import.sql')
executeSqlFile('seasons_import.sql')
executeSqlFile('event_types_import.sql')
executeSqlFile('event_attendance_import.sql')
executeSqlFile('events_import.sql')
executeSqlFile('members_import.sql')

