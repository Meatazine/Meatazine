<?php
/**
 * 保存杂志
 * @author Meathill (meathill@foxmail.com)
 */

require_once('include/functions.php');

$openid = strip_tags($_REQUEST['openid']);
$id = (int)$_REQUEST['bookid'];
$name = strip_tags($_REQUEST['name']);
$data = strip_tags($_REQUEST['data']);
$content = strip_tags($_REQUEST['content']);
$date = mktime();

// 没有id，插入新book
if ($id == 0) {
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

// 检查归属权，再写表
$sql = "SELECT 'x'
        FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
        WHERE m_book.id=$id AND m_user.qq='$openid'";
$check = $DB->query($sql);
if (!$check) {
  throwError('auth');
}
$sql = "UPDATE m_book
        SET title='$name', content='$content', edit_date=$date
        WHERE id=$id";
$check = $DB->query($sql);
refreshBook($id, $data, $content);
if ($check) {
  $result = array('code' => '0', 'data' => 'ok');
} else {
  throwError('sql');
}
die(json_encode($result));
?>