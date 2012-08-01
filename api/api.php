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

$api = strip_tags($_REQUEST['api']);

if ($api == '') {
  throwError();
}

include_once($api . '.php');
?>