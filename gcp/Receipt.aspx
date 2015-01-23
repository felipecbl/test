﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Receipt.aspx.cs" Inherits="gcp_Receipt" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
	<meta content="utf-8" http-equiv="encoding">
	<title>Transaction Receipt</title>
    <asp:Literal ID="stylesheet" runat="server"></asp:Literal>
	<%--<link rel="stylesheet" type="text/css" href="view/template/default/css/style.css" id='default-style'>--%>

    <!--[if lte IE 8]>
	<link rel="stylesheet" type="text/css" href="view/template/default/css/ie.css">
	<![endif]-->
	<!-- <script type="text/javascript" src="//www.google-analytics.com/ga.js" ></script> -->
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	</script>
</head>
<body>

	<noscript>
		<div id="noscript">
			<p>
				Please <a href="http://enable-javascript.com/">enable JavaScript</a> in your browser.<br>
				S'il vous pla&Icirc;t  <a href="http://enable-javascript.com/"> activer JavaScript</a> dans votre navigateur.
			</p>
			<p>
				Customer support: 1-888-782-8980 <br>
				Service client&egrave;le: 1-888-782-8980
			</p>
		</div>
	</noscript>

	<asp:Panel id="buyatabContent" runat="server">

		<div id="loading-receipt">
			<p>Loading receipt...</p>
		</div>

	</asp:Panel>
	<script type="text/javascript" src="view/js/json2.js"></script>
	<script type="text/javascript" src="view/js/jquery.min.js"></script>
	<script type="text/javascript" src="view/js/handlebars-1.0.0.beta.6.js"></script>
	<script type="text/javascript" src="view/js/jquery.buyalytics.js?v=1.6.11"></script>
	<script type="text/javascript" src="view/js/receipt.js"></script>
    <asp:Literal ID="receipt_data" runat="server"></asp:Literal>
	<script>
		var rbuyatab = $('#buyatabContent').bReceipt( {
												orderNumber: getParam( 'on' ),
												MerchantId: getParam( 'id' )
											} );
		$('body').buyalytics({Id:'UA-10681922-1'});
	</script>
</body>
</html>