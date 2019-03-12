/*
https://github.com/expressjs/session
https://github.com/chill117/express-mysql-session
*/

var session = require("express-session");
var MySQLSessionStore = require('express-mysql-session')(session);

var app = require('./app.js');
var config = require('./config.js');
var database = require('./database.js');


app.set('trust proxy', 1); // trust first proxy, for secure cookie

// set up a session middleware and export it
module.exports = session({
	secret: config.debug !== true ? Math.random().toString(36) : 'abc123',
	resave: false,
	saveUninitialized: false,
	unset: 'destroy',
	cookie: { path: '/', httpOnly: true, secure: false },
	name: 'PHPSESSID', // deception
	store: new MySQLSessionStore({
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,	// 15*60*1000 (15 minute)
		// The maximum age of a valid session; milliseconds:
		expiration: 86400000,	// 24*60*60*1000 (a day)
		// Whether or not to create the sessions database table, if one does not already exist:
		createDatabaseTable: true,
		// Whether or not to end the database connection when the store is closed:
		endConnectionOnClose: false, // since it's from the global pool

		//charset: 'utf8mb4_bin',

		schema: {
			tableName: 'sessions',
			columnNames: {
				session_id: 'session_id',
				expires: 'expires',
				data: 'data'
			}
		},
	}, database),
});
