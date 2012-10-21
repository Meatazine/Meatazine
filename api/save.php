<?php
/**
 * 保存杂志
 * @author Meathill (meathill@foxmail.com)
 */
require_once('include/functions.php');

$name = mysql_escape_string($_REQUEST['name']);
$data = mysql_escape_string($_REQUEST['data']);
$content = mysql_escape_string($_REQUEST['content']);
$date = date('Y-m-d H:i:s');

// 没有id，插入新book
if ($bookid == 0) {
  $sql = "SELECT id
          FROM m_user
          WHERE qq='$openid'";
  $uid = $DB->getVar($sql);
  if (!$uid) {
    throwError();
  }
  
  $bookid = createNewBook($uid, $name, $data, $date);
  refreshBook($bookid, $data, $content);
  if ($bookid) {
    $result = array('code' => '0', 'data' => $bookid);
  } else {
    throwError('sql', $sql);
  }
  die(json_encode($result));
}

$sql = "UPDATE m_book
        SET title='$name', content='$data', edit_time='$date'
        WHERE id=$bookid";
$check = $DB->query($sql);
refreshBook($bookid, $data, $content);
if ($check) {
  $result = array('code' => '0', 'data' => 'ok');
} else {
  throwError('sql', $sql);
}
die(json_encode($result));
?>