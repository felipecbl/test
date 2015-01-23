<%@ Page Language="C#" AutoEventWireup="true" CodeFile="3DSOrderPreview.aspx.cs" Inherits="Admin_3DSOrderPreview" %>

<!DOCTYPE html>
<html>
<head>
    <title>Purchase Order Summary</title>
    <asp:Literal ID="stylesheet" runat="server"></asp:Literal>

</head>
<body>
    <asp:Panel ID="buyatabContent" runat="server">
        <div id="wrapper" runat="server" class="receipt">
            <header>
                <hgroup>
                    <h1><span id="lblMerchant" runat="server"></span></h1>
                    <h2>Please review your order & click Continue to complete</h2>
                </hgroup>
                <div id="sub-title">
                    <div class="sub-left">
                        <h2>Purchased By</h2>
                        <div>
                            <span id="lblNameOnCard" runat="server"></span>
                            <span id="lblAddress" runat="server"></span>
                            <span id="lblPurchaserEmail" runat="server"></span>
                        </div>
                    </div>
                    <div class="sub-right">
                        <h2>Order ID</h2>
                        <div class="bold">#<span id="lblOrder" runat="server"></span> </div>
                    </div>
                </div>
            </header>

            <div id="items">
                <h2>Card(s)</h2>
                <div id="divCards" runat="server"></div>
            </div>

            <footer>
                <div id="sub-footer">
                    <div class="sub-left">
                        <div>
                            <div><span class="bold">Cardholder: </span><span id="lblCardHolder" runat="server" /></div>
                            <div><span class="bold">Payment method: </span><span id="lblCCType" runat="server" /></div>
                            <div><span class="bold">Card number: </span><span id="lblCreditCard" runat="server"></span></div>
                        </div>
                    </div>
                    <div class="sub-right">
                        <div>
                            <span class="bold">Date: </span>
                            <span id="lblPurchaseDate" runat="server"></span>
                        </div>
                    </div>
                </div>

                <div class="pages-nav">
                    <asp:HyperLink runat="server" ID="btnProceed" CssClass="button continue-button go-to-delivery no-tab" NavigateUrl="#"><span runat="server" id="span_button"></span></asp:HyperLink>
                </div>

                <!-- <div class="customer-service"> -->
                <!-- <div id="divSupportPhone" runat="server"><span class="bold">e-support: </span><span id="lblChainEmail" runat="server" /></div> -->
                <!-- <div id="divSupportEmail" runat="server"><span class="bold">phone: </span><span id="lblChainPhone" runat="server" /></div> -->
                <div id="div1" class="field" runat="server">
                    <span class="bold">* Please note that on your credit card statement, this transaction will replace your previous transaction. </span>
                </div>
                <!-- </div> -->
            </footer>
        </div>
        <div id="divError" runat="server" visible="false">
            <h1>Invalid Web Url</h1>
            <p>
                <label id="lblError" class="" runat="server"></label>
            </p>
        </div>

        <%--<ul id='items-detail'>
            <li>
                <div class='first-column'>
                    <div><span><img src=''/>  </span></div>
                    <div><span class='bold'>Amount: </span>{0} </div>
                    <div><span class='bold'>Quantity: </span>{1} </div>
                </div>
                <div class='second-column'>
                    <div><span class='bold'>Recipient: </span>{2} </div>
                    <div><span class='bold'>Email: </span>{3} </div>
                </div>
                <div class='third-column'>
                    <div><span class='bold'>Message: </span>{4} </div>
                </div>
            </li>
        </ul>--%>
    </asp:Panel>


    <%-- <div id="loader">
        <span>Please wait...</span>
    </div>--%>

    <script src="/gcp/view/js/jquery-1.10.2.min.js"></script>
    <script src="/gcp/view/js/3ds-order-preview.js"></script>
    <script src="/gcp/view/js/jquery.postHeight.js"></script>
</body>
</html>
