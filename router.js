/*
http://expressjs.com/en/guide/routing.html
http://expressjs.com/en/4x/api.html#router
https://expressjs.com/en/api.html#router
*/

var config = require('./config.js');
var database = require('./database.js');
var multer  = require('multer');	// https://github.com/expressjs/multer
var publicRouter = module.exports = require('express').Router();
var privateRouter = require('express').Router();

var log = function(msg){
	console.log('\x1b[37m%s\x1b[0m', msg);	// router log messages are white
}

/**** !!! THE ATTACHING ORDER IS IMPORTANT !!! ****/

// accounting middleware
privateRouter.use((req, res, next) => {
	
	//console.log(require('util').inspect(req.session, { showHidden: true }));
	
	if(!req.session.userId){
		return res.redirect(config.loginPageURL);
	}
	
	next();
});
publicRouter.use((req, res, next) => {
	res.locals.loggedIn = (!!req.session.userId);
	res.locals.loginPageURL = config.loginPageURL;
	res.locals.logoutPageURL = config.logoutPageURL;
	next();
});

// paginating, sorting, filtering middleware
publicRouter.use((req, res, next) => {
	
	res.locals.fullPath = req.baseUrl + req.path;	// http://expressjs.com/en/api.html#req.originalUrl
	
	// parse paginating
	res.locals.offset = parseInt(req.query.offset) || 0;
	res.locals.limit = parseInt(req.query.limit) || 20;
	res.locals.currPageNum = Math.ceil(res.locals.offset/res.locals.limit)+1	// the offset starts from 0;
	
	// parser sorting
	res.locals.sortField = req.query.sortField ? req.query.sortField.toString().replace(/[^a-zA-Z0-9]/g,'') : '';	// only allow [a-zA-Z0-9]* as field name
	res.locals.sortOrder = req.query.sortOrder=='ASC' ? 'ASC' : 'DESC';
	res.locals.sortQuery = res.locals.sortField ? ('sortField='+res.locals.sortField+'&amp;sortOrder='+res.locals.sortOrder) : '';
	
	// parse filtering
	res.locals.activeFilters = {};
	for(var filterField in req.query.filter){
		if ( !req.query.filter[filterField] ) {	// empty, not selected
			continue;
		}
		res.locals.activeFilters[filterField] = req.query.filter[filterField];
	}
	
	var filterItems = [];
	for(filterField in res.locals.activeFilters){
		res.locals.activeFilters[filterField].forEach(function(filterValue) {
			filterItems.push('filter['+encodeURIComponent(filterField)+'][]='+encodeURIComponent(filterValue));
		});
	}
	res.locals.filterQuery = filterItems.join('&amp;');
	
	res.locals.filterAndSortQuery = res.locals.filterQuery + (res.locals.sortQuery ? ('&amp;'+res.locals.sortQuery) : '');
	
	
	//console.log(require('util').inspect(req.query.filter, { showHidden: true }));
	
	// TODO not here, because not everything need this
	database.getAllAttributes(
		function(allAttributes){
			res.locals.allAttributes = allAttributes;
			next();
		},
		next
	);
	
});


publicRouter.get("/", (req, res, next) => {
	database.getItems(
		res.locals.activeFilters,
		res.locals.sortField,
		res.locals.sortOrder,
		res.locals.offset,
		res.locals.limit,
		function(items, count){
			res.render('index', { items: items, count: count });
		},
		next
	);
});

publicRouter.get("/detail/:id(\\d+)", (req, res, next) => {
	
	database.getOneItem(
		Number(req.params.id),
		function(item){
			res.render('detail', { item: item });
		},
		next
	);
});

/* Handle file upload */
privateRouter.route('/upload/:whatfor(faj|talalat)/:id(\\d+)')
  .get((req, res) => {
	res.render('upload', { whatfor: req.params.whatfor });
  })
  .post(
	multer({ dest: 'static/images/' }).array('img'),
	function (req, res, next) {
		var filesData = [];
		req.files.forEach(function(file){
			filesData.push([ req.params.id, file.filename]);
		});
		database.saveFilesData(
			req.params.whatfor,
			filesData,
			function(){
				if (req.params.whatfor=='talalat') {
					res.redirect('/detail/'+req.params.id);
				} else {
					res.redirect(res.locals.fullPath);
				}
			},
			next
		);
});


///--- Handle login process ---///

publicRouter.route(config.loginPageURL)
  .get((req, res) => {
	res.render('login', { returnTo: (req.headers.referer && req.headers.referer.startsWith('http://gomba.tk/')) ? req.headers.referer : '' });
  })
  .post((req, res, next) => {
	// TODO: logging!
	console.log(require('util').inspect(req.body, { showHidden: false }));
	database.verifyUserPassword(
		String(req.body.username),
		String(req.body.password),
		function(userId){
			if (userId && userId>0) {
				req.session.userId = userId;
				res.redirect( String(req.body.returnTo) || '/');
			} else {
				res.redirect(config.loginPageURL);
			}
		},
		next
	);
});
privateRouter.get(config.logoutPageURL, (req, res) => {
	delete req.session.userId;
	return res.redirect('/');
});

publicRouter.use(privateRouter);

// since it's after the use(privateRouter), will only be reached after loggedin
publicRouter.all("/*", (req, res) => {
	res.send('Hello World!');
	//res.end('Not Found');	// not HTML
	//res.render('not-found.pug');
});
