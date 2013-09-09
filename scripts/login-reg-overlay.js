

/****************************************** REGISTRATION ***************************************************/


function registration () {

	if($("input[name=password]").val().length < 6) {
		$("#errorspan").text("Password Must Be 6 Characters or More").show();
		return false;
	}

	if($("input[name=username]").val().length < 6) {
		$("#errorspan").text("Username must be 6 characters or more").show();
		return false;
	}

	if($("input[name=firstname]").val().length < 3) {
		$("#errorspan").text("Please enter a valid first name for your account").show();
		return false;
	}

	if($("input[name=lastname]").val().length < 2) {
		$("#errorspan").text("Please enter a valid last name for your account").show();
		return false;
	}

	if ($("input[name=password]").val() != $("input[name=verify]").val()) {
		$("#errorspan").text("Passwords Do Not Match").show();
		return false;
	}

	var email = $("input[name=emailaddress]").val();
	if(email.indexOf("@") == -1 || email.indexOf(".") == -1) {
		$("#errorspan").text("Please enter a valid email address").show();
		return false;
	}


	var userList = $.post('/users', {email: $("input[name=emailaddress]").val(), user: $("input[name=username]").val()}, function(data) {

		if (data[0].count > 0) {
			$("#errorspan").text("Username or Email already in use").show();
			return false;
		}
		validRegistration();
	})
	.fail(function () { console.log("error loading data from GET /users request."); });
}

function validRegistration() {

	$.post('/register', $("#registration").serialize())
		.done( function () {
			if (!sessionStorage['user']) {
				sessionStorage['user'] = $("input[name=username]").val();
			}
			closeOverlay();
			location.reload();
		});
}


/****************************************** LOGIN + LOGOUT ***************************************************/


function logout() {

	sessionStorage.clear();
	sessionStorage.clear();
	$('#welcome').attr('id',"register");
	window.location = '/';
}

function login () {

	$.post('/login', $("#loginform").serialize(), function (response) {
		if (response == "Unknown Error Occurred") {
			$("#errorspan").text("Incorrect Username / Password Combination");
		}
		else {
			sessionStorage['user'] = $("input[name=username]").val();
			closeOverlay();
			location.reload();
		}
	})
	.fail ( function () {
		console.log("Error loading data from POST /login .");			
	});
}

function validlogin () {

	sessionStorage['user'] = $("input[name=username]").val();
	location.reload();
}

function checkLogin() {

	var reggy = document.getElementById('register');
	var loggy = document.getElementById('login');

	// if NOT LOGGED IN
	if (!sessionStorage['user']) { 
		reggy.addEventListener('click', function () {
			var formHTML = "<form id=\"registration\">\
							<p id=\"title\">Scooter's Football League<b style=\"color:red\">:Register</b></p><br>\
							<label>First Name: </label><input type=\"text\" name=\"firstname\"><br>\
							<label>Last Name: </label><input type=\"text\" name=\"lastname\"><br>\
							<label>Username: </label><input type=\"text\" name=\"username\"><br>\
							<label>Password: </label><input type=\"password\" name=\"password\"><br>\
							<label>Verify Password: </label><input type=\"password\" name=\"verify\"><br>\
							<label>e-Mail Address: </label><input type=\"text\" name=\"emailaddress\"><br><br>\
							<input type=\"checkbox\" name=\"leaguemember\" value=\"yes\">I'm a Pismo Football League Member!<br><br>\
							<input type=\"button\" name=\"exit\" class=\"formbutton\" id=\"cancelbutton\" value=\"Cancel\" onclick=closeOverlay()>\
							<input type=\"button\" class=\"formbutton\" value=\"Submit\" onclick=registration()>\
							</form>\
							<span id=\"errorspan\"></span>";
			overlay(formHTML);
			$("#textOverlay").append("<img src=\"/closewindow.png\" id=\"closewindow\" onclick=closeOverlay() />");
		}, false);

		loggy.addEventListener('click', function () {
			var formHTML = "<form id=\"loginform\">\
							<p id=\"title\">Scooter's Football League<b style=\"color:red\">:Login</b></p><br>\
							<label>Username: </label><input type=\"text\" name=\"username\"><br>\
							<label>Password: </label><input type=\"password\" name=\"password\"><br><br>\
							<input type=\"button\" name=\"exit\" class=\"formbutton\" id=\"cancelbutton\" value=\"Cancel\" onclick=closeOverlay()>\
							<input type=\"button\" class=\"formbutton\" value=\"Login\" onclick=login()>\
							</form>\
							<span id=\"errorspan\"></span>";
			overlay(formHTML);
			$("#textOverlay").css('height','30%');
			$("#textOverlay").append("<img src=\"/closewindow.png\" id=\"closewindow\" onclick=closeOverlay() />");
		}, false);
	}
	// if LOGGED IN
	else { 
		$('#register').text(sessionStorage['user']).show();
		$('#register').attr('id', "welcome");
		$('#login').text("logout").show();
		document.getElementById('login').addEventListener('click', function () {
			logout();
		}, false);
	}

}

