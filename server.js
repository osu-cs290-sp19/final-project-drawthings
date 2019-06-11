var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");

var app = express();
var port = process.env.PORT || 3000;

var thingDB = require("./thingsDB");

for (i in thingDB) {
	thingDB[i].src = "/things/" + thingDB[i].id + ".png";
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
		res.status(200).render("viewPage", context);
	} else {
		next();
	}
});

app.post("/submitThing", function (req, res, next) {
	if (req.body && req.body.title && req.body.thing) {
		console.log("Adding thing with title", req.body.title, "and thing", req.body.thing.substring(0, 30), "...");
		index = 19; // TODO: Finish implementing this function
		res.status(200).send({
			index: index
		});
	} else {
		res.status(400).send({
			error: "Request body needs a title and a thing."
		});
	}
});

app.get('*', function (req, res) {
	res.status(404).render("404");
});

app.listen(port, function () {
	console.log("Server listening on port " + port);
});
