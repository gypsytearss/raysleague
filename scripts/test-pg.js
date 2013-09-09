
var pg = require('pg');

var conString = "tcp://hosting-db:alphak1ll$@localhost/postgres"; // REMEMBER 'NFL' SCHEMA PREFIX IN QUERIES!

var client = new pg.Client(conString);
client.connect();


