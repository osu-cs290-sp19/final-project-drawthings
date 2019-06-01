var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static('public'));

app.get('/', function (req, res, next) {
	res.status(200).render("homePage");
});

app.get('/draw', function (req, res, next) {
	res.status(200).render("drawPage");
});

app.get('*', function (req, res) {
	res.status(404).render("404");
});

app.listen(port, function () {
	console.log("Server listening on port " + port);
});
