<?php

/**
 * 代理，用来将请求指向不同的程序处理
 * @author Meathill (meathill@foxmail.com)
 */
if (!$_REQUEST) {
  die('ok');
}

include('include/error.php');
include('include/pdo_connect.php');

$api = $_REQUEST['api'];
$openid = mysql_escape_string($_REQUEST['openid']);
$bookid = isset($_REQUEST['bookid']) ? int($_REQUEST['bookid']) : NULL;

if ($api == '') {
  throwError();
}

// 权限校验
if ($openid && $bookid && $bookid != 0) {
  $sql = "SELECT 'x'
          FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
          WHERE m_book.id=$bookid AND m_user.qq='$openid'";
  $check = $DB->query($sql);
  if (!$check) {
    throwError('auth');
  }
}

include_once($api . '.php');
?>