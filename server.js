// Build dependencies

var http = require ('http'),
	path = require ('path'),
	express = require ('express'),
	params = require('express-params'),
	pg = require ('pg'),
	nodemailer = require ('nodemailer'),
	moment = require ('moment');

// Start express.js instance

var app = express();
params.extend(app);

var conString = "tcp://hosting-db:alphak1ll$@localhost/postgres"; // !!!!!!!! Change to 'hosting-db' before deploying

var transport = nodemailer.createTransport("SMTP", {
		service: "Gmail",
		auth: {
			user: "colinmatthew@gmail.com",
			pass: "C0linmr1"
		}
	});

// Configure basic app settings and paths

app.configure(function(){
	app.set('port', process.env.PORT || 8080);
	app.set('views', __dirname + '/views');
	app.use(express.favicon(__dirname + 'favicon.ico'));
	app.use(express.logger('dev')); // figure this line out
	app.use(express.bodyParser()); // Express method for parsing POST data into 'req.body'
	app.use(app.router); // figure this line out
	app.use('/views', express.static(__dirname + '/views'));
	app.use('/', express.static(__dirname));
	app.use('/js', express.static(__dirname + '/scripts'));
	app.engine('html', require('ejs').renderFile);
	app.param('week', Number);
	app.param('user', /^(\w+)/);
});

// ???? lol

app.configure('development', function(){
	app.use(express.errorHandler());
});

// Start server

app.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

/* --------------------------------------------------------------------------------------------------------------
			ROUTES: Route url GET / POST requests and serve pages
-------------------------------------------------------------------------------------------------------------- */


app.get('/', function(req, res){
	res.render('about.html', {
		title: 'About'
	});
});

app.get('/home', function (req, res) {
	res.render('index.html', {
		title: 'Home'
	});
});

app.get('/games/:week', function(req, res, next) {

	var param = req.params.week;
	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres: ' + err);
		}});

	var query = client.query('SELECT * FROM nfl."AllGames" WHERE week = $1;', [param], function (err, results) {
		if (err) {
			throw err;
		}
		else {
			res.json(results.rows);
		}
	});
});

app.get('/games', function(req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});

	var query = client.query('SELECT * FROM nfl."AllGames" WHERE week = nfl.thisweek(now());', function (err, results) {
		if (err) {
			throw err;
		}
		else {
			res.json(results.rows);
		}
	});
});

app.post('/users', function(req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});	

	var query = client.query('SELECT count(*) FROM nfl.users WHERE emailaddress = $1 OR username = $2;', [req.body.email, req.body.user], 
		function (err, results) {
			if (err) {
				throw err;
			}
			else {
				res.json(results.rows);
			}
	});
});

app.post('/register', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});	

	var message = {

		from: "Scooter's League <colinmatthew@gmail.com>",
		to: "Ray Rennie <rayrennie@yahoo.com>",
		subject: "User: " + req.body.firstname + " " + req.body.lastname + " has registered",
		html: "username: " + req.body.username + "<br>" + "leagueMember?: " + req.body.leaguemember
	};
	
	var leagueMember = (req.body.leaguemember == "yes" ? 'TRUE' : 'FALSE');

	var query = client.query('INSERT INTO nfl.users VALUES ($1, $2, $3, $4, $5, $6, false, now());', 
				[req.body.firstname, req.body.lastname, req.body.emailaddress, req.body.username, req.body.password, leagueMember], 
				function (err, results) {
					if (err) {
						throw err;
					}
					else {
						transport.sendMail(message, function(error, responseStatus){
						    if(error){
						        console.log('Error occured');
						        console.log(error.message);
						        return;
						    }
						    console.log('Message sent successfully!');
						});
						res.redirect('/home');
					}
	});
});	

app.post('/login', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});	

	var query = client.query('SELECT count(*) FROM nfl.users WHERE username = $1 AND password = $2;', 
				[req.body.username, req.body.password], 
				function (err, results) {
					if (err) {
						throw err;
					};
					if (results.rows[0].count == 1) {
						res.redirect('/home');
					}
					else {
						console.log(results.rows[0].count);
						res.send("Unknown Error Occurred");
					};
	});
});	

app.post('/picks', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});

	var message = {

		from: "Scooter's League <colinmatthew@gmail.com>",
		to: "Ray Rennie <rayrennie@yahoo.com>",
		subject: "User: " + req.body.username + " has made picks for week " + req.body.week,
		html: "username: " + req.body.username + " made " + req.body.selections.length + " new picks for week " + req.body.week
	};

	var checkTime = client.query('SELECT * FROM nfl."AllGames" WHERE week = $1', [req.body.week], 
		function (err, results) {
			if ((moment(results.rows[0].scheduled).format("X")*1000) > Date.now()) {

				console.log(moment(results.rows[0].scheduled).format("X")*1000);
				console.log(Date.now());
				for (i = 0; i < req.body.selections.length; i++) {

					var key = Object.keys(req.body.selections[i])[0];

					var query = client.query('SELECT nfl.userpicks_upsert($1::varchar, $2::varchar, $3::varchar, now()::date, $4::integer, $5::float);', 
								[key, req.body.username, req.body.selections[i][key], req.body.week, req.body.tiebreaker], 
								function (err, results) {
									if (err) {
										throw err;
									};
					});
				};

				transport.sendMail(message, function(error){
			    	if(error){
				        console.log('Error occured');
				        console.log(error.message);
				        return;
				    }
				});

				res.redirect('/home');
			}
			else {
				console.log(moment(results.rows[0].scheduled).format("X"));
				console.log(Date.now());
				res.send("Play for the week has already started");
			}
	});

});

app.post('/:user/picks/:week', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});

	var query = client.query('SELECT * FROM nfl.userpicks WHERE userid = $1 AND week = $2;',
		[req.body.username, req.body.week],
		function (err, results) {
			if (err) { throw err; }
			else {
				res.json(results.rows);
			}
		});
});

app.get('/standings/week/:week', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});

	console.log(req.params.week);

	var query = client.query('SELECT * FROM nfl."AllPicks" where week = $1 order by scheduled asc',
		[req.params.week],
		function (err, results) {
			if (err) { throw err; }
			else {
				if (!results.rows[0].scheduled || (moment(results.rows[0].scheduled).format("X")*1000) > Date.now()) { res.send("Standings for week " + req.params.week + " will be available once play for the week begins")}
				console.log("scheduled: " + moment(results.rows[0].scheduled).format("X")*1000);
				console.log("datenow: " + Date.now());
				res.json(results.rows);
			}
		});
});

app.get('/standings/overall', function (req, res) {

	var client = new pg.Client(conString);
	client.on('drain', client.end.bind(client));

	client.connect( function (err) {
		if (err) {
			return console.error('Could not connect to Postgres:' + err);
		}});

	console.log(req.params.week);

	var query = client.query('SELECT * FROM nfl."Standings"',

		function (err, results) {
			if (err) { throw err; }
			else {
				res.json(results.rows);
			}
		});
});

app.get('/views/standings/week/:week', function (req, res) {

	res.render('wkStandings.html');
});

app.get('/views/standings/overall', function (req, res) {

	res.render('cumStandings.html');
});

