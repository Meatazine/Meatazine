<?
/**
 * 将用户上传的zip保存到服务器上
 * @param $HTTP_RAW_POST_DATA
 * @return 文件id
 */
$count = (int)file_get_contents('count.log');
 
if (!is_dir('temp')) {
  mkdir('temp');
}
if (!is_dir('static')) {
  mkdir('static');
}
$filename = 'temp/' . $count . '.zip';
$fp = fopen($filename, 'w');
fwrite($fp, $HTTP_RAW_POST_DATA);
fclose($fp);

echo $count;
   
$count += 1;
$fp = fopen('count.log', 'w');
fwrite($fp, $count);
fclose($fp);
?>