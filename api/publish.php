<?
/**
 * 将内容编译成apk
 * 
 * 复制一份模板
 * 将资源添加进去
 * 通知用户下载
 */
$zip = new ZipArchive();
$template = 'template.zip';
$id = (int)$_REQUEST['id'];
 
// 先解压缩，然后进行把素材添加到apk   
$temp_dir = 'temp/' . $id . '/';
$filename = 'temp/' . $id . '.zip';
$zip->open($filename);
$zip->extractTo($temp_dir);
$zip->close();
 
$filename = 'static/' . $id . '.apk';
copy($template, $filename);
$zip->open($filename);
$mydir = dir($temp_dir);
while ($file = $mydir->read()) {
  if (!is_dir($temp_dir/$file) && $file != '.' && $file != '..') {
    $zip->addFile($temp_dir . $file, 'assets/www/' . $file);
    unlink($temp_dir . $file);
  }
}
rmdir($temp_dir);
$zip->close();

echo 'ok';
?>