<?php
$entityBody = file_get_contents('php://input');
if (!empty($entityBody)) {
  $file = fopen('presses.txt', 'a+');
  fwrite($file, $entityBody . PHP_EOL);
  fclose($file);
}
?>