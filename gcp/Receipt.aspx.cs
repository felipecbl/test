
using gcp.actions;
using gcp.objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class gcp_Receipt : System.Web.UI.Page
{
    private int _orderNumber;
    private ReceiptResponse _rr;

    protected void Page_Load(object sender, EventArgs e)
    {
        _rr = new ReceiptResponse();

        // Step 1: authenticate the query string parameters
        var queryRetrieved = GetOrderNumberFromQueryString();

        // Step 2: get receipt data which is added to receipt response object
        // and then used by other methods
        if (queryRetrieved)
        {
            GetReceiptData();
        }

        // Step 3: check for custom css
        // uses the receipt resonse obj
        AppendStyleSheetToPage();

        // Step 4: add theme values to page
        // uses the receipt resonse obj
        AppendStyleCustomizationsToPage();

        // Step 5: frontendify receipt information
        // uses the receipt resonse obj
        AddReceiptDataToPage();
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
                LogAction.WriteExceptionToLog(LogType.ERRORTYPE_WARNING, "Unable to decrypt the order number for a receipt. on : " + Request["on"], UnableToGetOrderNumber, false);
                _rr.Status = new Status(gcp.objects.Error.EC_RR_INVALID_ON, "Unable to decrypt.");
            }
        }
        else
        {
            _rr.Status = new Status(gcp.objects.Error.EC_RR_INVALID_ON, "Order number could not be retrieved.");
        }

        return success;
    }

    protected void GetReceiptData()
    {
        // Set the order number for the rr object
        _rr.OrderNumber = _orderNumber;

        // get the receipt data and put it in the response object
        ReceiptAction.PopulateResponse(ref _rr);
    }

    protected void AppendStyleSheetToPage()
    {
        var html = "<link rel='stylesheet' type='text/css' href='{0}' id='default-style'>";
        string[] file = {"css/style.css"};

        if (_rr != null && _rr.ChainId > 0 && _rr.MerchantId > 0)
        {
            var filesToAdd = Buyatab.Apps.Common.FileOperations.GetCustomFilePath(@"/gcp/view/template", _rr.ChainId.ToString(), _rr.MerchantId.ToString(), file);
            stylesheet.Text = string.Format(html, filesToAdd[0]); 
        }
        else
        {
            stylesheet.Text = string.Format(html, "view/template/default/css/style.css");
        }
    }

    protected void AppendStyleCustomizationsToPage()
    {
        string stylePresets = "theme-1 size-0 arial-font";
        if (_rr != null)
        {
            stylePresets = String.Format("theme-{0} size-{1} {2}-font", _rr.Style.PresetId, _rr.Style.Size, _rr.Style.FontFamily);
        }

        buyatabContent.CssClass = stylePresets;
    }

    protected void AddReceiptDataToPage()
    {
        var jsCreator = new System.Web.Script.Serialization.JavaScriptSerializer();
        string serializedResponse = jsCreator.Serialize(_rr);
        receipt_data.Text = String.Format("<script type='text/javascript' > window.receipt = {0}</script> ", serializedResponse);
    }
}