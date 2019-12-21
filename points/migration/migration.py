# https://docs.python.org/3/library/xml.etree.elementtree.html#module-xml.etree.ElementTree

# This file takes the .xml file used to store points and converts it to SQL that can be used with our database model.

import xml.etree.ElementTree as ET
import pickle
from helperFuns import *


databaseData = {}
idlookup = {}


databaseData["instruments"] = []
idlookup["instruments"] = {}

idCounter = 0

tree = ET.parse('PepBandData.xml')
root = tree.getroot()

for instrument in root.findall('./instruments/Instrument'):

	name = instrument.find('name').text
	idNo = idCounter
	idCounter += 1

	databaseData["instruments"].append({"id": idNo, "name":name})
	idlookup["instruments"][name] = idNo

idCounter = 0
idlookup["eventTypes"] = {}
databaseData["eventTypes"] = []

for eventType in root.findall('./eventTypes/EventType'):

	typeName = eventType.find('name').text
	

	databaseData["eventTypes"].append({"id":idCounter, "name": typeName})
	idlookup["eventTypes"][typeName] = idCounter
	idCounter +=1

	#print(typeName + " " + idNo)


memberId = 0
idlookup["members"] = {}
databaseData["members"] = {}

databaseData["events"] = []
databaseData["event_attendance"] = []

databaseData["seasons"] = [];

eventId = 0
seasonNo = 0


for season in root.findall("./seasons/Season"):

	seasonNo += 1

	print("Gathering Season "+ str(seasonNo) + " data")


	seasonYear = int(season.find("startingYear").text)
	seasonStartDate = season.find("startingDate").text
	seasonStartDate = seasonStartDate[0:seasonStartDate.find(" ")]


	databaseData["seasons"].append({
		"id": seasonNo,
		"name": str(seasonYear) + " - " + str(seasonYear+1),
		"start_date": seasonStartDate
		})



	path = "./seasons/Season["+str(seasonNo)+"]"
	memberNo = 0

	for member in season.findall("members/Member"):

		memberNo += 1
		path2 = path +"/members/Member["+str(memberNo)+"]"

		if isElementRef(member):
			continue

		# get data from element
		firstName = member.find('firstName').text
		lastName = member.find('lastName').text
		nickName = member.find('nickName').text
		classYear = int(member.find('classYear').text)
		netId = member.find("netID").text

		instId = getReference(root, path2+"/instrument", member.find("instrument"), idlookup)
		
		
		# add to database data

		if not(netId in idlookup["members"]):
			databaseData["members"][netId] = {"id": memberId, "netid": netId}
			idlookup["members"][netId] = memberId
			memberId += 1


		databaseData["members"][netId]["first_name"] = firstName
		databaseData["members"][netId]["last_name"] = lastName
		databaseData["members"][netId]["nick_name"] = nickName
		databaseData["members"][netId]["class_year"] = classYear
		databaseData["members"][netId]["instrument_id"] = instId


	eventNo = 0
	for event in season.findall("events/PepBandEvent"):

		eventNo += 1
		eventId += 1

		path2 = path +"/events/PepBandEvent["+str(eventNo)+"]"

		name = event.find("name").text
		date = event.find("date").text
		date = date[0:date.find(" ")]
		defaultPoints = int(event.find("pointValue").text)
		eventType = getReference(root, path2+"/eventType", event.find("eventType"), idlookup)

		databaseData["events"].append({
			"id": eventId,
			"name": name,
			"event_type_id": eventType,
			"date": date,
			"default_points": defaultPoints,
			"season_id": seasonNo,
			"description": ""})

		innerMemberNo = 0

		for member in event.findall("members/Member"):
			innerMemberNo += 1
			path3 = path2 + "/members/Member[" + str(innerMemberNo) + "]"

			memberIdLookup = getReference(root, path3, member, idlookup)

			databaseData["event_attendance"].append({
				"member_id": memberIdLookup,
				"event_id": eventId,
				"points": "NULL",
				"note": 0})

with open("PepBandDatabase.pickle","wb") as f:
	pickle.dump(databaseData, f)

### Continued in migration2.py

