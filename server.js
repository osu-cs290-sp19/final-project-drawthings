var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var dataUriToBuffer = require("data-uri-to-buffer");
var fs = require("fs");

var app = express();
var port = process.env.PORT || 3000;

var thingDB = [];

function createThing(title) {
	return {
		title: title,
		rating: 0,
		rating_n: 0
	};
}

function cloneThing(thing) {
	return {
		title: thing.title,
		rating: thing.rating,
		rating_n: thing.rating_n
	};
}

function writeToJSON() {
	thingDBCopy = [];
	for (i in thingDB) {
		thingDBCopy.push(cloneThing(thingDB[i]));
	}
	
	fs.writeFile("./thingsDB.json", JSON.stringify(thingDBCopy, null, 2), function (err) {
		if (err) throw err;
	});
}

function addToThingDB(thing, index) {
	thingDB.push(cloneThing(thing));
	thingDB[index].id = index;
	thingDB[index].src = "/things/" + index + ".png";
}

var thingDBOrig = require("./thingsDB");
for (i in thingDBOrig) {
	addToThingDB(thingDBOrig[i], i);
}

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.json());

app.use(express.static("public"));

function createDefaultContext(name) {
	var active = {};
	active[name] = true;
	return {
		active: active
	};
}

app.get("/", function (req, res, next) {
	var pagename = "homePage";
	res.status(200).render(pagename, createDefaultContext(pagename));
});

app.get("/gallery", function (req, res, next) {
	var pagename = "galleryPage";
	var context = createDefaultContext(pagename);
	context.things = thingDB;
	
	for (i in context.things) {
		context.things[i].ratingText = (context.things[i].rating === 0) ? "Unrated" : context.things[i].rating + " / 5";
	}
	
	res.status(200).render(pagename, context);
});

app.get("/draw", function (req, res, next) {
	var pagename = "drawPage";
	res.status(200).render(pagename, createDefaultContext(pagename));
});

app.get("/view/:n", function (req, res, next) {
	var pagename = "viewPage";
	var id = parseInt(req.params.n);
	var idIsInt = (id != NaN) && (String(id) === req.params.n);
	if (idIsInt && id >= 0 && id < thingDB.length) {
		var context = createDefaultContext(pagename);
		context.thing = thingDB[id];
		
		context.ratingText = (context.thing.rating === 0) ? "Unrated" : context.thing.rating + " / 5";
		
		res.status(200).render("viewPage", context);
	} else {
		next();
	}
});

app.post("/submitThing", function (req, res, next) {
	if (req.body && req.body.title && req.body.thing) {
		index = thingDB.length;
		addToThingDB(createThing(req.body.title), index);
		writeToJSON();
		
		fs.writeFile("./public/things/" + index + ".png", dataUriToBuffer(req.body.thing), "binary", function(err) {
			if (err) throw err;
		});
		
		res.status(200).send({
			index: index
		});
	} else {
		res.status(400).send({
			error: "Request body needs a title and a thing."
		});
	}
});

app.post("/rateThing", function (req, res, next) {
	if (!(req.body && req.body.id && req.body.rating)) {
		res.status(400).send({
			error: "Request body needs an id and a rating."
		});
	} else if (req.body.id < 0 || req.body.id >= thingDB.length) {
		res.status(400).send({
			error: "Request id must correspond to a thing."
		});
	} else {
		var rating = req.body.rating;
		var ratingIsInt = (rating != NaN);
		if (!ratingIsInt || req.body.rating < 1 || req.body.rating > 5) {
			res.status(400).send({
				error: "Request rating must an integer between 1 and 5 (inclusive)."
			});
		} else {
			var id = req.body.id;
			var oldRating = thingDB[id].rating;
			var oldRatingN = thingDB[id].rating_n;
			var newRating = (oldRating * oldRatingN + rating) / (oldRatingN + 1);
			newRating = Math.round(newRating * 1e2) / 1e2; // Round to 2 decimal points
			thingDB[id].rating = newRating;
			thingDB[id].rating_n++;			
			
			writeToJSON();
			
			res.status(200).send({
				newRating: newRating
			});
		}
	}
});

app.get('*', function (req, res) {
	res.status(404).render("404");
});

app.listen(port, function () {
	console.log("Server listening on port " + port);
});
