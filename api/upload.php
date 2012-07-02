<?php
  /**
   * 处理上传icon和cover
   */
  $id = $_GET['id'];
  $type = $_GET['type'];
  $dir = 'assets/' . $id;
  $file = $dir . '/' . $type . '.jpg';
  
  if (!is_dir('assets')) {
    mkdir('assets');
  }
  if (!is_dir($dir)) {
    mkdir($dir);
  }
  
  $fp = fopen($file, 'w');
  fwrite($fp, $HTTP_RAW_POST_DATA);
  fclose($fp);
  
  echo $file;
?>