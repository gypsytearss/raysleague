// Include module dependencies
var etree = require('elementtree'),
	http = require ('http'),
	util = require('util'),
	pg = require('pg');

// 'Options' for http GET request to pull-in XML data from SportsDataLLC's api
var options = { host : 'api.sportsdatallc.org',
				path : '/nfl-t1/teams/2012/REG/standings.xml?api_key=v38np4ejnbegrdztr68bfsp6'
};
// Connection string to Gandi hosting instance's postgres database (localhost)
var conString = "tcp://hosting-db:alphak1ll$@localhost/postgres";


var content = "",
	teams = [];

// Class for storing "rows" of data
function Team (id, name, market, wins, losses, ties) {
	this.id = id;
	this.name = name;
	this.market = market;
	this.wins = wins;
	this.losses = losses;
	this.ties = ties;
};

// Main function: makes the http GET request to our api (defined in 'options') and returns it in a string
//				  We then will parse the string and create an elementtree instance to iterate over
var req = http.request(options, function(res) {
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
        content += chunk;
    });

    // Once the content has all been received and "chunked", we begin parsing the data
    res.on("end", function () {
		var tree = etree.parse(content);

		// Set tree's "root" object
		root = tree.getroot();

		// Find all 'team' tags and begin to iterate over them 
		allTeams = root.findall('./conference/division/team');
		for (i = 0; i < allTeams.length; i++) {

			thisId = allTeams[i].get('id');
			thisName = allTeams[i].get('name');
			thisMarket = allTeams[i].get('market');

			record = allTeams[i].find('./overall');

			thisWins = record.get('wins');
			thisLosses = record.get('losses');
			thisTies = record.get('ties');
			teams[i] = new Team(thisId, thisName, thisMarket, thisWins, thisLosses, thisTies);

			console.log("Team " + i + ": " + teams[i].id, teams[i].name, teams[i].market, teams[i].wins, teams[i].losses, teams[i].ties);
		};

		// Connect to Postgres
		var client = new pg.Client(conString);
		client.on('drain', client.end.bind(client));

		client.connect( function (err) {
			if (err) {
				return console.error('Could not connect to Postgres:' + err);
			}});

		for (z = 0; z < teams.length; z++) {	

			var query = client.query('UPDATE nfl.teams SET name = $2, market = $3, wins = $4, losses = $5, ties = $6 WHERE id = $1::VARCHAR;', 
				[teams[z].id, teams[z].name, teams[z].market, teams[z].wins, teams[z].losses, teams[z].ties]);

			query.on('error', function(error) {
				console.log("UPDATE ERROR: " + error);
			});
			query.on('row', function(row) {
				console.log("UPDATE ROW: " + row.id);
			});

			var again = client.query('INSERT INTO nfl.teams(id, name, market, wins, losses, ties) \
				SELECT $1::VARCHAR, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM nfl.teams WHERE id = $1::VARCHAR);', 
				[teams[z].id, teams[z].name, teams[z].market, teams[z].wins, teams[z].losses, teams[z].ties]);

			again.on('error', function(error) {
				console.log("INSERT ERROR: " + error);
			});
			again.on('row', function(row) {
				console.log("INSERT ROW: " + row.id);
			});
		};
	});	
});

// End the http request
req.end();



