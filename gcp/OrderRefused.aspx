<%@ Page Language="C#" AutoEventWireup="true" CodeFile="OrderRefused.aspx.cs" Inherits="gcp_view_OrderRefused" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Order Refused</title>
    <asp:Literal ID="stylesheet" runat="server"></asp:Literal>
</head>
<body>
    <form id="form1" runat="server">
        <asp:Panel runat="server" ID="pnlAccessDenied" Visible="true">
            Oops. Looks like you aren't supposed to be here... Go on, get.
        <a href="https://www.buyatab.com">Home Page</a>
        </asp:Panel>
        <asp:Panel runat="server" ID="buyatabContent">
            <div id="wrapper">
                <div id="pages-wrapper">
                    <div id="content">
                        <h2 id="lblMessage1" runat="server"></h2>
                        <h2 id="lblMessage2" runat="server"></h2>
                        <h2 id="lblMessage3" runat="server"></h2>

                        <div class="pages-nav">
                            <%--<h2 runat="server" ID="lblMerchantText"></h2>--%>
                            <asp:HyperLink runat="server" ID="hlRedirect" CssClass="button continue-button go-to-delivery no-tab"><span runat="server" id="span_button"></span></asp:HyperLink>
                        </div>
                    </div>
                </div>
            </div>
        </asp:Panel>
    </form>
</body>
</html>
