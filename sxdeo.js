
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
var settings = require('./settings');
var flash = require('connect-flash');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var session = require('express-session');
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var _static = require('serve-static');
var multer = require('multer');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

var fs = require('fs');
var accessLog = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
var errorLog = fs.createWriteStream(__dirname + '/error.log', {flags: 'a'});
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(favicon(__dirname + '/public/images/favicon/icon32.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));

app.use(multer({
	dest: './public/images/dbimg',
	rename: function (fieldname, filename) {
		return (new Date).getTime() + filename;
	}
}));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
	secret: settings.cookieSecret,
	key: settings.db,//cookie name
	saveUninitialized: true,
	resave: false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24
	},//1 days
	store: new MongoStore({
		db: settings.db
	})
}));
// app.use(app.router);
app.use(_static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
	var meta = '[' + new Date() + '] ' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
	next();
});
//github
passport.use(new GithubStrategy({
  clientID: "c236c5b3ce11c027c837",
  clientSecret: "fbbf3563241d3025bd7f59b839194d1288995645",
  callbackURL: "http://hwh.club/login/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  done(null, profile);
}));
// development only
if ('development' == app.get('env')) {
 	app.use(errorHandler());
}
app.use(passport.initialize());
//新添加
routes(app);

http.createServer(app).listen(app.get('port'), function(){
 	console.log('药！药！切克闹，煎饼果子来一套 ' + app.get('port'));
});
