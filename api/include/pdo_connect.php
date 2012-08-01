<?php
/**
 * db connect
 * @author Meathill (meathill@foxmail.com)
 */
class DB {
  /****************
   * 静态属性
   ***************/
  public static $conn_arr = array();
  
  
  /****************
   * 静态方法
   ***************/
  public static function getInstance($name, $get_new=0){
    
    if(self::$conn_arr && self::$conn_arr[$name] && !$get_new){
      return self::$conn_arr[$name];
    }

    if($name == "meatazine"){
      $dsn = "mysql:host=localhost;port=3306;dbname=meatazine";
      $instance = new DB($dsn, 'root', 'pw263113');
      self::$conn_arr[$name] = $instance;
      return $instance;
    }

  }
  
  /****************
   * 私有属性
   ***************/
  private $pdo;
  
  /****************
   * 构造函数
   ***************/
  private function __construct($dsn, $username, $pwd) {
    $this->pdo = new PDO($dsn, $username, $pwd);
    $this->pdo->defaut_table = "m_user";
  }
  
  /****************
   * 公共方法
   ***************/
  /**
   * 取一个值
   * @param {Ssring} $sql
   * @return {mixed} 第一个值
   */
  public function getVar($sql) {
    $result = $this->pdo->query($sql);
    $result->setFetchMode(PDO::FETCH_NUM);
    $row = $result->fetch();
    return $row[0];
  }
  public function getRow($sql) {
    
  }
  /**
   * 取一批值
   * @param {string} $sql
   * @param {string} $type 返回类型，"O" 对象，"A" 数组
   * @return {array} 数组
   */
  public function getResults($sql, $type = 'O') {
    $result = array();
    $data = $this->pdo->query($sql);
    if ($data) {
      $data->setFetchMode(PDO::FETCH_ASSOC);
      while($row = $data->fetch()) {
        $result[] = $row;
      }
    }
    return $result;
  }
  /**
   * 取最近插入的数据的id
   */
  public function lastInsertId() {
    return $this->pdo->lastInsertId();
  }
  /**
   * 执行sql
   * @param {string} $sql
   * @return {mixed} 结果
   */
  public function query($sql) {
    return $this->pdo->query($sql);
  }
}
$DB = DB::getInstance('meatazine');

?>
