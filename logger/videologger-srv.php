<?php

$filename = $_POST['filename'];
$binarydata = base64_decode($_POST['binarydata']);

if (!empty($binarydata)) {
    // log to file
    $file = fopen('videos/' . $filename, 'a+');
    fwrite($file, $binarydata);
    fclose($file);
    print("Successfully Logged to " . $filename);
} else {
    print("EntiyBody is empty.");
}
?>
