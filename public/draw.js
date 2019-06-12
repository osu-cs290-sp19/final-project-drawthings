// https://www.createjs.com/tutorials/Mouse%20Interaction/

var canvas = document.getElementById('draw-canvas');
canvas.height = canvas.clientHeight; // Resize canvas to match display size
canvas.width = canvas.clientWidth;
var context = canvas.getContext("2d");

context.strokeStyle = "black";
context.lineJoin = "round";
context.lineWidth = 5;

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

var first = true;
var submitted = false;
var drawing;

function getCoordinate(event){
	return {
		"x": event.pageX - canvas.offsetLeft,
		"y": event.pageY - canvas.offsetTop
	};
}

function handleMouseDown(event){ // Start line
	drawing = true;
	if(!first){
		context.closePath();
	} else {
		first = false;
	}
	var coordinate = getCoordinate(event);
	context.moveTo(coordinate.x, coordinate.y);
	context.beginPath();
	// TODO add point where first contact is made
}

function handleMouseUp(event){ // End line
	drawing = false;
	context.closePath();
}

function handleMouseMove(event){ // Draw line
	if(drawing){
		var coordinate = getCoordinate(event);
		context.lineTo(coordinate.x, coordinate.y);
		context.stroke();
	}
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

function handleSubmit() {
	var title = document.getElementById("title-input").value.trim();
	
	if (!title) {
		alert("You must add a title to your thing!");
	} else if (first) {
		alert("You haven't drawn anything yet!");
	} else {
		var request = new XMLHttpRequest();
		request.open("POST", "/submitThing");
		
		var thing = {
			title: title,
			thing: canvas.toDataURL()
		};
		var requestBody = JSON.stringify(thing);
		
		request.addEventListener("load", function (event) {
			if (event.target.status === 200) {
				submitted = true;
				var parsedResponse = JSON.parse(event.target.response);
				window.location.href = "/view/" + parsedResponse.index;
			} else {
				alert("Error submitting thing: " + event.target.response);
			}
		});
		
		request.setRequestHeader("Content-Type", "application/json");
		request.send(requestBody);
	}
}

var submitButton = document.getElementById("submit-button");
submitButton.addEventListener("click", handleSubmit);

function warnAboutChanges(event) {
	if (!first && !submitted) {
		var leaveMessage = "You have unsubmitted work.  Are you sure you want to leave?";
		(event || window.event).returnValue = leaveMessage;
		return leaveMessage;
	}
}

window.addEventListener("beforeunload", warnAboutChanges);