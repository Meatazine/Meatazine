<?php
/**
 * 保存杂志
 * @author Meathill (meathill@foxmail.com)
 */

require_once('include/functions.php');

$name = strip_tags($_REQUEST['name']);
$data = strip_tags($_REQUEST['data']);
$content = strip_tags($_REQUEST['content']);
$date = mktime();

// 没有id，插入新book
if ($bookid == 0) {
  $sql = "SELECT id
          FROM m_user
          WHERE qq='$openid'";
  $uid = $DB->getVar($sql);
  if (!$uid) {
    throwError();
  }
  
  $bookid = createNewBook($uid, $name, $data, $content, $date);
  refreshBook($bookid, $data, $content);
  if ($bookid) {
    $result = array('code' => '0', 'data' => $bookid);
  } else {
    throwError('sql', $sql);
  }
  die(json_encode($result));
}

$sql = "UPDATE m_book
        SET title='$name', content='$content', edit_date=$date
        WHERE id=$bookid";
$check = $DB->query($sql);
refreshBook($bookid, $data, $content);
if ($check) {
  $result = array('code' => '0', 'data' => 'ok');
} else {
  throwError('sql');
}
die(json_encode($result));
?>