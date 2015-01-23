<%@ Page Language="C#" AutoEventWireup="true" CodeFile="3DSResult.aspx.cs" Inherits="gcp_3DSResult" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Gift Card</title>
</head>
<body>
    <form runat="server">
    	<asp:Literal runat="server" ID="litResults" ClientIDMode="Static" ></asp:Literal>
        <asp:ScriptManager ID="ScriptMng" runat="server" EnablePartialRendering="true"></asp:ScriptManager>
        <asp:UpdatePanel runat="server" ID="eventListener" UpdateMode="Conditional">
            <ContentTemplate>
            </ContentTemplate>
        </asp:UpdatePanel>
        <script type="text/javascript" src="view/js/jquery-1.10.2.min.js"></script>
    </form>
</body>
</html>