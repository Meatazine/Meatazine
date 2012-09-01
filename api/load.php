<?php
/**
 * 加载杂志内容
 */
 
if (!$bookid) {
  throwError();
}

$sql = "SELECT content
        FROM m_book
        WHERE id=$bookid";
$content = $DB->getVar($sql);
if ($check) {
  $result = array('code' => '0', 'data' => $content);
} else {
  throwError('sql');
}
die(json_encode($result));
?>