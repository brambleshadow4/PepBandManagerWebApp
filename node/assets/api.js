function loadJSON(url, handler, failhandler)
{
	var request = new XMLHttpRequest();

	request.onreadystatechange = function(e)
	{
	
		if (this.readyState == 4)
		{
			if(this.status == 200)
			{
				var response = JSON.parse(this.responseText);
				handler(response);
			}
			else
			{
				if(failhandler)
				{
					failhandler();
				}
				else
				{
					alert("Something went wrong with loading " + url);
				}
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
			handler(this.response);
		}

		if(this.readyState == 4 && this.status >= 400)
		{
			if(failhandler)
				failhandler(this.response);
			else
				console.error("Failed to send data to " + url);
		}
	};

	request.open("POST", url, true);
	//request.setRequestHeader("Content-Type", "text/JSON"); //this caused problems on the server
	request.send(data);
//}, 1000*Math.random());

}


var boxesSending = 0; // global

/**
 * Outbox provides an interface so that if two POSTS to the same resource
 * are sent out at the same time, it waits for the first to resolve before sending
 * out the next.
 *
 * new Outbox(url, successHandler, failHandler) - creates the outbox.
 * oubox.send(data) - Sends the data
 */
function Outbox(url, successHandler, failHandler)
{
	const OUTBOX_READY = 0; // able to send data to server
	const OUTBOX_AWAIT_ACK = 1; // waiting on a reply from the server
	const OUTBOX_HOLD_DATA = 2; // need to send updated data, but also waiting for a reply

	this._state = OUTBOX_READY;
	this._data = {};

	this._update = function()
	{
		if(this._state == OUTBOX_READY)
		{
			this._state = OUTBOX_AWAIT_ACK;

			boxesSending++;
			sendJSON(url, JSON.stringify(this._data), function(){

				boxesSending--;
				if(this._state == OUTBOX_HOLD_DATA)
				{
					this._state = OUTBOX_READY;
					this._update();	
				}
				else
				{
					this._state = OUTBOX_READY;
					successHandler();
				}
				

			}.bind(this), function(e){
				boxesSending--;
				failHandler(e)
			});
		}
		else
		{
			this._state = OUTBOX_HOLD_DATA;
		}
	}

	this.send = function(data)
	{
		this._data = data;
		this._update();
	}
}

