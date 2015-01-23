<%@ Page Language="C#" AutoEventWireup="true" CodeFile="3DSCheckout.aspx.cs" Inherits="gcp_3DSCheckout" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Buyatab Gift Card</title>
    <link rel="stylesheet" type="text/css" href="view/template/default/css/jquery-ui-1.10.4.min.css">
    <link rel="stylesheet" type="text/css" href="view/template/default/css/style.css">
</head>
<body>
    <div id="wrapper">
        <h2>
            <p class="delivery-description">
                For your security, please fill out the form below to complete your order. Do not click the
                Refresh or Back button or this transaction may be interrupted or cancelled.
            </p>
        </h2>

        <form id="tdForm" runat="server" method="post" target="my_frame" action="https://www.buyatab.com">
            <asp:ScriptManager ID="ScriptMng" runat="server" EnablePartialRendering="true"></asp:ScriptManager>
            <input type="hidden" name="TermUrl" runat="server" id="TermUrl" />
            <input type="hidden" name="PaReq" runat="server" id="PaReq" />
            <input type="hidden" name="MD" runat="server" id="MD" />
            <div>
                <button id="ifSubmit" runat="server" hidden="hidden"></button>
            </div>
            <asp:UpdatePanel runat="server" ID="eventListener" UpdateMode="Conditional">
            <ContentTemplate>
            </ContentTemplate>
        </asp:UpdatePanel>
    </form>
    <iframe runat="server" id="ifVisa" name="my_frame" width="100%" height="500"></iframe>
</div>
<script type="text/javascript" src="view/js/jquery-1.10.2.min.js"></script>
<script type="text/javascript">

function triggerSubmit() {
    $("#ifSubmit").click();
};

(function(){
    function get_hostname(url) {
        var m = url.match(/^http[s]?:\/\/[^/]+/);
        return m ? m[0] : null;
    }

    window.getParam = function( param ){
        return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
    };

    var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
        eventer = window[eventMethod],
        messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message',
        myFrame = document.getElementById('ifVisa'),
        origin = window.location.origin;

    window.buyMessages = [];

    // Listen to message from child window
    eventer(messageEvent, function(e) {
        var response = e.data,
            results = my_frame.window.results;

        console.log(e.data);

        if (response == 0 || response == 404) {

            //remove cards from local storage
            try {
                localStorage.removeItem( 'cart' + results.mid );
            } catch (err) {
                if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
            }                        

            window.location.href = "confirm.html?on=" + results.on + '&cid=' + results.cid + '&analytics=true';
            // localStorage.removeItem( 'cart' + getParam( 'id' ) );
        }else{
            window.location.href = "orderRefused.aspx?" + 'md=' + getParam('md');
        }

        window.buyMessages.push(e);

    },false);

})();

window.onload = function(){$('#ifSubmit').click();}()// triggerSubmit;
</script>
</body>
</html>
