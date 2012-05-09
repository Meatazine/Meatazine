<?
  /**
   * 初级发布程序
   * 
   * 从用户端获取资源zip包
   * 读取模板
   * 替换其中的资源
   * 打包成apk
   * 提供链接给用户下载
   */
  $count = (int)file_get_contents('count.log');
  $zip = new ZipArchive();
  $template = 'template.zip';
   
  if (!is_dir('temp')) {
    mkdir('temp');
  }
  if (!is_dir('static')) {
    mkdir('static');
  }
  if (!is_dir('status')) {
    mkdir('status');
  }
  $filename = 'temp/' . $count . '.zip';
  $fp = fopen($filename, 'w');
  fwrite($fp, $HTTP_RAW_POST_DATA);
  fclose($fp);
  
  echo $count;
   
  if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
  }
   
  // 先把计数返回，然后进行把素材添加到apk   
  $temp_dir = 'temp/' . $count . '/';
  $zip->open($filename);
  $zip->extractTo($temp_dir);
  $zip->close();
   
  $filename = 'static/' . $count . '.apk';
  copy($template, $filename);
  $zip->open($filename);
  $mydir = dir($temp_dir);
  while ($file = $mydir->read()) {
    if (!is_dir($temp_dir/$file) && $file != '.' && $file != '..') {
      $zip->addFile($temp_dir . $file, 'assets/www/' . $file);
    }
  }
  $zip->close();
  
  $fp = fopen('status/' . $count . '.log' , 'w');
  fwrite($fp, '1');
  fclose($fp);
   
  $count += 1;
  $fp = fopen('count.log', 'w');
  fwrite($fp, $count);
  fclose($fp);
?>