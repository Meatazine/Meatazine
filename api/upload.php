<?php
  /**
   * 处理上传icon和cover
   */
  $file = $_FILES['file'];
  $filename = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : $file['name'];
  
  $dir = '../export/' . $bookid;
  $filename = $dir . '/' . $filename;
  
  $isPass = TRUE;
  $msg = '';
  
  if (!is_dir('assets')) {
    mkdir('assets');
  }
  if (!is_dir($dir)) {
    mkdir($dir);
  }
  if ($file['error'] > 0) {
    $isPass = false;
    $msg = $file['error'];
  }
  if ($isPass && !in_array($file['type'], array('image/jpeg', 'image/pjpeg', 'image/png'))) {
    $isPass = false;
    $msg = '文件类型有误' . $file['type'];
  }
  if ($isPass && $file['size'] > 1024 * 1024 * 5) {
    $isPass = false;
    $msg = '文件太大，请上传5M以下的图片';
  }
  
  if ($isPass) {
    move_uploaded_file($file['tmp_name'], $filename);
    $result = array('code' => '0', 'fileurl' => $filename);
  } else {
    $result = array('code' => '1', 'msg' => $msg);
  }
  echo json_encode($result)
?>