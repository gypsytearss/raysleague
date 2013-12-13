
/********************************************* QUOTES ********************************************************/


var quotes = [
	{
		author: "San Francisco 49ers",
		quote: "&#34As iron sharpens iron, so does one man sharpen another.&#34"
	},
	{
		author: "Ronald Reagan",
		quote: "&#34Going to college offered me the chance to play football for four more years.&#34"
	},
	{
		author: "John F. Kennedy",
		quote: "&#34Politics is like football; if you see daylight, go through the hole.&#34"
	},
	{
		author: "Vince Lombardi",
		quote: "&#34People who work together will win, whether it be against complex football defenses or the problems of modern society.&#34"
	},
	{
		author: "Lewis Grizzard",
		quote: "&#34Life is a lot like football. You have to tackle your problems, block your fears, and score your points when you get the opportunity&#34"
	},
	{
		author:"Peyton Manning",
		quote:"\"Pressure is something you feel when you don't know what the hell you're doing.\""
	},
	{
		author:"Vince Lombardi, Jr.",
		quote:"\"Once you learn to quit, it becomes a habit\""
	},
	{
		author:"Lou Holtz",
		quote:"\"Ability is what you're capable of doing. Motivation determines what you do. Attitude determines how well you do it.\""
	},
	{
		author:"Jarod Kintz",
		quote:"\"When I meet a European, the first thing I say is, 'I’d much rather watch football than football.' But I’m just teasing them, and they know I’d really rather watch football than football.\""
	},
	{
		author:"Jerry Rice",
		quote:"\"Today I will do what others won't, so tomorrow I can accomplish what others can't\""
	},
	{
		author:"John Madden",
		quote:"\"You got one guy going boom, one guy going whack, and one guy not getting in the endzone.\""
	},
	{
		author:"Dmitri Shostakovich",
		quote:"\"Football is the ballet of the masses.\""
	},
	{
		author:"Maurice Jones-Drew",
		quote:"\"You're the only one that can put pressure on yourself... No one else can put pressure on you. It's self-inflicted.\""
	},
	{
		author:"John Madden",
		quote:"\"There definitely needs to be water on the sidelines for these players, but I also had some Gatorade just in case they were allergic to the water or vice versa.\""
	}
];

var dispQuotes = setInterval(function () {showQuotes()}, 10000);

function showQuotes () {

	var quoteNum = Math.floor(Math.random()*quotes.length);
	quote = quotes[quoteNum];

	$("header").empty();
	$("header").append("<p class=\"quote\" style=\"inline\"></p><p id=\"author\"></p>");

	$(".quote").html(quote.quote);
	$("#author").text(quote.author).show();

	textArray = $(".quote").text().split('');
	textArray[0] = "<b id=\"largeQuote\">" + textArray[0] + "</b>";
	textArray[textArray.length - 1] = "<b id=\"largeQuote\">" + textArray[textArray.length - 1] + "</b>";
	$(".quote").html(textArray.join(''));
}


/****************************************** WEEKLY PICKS ***************************************************/


