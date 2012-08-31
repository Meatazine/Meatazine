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

// 检查openid的权限
$sql = "SELECT 'x'
        FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
        WHERE m_book.id=$bookid AND m_user.qq='$openid'";
$check = $DB->query($sql);
if (!$check) {
  throwError('auth');
}

$assets = json_decode($assets);

$pass = array();
foreach ($assets as $key => $value) {
	$url = 'static/' + $bookid + '/' + $value['name'];
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