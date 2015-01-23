<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ecard.aspx.cs" Inherits="ecard" EnableViewState="false" Trace="false"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<!-- <meta name="viewport" content="initial-scale=1.0,maximum-scale=1.0, user-scalable=0,width=device-width" /> -->
	<meta name="viewport" content="width=device-width" />
	<title>E-Gift Card</title>
	<link rel="stylesheet" type="text/css" href="view/template/default/css/jquery-ui-1.10.4.min.css">

	<!--[if lte IE 8]>
	<link rel="stylesheet" type="text/css" href="view/template/default/css/ie.css">
	<![endif]-->

</head>
<body class="ecard" onload="render()">
	<div id="wrapper">
		<div class="container">
			<div id="content">
				<div id="ecard-wrap"></div>
				<noscript>
					<div id="noscript">
						<p> Please <a href="https://support.microsoft.com/gp/howtoscript">enable JavaScript</a> in your browser.<br> S'il vous pla&Icirc;t  <a href="https://support.microsoft.com/gp/howtoscript"> activer JavaScript</a> dans votre navigateur. </p>
						<p> Customer support: 1-888-782-8980 <br> Service client&egrave;le: 1-888-782-8980 </p>
					</div>
				</noscript>
			</div>
		</div>
	</div>
	<!--
        <script type="text/javascript" src="view/js/json2.js"></script>

        <script type="text/javascript" src="view/js/jquery.buyalytics.js?v=1.6.18"></script>
        -->


<%--	 <script type="text/javascript" src="view/js/console.log.js"></script>
	<script type="text/javascript" src="view/js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="view/js/jquery-ui-1.10.4.min.js"></script>
	<script type="text/javascript" src="view/js/modernizr-2.6.2.min.js"></script>
	<script type="text/javascript" src="view/js/jquery.waitforimages.js"></script>
    <script type="text/javascript" src="view/js/handlebars-v2.0.0.min.js"></script>
	<script type="text/javascript" src="view/js/jquery-ui-1.10.4.min.js" ></script>
    <script type="text/javascript" src="view/js/jquery.ecard.js"></script>

	<!-- barcode -->
	<script type="text/javascript" src="view/js/barcode/bwip.js"></script>
	<script type="text/javascript" src="view/js/barcode/symdesc.js"></script>
	<script type="text/javascript" src="view/js/barcode/needyoffset.js"></script>
	<script type="text/javascript" src="view/js/barcode/canvas.js"></script>
    --%>
	<!-- <script type="text/javascript" src="//www.google-analytics.com/ga.js" ></script> -->
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	</script>

   <% =SquishIt.Framework.Bundle.JavaScript()
        .Add("view/js/console.log.js")
        .Add("view/js/jquery-1.10.2.min.js")
        .Add("view/js/jquery-ui-1.10.4.min.js")
        .Add("view/js/modernizr-2.6.2.min.js")
        .Add("view/js/jquery.waitforimages.js")
        .Add("view/js/handlebars-v2.0.0.min.js")
        .Add("view/js/jquery-ui-1.10.4.min.js")
        .Add("view/js/barcode/bwip.js")
        .Add("view/js/barcode/symdesc.js")
        .Add("view/js/barcode/needyoffset.js")
        .Add("view/js/barcode/canvas.js")
        .Add("view/js/jquery.ecard.js")
        .Add("view/js/jquery.buyalytics.js?v=1.6.18")
        .ForceRelease()
        .Render("view/js/ecard.comb.js")
        %>

<%--   <% =SquishIt.Framework.Bundle.JavaScript()
        .Add("view/js/barcode/bwip.js")
        .Add("view/js/barcode/symdesc.js")
        .Add("view/js/barcode/needyoffset.js")
        .Add("view/js/barcode/canvas.js")
        .ForceRelease()
        .Render("view/js/ecard.barcode.comb.js")
        %>--%>

	<!-- Dynamic files -->
    <asp:Literal ID="ecard_info" runat="server"></asp:Literal>
	<%--<asp:Literal ID="custom_template_file" runat="server"></asp:Literal>
	<asp:Literal ID="custom_lang_file" runat="server"></asp:Literal>--%>

	<script>
    	$('body').buyalytics({Id:'UA-10681922-1'});

		$('#ecard-wrap').eCard();

		//trigger barcode loading when page is loaded
		function render() {
			$(window).trigger('loadBarcode');
		}

	</script>
</body>
</html>
