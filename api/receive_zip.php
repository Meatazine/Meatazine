<?php
/**
 * 将用户上传的zip保存到服务器上
 * @param $HTTP_RAW_POST_DATA
 * @return 文件id
 */
 
$id = $_GET['id'];
 
if (!is_dir('temp')) {
  mkdir('temp');
}
if (!is_dir('static')) {
  mkdir('static');
}

$filename = 'temp/' . $id . '.zip';

$fp = fopen($filename, 'w');
fwrite($fp, $HTTP_RAW_POST_DATA);
fclose($fp);

echo 'zip saved..';
?>