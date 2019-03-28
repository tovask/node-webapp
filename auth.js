/*
Read the docs:
http://www.passportjs.org/docs/
https://github.com/jaredhanson/passport-google-oauth2
*/
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var config = require('./config.js');

var passport_initialize_middleware = passport.initialize();
var passport_session_middleware = passport.session();


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
		clientID: config.google.clientID,
		clientSecret: config.google.clientSecret,
		callbackURL: config.google.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		// see http://www.passportjs.org/docs/profile/
		if (config.debug === true) {
			done(null, profile); // bypass when debugging
		} else {
			User.findOrCreate({ googleId: profile.id }, function (err, user) {
				return done(err, user);
			});
		}
	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});


// export the auth method and the middleware
module.exports = {
	middleware: function( req, res, next){
		// pass the call to the middlewares
		// well, this is dirty, i think there's a better way to call more middleware
		passport_initialize_middleware( req, res, function(){
			passport_session_middleware( req, res, next);
		});
	},
	authenticate: passport.authenticate.bind(passport)
}

