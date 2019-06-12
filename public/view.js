var boxes = document.getElementsByClassName("rate-box");
var thingId = document.currentScript.getAttribute("thingId");

function handleRate(event) {
	var rating = parseInt(event.target.id.substr(4, 5));
	
	var request = new XMLHttpRequest();
	request.open("POST", "/rateThing");
	
	var requestObj = {
		id: thingId,
		rating: rating
	};
	var requestBody = JSON.stringify(requestObj);
	
	request.addEventListener("load", function (evt) {
		if (evt.target.status === 200) {
			event.target.classList.add("rated");
			for (var i = 0; i < boxes.length; i++) {
				boxes[i].classList.remove("unrated");
				boxes[i].removeEventListener("click", handleRate);
			}
			
			var parsedResponse = JSON.parse(evt.target.response);
			document.getElementById("view-rating").textContent = "Rating: " + parsedResponse.newRating + " / 5";
		} else {
			alert("Error rating thing: " + evt.target.response);
		}
	});
	
	request.setRequestHeader("Content-Type", "application/json");
	request.send(requestBody);
}

for (var i = 0; i < boxes.length; i++) {
	boxes[i].addEventListener("click", handleRate);
}