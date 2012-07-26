<?
/**
 * db connect
 */
class DB {
  public static $conn_arr = array();
  private function __construct(){
  
  }

  public static function getInstance($name,$get_new=0){
    
    if(self::$conn_arr && self::$conn_arr[$name] && !$get_new){
      return self::$conn_arr[$name];
    }

    if($name == "meatazine"){
      

      $dsn = "mysql:host=localhost;port=3306;dbname=meatazine";
      $pdo = new PDO($dsn,"root","123456");
      $pdo->defaut_table = "m_user";
      self::$conn_arr[$name] = $pdo;
      return $pdo;
    }

  }

}
$DB = DB::getInstance('meatazine');

?>
