//importing CORE MODULES
var express 		= require('express');			//express framework for creating web applications
var morgan 			= require('morgan');
var mongoose 		= require('mongoose');
var path 			= require('path');

//importing LOCAL MODULES
var routes			= require('./app/router');
var User 			= require('./app/models/User');

//creating obects
var app 				= express();	//invoking express in app variable
var port 				= process.env.PORT || 8082; //var routes			= require('./router');

// middlewares
app.use(morgan('dev')); 						// dev helps in color coded logs
app.use(express.static('public')) 	//used to serve static files
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', routes.router);

//connecting to Mongo DB.
mongoose.connect('mongodb://localhost:27017/blockchain', function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connection to mongodb successful ..')
	}
});


app.get('*', function(req, res) {
	//sendFile requires apbsolute path thus we used __dirname
	//__dirname 				: absolute path of the current direcory
	//path.join(x,y,z) 	: method that joins paths
	res.sendFile(path.join(__dirname, '/public/Index.htm'));
});

//server listening on port 8082
app.listen(port, function() {
	console.log('Running a Server at port ' + port);
});
