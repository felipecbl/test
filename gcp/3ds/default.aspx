<%@ Page Language="C#" AutoEventWireup="true" CodeFile="default.aspx.cs" Inherits="gcp_3DSFrame" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Order Summary</title>
    <asp:Literal ID="stylesheet" runat="server"></asp:Literal>
    <asp:Literal ID="template" runat="server"></asp:Literal>
    <!-- <link rel="stylesheet" type="text/css" href="../view/template/default/css/3ds.css"> -->

</head>
<body>

    <div id="iframe_div">
        <iframe name="tdsIframe" id="tdsIframe" width="100%" height="1300" runat="server" class="iframe"></iframe>
    </div>

    <!--<script type="text/javascript" src="../view/template/default/template/3ds.js"></script>-->
    <script type="text/javascript" src="../view/js/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="../view/js/json2.js"></script>
    <script type="text/javascript" src="../view/js/handlebars-1.0.0.beta.6.js"></script>
    <script type="text/javascript" src="../view/js/jquery.3ds.js"></script>

    <script> $('body').b3ds(); </script>

</body>
</html>
