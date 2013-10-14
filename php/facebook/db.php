<?php

require_once("facebook.php");

$config = array();
$config['appId'] = '1374847586087086';
$config['secret'] = 'super awesome secret key';
$config['fileUpload'] = false;
$facebook = new Facebook($config);

$dbhostname = "localhost";
$dbusername = "letsrtfm_fb";
$dbname = "letsrtfm_facebook";
$dbpassword = "super awesome secret password";

?>