
async function load()
{
	var data = await getTableData();
	document.getElementById('title-heading').innerHTML = data.pageHeading;
}

load();

var uniqueRowId = 0;
var largestId = -1;
var deletedRows = [];;


createTable();

function createRow(keys, data)
{
	var row = document.createElement('tr');
	row.id = "row" + uniqueRowId;

	var td;
	for(var j in keys)
	{	
		var key = keys[j];

		td = document.createElement('td');


		if(key == "id")
		{
			if(data[key] !== undefined)
				largestId = Math.max(largestId, Number(data[key]))
		}
		else
		{
			td.setAttribute("contenteditable", "true")
		}

		if(key == "start_date")
		{
			td.oninput = function()
			{
				var text = this.innerHTML.replace(/<\/?\w+>/g, "").trim();
				if(/\d\d\d\d-\d\d-\d\d/.exec(text) && !isNaN(new Date(text).getTime()))
				{
					this.classList.remove('error');
					this.setAttribute("title","");
				}
				else
				{
					this.classList.add('error')
					this.setAttribute("title", "Error: date should be formatted as YYY-MM-DD");
				}
			}
		}


		td.innerHTML = (data[key] === undefined ? data[j] : data[key]);
		
		row.appendChild(td);
	}

	td = document.createElement('td');
	td.className = 'close-button';
	td.innerHTML = "<span icon='close'></span>";

	let thisRowId = uniqueRowId;

	td.getElementsByTagName('span')[0].onclick = function()
	{
		var el = document.getElementById('row'+thisRowId)

		deletedRows.push(el);

		el.parentNode.removeChild(el);
	}
	row.appendChild(td);

	uniqueRowId++;
	return row;
}

async function createTable()
{
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');

	table.appendChild(tbody);
	var tableData = await getTableData();
	var keys = tableData.keys;
	var items = tableData.items;
	
	tbody.innerHTML = tableData.headerRow;

	for(var i=0; i<items.length; i++)
	{
		tbody.appendChild(createRow(keys, items[i]));
	}

	document.getElementById('editable-table').appendChild(table);

	var lastRow = document.createElement('tr');
	lastRow.id="lastRow"
	td = document.createElement('td');
	td.setAttribute('colspan', keys.length);

	var newRowButton = document.createElement('button');
	newRowButton.innerHTML = "Add row";
	td.appendChild(newRowButton);
	lastRow.appendChild(td);
	tbody.appendChild(lastRow);


	newRowButton.onclick = function()
	{
		var tbody = document.getElementsByTagName('tbody')[0];

		var newItems = keys.slice();
		if(newItems[0] == "id")
		{	
			largestId++;
			newItems[0] = largestId;
		}

		if(newItems[1] == "start_date")
		{
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth()+1;
			month = (month < 10) ? "0" + month : "" + month;
			var day = now.getDate();
			day = (day < 10) ? "0" + day : "" + day;

			newItems[1] = `${year}-${month}-${day}`
		}
		tbody.insertBefore(createRow(keys,newItems), lastRow)
	}

	document.getElementById('notes').innerHTML = tableData.notes;

}

async function getTableData()
{
	if(window.location.toString().indexOf("seasons") >=0)
	{
		return {
			table: "Seasons",
			keys: ["id", "start_date", "name"],
			pageHeading: "Seasons",
			headerRow : "<tr><th>ID</th><th>Start Date</th><th>Season Name</th>",
			items: enums.seasons,
			notes: "The current season is the one with the highest id number, and the previous season is that id number minus one.<br><br>"+
				"You will not be able to successfully delete a season if it has any events.",
		};
	}
	else if(window.location.toString().indexOf("access") >=0)
	{
		var adminData = await loadJsonP("api/getAdmins");
		return {
			table: "Admins",
			keys: ["netid", "role"],
			pageHeading: "Access",
			headerRow : "<tr><th>NetID or Gmail</th><th>Role No.</th>",
			items: adminData ,
			notes: `These settings determine who has the ability to modify the database and what permissions they have, so be careful.
			You can give/revoke accesss by assigning the netid/gmail the corresponding role number.<br><br>
			Possible roles:<br>
			1 - Full administrator access<br><br>
			If you change your own settings, they will apply when you log back in.`,
		}
	}	
	else if(window.location.toString().indexOf("instruments") >=0)
	{
		return {
			table: "Instruments",
			keys: ["id", "name"],
			pageHeading: "Instrument Types",
			headerRow : "<tr><th>ID</th><th>Name</th>",
			items: enums.instruments,
			notes: ``,
		}
	}	
}


async function saveTable()
{
	document.getElementById('save-button').disabled = "true";
	document.getElementById('loading').setAttribute('icon',"loading");
	document.getElementById('success').style.display = "none";
	document.getElementById('errors').style.display = "none";


	var rows = document.getElementsByTagName('tr');
	var tableData = await getTableData();
	var keys = tableData.keys;

	var data = {
		token: document.getElementById("crsf").value,
		table: tableData.table,
		updates: [],
		deletes: [],
	}

	for(var i=1; i < rows.length-1; i++)
	{
		var rowObj = {};
		var tds = rows[i].getElementsByTagName('td');
		for(var j =0; j < tds.length-1; j++) //minus 1 because last is delete button
		{
			var value = tds[j].innerHTML.replace(/<\/?\w+>/g, "").trim();
			rowObj[keys[j]] = value;
		}

		data.updates.push(rowObj);
	}


	for(var i=0; i < deletedRows.length; i++)
	{
		var rowObj = {};
		var tds = deletedRows[i].getElementsByTagName('td');
		for(var j =0; j < tds.length-1; j++)
		{
			var value = tds[j].innerHTML.replace(/<\/?\w+>/g, "").trim();
			rowObj[keys[j]] = value;
		}

		data.deletes.push(rowObj);
	}

	sendJSON("api/updateTable", JSON.stringify(data), successHandler, failHandler)
}

function successHandler()
{
	document.getElementById('save-button').disabled = "";
	document.getElementById('loading').setAttribute('icon',"");
	document.getElementById('success').style.display = "inline-block";
}

function failHandler(errors)
{
	document.getElementById('save-button').disabled = "";
	document.getElementById('loading').setAttribute('icon',"");
	document.getElementById('errors').style.display = "inline-block";

	errors = JSON.parse(errors)
	document.getElementById('errors-text').innerHTML = "<ul>" + errors.map(x => "<li>" + x + "</li>").join("") + "</ul>";
}
