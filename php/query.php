<?php

define("RESULT_SUCCESS", 'success');
define("RESULT_FAILURE", 'failure');

require 'URLResolver.php';
require 'facebook/db.php';
$user = $facebook->getUser();

//INPUT
$request_type = $_POST['query'];

//OUTPUT
$output = [];

switch ($request_type) {
	case "login":
		loginRequest();
		break;
	case 'pullFriends':
		pullFriendsRequest();
		break;
	case 'urlLookup':
		urlLookupRequest($_POST['url']);
		break;
	case 'massUrlLookup':
		massUrlLookupRequest($_POST['urls']);
		break;
	case 'profileupdate':
		profileUpdateRequest();
		break;
	case 'deleteprofile':
		deleteprofile();
		break;
	case 'pullStats':
		pullStatsRequest();
		break;
	case 'savegame':
		saveGameRequest();
		break;
	case 'loadgame':
		loadGameRequest();
		break;
	case 'getScores':
		getscores();
		break;
	case 'postscore':
		postscore();
		break;
	default:
		//pullFriendsRequest();
		//pullStatsRequest();
		Header("Location: http://letsrtfm.com");
		break;
}

/* REQUEST FUNCTIONS */

function getscores() {
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if($cacheselect=$mysqli->query("SELECT Name, Score From Scores Where LIMIT 15 ORDER By Score")) {
		$result = [];
		while($temp=$cacheselect->fetch_assoc()) {
			$result [] = $temp;
		}
	}
	$printresult["response"]="success";
	$printresult["scores"]=$temp;
	echo json_encode($printresult);	 
}

function postscore($user,$userid,$score) {
	if($query = $mysqli->prepare("INSERT INTO Scores (Name, ID, Score) values (?, ?, ?)")) {
				$query->bind_param("sss", $user, $userid, $score);
				$query->execute();
				$query->close();
	}
}

function loginRequest() {
	// Database Parameters
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	// Facebook API Variables
	global $facebook, $user;
	
	/*
	// Report Login Status and Hand Over Login & Logout URL
	*/
	
	if($user) {
		$userquery = $facebook->api('/me');
		$output['name'] = $userquery['name'];
		$output['id'] = $userquery['id'];
		$output['isNewUser'] = true;
		$output['profilepic'] = "https://graph.facebook.com/".$user."/picture";
		
		// User Database Lookup
		$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
		if($query = $mysqli->prepare("SELECT ID FROM Users WHERE ID = ? AND Class > '';")) {
			$query->bind_param("s", $user);
			$query->execute();
			$query->bind_result($query_result);
			$query->fetch();
			$query->close();
		}
		if($query_result) {
			$output['isNewUser'] = false;
		} else {
			if($query = $mysqli->prepare("INSERT INTO Users (Name, ID) values (?, ?);")) {
				$query->bind_param("ss", $userquery['name'], $userquery['id']);
				$query->execute();
				$query->close();
			}
		}
		
		$output['logouturl'] = $facebook->getLogoutUrl();
		//$output['logouturl'] = str_replace("%2Fphp%2Fquery.php", "", $output['logouturl']);
		$output['result'] = RESULT_SUCCESS;
	} else {
		$output['loginurl'] = $facebook->getLoginUrl();
		//$output['loginurl'] = str_replace("%2Fphp%2Fquery.php", "", $output['loginurl']);
		$output['result'] = RESULT_FAILURE;
	}
	
	echo json_encode($output);
}

//NAME, ID, PIC, STATS
function pullFriendsRequest() {
	global $facebook, $user;
	//Pull friend data from API
	global $accumLikes;
	
	if($user) {
		$arrayOfFriends = array();
		$friends = $facebook->api('/me?fields=friends')['friends']['data'];
		foreach ($friends as $key=>$currentFriend) {
			$friend = array();
			$friend['id'] = $currentFriend['id'];
			$friend['name'] = $currentFriend['name'];
			$friend['profilepic'] = "https://graph.facebook.com/".$friend['id']."/picture";
			
			// Generate Random Stats for Now...
			$friend['stats'] = generateStats();
			
			$arrayOfFriends[$key] = $friend;
		} 
		$tmp; 
		$current; 
		$top = count($arrayOfFriends);

		shuffle($arrayOfFriends);
		$arrayOfFriends=array_slice($arrayOfFriends, 0, 10);
		$output['friend'] = $arrayOfFriends;
		$output['result'] = RESULT_SUCCESS;
	} else {
		$output['result'] = RESULT_FAILURE;
	}
	echo json_encode($output);
}

function urlLookupRequest($url) {
	global $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;

	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("SELECT output_url FROM ULookup WHERE input_url = ?;")) {
		$query->bind_param("s", $url);
		$query->execute();
		$query->bind_result($out_url);
		$query->fetch();
		$query->close();
	}
	$output['test'] = $out_url;
	if($out_url) {
		$output['url'] = $out_url;
		$output['result'] = RESULT_SUCCESS;
		$output['debug'] = "FOUND CACHED RESULT";
	} else {
		//URL Resolver
		$resolver = new URLResolver();
		$output['url'] = $resolver->resolveURL($url)->getUrl();
		
		if ($query = $mysqli->prepare("INSERT INTO ULookup (input_url, output_url) values (?, ?);")) {
			$query->bind_param("ss", $url, $output['url']);
			$query->execute();
			$query->fetch();
			$query->close();
		}
		
		$output['result'] = RESULT_SUCCESS;
	}
	
	echo json_encode($output);
}

