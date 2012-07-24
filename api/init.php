<?php
/**
 * 初始化函数
 * 有传id进来就按读取杂志数据处理
 * 没传id就给最新的id
 * @param {int} id 杂志id
 * @return {int} id 杂志id
 */
 
  $count = 'count.log';
  $action = $_REQUEST['act'];
  $id = $_REQUEST ? (int)$_REQUEST['id'] : 0;
  switch ($action) {
    case 'new':
      $id = (int)file_get_contents($count);
      
      $fp = fopen($count, 'w');
      fwrite($fp, $id + 1);
      fclose($fp);
      
      break;
    
    default:
      
      break;
  }
  
  
  echo $id;
?>