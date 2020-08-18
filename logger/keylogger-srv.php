<?php

$ignoreAuth = true;
require_once("../interface/globals.php");
require_once("../library/sql.inc");

$entityBody = file_get_contents('php://input');
if (!empty($entityBody)) {
    // // log to file
    // $file = fopen('keypresses.txt', 'a+');
    // fwrite($file, $entityBody . PHP_EOL);
    // fclose($file);

    // log to sql
    $decoded = json_decode($entityBody);
    $user = $decoded->user;
    foreach ($decoded->events as $event) {
        $sqlBinds = array($user, $event->time, $event->type);
        $query = "INSERT INTO aa_keylogger_trace ( user, time, type, data, x, y ) VALUES ( ?, ?, ?, ?, ?, ? )";
        if (property_exists($event, 'data')) {
            array_push($sqlBinds, $event->data);
        } else {
            array_push($sqlBinds, '');
        }
        if (property_exists($event, 'x')) {
            array_push($sqlBinds, $event->x);
            array_push($sqlBinds, $event->y);
        } else {
            array_push($sqlBinds, -1);
            array_push($sqlBinds, -1);
        }
        sqlInsert($query, $sqlBinds);
    }
    print("Successfully Logged.");
} else {
    print("EntiyBody is empty.");
}
?>

