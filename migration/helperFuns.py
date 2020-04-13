
def isElementRef(element):
	return ("reference" in element.attrib)


refDict = {}

def getReference(root, path, element, idlookup):

	# element is needed for optimization as calling from
	# root is very slow.
	s = element.attrib["reference"]

	while s[0:3] == "../":

		s = s[3:]
		path = path[0:path.rfind("/")]


	fullPath = path + "/" + s


	if fullPath in refDict:
		refElement = refDict[fullPath]
	else:
		refElement = root.find(fullPath) 
		refDict[fullPath] = refElement #store the results to speed things up


	if refElement.tag == "Member":
		return idlookup["members"][refElement.find("netID").text]

	elif refElement.tag == "Instrument":
		return idlookup["instruments"][refElement.find("name").text]

	elif refElement.tag == "EventType":
		return idlookup["eventTypes"][refElement.find("name").text]

	elif refElement.tag == "Location":
		return idlookup["locations"][refElement.find("name").text]


	raise Exception("Reference not found:" + refElement.tag)
	