/****************************************** OVERLAY ***************************************************/


function overlay (formHTML) {

	var bgOverlay = document.getElementById('bgOverlay');

	if (!bgOverlay) {
		var bodyElement = document.getElementsByTagName("body")[0];
		var appendOverlay = document.createElement('div');
		var appendForm = document.createElement('p');
		appendOverlay.setAttribute("id", "bgOverlay");
		appendOverlay.setAttribute("onclick", "closeOverlay()");
		appendForm.setAttribute("id", "textOverlay");
		appendForm.innerHTML = formHTML;
		bodyElement.appendChild(appendOverlay);
		bodyElement.appendChild(appendForm);
	}
}

function closeOverlay () {

	var bodyElement = document.getElementsByTagName("body")[0];
	var appendOverlay = document.getElementById("bgOverlay");
	var appendForm = document.getElementById("textOverlay");
	bodyElement.removeChild(appendOverlay);
	bodyElement.removeChild(appendForm);
}


/****************************************** HOME / MISc ***************************************************/

function weeklyPicks() {
	
	window.location = "/home";
}

function weeklyStandings () {

	window.location = "/views/standings/week/1";
}

function overallStandings() {

	window.location = "/views/standings/overall";
}

function about() {

	window.location = "/";
}

function printPage() {

/*	var win = null;
	win = window.open();
	self.focus();
	win.document.open();
	win.document.write("<!DOCTYPE html><html><head>\
		<link rel=\"icon\" type=\"image/png\" href=\"/favicon.png\">\
		<link rel=\"stylesheet\" type=\"text/css\" href=\"/views/style.css\">\
		<title> Scooter's Football League - Weekly Standings </title>\
		<script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>\
		</head><body><ul>\
		<li id=\"home\"><a href=\"/\">Scooter's Football League</a></li>\
		<li id=\"image\" onclick=showMenu()><img src=\"/dropicon.png\" />\
		</li><li id=\"login\">login</li>\
		<li id=\"register\">register</li>\</ul>\
		<div class=\"weekTitle\"></div>\
		<table class=\"overview\" cellspacing=10></table>\
		"
	);
	//win.document.write("<script>$(document).ready(function() { loadWeekPicks(sessionStorage['week']);	checkLogin();});");
	win.document.write("</script></head><body><ul>\
		<li id=\"home\"><a href=\"/\">Scooter's Football League</a></li>\
		<li id=\"image\" onclick=showMenu()><img src=\"/dropicon.png\" />\
		</li><li id=\"login\">login</li>\
		<li id=\"register\">register</li>\</ul>\
		<div class=\"weekTitle\"></div>\
		<table class=\"overview\" cellspacing=10></table>"
		);
	win.document.write("<footer><img src=\"/footballicon.png\" />\
		<p> Copyright 2013 Scooter's Football League <br> Site design by <a href=\"mailto:colinmatthew@gmail.com\">Colin Rennie</a></p>\
		</footer></body></html>"
		);
	win.document.close();*/
	window.print();
	//window.close();
}