function massUrlLookupRequest($urls) {
	foreach($urls as $key=>$url) {
		global $facebook, $user;
		global $dbhostname, $dbusername, $dbpassword, $dbname;

		$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
		if ($query = $mysqli->prepare("SELECT output_url FROM ULookup WHERE input_url = ?;")) {
			$query->bind_param("s", $url);
			$query->execute();
			$query->bind_result($out_url);
			$query->fetch();
			$query->close();
		}
		$output['test'] = $out_url;
		if($out_url) {
			$output[$key] = $out_url;
		} else {
			//URL Resolver
			$resolver = new URLResolver();
			$output[$key] = $resolver->resolveURL($url)->getUrl();
			
			if ($query = $mysqli->prepare("INSERT INTO ULookup (input_url, output_url) values (?, ?);")) {
				$query->bind_param("ss", $url, $output['url']);
				$query->execute();
				$query->fetch();
				$query->close();
			}
		}
	}
	
	echo json_encode($output);
}

function profileUpdateRequest() {
	global $_POST, $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	$str = $_POST['str'];
	$agi = $_POST['agi'];
	$int = $_POST['intel'];
	$char = $_POST['character'];
	
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("UPDATE Users SET Str = ?, Agi = ?, Intel = ?, Class = ? WHERE ID = ?;")) {
		$query->bind_param("iiiss", $str, $agi, $int, $char, $user);
		$query->execute();
		$query->close();
	}
	$output['result'] = RESULT_SUCCESS;
	echo json_encode($output);
}

function pullStatsRequest() {
	//URL Resolver
	$resolver = new URLResolver();
	global $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("SELECT name, str, agi, intel, ItemScript, ItemCoffee, ItemAlcohol, ItemFood, ItemFirewall, Class FROM Users WHERE ID = ?;")) {
		$query->bind_param("s", $user);
		$query->execute();
		$query->bind_result($name, $query_result[0], $query_result[1], $query_result[2], $query2_result[0], $query2_result[1], $query2_result[2], $query2_result[3], $query2_result[4], $class);
		$query->fetch();
		$query->close();
	}
	$output['result'] = RESULT_SUCCESS;
	$output['name'] = $name;
	$output['id'] = $user;
	$output['stats'] = $query_result;
	$output['items'] = $query2_result;
	switch($class) {
		case "Web Developer":
			$output['class'] = 0;
			break;
		case "Database Admin":
			$output['class'] = 1;
			break;
		case "Project Manager":
			$output['class'] = 2;
			break;
	}
	$output['profilepic'] = $resolver->resolveURL("https://graph.facebook.com/".$user."/picture?width=150&height=150")->getUrl();
	echo json_encode($output);
}
function deleteprofile() {
	global $_POST, $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("Delete from Users Where ID = ?")) {
		$query->bind_param("s", $user);
		$query->execute();
		$query->close();
	}
}
function saveGameRequest() {
	global $_POST, $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("UPDATE Users SET Str = ?, Agi = ?, Intel = ?, ItemScript = ?, ItemCoffee = ?, ItemAlcohol = ?, ItemFood = ?, ItemFirewall = ?, Xp = ?, Score = ? WHERE ID = ?;")) {
		$query->bind_param("iiiiiiiiiis", $_POST['stats']['str'], $_POST['stats']['agi'], $_POST['stats']['int'], $_POST['items'][0], $_POST['items'][1], $_POST['items'][2], $_POST['items'][3], $_POST['items'][4], $_POST['xp'], $_POST['score'], $user);
		$query->execute();
		$query->close();
	}
	$output['result'] = RESULT_SUCCESS;
	echo json_encode($output);
}

function loadGameRequest() {
	global $_POST, $facebook, $user;
	global $dbhostname, $dbusername, $dbpassword, $dbname;
	$mysqli = getConnected($dbhostname, $dbusername, $dbpassword, $dbname);
	if ($query = $mysqli->prepare("SELECT Str, Agi, Intel, ItemScript, ItemCoffee, ItemAlcohol, ItemFood, ItemFirewall, Xp, Score, Class FROM Users WHERE ID = ?;")) {
		$query->bind_param("s", $user);
		$query->execute();
		$query->bind_result($stats[0], $stats[1], $stats[2], $items[0], $items[1], $items[2], $items[3], $items[4], $xp, $score, $class);
		$query->fetch();
		$query->close();
	}
	$output['stats'] = $stats;
	$output['items'] = $items;
	$output['xp'] = $xp;
	$output['score'] = $score;
	switch($class) {
		case "Web Developer":
			$output['class'] = 0;
			break;
		case "Database Admin":
			$output['class'] = 1;
			break;
		case "Project Manager":
			$output['class'] = 2;
			break;
	}
	$output['result'] = RESULT_SUCCESS;
	echo json_encode($output);
}

/* HELPER FUNCTIONS */

function getConnected($host,$user,$pass,$db) {
	$mysqli = new mysqli($host, $user, $pass, $db);

	if($mysqli->connect_error) 
		die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());

	return $mysqli;
}

function generateStats() {
	$total = 200;
	$split1 = rand(23,43) / 100.0;
	$split2 = rand(23,43) / 100.0;
	$skill1 = (int)($split1 * $total);
	$skill2 = (int)($split2 * $total);
	$skill3 = $total - $skill1 - $skill2;
	if($skill3 > (75)) {
		$min = max(100 - $skill3, 0);
		$sub = rand($min, 25);
	}
	$skill1 += ceil($sub / 2.0);
	$skill2 += floor($sub / 2.0);
	$skill3 -= $sub;
	return [$skill1, $skill2, $skill3];
}

?>