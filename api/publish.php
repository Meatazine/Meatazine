<?php
/**
 * 将内容编译成apk、ipa
 * 
 * 复制一份模板
 * 将资源添加进去
 * 通知用户下载
 */
 
/*function chmodr($path, $filemode) { 
  if (!is_dir($path)) {
    return chmod($path, $filemode);
  }
  $dh = opendir($path); 
  while (($file = readdir($dh)) !== false) { 
    if($file != '.' && $file != '..') { 
      $fullpath = $path.'/'.$file; 
      if(is_link($fullpath)) 
          return FALSE; 
      elseif(!is_dir($fullpath) && !chmod($fullpath, $filemode)) 
              return FALSE; 
      elseif(!chmodr($fullpath, $filemode)) 
          return FALSE; 
    } 
  }
  
  closedir($dh);
  if(chmod($path, $filemode)) 
      return TRUE; 
  else 
      return FALSE; 
}*/

$hasApk = (boolean)$_REQUEST['apk'];
$hasIpa = (boolean)$_REQUEST['ipa'];
$id = (int)$_REQUEST['id'];

if (!is_dir('temp')) {
  mkdir('temp');
}
   
// 先解压缩
$temp_dir = 'temp/' . $id . '/';
$filename = 'temp/' . $id . '.zip';
$zip = new ZipArchive();
$zip->open($filename);
$zip->extractTo($temp_dir);
$zip->close();

// ipa部分
if ($hasIpa) {
  $template = './Meatazine.ipa';
   
  $filename = 'static/' . $id . '.ipa';
  copy($template, $filename);
  $zip->open($filename);
  $zip->deleteName('Payload/Meatazine.app/www/');
  $mydir = dir($temp_dir);
  while ($file = $mydir->read()) {
    if ($file != '.' && $file != '..') {
      echo $file . ' : ' . $zip->addFile($temp_dir . $file, 'Payload/Meatazine/www/' . $file) . "<br />\n";
    }
  }
  $zip->close();
}

// apk部分
if ($hasApk) {
  if (!is_dir('temp/project')) {
    mkdir('temp/project');
  }
  $template = 'android/';
  //$project = 'temp/project/' . $id;
  //mkdir($project);
  //system("cp -rf $template $project/");
  
  $mydir = dir($temp_dir);
  while ($file = $mydir->read()) {
    if ($file != '.' && $file != '..') {
      copy($temp_dir . $file, $template . '/assets/www/' . $file);
    }
  }
  system("ant -file ./$template/build.xml release");
  copy($template . '/bin/test-release.apk', 'static/' . $id . '.apk');
  
  rmdir($project);
}

rmdir($temp_dir);

echo 'ok';
?>