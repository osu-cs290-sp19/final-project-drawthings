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

			document.cookie = thingId + "=" + rating + "; expires=Tue, 1 Jan 2030 12:00:00 UTC; path=/";
		} else {
			alert("Error rating thing: " + evt.target.response);
		}
	});
	
	request.setRequestHeader("Content-Type", "application/json");
	request.send(requestBody);
}

var ratingIndex = document.cookie.indexOf(thingId + "=");
if (ratingIndex != -1) {
	ratingIndex += (thingId + "=").length;
	var semicolonIndex = document.cookie.indexOf(";", ratingIndex);
	var currentRating = (semicolonIndex == -1) ? document.cookie.substring(ratingIndex) : document.cookie.substring(ratingIndex, semicolonIndex);
	
	for (var i = 0; i < boxes.length; i++) {
		boxes[i].classList.remove("unrated");
		if (boxes[i].id.substr(4, 5) == currentRating) {
			boxes[i].classList.add("rated");
		}
	}
} else {
	for (var i = 0; i < boxes.length; i++) {
		boxes[i].addEventListener("click", handleRate);
	}
}