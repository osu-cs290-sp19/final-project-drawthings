var selected = document.getElementsByClassName("selected");
var things = document.getElementsByClassName("thing");
var thingContainer = document.getElementById("gallery-container");

function setSelected(event) {
	for (var i = 0; i < selected.length; i++) {
		selected[i].classList.remove("selected");
	}
	event.target.classList.add("selected");
}

function createSortFunc(field, numeric, reverse) {
	return function (a, b) {
		var fieldA = a.dataset[field];
		var fieldB = b.dataset[field];
		
		if (numeric) {
			fieldA = parseFloat(fieldA);
			fieldB = parseFloat(fieldB);
		} else {
			fieldA = fieldA.toUpperCase();
			fieldB = fieldB.toUpperCase();
		}
		
		if (fieldA > fieldB) return (!reverse ? 1 : -1);
		if (fieldA < fieldB) return (!reverse ? -1 : 1);
		return 0;
	}
}

function sortThings(event, field, numeric = false, reverse = false) {
	setSelected(event);
	
	var elems = document.createDocumentFragment();
	
	thingsList = Array.prototype.slice.call(things, 0);
	thingsList.sort(createSortFunc(field, numeric, reverse));
	
	for (i in thingsList) {
		elems.appendChild(thingsList[i]);
	}
	
	thingContainer.innerHTML = null;
	thingContainer.appendChild(elems);
}

function sortDate(event) {
	sortThings(event, "id", true);
}

function sortTitle(event) {
	sortThings(event, "title");
}

function sortRating(event) {
	sortThings(event, "rating", true, true);
}

document.getElementById("sort-date").addEventListener("click", sortDate);
document.getElementById("sort-title").addEventListener("click", sortTitle);
document.getElementById("sort-rating").addEventListener("click", sortRating);