using gcp.actions;
using gcp.objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class gcp_Confirm : System.Web.UI.Page
{
    private int _orderNumber;
   // private ReceiptResponse _rr;
    private Buyatab.Apps.Confirmation.OrderConfirmation _confirmation;
    private string[] files = { "css/style.css" , "template/confirm{0}.js"};
    private string[] addOnFiles = { "js/conf.header.js", "js/conf.body.js" };

    protected void Page_Load(object sender, EventArgs e)
    {
        //_rr = new ReceiptResponse();

        // Step 1: authenticate the query string parameters
        var queryRetrieved = GetOrderNumberFromQueryString();

        // Step 2: get confirmation data which is added to receipt response object
        // and then used by other methods
        if (queryRetrieved)
        {
            GetReceiptData();
        }

        // Step 3: check for custom css, custom template & custom analytics files
        // uses the receipt resonse obj
        AppendCustomFiles();

        // Step 4: add theme values to page
        // uses the receipt resonse obj
        AppendStyleCustomizationsToPage();

        // Step 5: frontendify receipt information
        // uses the receipt resonse obj
        AddConfirmationDataToPage();
    }

    private void AppendCustomFiles()
    {
        if (_confirmation != null && _confirmation.Merchant != null)
        {
            string lang = _confirmation.Merchant.Language == Buyatab.Apps.Common.Language.French ? "-fr" : "";
            files[1] = String.Format(files[1], lang);

            files = Buyatab.Apps.Common.FileOperations.GetCustomFilePath(@"/gcp/view/template", _confirmation.Merchant.ChainId.ToString(), _confirmation.Merchant.MerchantId.ToString(), files);
            addOnFiles = Buyatab.Apps.Common.FileOperations.GetCustomFilePathNoDefault(@"/gcp/view/template", _confirmation.Merchant.ChainId.ToString(), _confirmation.Merchant.MerchantId.ToString(), addOnFiles);
        }

        // Stylesheet
        AppendStyleSheetToPage(files[0]);

        // Template
        AppendTemplateToPage(files[1]);

        // Analytics
        AppendAnalyticsToPage(addOnFiles);

    }

    /// <summary>
    /// Retrieves the order number from query string
    /// </summary>
    /// <returns>whether operation was successful</returns>
    protected bool GetOrderNumberFromQueryString()
    {
        bool success = false;

        // get query string
        if (Request["on"] != null)
        {
            try
            {
                var queryParser = new Buyatab.Apps.GiftCards.ECard.ECardLinkIDParser();
                _orderNumber = queryParser.ParseProductReferenceId(Request["on"]);
                success = true;
            }
            catch (Exception UnableToGetOrderNumber)
            {
                LogAction.WriteExceptionToLog(LogType.ERRORTYPE_WARNING, "Unable to decrypt the order number for a confirmation. on : " + Request["on"], UnableToGetOrderNumber, false);
                //_confirmation.Status = new Status(gcp.objects.Error.EC_RR_INVALID_ON, "Unable to decrypt.");
            }
        }
        
        return success;
    }

    protected void GetReceiptData()
    {
        //// Set the order number for the rr object
        //_rr.OrderNumber = _orderNumber;

        //// get the receipt data and put it in the response object
        //ReceiptAction.PopulateResponse(ref _rr);

        var orderRetriever = new Buyatab.Apps.Confirmation.OrderConfirmationRetriever();
        _confirmation = orderRetriever.GetOrderConfirmationByOrderNumber(_orderNumber);
    }

    private void AppendTemplateToPage(string templatePath)
    {
        var html = "<script type='text/javascript' src='{0}' id='template'></script>";


        if (_confirmation != null)
        {
            template.Text = string.Format(html, templatePath);
        }
        else
        {
            template.Text = string.Format(html, "view/template/default/template/confirm.js");
        }
    }

    private void AppendAnalyticsToPage(string[] analyticsFiles)
    {
        var html = "<script type='text/javascript' src='{0}'></script>";


        if (_confirmation != null )
        {
            analytics_head.Text += !String.IsNullOrWhiteSpace(analyticsFiles[0]) ? string.Format(html, analyticsFiles[0]) : "";
            analytics_body.Text += !String.IsNullOrWhiteSpace(analyticsFiles[1]) ? string.Format(html, analyticsFiles[1]) : "";
        }

    }

    protected void AppendStyleSheetToPage(string filePath)
    {
        var html = "<link rel='stylesheet' type='text/css' href='{0}' id='default-style'>";


        if (_confirmation != null)
        {
            stylesheet.Text = string.Format(html, filePath);
        }
        else
        {
            stylesheet.Text = string.Format(html, "view/template/default/css/style.css");
        }
    }

    protected void AppendStyleCustomizationsToPage()
    {
        string stylePresets = "theme-1 size-0 arial-font";
        if (_confirmation != null)
        {
            stylePresets = String.Format("theme-{0} size-{1} {2}-font", _confirmation.Merchant.Theme.PresetId, _confirmation.Merchant.Theme.Size, _confirmation.Merchant.Theme.Font);
        }

        buyatabContent.CssClass = stylePresets;
    }

    protected void AddConfirmationDataToPage()
    {
        var jsCreator = new System.Web.Script.Serialization.JavaScriptSerializer();
        string serializedResponse = jsCreator.Serialize(_confirmation);
        confirm_data.Text = String.Format("<script type='text/javascript' > window.orderConfirm = {0}</script> ", serializedResponse);
    }
}