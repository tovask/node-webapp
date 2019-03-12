/*
https://github.com/mysqljs/mysql
*/

var log = function(msg){
	console.log('\x1b[36m%s\x1b[0m', msg);	// database log messages are cyan
}

var mysql = require('mysql');

var config = require('./config.js');

var pool = module.exports = mysql.createPool({
		//host : 'localhost',
		user : config.database.user,
		password : config.database.password,
		database : config.database.database,
		connectionLimit : 20, // maximum simultenius connections
		waitForConnections: false, // don't wait if all the connections are in use
		trace : config.debug === true, // include trace in error
	});

pool.getAllAttributes = function( successCallback, errorCallback){
	// mezo, id, nev, sorrend
	var query = `
(SELECT 'aljzat'          AS mezo, parent.id, parent.nev, parent.sorrend, IF(parent.szulo_id=0,1,0) AS isTopLevel, GROUP_CONCAT(child.id) AS childs FROM aljzat AS parent LEFT JOIN aljzat AS child ON (parent.id = child.szulo_id) GROUP BY parent.id) UNION
(SELECT 'aljzatallapot'   AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM aljzatallapot   ) UNION
(SELECT 'aljzatfeleseg'   AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM aljzatfeleseg   ) UNION
(SELECT 'magassag'        AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM magassag        ) UNION
(SELECT 'nitrogen'        AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM nitrogen        ) UNION
(SELECT 'preparatum'      AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM preparatum      ) UNION
(SELECT 'talajfeleseg'    AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM talajfeleseg    ) UNION
(SELECT 'talajnedvesseg'  AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM talajnedvesseg  ) UNION
(SELECT 'talajreakcio'    AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM talajreakcio    ) UNION
(SELECT 'talajtipus'      AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM talajtipus      ) UNION
(SELECT 'tarsulokepesseg' AS mezo,        id,        nev,        sorrend,                         0 AS isTopLevel,                   NULL AS childs FROM tarsulokepesseg )
ORDER BY mezo, sorrend
`;
	pool.query(query, function (error, results, fields) {
		if (error) return errorCallback(error);
		var allAttributes = {};
		for(row in results){
			if ( !(results[row]['mezo'] in allAttributes) ) {
				allAttributes[ results[row]['mezo'] ] = {};
			}
			allAttributes[ results[row]['mezo'] ][ results[row]['id'] ] = results[row];
		}
		successCallback(allAttributes);
	});
}

pool.getItems = function( filters, sortField, sortOrder, offset, limit, successCallback, errorCallback){
	//console.log(require('util').inspect(filters, { showHidden: true }));
	var recordBase = 'faj LEFT JOIN talalat ON (faj.id = talalat.faj) LEFT JOIN kep ON (faj.id = kep.faj)';
	var wheres = [];
	for ( field in filters ) {
		// validating field names
		if ( [ 'aljzat', 'aljzatallapot', 'aljzatfeleseg', 'magassag', 'nitrogen', 'preparatum', 'talajfeleseg', 'talajnedvesseg', 'talajreakcio', 'talajtipus', 'tarsulokepesseg' ].indexOf(field) == -1 ) {
			// TODO log hacker!
			continue;
		}
		//console.log(require('util').inspect(filters[field], { showHidden: true }));
		if ( !Array.isArray(filters[field]) ) {
			// TODO log hacker!
			continue;
		}
		wheres.push( mysql.format(' talalat.?? IN ( ? ) ', [ field, filters[field] ]) );
	}
	if (wheres.length > 0) {
		recordBase += ' WHERE ' + wheres.join(' AND ');
	}
	var queryString = mysql.format(
		'SELECT talalat.id, faj.nev, talalat.datum, talalat.helyszin, kep.file FROM '+recordBase+' ORDER BY ?? ? LIMIT ? OFFSET ? ',
		[
			// validating sort field, TODO log the hacker activity!
			( ([ 'nev', 'datum', 'helyszin' ].indexOf(sortField) != -1) ? sortField : 'talalat.id'),
			mysql.raw(sortOrder),
			limit,
			offset
		]
	);
	log(queryString);
	pool.query(queryString, function (error, results, fields) {
		if (error) return errorCallback(error);
		var items = results;
		pool.query('SELECT COUNT(*) AS count FROM '+recordBase, function (error, results, fields) {
			if (error) return errorCallback(error);
			var count = results[0].count;
			successCallback(items, count);
		});
	});
};


pool.getOneItem = function( id, successCallback, errorCallback){
	var queryString = mysql.format( 'SELECT talalat.id AS talalat_id, faj.id AS faj_id, talalat.*, faj.* FROM talalat LEFT JOIN faj ON (talalat.faj = faj.id) WHERE talalat.id = ?', [ id ] );
	log(queryString);
	pool.query( queryString, function (error, results, fields) {
		if (error) return errorCallback(error);
		successCallback(results[0]);
	});
}

pool.saveFilesData = function( whatfor, filesData, successCallback, errorCallback){
	if (filesData.length==0) {
		return successCallback();
	}
	var queryString = mysql.format( 'INSERT INTO kep ( '+(whatfor=='faj'?'faj':'talalat')+', file) VALUES ?', [ filesData ] );
	log(queryString);
	pool.query( queryString, function (error, results, fields) {
		if (error) return errorCallback(error);
		successCallback()
	});
}

function hash_sha256(data){
	var hash = require('crypto').createHash('sha256');
	hash.update(data);
	return hash.digest('hex');
}
pool.verifyUserPassword = function( username, password, successCallback, errorCallback){
	password = hash_sha256(password);
	var queryString = mysql.format( 'SELECT * FROM users WHERE username = ? AND password = ?', [ username, password ] );
	log(queryString);
	pool.query( queryString, function (error, results, fields) {
		if (error) return errorCallback(error);
		if (results.length == 1) {
			successCallback(results[0]['id']);
		} else {
			successCallback(-1);
		}
	});
}

