<?php
$dir = __DIR__;
$files = scandir($dir);
$pngs = array_filter($files, function ($file) {
    return preg_match('/\.png$/i', $file);
});
header('Content-Type: application/json');
echo json_encode(array_values($pngs));
?>
