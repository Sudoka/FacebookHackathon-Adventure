<?php

define("RESULT_SUCCESS", 'success');
define("RESULT_FAILURE", 'failure');

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
	default:
		pullFriendsRequest();
		//Header("Location: http://letsrtfm.com");
		break;
}

/* REQUEST FUNCTIONS */

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
		if($query = $mysqli->prepare("SELECT ID FROM Users WHERE ID = ? AND Special > '';")) {
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
			//$friend['stats'] = generateStats();
			accumulateInterests($friend['id']);
			
			$arrayOfFriends[$key] = $friend;
		}
		
		$output['friend'] = $arrayOfFriends;
		$output['result'] = RESULT_SUCCESS;
	} else {
		$output['result'] = RESULT_FAILURE;
	}
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

$accumLikes = array();

function accumulateInterests($id) {
	// Facebook API Variables
	global $facebook, $user;
	global $accumLikes;
	
	$likes = $facebook->api('/'.$id.'?fields=likes')['likes']['data'];
	
	echo json_encode($likes);
	
	//foreach($likes as $like) {
	//	$accumLikes[$like['name']] += 1;
	//}
}

$classifications = array();

//Strength
$classifications[0] = [];

//Agility
$classifications[1] = [];

//Intelligence
$classifications[2] = [];

?>