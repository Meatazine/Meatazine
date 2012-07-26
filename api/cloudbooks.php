<?php
/**
 * 取用户存在云端的杂志
 * @author Meathill
 */
 
include_once("include/pdo_connect.php");
 
$openid = strip_tags($_REQUEST['openid']);
$act = strip_tags($_REQUEST['act']);
$result = array();

if ('fetch' == $act) {
  if ($openid == '') {
    $result['type'] = 'error';
    $result['code'] = '1';
    $result['msg'] = '没有openid';
    die(json_encode($result));
  }
  
  // 先查userid，然后取书
  $sql = "SELECT uid
          FROM m_user
          WHERE openid='$openid'";
  $result = $DB->query($sql);
  $result->setFecthMode(PDO::FETCH_ASSOC);
  $obj = $result->fetch();
  $uid = $obj['uid'];
  
  if ($uid) {
    $sql = "SELECT bookid, content
            FROM m_book
            WHERE owner=$uid";
    $data = $DB->query($sql);
    $data->setFetchMode(PDO::FETCH_ASSOC);
    while($row = $data->fetch()) {
      $result[] = $row;
    }
    echo json_encode($result);
  } else {
    $sql = "INSERT INTO m_user
            (openid)
            VALUES ($openid)";
    $check = $DB->justquery($sql);
    if ($check) {
      $uid = $DB->lastInsertId();
      $date = date('Y-m-d H:i:s');
      $sql = "INSERT INTO m_book
              (owner, title, content, create_date, edit_date)
              VALUES ($uid, '', '', '$date', '$date')";
      $check = $DB->justquery($sql);
      $bookid = $DB->lastInsertId();
      $result[] = array("bookid" => $bookid,
                        "title" => "",
                        "content" => "",
                        "time" => $date);
      echo json_encode($result);
    }
  }
  die();
}
if ('save' == $act) {
  
}

?>