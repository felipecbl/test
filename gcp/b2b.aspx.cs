using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using Buyatab.Apps.Payment;

public partial class gcp_b2b : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        int merchantId = (int)Session["B2B_MerchantId"];
        int b2bAccountUserId = (int)Session["B2B_AccountUserId"];
        int purchaseType = (int)Session["B2B_PurchaseType"];

        decimal discountAmount = 0;
        string discountType = String.Empty;

        if (Session["B2B_DiscountAmount"] != null &&
            Session["B2B_DiscountType"] != null)
        {
            discountAmount = (decimal)Session["B2B_DiscountAmount"];
            discountType = (string)Session["B2B_DiscountType"];
        }

        // If there are previously saved shipping addresses to choose from, create a json array of them
        string jsonShippingAddressArray = String.Empty;

        if (Session["B2B_UserShippingAddresses"] != null)
        {
            var userShippingAddresses = (List<Buyatab.Apps.ProductDelivery.Address>)Session["B2B_UserShippingAddresses"];

            jsonShippingAddressArray = String.Format("[{0}]",
                String.Join(",", userShippingAddresses.Select(a => a.ToString()).ToArray()));
        }

        // If there are previously saved payment options to choose from, create a json array of them
        string jsonBillingInfoArray = String.Empty;

        if (Session["B2B_UserCCInformation"] != null)
        {
            var ccInfo = (List<CCInformation>)Session["B2B_UserCCInformation"];

            var billingInfo = from c in ccInfo
                              select new UserBillingInfo(Encryption.EncryptAndEncode(c.Id.ToString()), c.CardType.ToString() + "-" + c.ObscuredCardNumber);

            jsonBillingInfoArray = String.Format("[{0}]",
                String.Join(",", billingInfo.Select(bi => bi.ToString()).ToArray()));
        }

        // Create the json objects to pass to the plug-in
        plhTemplateItems.Controls.Add(new LiteralControl(
            String.Format("<script>	    $('#buyatabContent').bTemplate({{MerchantId: {0}, b2b: true, UserId: {1}, PurchaseId: {2}, discount:{{ value: {3}, type: '{4}'}}, userShippingAddresses: {5}, userBillingInfo: {6} }}); </script>",
                merchantId,
                b2bAccountUserId,
                purchaseType,
                discountAmount,
                discountType,
                jsonShippingAddressArray,
                jsonBillingInfoArray))); ;
    }

    public class UserBillingInfo
    {
        public string Id;
        public string Description;

        public UserBillingInfo(string id, string description)
        {
            Id = id;
            Description = description;
        }

        public override string ToString()
        {
            return Buyatab.Apps.Common.JsonSerializer.Serialize(this);
        }
    }
}