function loadWeek(week) {

	if (!sessionStorage.week || sessionStorage.week < 1) {
		var weekReq = "/games";
	}
	else {
		var weekReq = "/games/" + week;
	}

	$('.weekTitle').empty();
	$('.matchups').remove();
	$('.daydiv').remove();
	$('.tieSubmit').remove();
	sessionStorage.selections = [];
	selections = [];

	var dock = $.get(weekReq, function(data) {

		sessionStorage.week = data[0].week;

		for (i = 0; i < data.length; i++) {

			if (i == 0) {
				$('.weekTitle').append("Picks<b style=\"color:red\">:Week " + data[i].week + "</b>");
				var dateToday = moment(data[i].scheduled);
				$('body').append("<div class=\"daydiv\"><b>" + dateToday.format("ddd, MMM, Do") + "</b></div>");
			}
			else {
				var dateYest = moment(data[i-1].scheduled);
				var dateToday = moment(data[i].scheduled);
				if (dateYest.format("ddd") != dateToday.format("ddd")) {
					$('body').append("<div class=\"daydiv\"><b>" + dateToday.format("ddd, MMM, Do") + "</b></div>");
				}
			}

			$('body').append("<table class=\"matchups\"><tr id=" + data[i].id + "><td id=\"scheduled\">" + dateToday.format("h:mmA")
			 + "<td id=" + data[i].awayteam_id + 
				" onclick=highlight('" + data[i].id + "','" + data[i].awayteam_id + "','" + data[i].hometeam_id + "')>" + 
				data[i].awayteam_market + " " + data[i].awayteam_name + 
				"<br> (" + data[i].awayteam_wins + "-" + data[i].awayteam_losses + "-" + data[i].awayteam_ties + ")" + 
				"<td id=\"versus\">.... at ...." +
				"<td id=" + data[i].hometeam_id + 
				" onclick=highlight('" + data[i].id + "','" + data[i].hometeam_id + "','" + data[i].awayteam_id + "')>" + 
				data[i].hometeam_market + " " + 
				data[i].hometeam_name + "<br> (" + data[i].hometeam_wins + "-" + data[i].hometeam_losses + "-" + data[i].hometeam_ties + ")" + 
				"</tr></table>");
		};

		if (sessionStorage.user) {
			var destination = '/' + sessionStorage.user + '/picks/' + sessionStorage.week;
			var picks = $.post(destination, {username: sessionStorage.user, week: sessionStorage.week},
				function (response) {
					for (i = 0; i < response.length; i++) {
						highlight(response[i].gameid, response[i].teamid, null);
					}

					try {
						var tiebreak = response[0].tiebreaker; }
					catch(err) {
						var tiebreak = "";}

					$('body').append("<div class=\"tieSubmit\">\
						<b>Tiebreaker: </b><input type=\"number\" id=\"tiebreaker\" name=\"tiebreaker\"  min=\"0\" max=\"200\" step=\"1\" value=tiebreak.val() /><br>\
						<input type=\"button\" class=\"formbutton\" value=\"Submit\" onclick=submitPicks()>\
						</div>");
					$("#tiebreaker").val(tiebreak);
				});

		}
	})
	.fail(function() { console.log("error loading data from GET /games request."); });
}

function Game (gameid, hometeam_id, awayteam_id, tiebreaker, winner) {
	this.gameid = gameid;
	this.hometeam_id = hometeam_id;
	this.awayteam_id = awayteam_id;
	this.tiebreaker = tiebreaker;
	this.winner = winner;
}

function loadStandings() {

	$('.overview').empty();

	var getReq = $.get("/standings/overall", function(data) {

		if (data[0].week) { 

			var players = [],
				weeks = [];

			for (i = 0; i < data.length; i++) {

				if (players.indexOf(data[i].userid) == -1) { players.push(data[i].userid); }
				var grep = $.grep(weeks, function(e) { return e.week == data[i].week; });
				if (grep.length == 0) { weeks.push(data[i].week); }
			};

			var selections = "<tr><td id=\"players\">";
			for (x = 1; x < 18; x++) {

				selections += "<td id=\"selection\"><b><p style=\"color:#BFBFBF;\">" + x + "</p></b></td>";
			}
			selections += "<td id=\"tiebreak\"><b> Total </b></td></tr>";

			for (j = 0; j < players.length; j++) {

				var total = 0;
				var playerTotals = "<tr><td id=\"players\"><b>" + players[j] + "</td>";

				for (k = 1; k < 18; k++) {

					var greppy = $.grep(data, function(e) { return (e.week == k && e.userid == players[j])});
					if (!greppy[0]) { playerTotals  += "<td>"; }
					else { 
						playerTotals  += "<td id=\"selection\" style=\"color:black;\">" + greppy[0].count + "</td>";
						total += parseInt(greppy[0].count);
					}
				}

				playerTotals  += "<td id=\"tiebreak\"><b>" + total + "</b></td></tr>";
				selections += playerTotals ;
			}

			$('.overview').append(selections);
		}
	});
}

