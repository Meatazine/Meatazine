<?php
/**
 * 加载杂志内容
 */
 
$id = (int)$_REQUEST['bookid'];
// 仍然先检查归属权，然后再读表
$sql = "SELECT 'x'
        FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
        WHERE m_book.id=$id AND m_user.qq='$openid'";
$check = $DB->query($sql);
if (!$sql) {
  throwError('auth');
}
$sql = "SELECT content
        FROM m_book
        WHERE id=$id";
$content = $DB->getVar($sql);
if ($check) {
  $result = array('code' => '0', 'data' => $content);
} else {
  throwError('sql');
}
die(json_encode($result));
?>