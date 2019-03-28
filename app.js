/*
Main file of the program.
Set up and start the server.

Useful docs:
http://expressjs.com/en/4x/api.html#express.static
http://expressjs.com/en/guide/error-handling.html
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-centos-7
http://expressjs.com/en/guide/using-middleware.html
https://github.com/mde/ejs

colorful logging: https://stackoverflow.com/a/41407246

*/

var log = msg => console.log(msg);

var express = require("express");
var app = module.exports = express(); // this need first for circular require
var config = require('./config.js')

app.disable('x-powered-by') // consider https://github.com/helmetjs/helmet

// setup template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// for static files (css, js, imgs)
app.use('/images', express.static('static/images', { index: false, redirect: false, setHeaders: function (res, path, stat) {
	res.set('Content-Type', 'image');	// since files may stored without an extension, force to handle it as an image
}}));
app.use(express.static('static', { index: false, redirect: false }));

app.use( require("body-parser").urlencoded({ extended: true }) );

app.use( require('./session.js') );


app.use(function debugmiddleware(req, res, next) {
	if (config.debug === true) {
		log(`\n\n${req.method} ${req.headers.host} ${req.originalUrl}`);
		log('\tTime:\t'+ (new Date()).toISOString() );
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		log('\tIP:\t'+ ip );
		log('\tuser-agent:\t' + req.headers['user-agent']);
		if(req.headers.referer){
			log('\treferer:\t' + req.headers.referer);
		}
		if(req.session.userId){
			log('\tuserId:\t' + req.session.userId);
		}
		// for deep inspection:
		// console.log(require('util').inspect(req.user, { showHidden: true }));
	}
	next();
})

// attach the routes
app.use( require('./router.js') );

// handle unknown path
app.all("/*", (req, res) => {
	res.end('Not Found');
});


// @see http://expressjs.com/en/guide/error-handling.html
app.use(function errorHandler(err, req, res, next) {
	console.error('\n\nTime:\t'+ (new Date()).toISOString() );
	console.error(err.stack);
	if (config.debug) {
		next(err);	// pass to express
	} else {
		res.status(500).send('Something broke!');
	}
});

// start the server
app.listen( config.listenPort, function(){
	log(`server started to running in ${process.env.NODE_ENV} mode\n`);
	log(`\tlistenning on port ${config.listenPort}`);
});

