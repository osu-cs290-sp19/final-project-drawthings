// https://www.createjs.com/tutorials/Mouse%20Interaction/

var canvas = document.getElementById('draw-canvas');
canvas.height = canvas.clientHeight; // Resize canvas to match display size
canvas.width = canvas.clientWidth;
var context = canvas.getContext("2d");

context.strokeStyle = "#FFF";
context.lineJoin = "round";
context.lineWidth = 5;

var first = true;
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