function loadWeekPicks(week) {

	$('.weekTitle').empty();
	$(".about").remove();
	sessionStorage.selections = [];
	selections = [];

	if (!week || week < 1) {
		var weekReq = "/standings/week/1";
		$('.weekTitle').append("Game Day Sheet<b style=\"color:red\">:Week 1");
	}
	else {
		var weekReq = "/standings/week/" + week;
		$('.weekTitle').append("Game Day Sheet<b style=\"color:red\">:Week " + week + "</b>");
	}

	$('.overview').empty();
	

	var dock = $.get(weekReq, function(data) {

		if (data[0].scheduled) { 

			sessionStorage.week = data[0].week;

			var players = [],
				games = [];

			for (i = 0; i < data.length; i++) {

				if (players.indexOf(data[i].userid) == -1) { players.push(data[i].userid); }
				var grep = $.grep(games, function(e) { return e.gameid == data[i].gameid; });
				if (grep.length == 0) { 
					var newGame = new Game(data[i].gameid, data[i].hometeam_id, data[i].awayteam_id, data[i].tiebreaker, data[i].winner);
					games.push(newGame);
				};
			};

			var selections = "<tr><td id=\"players\">";
			for (x = 0; x < games.length; x++) {

				selections += "<td id=\"selection\"><b><p style=\"color:black;\">" + games[x].awayteam_id + "</p></b><br>\
					<p style=\"color:black;font-size:12px\"> at <br><b>\
					<p style=\"color:#BFBFBF;\">" + games[x].hometeam_id + "</p></td>";
			}
			selections += "<td id=\"tiebreak\"><b> Tie<br>Breaker </b></td><td id=\"correctpicks\"><b> Winners </b></td></tr>";

			var max = { user: "",
						number: 0,
						diff: 1000};

			for (j = 0; j < players.length; j++) {

				var playerSelections = "<tr><td id=\"players\">" + players[j] + "</td>";
				var playerTiebreaker = "",
					correct = 0,
					total = 0,
					newDiff = 0;

				for (k = 0; k < games.length; k++) {

					var greppy = $.grep(data, function(e) { return (e.gameid == games[k].gameid && e.userid == players[j])});
					if (!greppy[0].teamid) { playerSelections += "<td>"; }
					else { 
						if (games[k].winner == null) {
							playerSelections += "<td id=\"selection\" style=\"color:";
							if (greppy[0].teamid == games[k].awayteam_id) { playerSelections += "black;"; }
							else { playerSelections += "#BFBFBF;"; }
							playerSelections += "\">";
						}
						else {
							if (greppy[0].teamid != games[k].winner) { playerSelections += "<td id=\"selection\"><s>"; }
							else { 
								playerSelections += "<td id=\"selection\" style=\"color:#24A2F0;\"><b>";
								correct += 1;
							}
							total += 1;
						}
						playerSelections += greppy[0].teamid + "</td>";
						playerTiebreaker = greppy[0].tiebreaker;
						newDiff = Math.abs(greppy[0].tiebreaker - greppy[0].tiebreakertotal);
					}
				}

				if (correct > max.number) { max.number = correct; max.user = players[j]; max.diff = newDiff;}
				if (correct == max.number && newDiff < max.diff) { max.number = correct; max.user = players[j]; max.diff = newDiff;}

				playerSelections += "<td id=\"tiebreak\"><b>" + playerTiebreaker + "</b></td>\
					<td id=\"correctpicks\" style=\"color:#24A2F0;\"><b>" + correct + "</b></td></tr>";
				selections += playerSelections;
			}

			$('.overview').append(selections);

			if (total == games.length) {
				findWinner(max);
			}

		}
		else {
			sessionStorage.week = week;
			$(".about").empty();
			$("body").append("<div class=\"about\"><p><span>" + data + "</span></p></div>");
		}
	})
	.fail(function() { console.log("error loading data from GET /games request."); });
}


