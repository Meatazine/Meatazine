<?php
/**
 * 处理报错的php
 * @author Meathill (meathill@foxmail.com)
 */
 
function throwError ($type, $param) {
  $result = NULL;
  switch ($type) {
    case 'sql':
      $result = array('type' => 'error',
                      'code' => '2',
                      'msg' => '貌似是sql错了：' . $param);
      break;
      
    case 'auth':
      $result = array('type' => 'error',
                      'code' => '3',
                      'msg' => '没有权限操作目标');
      break;
    
    default:
      $result = array('type' => 'error',
                      'code' => '1',
                      'msg' => '参数错误');
      break;
  }
  die(json_encode($result));
}
?>