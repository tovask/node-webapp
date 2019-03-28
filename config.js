
var app = require('./app.js');

var debug = (app.get('env') === 'development');

module.exports = {
	debug: debug,
	listenPort: 3000, // the port number what the application will lintenning on
	database: {
		user : 'root', // create a non-root user for production!
		password : 'SqlR00tP@ssword',
		database : 'mynodeproject',
	},
	loginPageURL: '/login',
	logoutPageURL: '/logout' /*,
	// File upload:
	uploadPageURL: '/upload',
	// Google login:
	google: {
		clientID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
		clientSecret: 'YOUR_CLIENT_SECRET',
		callbackURL: "https://YOUR_DOMAIN.com/auth/google/callback"
	}*/
};