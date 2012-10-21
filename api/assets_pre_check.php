<?php
/**
 * 校验要上传的素材有哪些不需要上传
 * @author Meathill (meathill@foxmail.com)
 */

$openid = strip_tags($_REQUEST['openid']);
$bookid = strip_tags($_REQUEST['bookid']);
$assets = $_REQUEST['assets'];

if ($openid == '' || $assets == '') {
  throwError();
}

$assets = json_decode($assets);

$pass = array();
foreach ($assets as $key => $value) {
	$url = 'static/' + $bookid + '/' + $value->name;
  if (!file_exists($url)) {
    $pass[] = $key;
    continue;
  }
  if (strcmp(date('Y-m-d\TH:i:s.000\Z', filemtime($url)), $value['lastModifiedDate']) < 0) {
    $pass[] = $key;
  }
}

$result = array(
  'code' => 0,
  'data' => $pass,
);
die(json_encode($result));
?>