/****************************************** TRACK + SUBMIT PICKS ***************************************************/

function findWinner (max) {

	$('.overview #players').each(function () {

		if ($(this).html() == max.user) {
			$(this).css("color","red");
			$(this).css("font-weight","bold");
		}
	});

}


var selections = [];

function submitPicks() {

	$.post('/picks', {username: sessionStorage.user, selections: JSON.parse(sessionStorage.selections), week: sessionStorage.week, tiebreaker: (Math.floor($('input[name="tiebreaker"]').val()/.1)*.1)},
		function (response) {
			if (response == "Play for the week has already started") {
				location.reload();
				$("body").append("<span> Picks may not be changed after play for the week has commenced. </span>");
			}
			else {
				location.reload();
			}
		})
		.fail( function () { console.log("error loading data from POST /picks request.");});
}

var removeVal = function (array, gameId) {
	var i = array.length;
	while (i--) {
		if (array[i] && array[i][gameId]) {
			array.splice(i, 1);
		}
	}
	return array;
}

function highlight (gameId, teamId, otherteamId) {

	console.log("Selections: " + JSON.stringify(selections));
	var newSelection = {};
	newSelection[gameId] = teamId;
	if (otherteamId == null) {
		document.getElementById(teamId).innerHTML = "<b>" + document.getElementById(teamId).innerHTML + "</b>";
		document.getElementById(teamId).style.color = "black";
		selections.push(newSelection);
		sessionStorage['selections'] = JSON.stringify(selections);
		return false;
	}
	var otherteamInner = document.getElementById(otherteamId).innerHTML.toString();
	var inner = document.getElementById(gameId).innerHTML.toString();
	var teamInner = document.getElementById(teamId).innerHTML.toString();
	if (inner.indexOf("</b>") != -1) {
		if (teamInner.indexOf("</b>") != -1)  {  // same selection
			document.getElementById(teamId).innerHTML = teamInner.replace("<b>","").replace("</b>","");
			document.getElementById(teamId).removeAttribute("style");
			removeVal(selections, gameId);
		} 
		else {
			document.getElementById(otherteamId).innerHTML = otherteamInner.replace("<b>","").replace("</b>","");
			document.getElementById(otherteamId).removeAttribute("style");
			document.getElementById(teamId).innerHTML = "<b>" + document.getElementById(teamId).innerHTML + "</b>";
			document.getElementById(teamId).style.color = "black";
			removeVal(selections, gameId);
			selections.push(newSelection);
		}
	}
	else {
		document.getElementById(teamId).innerHTML = "<b>" + document.getElementById(teamId).innerHTML + "</b>";
		document.getElementById(teamId).style.color = "black";
		selections.push(newSelection);
	}
	sessionStorage['selections'] = JSON.stringify(selections);
}


/****************************************** NAV MENU ***************************************************/


function clickBody () {

		linkTable = document.getElementById("links");
		console.log("REMOVING MENU");
		$(".links").remove();	
		document.getElementsByTagName("html")[0].removeEventListener('click', clickBody);
}

function showMenu () {

	if (!document.getElementById("link")) {
		console.log("SHOWING MENU");
		$("body").append("<table class=\"links\"><tr><td id=\"link\" onclick=weeklyPicks()> Picks </tr></td>\
			<tr><td id=\"link\" onclick=weeklyStandings()> Game Day Sheets </td></tr>\
			<tr><td id=\"link\" onclick=overallStandings()> Standings </td></tr>\
			<tr id=\"horizontalbar\"></tr>\
			<tr><td id=\"link\" onclick=about()> About SFL </td></tr>\
			</table>");
		setTimeout(function() {document.getElementsByTagName("html")[0].addEventListener('click', clickBody);}, 200);
	}
}


