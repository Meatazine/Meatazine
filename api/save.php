<?php
/**
 * 保存杂志
 * @author Meathill (meathill@foxmail.com)
 */

$openid = strip_tags($_REQUEST['openid']);
$id = (int)$_REQUEST['bookid'];
$name = strip_tags($_REQUEST['name']);
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
  
  $sql = "INSERT INTO m_book
          (owner, title, content, create_date, edit_date)
          VALUES ($uid, '$name', '$content', $date, $date)";
  $check = $DB->query($sql);
  $bookid = $DB->lastInsertId();
  if ($check) {
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
if (!$sql) {
  throwError('auth');
}
$sql = "UPDATE m_book
        SET title='$name', content='$content', edit_date=$date
        WHERE id=$id";
$check = $DB->query($sql);
if ($check) {
  $result = array('code' => '0', 'data' => 'ok');
} else {
  throwError('sql');
}
die(json_encode($result));
?>