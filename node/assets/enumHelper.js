/**
	A helper function that takes the enums from getEvents.php and turns them into JavaScript maps to quickly lookup values.
	E.g. lookup.enumName[i]
*/
function makeEnumLookup(enums)
{
	var lookup = {};
	for(var i in enums)
	{
		lookup[i] = {};

		for(var j in enums[i])
		{
			var obj = enums[i][j];

			lookup[i][obj.id] = obj.name;
			lookup[i][obj.name] = obj.id;
		}
	}

	return lookup;
}

function makeAttendanceNoteSelect(enums)
{
	var select = document.createElement('select');

	for (var i in enums.attendance_notes)
	{
		var option = document.createElement('option');
		option.innerHTML = enums.attendance_notes[i].name;
		option.value = enums.attendance_notes[i].id;

		select.appendChild(option);
	}

	return select;
}
function makeEventTypeSelect(enums)
{
	var select = document.createElement('select');

	for (var i in enums.event_types)
	{
		var option = document.createElement('option');
		option.innerHTML = enums.event_types[i].name;
		option.value = enums.event_types[i].id;

		select.appendChild(option);
	}

	return select;
}

function makeSeasonSelect(enums)
{
	var select = document.createElement('select');

	for (var i in enums.seasons)
	{
		var option = document.createElement('option');
		option.innerHTML = enums.seasons[i].name;
		option.value = enums.seasons[i].id;

		select.appendChild(option);
	}

	return select;
}

function makeInstrumentSelect(enums)
{
	var select = document.createElement('select');

	for (var i in enums.instruments)
	{
		var option = document.createElement('option');
		option.innerHTML = enums.instruments[i].name;
		option.value = enums.instruments[i].id;

		select.appendChild(option);
	}

	return select;
}

function makeLocationSelect(enums)
{
	var select = document.createElement('select');

	for (var i in enums.locations)
	{
		var option = document.createElement('option');
		option.innerHTML = enums.locations[i].name;
		option.value = enums.locations[i].id;

		select.appendChild(option);
	}

	return select;
}