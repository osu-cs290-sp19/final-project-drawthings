var express = require("express");
var exphbs = require("express-handlebars");

var app = express();
var port = process.env.PORT || 3000;

var thingDB = require("./thingsDB");

for (i in thingDB) {
	thingDB[i].src = "/things/" + thingDB[i].id + ".png";
}

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

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

app.get("/draw", function (req, res, next) {
	res.status(200).render("drawPage");
});

app.get("/gallery", function (req, res, next) {
	var pagename = "galleryPage";
	var context = createDefaultContext(pagename);
	context.things = thingDB;
	res.status(200).render(pagename, context);
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

app.get('*', function (req, res) {
	res.status(404).render("404");
});

app.listen(port, function () {
	console.log("Server listening on port " + port);
});
