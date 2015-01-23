<%@ Page Language="C#" AutoEventWireup="true" CodeFile="b2b.aspx.cs" Inherits="gcp_b2b" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>Buyatab Gift Card</title>
	<link rel="stylesheet" type="text/css" href="view/template/default/css/style.css" id='default-style'>
	<!--[if lte IE 8]>
	<link rel="stylesheet" type="text/css" href="view/template/default/css/ie.css">
	<![endif]-->
</head>
<body>
	<div id="buyatabContent" style='overflow: hidden;'></div>
	<img id='verisign1' alt='Click to Verify - This site has chosen an SSL Certificate to improve Web site security' src='view/template/default/images/getseal.gif'/>

	<noscript>
		<div id="noscript">
			<p>
				Please <a href="https://support.microsoft.com/gp/howtoscript">enable JavaScript</a> in your browser.<br>
				S'il vous pla&Icirc;t  <a href="https://support.microsoft.com/gp/howtoscript"> activer JavaScript</a> dans votre navigateur.
			</p>
			<p>
				Customer support: 1-888-782-8980 <br>
				Service client&egrave;le: 1-888-782-8980
			</p>
		</div>
	</noscript>
	<!-- <script type="text/javascript" src="//www.google-analytics.com/ga.js" ></script> -->
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	</script>
	<script type="text/javascript" src="view/js/json2.js"></script>
	<script type="text/javascript" src="view/js/underscore.js"></script>
	<script type="text/javascript" src="view/js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="view/js/backbone.js"></script>
	<script type="text/javascript" src="view/js/getseal.js"></script>
	<script type="text/javascript" src="view/js/jquery.creditCardValidator.js"></script>
	<script type="text/javascript" src="view/js/jquery-ui.js"></script>
	<script type="text/javascript" src="view/js/jquery.ui.touch-punch.min.js"></script>
	<script type="text/javascript" src="view/js/jquery.mousewheel.js"></script>
	<script type="text/javascript" src="view/js/handlebars-1.0.0.beta.6.js"></script>
	<script type="text/javascript" src="view/js/jquery.roundabout.js"></script>
	<script type="text/javascript" src="view/js/jquery.flexslider-min.js?version=2.2"></script>
	<script type="text/javascript" src="view/js/jquery.path.js"></script>

	<!-- The jQuery UI widget factory, can be omitted if jQuery UI is already included -->
	<script type="text/javascript" src="view/js/upload/vendor/jquery.ui.widget.js"></script>
	<!-- The Load Image plugin is included for the preview images and image resizing functionality -->
	<script type="text/javascript" src="view/js/upload/load-image.min.js"></script>
	<!-- The Canvas to Blob plugin is included for image resizing functionality -->
	<script type="text/javascript" src="view/js/upload/canvas-to-blob.min.js"></script>
	<!-- The Iframe Transport is required for browsers without support for XHR file uploads -->
	<script type="text/javascript" src="view/js/upload/jquery.iframe-transport.js"></script>
	<!-- The basic File Upload plugin -->
	<script type="text/javascript" src="view/js/upload/jquery.fileupload.js"></script>
	<!-- The File Upload processing plugin -->
	<script src="view/js/upload/jquery.fileupload-process.js"></script>
	<!-- The File Upload image preview & resize plugin -->
	<script src="view/js/upload/jquery.fileupload-image.js"></script>

	<script type="text/javascript" src="view/js/jquery.buyalytics.js?v=1.6.18"></script>
 	<script> document.write("<script type='text/javascript' src=view/js/buyatabTemp.jquery.js?v=" + Math.random() + "><\/script>"); </script>

	<!-- <script type="text/javascript" src="xxx/view/js/buyatabTemp.jquery.js?v=1.09.30"></script> -->
	<script type="text/javascript" src="view/js/functions.js"></script>

    <asp:PlaceHolder runat="server" id="plhTemplateItems" />

	<script type="text/javascript" src="view/template/1205/js/porthole.min.js"></script>
	<script type="text/javascript" src="view/template/1205/js/relay.js"></script>

</body>
</html>
