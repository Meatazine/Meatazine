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
    $sql = "SELECT id, title AS name, edit_date AS datetime
            FROM m_book
            WHERE owner=$uid";
    $data = $DB->query($sql);
    $result = array();
    if ($data) {
      $data->setFetchMode(PDO::FETCH_ASSOC);
      while($row = $data->fetch()) {
        $result[] = $row;
      }
    }
    echo json_encode($result);
  } else {
    $sql = "INSERT INTO m_user
            (qq)
            VALUES ('$openid')";
    $check = $DB->query($sql);
    if ($check) {
      $result = array('code' => '0', 'data' => $bookid);
    } else {
      $result = array('type' => 'error',
                      'code' => '3',
                      'msg' => '貌似是sql错了');
    }
    echo json_encode($result);
  }
  die();
}
if ('save' == $act) {
  $id = (int)$_REQUEST['bookid'];
  $name = strip_tags($_REQUEST['name']);
  $content = strip_tags($_REQUEST['content']);
  $date = mktime();
  // 没有id，插入新book
  if ($id == 0) {
    $sql = "SELECT id
            FROM m_user
            WHERE qq='$openid'";
    $result = $DB->query($sql);
    if (!$result) {
      $result = array('type' => 'error',
                      'code' => '4',
                      'msg' => '此openid无效');
      die(json_encode($result));
    }
    
    $result->setFetchMode(PDO::FETCH_ASSOC);
    $row = $result->fetch();
    $uid = $row['id'];
    
    $sql = "INSERT INTO m_book
            (owner, title, content, create_date, edit_date)
            VALUES ($uid, '$name', '$content', $date, $date)";
    $check = $DB->query($sql);
    $bookid = $DB->lastInsertId();
    if ($check) {
      $result = array('code' => '0', 'data' => $bookid);
    } else {
      $result = array('type' => 'error',
                      'code' => '3',
                      'msg' => '貌似是sql错了');
    }
    die(json_encode($result));
  }
  // 检查归属权，再写表
  $sql = "SELECT 'x'
          FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
          WHERE m_book.id=$id AND m_user.qq='$openid'";
  $check = $DB->query($sql);
  if (!$sql) {
    $result = array('type' => 'error',
                    'code' => '2',
                    'msg' => '没有权限操作目标应用');
    die(json_encode($result));
  }
  $sql = "UPDATE m_book
          SET title='$name', content='$content', edit_date=$date
          WHERE id=$id";
  $check = $DB->query($sql);
  if ($check) {
    $result = array('code' => '0', 'data' => 'ok');
  } else {
    $result = array('type' => 'error',
                    'code' => '3',
                    'msg' => '貌似是sql错了');
  }
  echo json_encode($result);
  die();
}
if ('load' == $act) {
  $id = (int)$_REQUEST['bookid'];
  // 仍然先检查归属权，然后再读表
  $sql = "SELECT 'x'
          FROM m_book LEFT JOIN m_user ON m_user.id=m_book.owner
          WHERE m_book.id=$id AND m_user.qq='$openid'";
  $check = $DB->query($sql);
  if (!$sql) {
    $result = array('type' => 'error',
                    'code' => '2',
                    'msg' => '没有权限操作目标应用');
    die(json_encode($result));
  }
  $sql = "SELECT content
          FROM m_book
          WHERE id=$id";
  $result = $DB->query($sql);
  $result->setFetchMode(PDO::FETCH_ASSOC);
  $row = $result->fetch();
  $content = $row['content'];
  if ($check) {
    $result = array('code' => '0', 'data' => $content);
  } else {
    $result = array('type' => 'error',
                    'code' => '3',
                    'msg' => '貌似是sql错了');
  }
  echo json_encode($result);
  die();
}

?>