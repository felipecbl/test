 $(function () {
    $("#loader").hide();
    var self = this,
    host = document.location.hostname;

    //for debugging
    if (host == 'localhost') {
        host = host + ":56829";
    }

    var cUrl = "https://" + host + "/gcp/services/BuyatabWS.asmx/Force3DS";

    $('#btnProceed').click(function (e) {
        e.preventDefault();

        $("#loader").show();
        var Id = getParam('id');

        var dataToSend = { id: Id };
        dataToSend = JSON.stringify(dataToSend);

        $.ajax({
            type: "POST",
            url: cUrl,
            data: dataToSend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                $("#loader").hide();
                // 3DS required
                if (data.d.PaymentAppResponse.PaymentDecision == 6) {
                    var tdsResponse = data.d.PaymentAppResponse;
                    window.location.href = "https://" + host + "/gcp/3DSCheckout.aspx?md=" + tdsResponse.TDSTransactionInfoId;
                }
                else {
                    console.log(data.d);
                }
            },
            fail: function(data){}
        });
        $("#loader").hide();
    });

    function getParam( param ){
        return decodeURI( ( RegExp( param + '=' + '(.+?)(&|$)').exec(location.search) || [,null] )[1] );
    }
});