using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Buyatab.Apps.Common;
using Buyatab.Apps.gcp.actions;

public partial class gcp_view_OrderRefused : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            int transInfoId = GetTransInfoIdFromQuery();

            if (transInfoId != -1)
                DisplayRefusedMessage(transInfoId);
            else
                AccessDenied(true);
        }
    }

    private void AccessDenied(bool denyAccess)
    {
        pnlAccessDenied.Visible = denyAccess;
        buyatabContent.Visible = !denyAccess;
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

    private void DisplayRefusedMessage(int transInfoId)
    {
        var tdsAction = new gcp.actions.TDSAction();
        var tdsTransInfo = tdsAction.GetTransactionInfo(transInfoId);


        if (tdsTransInfo != null)
        {
            int merchantId = tdsTransInfo.CheckoutRequest.Cart.CartCards[0].MerchantId;

            int languageId = tdsAction.GetLanguageId(tdsTransInfo.CheckoutRequest);
            
            var merchantName = MerchantAction.MerchantName(merchantId);

            if (languageId == (int)Language.French)
            {
                lblMessage1.InnerText = "Oops.  Unfortunately, your financial institution has not authorized this payment card.";
                lblMessage2.InnerText = "You can try again with a different payment card by clicking on the link below.";
                lblMessage3.InnerText = "When prompted, keep the items in your cart and proceed to check out.  Thank you.";
                
                //lblMerchantText.InnerText = "{French} Click the button to return to " + merchantName;
            }
            else
            {
                lblMessage1.InnerText = "Oops.  Unfortunately, your financial institution has not authorized this payment card.";
                lblMessage2.InnerText = "You can try again with a different payment card by clicking on the link below.";
                lblMessage3.InnerText = "When prompted, keep the items in your cart and proceed to check out.  Thank you.";
                
                //lblMerchantText.InnerText = "Return to " + merchantName;
            }
            
            int chainId = MerchantAction.ChainId(merchantId);
            // Set the style sheet
            AppendStyleSheetToPage(chainId, merchantId);
            // Add the content classes
            AddBuyatabContentClass(merchantId);

            string scheme = System.Web.HttpContext.Current.Request.Url.Scheme + @"://";              // Get the scheme (http/https)
            string host = System.Web.HttpContext.Current.Request.Url.Host;                          // Get the host (www.buyatab.com)
            int port = System.Web.HttpContext.Current.Request.Url.Port;         // Get the port (:80)

            string urlStart = scheme + host + (port != 80 ? "" + (port != 443 ? ":" + port.ToString() : "") : "");           // Build the url
            span_button.InnerText = "Return";
            hlRedirect.NavigateUrl = urlStart + "/gcp?id=" + merchantId.ToString();
            
            AccessDenied(false);
        }
        else
            AccessDenied(true);
    }

    protected void AppendStyleSheetToPage(int chainId, int merchantId)
    {
        var html = "<link rel='stylesheet' type='text/css' href='{0}' id='default-style'>";
        string[] file = { "css/style.css" };

        if (chainId > 0 && merchantId > 0)
        {
            var filesToAdd = Buyatab.Apps.Common.FileOperations.GetCustomFilePath(@"/gcp/view/template", chainId.ToString(), merchantId.ToString(), file);
            stylesheet.Text = string.Format(html, filesToAdd[0]);
        }
        else
        {
            stylesheet.Text = string.Format(html, "view/template/default/css/style.css");
        }
    }

    protected void AddBuyatabContentClass(int merchantId)
    {
        string buyatabContentClass = "theme-1 size-0 arial-font";
        var gcpStyleInformation = MerchantAction.GetGCPStyleInformation(merchantId);

        if (gcpStyleInformation != null && gcpStyleInformation.Tables.Count > 0 && gcpStyleInformation.Tables[0].Rows.Count > 0)
        {
            int presetId = (int)gcpStyleInformation.Tables[0].Rows[0]["PresetId"];
            int size = (int)gcpStyleInformation.Tables[0].Rows[0]["Size"];
            string fontFamily = gcpStyleInformation.Tables[0].Rows[0]["FontFamily"].ToString();

            buyatabContentClass = String.Format("theme-{0} size-{1} {2}-font", presetId, size, fontFamily);
            buyatabContent.CssClass = buyatabContentClass;
        }

        buyatabContent.CssClass = buyatabContentClass;
    }

}