<?php
/*
 * jQuery File Upload Plugin PHP Example 5.14
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */


error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
// $upload_handler = new UploadHandler();

$MerchantId = $_REQUEST['merchantId'];
$myId = uniqid('photo_');
$uploadFolder = '../../view/photo_cards/' . $MerchantId. '/' .$myId. '/';
$uploadUrl = '/gcp/view/photo_cards/' . $MerchantId. '/' .$myId. '/';
$options = array(
    'upload_dir' => $uploadFolder,
    'upload_url' => $uploadUrl
);

$upload_handler = new UploadHandler($options);