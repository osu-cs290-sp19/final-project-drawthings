// Handle drawing

var canvas = document.getElementById('draw-canvas');
canvas.height = 600;
canvas.width = 800;

var context = canvas.getContext("2d");
context.lineJoin = "round";

var firstLine = true; // Flag for if first line
var submitted = false;
var drawing; // Flag to track if drawing is in progress
var points = []; // Record of all visited points for redrawing purposes

function setDrawColor(color){
	context.strokeStyle = color;
}

function setDrawSize(width){
	context.lineWidth = width;
}

function fillBackground(color){
	if(color){
		context.fillStyle = color;
	}
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function redraw(){
	fillBackground();

	var userSetWidth = context.lineWidth; // Backup user settings
	var userSetColor = context.strokeStyle;

	for(var i = 0; i < points.length; i++){ // Redraw all points
		setDrawColor(points[i].color);
		setDrawSize(points[i].width);
		if(points[i].mode == "start"){
			context.moveTo(points[i].coordinate.x, points[i].coordinate.y);
			context.beginPath();
		} else if(points[i].mode == "drawing"){
			context.lineTo(points[i].coordinate.x, points[i].coordinate.y);
			context.stroke();
		} else if(points[i].mode == "stop"){
			context.closePath();
		} else{
			alert("Error");
		}
	}
	context.closePath();
	setDrawSize(userSetWidth);
	setDrawColor(userSetColor);
}

function addPoint(coordinate, mode){
	points.push({
		coordinate: coordinate,
		width: context.lineWidth,
		color: context.strokeStyle,
		mode: mode
	});
}

function reset(){
	points = [];
	redraw();
}

function undo() {
	var lastStart = 0;
	for(var i = 0; i < points.length; i++){ // Delete last start-stop sequence (most recent line)
		if(points[i].mode == "start"){
			lastStart = i;
		} 
	}
	points.splice(lastStart, points.length - lastStart);
    redraw();
}

function getCoordinate(event){
	return {
		"x": event.pageX - canvas.offsetLeft,
		"y": event.pageY - canvas.offsetTop
	};
}

function startDrawing(event){
	drawing = true;
	if(!firstLine){
		context.closePath();
	} else {
		firstLine = false;
	}
	var coordinate = getCoordinate(event);
	context.moveTo(coordinate.x, coordinate.y);
	context.beginPath();
	addPoint(coordinate, "start");
	
	// TODO add point where first contact is made
}

function drawLine(event){
	if(drawing){
		var coordinate = getCoordinate(event);
		context.lineTo(coordinate.x, coordinate.y);
		context.stroke();
		addPoint(coordinate, "drawing");
	}
}

function stopDrawing(){
	if(drawing){
		var coordinate = getCoordinate(event);
		drawing = false;
		context.closePath();
		addPoint(points[points.length - 1].coordinate, "stop");
	}
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Drawing Tools

function createColorSelector(color, colorTarget){
	var colorButton = document.createElement("button");
	colorButton.classList.add("color-selector");
	colorButton.style.backgroundColor = color;
	colorButton.addEventListener("click", function(){
		colorTarget(color);
	});
	return colorButton;
}

function setupColorPicker(){ // Color formats for background and drawing are basically the same
	var colors = ["black", "white", "red", "orange", "yellow", "green", "blue", "purple"];

	var colorPicker = document.getElementById("color-picker");
	var backgroundPicker = document.getElementById("background-picker");

	for(var i = 0; i < colors.length; i++){
		colorPicker.appendChild(createColorSelector(colors[i], setDrawColor));

		backgroundPicker.appendChild(createColorSelector(colors[i], function(color){
			fillBackground(color);
			redraw();
		}));
	}
}

function createPenSizeSelector(size){
	var sizeButton = document.createElement("button");
	sizeButton.classList.add("pen-size");

	sizeButton.style.height = size + "px";
	sizeButton.style.width = size + "px";
	sizeButton.style.borderRadius = size + "px";

	sizeButton.addEventListener("click", function(){
		setDrawSize(size);
	});
	return sizeButton;
}

function setupPenSizes(){
	var sizes = [1, 2, 3, 4, 5, 10, 15, 20];

	var penSizes = document.getElementById("pen-sizes");

	for(var i = 0; i < sizes.length; i++){
		penSizes.appendChild(createPenSizeSelector(sizes[i]));
	}
}

// Set Up Page

fillBackground("white");
setDrawSize(5);
setDrawColor("black");

setupColorPicker();
setupPenSizes();

var undoButton = document.getElementById("undo-button");
undoButton.addEventListener("click", undo);
var resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", reset);

// Misc

function handleSubmit() {
	var title = document.getElementById("title-input").value.trim();
	
	if (!title) {
		alert("You must add a title to your thing!");
	} else if (firstLine) {
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
	if (!firstLine && !submitted) {
		var leaveMessage = "You have unsubmitted work.  Are you sure you want to leave?";
		(event || window.event).returnValue = leaveMessage;
		return leaveMessage;
	}
}

window.addEventListener("beforeunload", warnAboutChanges);