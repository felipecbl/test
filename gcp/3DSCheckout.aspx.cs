using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Buyatab.Apps.Payment;

public partial class gcp_3DSCheckout : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            //SetJavascriptEvent("<script type=\"text/javascript\" src=\"view/js/jquery-1.10.2.min.js\"></script>", "jquery", false);

                    //hdnTriggerSubmit.Value = "1";

                    int transInfoId = GetTransInfoIdFromQuery();
                    if (transInfoId != -1)
                    {
                        PostTo3DS(transInfoId);
                    }

            //else
            //{
            //    int transInfoId = GetTransInfoIdFromQuery();

                //if (transInfoId != -1)
                  //  ResumeCheckoutProcess(transInfoId);
            //}
        }
    }

    private int GetTransInfoIdFromQuery()
    {
        int transInfoId = -1;
        if (Request.QueryString["md"] != null)
        {
            string transInfoIdEncrypted = Request.QueryString["md"];

            var mdParser = new Buyatab.Apps.Payment.TDS.MerchantDescriptorParser();

            transInfoId = mdParser.ParseFromServerEncryptedString(transInfoIdEncrypted);
        }
        return transInfoId;
    }

    public bool PostTo3DS(int transInfoId)
    {
        bool success = true;

        var tdsAction = new gcp.actions.TDSAction();
        var tdsTransInfo = tdsAction.GetTransactionInfo(transInfoId);

        string termUrl = Request.Url.Scheme + "://" + Request.Url.Authority + "/gcp/3DSResult.aspx?md=" + tdsTransInfo.PaymentAppResponse.TDSTransactionInfoId;
        string paReq = tdsTransInfo.PaymentAppResponse.TDSEnrollmentResponse.PaymentRequest;
        string md = tdsTransInfo.PaymentAppResponse.TDSTransactionInfoId;
        string url = tdsTransInfo.PaymentAppResponse.TDSEnrollmentResponse.Url;

        TermUrl.Value = termUrl;
        PaReq.Value = paReq;
        MD.Value = md;
        tdForm.Action = url;

        return success;
    }
}