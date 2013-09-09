// Include module dependencies
var etree = require('elementtree'),
	http = require ('http'),
	util = require('util'),
	pg = require('pg');

// 'Options' for http GET request to pull-in XML data from SportsDataLLC's api
var options = { host : 'api.sportsdatallc.org',
				path : '/nfl-t1/2013/REG/schedule.xml?api_key=v38np4ejnbegrdztr68bfsp6'
};
// Connection string to Gandi hosting instance's postgres database (localhost)
var conString = "tcp://hosting-db:alphak1ll$@localhost/postgres";


var content = "",
	games = [],
	x = 0;

// Class for storing "rows" of data
function Game (week, type, season, id, scheduled, hometeam_id, awayteam_id, status) {
	this.week = week;
	this.type = type;
	this.season = season;
	this.id = id;
	this.scheduled = scheduled;
	this.hometeam_id = hometeam_id;
	this.awayteam_id = awayteam_id;
	this.status = status;
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

		// Set tree's "root" and hold 'season' and 'type' variables which are needed in all data rows
		root = tree.getroot();
		thisSeason = root.get('season');
		thisType = root.get('type');

		// Find all 'week' tags and begin to iterate over them 
		week = root.findall('./week');
		for (i = 0; i < week.length; i++) {

			// Find all 'game' tags and iterate over them
			thisWeek = week[i].get('week');
			wkGames = week[i].findall('./game');

			// Extract game data for each game in each week, then store row data in 'Game' class instances and store them in a list
			for (j = 0; j < wkGames.length; j++) {

				thisId = wkGames[j].get('id');
				thisScheduled = wkGames[j].get('scheduled');
				thisHome = wkGames[j].get('home');
				thisAway = wkGames[j].get('away');
				thisStatus = wkGames[j].get('status');
				games[x] = new Game(thisWeek, thisType, thisSeason, thisId, thisScheduled, thisHome, thisAway, thisStatus);
				x++;
			};
		};

		// Connect to Postgres
		var client = new pg.Client(conString);
		client.on('drain', client.end.bind(client));

		client.connect( function (err) {
			if (err) {
				return console.error('Could not connect to Postgres:', err);
			}});

		for (z = 0; z < games.length; z++) {	

			var query = client.query('UPDATE nfl.games SET season = $2, type = $3, week = $4, scheduled = $5, status = $6, hometeam_id = $7\
				, awayteam_id = $8 WHERE id = $1;', 
				[games[z].id, games[z].season, games[z].type, games[z].week, games[z].scheduled, games[z].status, 
				games[z].hometeam_id, games[z].awayteam_id]);

			query.on('error', function(error) {
				console.log("ERROR: " + error);
			});
			query.on('row', function(row) {
				console.log("ROW: " + row.id);
			});

			var again = client.query('INSERT INTO nfl.games(id, season, type, week, scheduled, status, hometeam_id, awayteam_id) \
				SELECT $1::VARCHAR, $2, $3, $4, $5, $6, $7, $8 WHERE NOT EXISTS (SELECT 1 FROM nfl.games WHERE id = $1);', 
				[games[z].id, games[z].season, games[z].type, games[z].week, games[z].scheduled, games[z].status, 
				games[z].hometeam_id, games[z].awayteam_id]);

			again.on('error', function(error) {
				console.log("ERROR: " + error);
			});
			again.on('row', function(row) {
				console.log("ROW: " + row.id);
			});
		};

	});		
});
// End the http request
req.end();

