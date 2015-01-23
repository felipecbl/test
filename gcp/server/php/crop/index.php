<?php
require_once('../FirePHPCore/FirePHP.class.php');
ob_start();
$firephp = FirePHP::getInstance(true);

$image = $_REQUEST;
$protocol = 'http://';
$domainName = $_SERVER['HTTP_HOST'];
$host = $protocol . $domainName;
$imgSrc = $image['src'];
$path_parts = pathinfo($imgSrc);
$file = $host.$image['src'];
$imgFolder = dirname($file);
$fileName = basename($file);
$ext = pathinfo($fileName, PATHINFO_EXTENSION);
$imgPath = 	$path_parts['dirname'];

$return['progress'] = 0;

// $firephp->log($image);
// $firephp->log('File: ' . $file);
// $firephp->log('Extension: ' . $ext);
// $firephp->log('Image folder: ' . $imgFolder);
// $firephp->log('File Name: ' . $fileName);
// $firephp->log('image Path: ' . $imgPath);

	// *** Include the class
include("resize-class.php");

	// *** 1) Initialise / load image
// $resizeObj = new resize('test.jpg');
$resizeObj = new resize($host . $imgPath . '/' . $fileName);
$return['progress'] = 10;
$return['action'] = 'Analizing image';
$return['status'] = 'starting';
// echo json_encode($return);

	// *** 2) Resize image (options: exact, portrait, landscape, auto, crop)
$resizeObj -> resizeCrop($image['real_w'], $image['real_h'], $image['real_x'], $image['real_y']);

	// *** 3) Save image
$resizeObj -> saveImage('../../../..' . $imgPath . '/crop_' . $fileName, 100);


$return['progress'] = 20;
$return['action'] = 'Cropping';
$return['status'] = 'cropping';
// echo json_encode($return);

$imgCroped = new resize('../../../..' . $imgPath . '/crop_' . $fileName);

// *** big
$imgCroped -> resizeImage(590, 295, 'crop');
$return['action'] = 'Saving big';
$return['status'] = 'saving';
$imgCroped -> saveImage('../../../..' . $imgPath . '/big.' . $ext, 100);

$return['progress'] = 50;
// echo json_encode($return);

// *** medium
$imgCroped -> resizeImage(200, 100, 'crop');
$return['action'] = 'Saving medium';
$return['status'] = 'saving';
$imgCroped -> saveImage('../../../..' . $imgPath . '/medium.' . $ext, 100);

$return['progress'] = 70;
// echo json_encode($return);

// *** small
$imgCroped -> resizeImage(56, 28, 'crop');
$return['action'] = 'Saving small';
$return['status'] = 'saving';
$imgCroped -> saveImage('../../../..' . $imgPath . '/small.' . $ext, 100);

$return['progress'] = 100;
$return['action'] = 'Complete';
$return['status'] = 'complete';
// echo json_encode($return);
$status['success'] = true;
$status['progress'] = 100;
echo json_encode($status);

?>
