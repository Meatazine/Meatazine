<?php
/**
 * 公共函数
 */
 
define('TEMPLATE', '../template/index.html');
 
/**
 * 创建一本杂志。需要插入表，还需要生成一个预览目录放素材
 * @param {int} $uid 用户id
 * @param {string} $name 杂志名称
 * @param {string} $name 杂志内容，实际是一个json字符串，由BookProperties.toJSON()生成
 * @param {int} $date 时间戳
 * @return {int} $bookid 杂志id
 */
function createNewBook($uid, $name, $data, $date) {
  global $DB;
  // 插入杂志的内容到表
  $sql = "INSERT INTO m_book
          (owner, title, content, create_time, edit_time)
          VALUES ($uid, '$name', '$data', '$date', '$date')";
  $check = $DB->query($sql);
  $bookid = $DB->lastInsertId();
  // 创建预览目录放素材
  if ($bookid) {
    $dir = '../export/' . $bookid;
    if (!is_dir($dir)) {
      mkdir($dir);
    }
  }
  return $bookid;
}
/**
 * 刷新杂志内容
 * @param {int} $bookid 杂志id
 * @param {string} $data JSON化的杂志数据
 * @param {string} $content 包含各页HTML的数组
 */
function refreshBook($bookid, $data, $content) {
  require(dirname(__FILE__) . '/Mustache/Autoloader.php');
  Mustache_Autoloader::register();
  $dir = '../export/' . $bookid;
  $filename = $dir . '/index.html';
  
  $book = json_decode(stripslashes($data), TRUE);
  $pages = json_decode(stripslashes($content));
  $bookdata = array(
    'width' => $book['width'],
    'height' => $book['height'],
    'pages' => implode(array_slice($pages, 0, 5), "\n"),
    'content' => implode($pages, '###'),
  );
  $template = file_get_contents(TEMPLATE);
  $m = new Mustache_Engine;
  
  $fp = fopen($filename, 'w');
  fwrite($fp, $m->render($template, $bookdata));
  fclose($fp);
}
?>