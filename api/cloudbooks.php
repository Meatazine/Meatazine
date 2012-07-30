<?php
/**
 * 取用户存在云端的杂志
 * @author Meathill
 */
 
if (!$_REQUEST) {
  die('ok');
}

include_once("include/pdo_connect.php");

$openid = strip_tags($_REQUEST['openid']);
$act = strip_tags($_REQUEST['act']);

if ('fetch' == $act) {
  if ($openid == '') {
    $result = array('type' => 'error',
                    'code' => '1',
                    'msg' => '没有openid');
    die(json_encode($result));
  }
  
  // 先查userid，然后取书
  $sql = "SELECT id
          FROM m_user
          WHERE qq='$openid'
          LIMIT 1";
  $result = $DB->query($sql);
  $result->setFetchMode(PDO::FETCH_ASSOC);
  $obj = $result->fetch();
  $uid = $obj['id'];
  
  if ($uid) {
    $sql = "SELECT id, content
            FROM m_book
            WHERE owner=$uid";
    $data = $DB->query($sql);
    if ($data) {
      $data->setFetchMode(PDO::FETCH_ASSOC);
      $result = array();
      while($row = $data->fetch()) {
        $result[] = $row;
      }
      echo json_encode($result);
    } else {
      $date = mktime();
      $sql = "INSERT INTO m_book
              (owner, title, content, create_date, edit_date)
              VALUES ($uid, '', '', $date, $date)";
      $check = $DB->query($sql);
      $bookid = $DB->lastInsertId();
      $result = array();
      $result[] = array("bookid" => $bookid,
                        "title" => "",
                        "content" => "",
                        "time" => $date);
      echo json_encode($result);
    }
  } else {
    $sql = "INSERT INTO m_user
            (qq)
            VALUES ('$openid')";
    $check = $DB->query($sql);
    if ($check) {
      $uid = $DB->lastInsertId();
      $date = mktime();
      $sql = "INSERT INTO m_book
              (owner, title, content, create_date, edit_date)
              VALUES ($uid, '', '', $date, $date)";
      $check = $DB->query($sql);
      $bookid = $DB->lastInsertId();
      $result = array();
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