using Buyatab.Apps.Payment.TDS;
using gcp.actions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class gcp_3DSFrame : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request.QueryString["id"] != null)
            {
                try
                {
                    //get transinfoid from parent
                    var encryptdTransId = Request.QueryString["id"].ToString();
                    var mdParser = new Buyatab.Apps.Payment.TDS.MerchantDescriptorParser();
                    var transId = mdParser.ParseFromServerEncryptedString(encryptdTransId);

                    var uriEsc = Uri.EscapeDataString(encryptdTransId);

                    var tdsNotif = new TDSNotification();

                    if (transId > 0 && tdsNotif.ValidateNotificationKey(uriEsc))
                    {
                        var tds = new TDSAction();
                        var tdsData = tds.GetPartialTransInfo(transId);

                        if (tdsData != null)
                        {
                            var merchantId = tdsData.CheckoutRequest.Cart.CartCards[0].MerchantId;

                            var chainId = Buyatab.Apps.gcp.actions.MerchantAction.ChainId(merchantId);

                            AppendStyleSheetToPage(chainId, merchantId);

                            AppendStyleTemplate(chainId, merchantId);
                        }
                    }
                    else
                    {
                        AppendDefaultStyleSheetToPage();
                        AppendStyleTemplate(0, 0);
                        //divError.Visible = true;
                        //iframe_div.Visible = false;
                        //lblError.Text = "Invalid URL. Please contact customer support for assistance.";
                    }
                }
                catch (Exception ex)
                {
                    LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "3DS Order preview error", ex, false);
                }
            }
        }
    }

    private void AppendStyleTemplate(int? chainId, int? merchantId)
    {
        var tdsOP = new TDSOrderPreview();
        try
        {
            template.Text = tdsOP.GetStyleTemplate(chainId, merchantId);
        }
        catch (Exception ex)
        {
            LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "Error getting custom style sheet", ex, false);
        }

        //template.Text = "<script type='text/javascript' src='/gcp/view/template/default/template/3ds.js'></script>";
    }

    protected void AppendStyleSheetToPage(int chainId, int merchantId)
    {
        var tdsOP = new TDSOrderPreview();
        try
        {
            stylesheet.Text = tdsOP.GetCustomStyleSheet(chainId, merchantId);
        }
        catch (Exception ex)
        {
            LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "Error getting custom style sheet", ex, false);
        }
    }

    protected void AppendDefaultStyleSheetToPage()
    {
        var tdsOP = new TDSOrderPreview();
        stylesheet.Text = tdsOP.GetDefaultStyleSheet();
    }
}