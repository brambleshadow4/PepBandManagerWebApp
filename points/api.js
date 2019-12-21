function loadJSON(url, handler, failhandler)
{
	var request = new XMLHttpRequest();

	request.onreadystatechange = function(e)
	{
	
		if (this.readyState == 4 && this.status == 200)
		{
			var response = JSON.parse(this.responseText);
			if(response.status == 200)
				handler(response.data);
			else
			{
				if(failhandler)
					failhandler(response);
				else
					throw new Error(response.status + ": " + response.data);
			}
		}
	}

	request.open("GET", url, true);
	request.send();
}

/**
	Asynchronously loads multiple resources [a, b, c] and calls handler only when all
	have returned successfully.
*/
function multiloadJSON(resourceArray, handler, failHandler)
{
	var count = resourceArray.length;
	var results = [];

	for(let i = 0; i < resourceArray.length; i++)
	{
		loadJSON(resourceArray[i], function(data){

			results[i] = data;
			count--;

			if(count <=0)
			{
				handler(results);
			}
		},  function(data){

			results[i] = data;
			count--;

			failHandler(results);
		})
	}
}

function sendJSON(url, data, handler, failhandler){

//setTimeout(function(){

	var request = new XMLHttpRequest();

	request.onreadystatechange = function(e)
	{
		if (this.readyState == 4 && this.status == 200)
		{
			handler();
		}

		if(this.readyState == 4 && this.status >= 400)
		{
			failhandler(this.response);
		}
	};

	request.open("POST", url, true);
	//request.setRequestHeader("Content-Type", "text/JSON"); //this caused problems on the server
	request.send(data);
//}, 1000*Math.random());

}


var boxesSending = 0; // global

function Outbox(url, successHandler, failHandler)
{
	const OUTBOX_READY = 0; // able to send data to server
	const OUTBOX_AWAIT_ACK = 1; // waiting on a reply from the server
	const OUTBOX_HOLD_DATA = 2; // need to send updated data, but also waiting for a reply

	this.state = OUTBOX_READY;
	this.data = {};

	this.update = function()
	{
		if(this.state == OUTBOX_READY)
		{
			this.state = OUTBOX_AWAIT_ACK;

			boxesSending++;
			sendJSON(url, JSON.stringify(this.data), function(){

				boxesSending--;
				if(this.state == OUTBOX_HOLD_DATA)
				{
					this.state = OUTBOX_READY;
					this.update();	
				}
				else
				{
					this.state = OUTBOX_READY;
					successHandler();
				}
				

			}.bind(this), function(e){
				boxesSending--;
				failHandler(e)
			});
		}
		else
		{
			this.state = OUTBOX_HOLD_DATA;
		}
	}

	this.send = function(data)
	{
		this.data = data;
		this.update();
	}
}

