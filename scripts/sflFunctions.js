var quotes = [
	{
	author: "Jim Harbaugh",
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
	quote: "&#34People who work together will win, whether is be against complex football defenses or the problems of modern society.&#34"
	},
	{
	author: "Lewis Grizzard",
	quote: "&#34Life is a lot like football. You have to tackle your problems, block your fears, and score your points when you get the opportunity&#34"
	}
];

var dispQuotes = setInterval(function () {showQuotes()}, 10000);

function showQuotes () {

	var quoteNum = Math.floor(Math.random()*quotes.length);
	quote = quotes[quoteNum];

	$(".quote").html(quote.quote);
	$("#author").text(quote.author).show();

	textArray = $(".quote").text().split('');
	textArray[0] = "<b id=\"largeQuote\">" + textArray[0] + "</b>";
	textArray[textArray.length - 1] = "<b id=\"largeQuote\">" + textArray[textArray.length - 1] + "</b>";
	$(".quote").html(textArray.join(''));
}

function loadWeek(week) {

	if (!localStorage['week'] || localStorage['week'] < 1) {
		var weekReq = "/games";
	}
	else {
		var weekReq = "/games/" + week;
	}

	$('.weekTitle').empty();
	$('.matchups').empty();

	var dock = $.get(weekReq, function(data) {

		localStorage['week'] = data[0].week;

		for (i = 0; i < data.length; i++) {

			if (i == 0) {
				$('.weekTitle').append("Week " + data[i].week);
				var dateToday = new Date(data[i].scheduled).toString();
				var dateTodayPart = dateToday.split(' ');
				$('.matchups').append("<tr><td><td><b>" + dateTodayPart[0] + ", " + dateTodayPart[1] + " " + dateTodayPart[2] + "</b></tr>");
			}
			else {
				var dateYest = new Date(data[i-1].scheduled).toString();
				var dateYestPart = dateYest.split(' ');
				var dateToday = new Date(data[i].scheduled).toString();
				var dateTodayPart = dateToday.split(' ');
				if (dateYestPart[0] != dateTodayPart[0]) {
					$('.matchups').append("<tr><td><td><b>" + dateTodayPart[0] + ", " + dateTodayPart[1] + " " + dateTodayPart[2] + "</b></tr>");
				}
			}

			// console.log(dateYestPart);
			$('.matchups').append("<tr id=" + data[i].id + "><td id=" + data[i].hometeam_id + 
				" onclick=highlight('" + data[i].id + "','" + data[i].hometeam_id + "','" + data[i].awayteam_id + "')>" + 
				data[i].hometeam_market + " " + data[i].hometeam_name + 
				"<br> (" + data[i].hometeam_wins + "-" + data[i].hometeam_losses + "-" + data[i].hometeam_ties + ")" + 
				"<td>.... v ...." +
				"<td id=" + data[i].awayteam_id + 
				" onclick=highlight('" + data[i].id + "','" + data[i].awayteam_id + "','" + data[i].hometeam_id + "')>" + 
				data[i].awayteam_market + " " + 
				data[i].awayteam_name + "<br> (" + data[i].awayteam_wins + "-" + data[i].awayteam_losses + "-" + data[i].awayteam_ties + ")" + "</tr>");
		};

		if (sessionStorage.user) {
			var destination = '/' + sessionStorage.user + '/picks/' + localStorage['week'];
			var picks = $.post(destination, {username: sessionStorage.user, week: localStorage.week},
				function (response) {
					for (i = 0; i < response.length; i++) {
						highlight(response[i].gameid, response[i].teamid, null);
					} 
				});
		}
	})
	.fail(function() { console.log("error loading data from GET /games request."); });
}


function submitPicks() {

	$.post('/picks', {username: sessionStorage.user, selections: JSON.parse(sessionStorage.selections), week: localStorage.week})
		.done( function () { location.reload();})
		.fail( function () { console.log("error loading data from POST /picks request.");});
}

var selections = [];

function clickBody () {

		linkTable = document.getElementById("links");
		$(".links").remove();	
		document.getElementById("image").removeEventListener('click', clickBody);
}

function showMenu () {

	$("header").append("<table class=\"links\"><tr><td id=\"link\"><a href=\"/views/standings/week/1\"> Weekly Standings </a></td></tr>\
		<tr><td id=\"link\"><a href=\"/views/standings/overall\"> Overall Standings </a></tr></td></table>");
	document.getElementById("image").addEventListener('click', clickBody);
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

	var newSelection = {};
	newSelection[gameId] = teamId;
	if (otherteamId == null) {
		document.getElementById(teamId).innerHTML = "<b>" + document.getElementById(teamId).innerHTML + "</b>";
		document.getElementById(teamId).style.color = "black";
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

