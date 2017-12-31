var express = require('express');
var app 		= express();
var router	= express.Router();
var port		= 8082;

//------------------------------------------------------------------------------------------

app.use(function(req, res, next) {
	console.log('Middleware with no mount path is executed');
	next(); // required or else the request is left hanging
});

//-------------------------------------------------------------------------------------------

app.use('/user/:id', function (req, res, next) {
  console.log('Middleware with mount path /user/:id');
  //console.log('Request Type:', req.method);
  next();
});

//-------------------------------------------------------------------------------------------

app.use('/multifun', function(req, res, next){
	console.log("this example is of substacking of middleware functions.. ");
	next();
}, function (req, res, next) {
	console.log("function 1");
	next();
}, function (req, res, next) {
	console.log("funciton 2");
	next();
});

//-------------------------------------------------------------------------------------------

app.get('/routeHandler/:id', function(req, res, next) {
	console.log("ID: " +  req.params.id);
	next();
}, function(req, res, next) {
	//res.send("thanks for requesting.");
	next();
});

app.get('/routeHandler/:id', function(req, res, next) {
	//console.log('hey');
	res.send("another route for same path.");
});

//-------------------------------------------------------------------------------------------

app.get('/pageSelection/:id', function(req, res, next){
	console.log(req.params.id);
	if (req.params.id == '0') {
		next('route');
	}	else {
		next();
	}

}, function(req, res, next){
		res.send('regular page');
});

app.get('/pageSelection/:id', function(req, res, next){
		res.send('Special page');
});

//-----------------------------------------------------------------------------------------
//Router-level middlewares can be loaded using a router instance using
//var router = express.Router();

//the way of loading is same ass appln-level middlewares using
//router.use() or router.METHOD() METHOD : {get, post, put, delete, etc.}

//router can then be mounted on the app using
//app.use('/routeName', router)

app.use('/routes', router);

router.get('/route', function(req, res, next){
	res.send('Special route');
});

//-----------------------------------------------------------------------------------------

// Error handling middlewares are same except they take 4 arguments
// err argument is now the first argument along with req, res, next.

//-----------------------------------------------------------------------------------------

// express has build in middleware functions hich are following :
// 1) express.static : serves static assets such as HTML files, images, and so on.
// 2) express.json : parses incoming requests with JSON payloads.
// 3) express.urlencoded : parses incoming requests with URL-encoded payloads.

//----------------------------------------------------------------------------------------

// we can use third party middlewares which add on the functionalities of express.

//----------------------------------------------------------------------------------------
app.listen(port, function() {
	console.log('listening at ' + port);
});
