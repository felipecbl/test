
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using gcp.actions;
using System.Text;
using Buyatab.Apps.Common;
using Buyatab.Apps.DataLayer;
using Buyatab.Apps.Payment.TDS;
using System.Text.RegularExpressions;
using Buyatab.Apps.Clients;

public partial class Admin_3DSOrderPreview : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request.QueryString["id"] != null)
            {
                try
                {
                    //get transinfoid
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
                            var cr = PopulateSummary(tdsData);

                            var merchantId = cr.Cart.CartCards[0].MerchantId;

                            var merchantName = Buyatab.Apps.gcp.actions.MerchantAction.MerchantName(merchantId);
                            lblMerchant.InnerText = merchantName;

                            var chainId = Buyatab.Apps.gcp.actions.MerchantAction.ChainId(merchantId);

                            PopulateSupportFooter(chainId);

                            AppendStyleSheetToPage(chainId, merchantId);

                            AddBuyatabContentClass(merchantId);

                            span_button.InnerText = "Continue";

                            //Log customer user info
                            var custUser = new TDSCustomer()
                            {
                                TdsTransInfoId = transId,
                                DateViewed = DateTime.Now
                            };

                            var tdsDb = new TDSDatabase();
                            tdsDb.SaveTDSCustomerLog(custUser);
                        }
                    }
                    else
                    {
                        AppendDefaultStyleSheetToPage();
                        divError.Visible = true;
                        //buyatabContent.Visible = false;
                        wrapper.Visible = false;
                        lblError.InnerText = "Either link is invalid OR it has expired. Please contact our customer support for assistance.";

                    }
                }
                catch (Exception ex)
                {
                    LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "3DS Order preview error", ex, false);
                }
            }

        }
    }

    private void PopulateSupportFooter(int chainId)
    {
        var chainDb = new ChainRetriever();
        var chain = chainDb.GetChainById(chainId);
        var chainEmail = Chain.GetChainEmail(chainId);

        if (!String.IsNullOrWhiteSpace(chain.ContactNumber)) { lblChainPhone.InnerText = chain.ContactNumber; }
        else
        {
            divSupportPhone.Visible = false;
        }

        if (!String.IsNullOrWhiteSpace(chainEmail)) { lblChainEmail.InnerText = chainEmail; }
        else
        {
            divSupportEmail.Visible = false;
        }
    }

    private gcp.objects.CheckoutRequest PopulateSummary(gcp.objects.DelayedTDSInfo tdsData)
    {
        //populate order summary
        var cr = tdsData.CheckoutRequest;
        var cd = tdsData.CheckoutData;
        var su = new StringUtility();

        var billingInfo = cr.Payment.GetBillingInfo();
        var ptype = cr.Cart.CartCards[0].Delivery.DeliveryMethod;

        //card(s) info
        //lblPurchaseType.InnerText = cr.PurchaseType.ToString();
        lblCardHolder.InnerText = cr.Payment.NameOnCard.ToString();
        lblCCType.InnerText = su.ConvertToSentenceCase(cr.Payment.CCType.ToString());

        string s1 = "<ul id='items-detail'> <li> <div class='card-img'><img src='{5}'/></div> <div class='first-column'> <div><span class='bold'>Amount: </span>{0} </div> <div><span class='bold'>Quantity: </span>{1} </div> </div> <div class='second-column'> <div><span class='bold'>Recipient: </span>{2} </div> <div><span class='bold'>Email: </span>{3} </div> </div> <div class='third-column'> <div><span class='bold'>Message: </span>{4} </div></div> </li> </ul>";

        string s2 = "<ul id='items-detail'> <li> <div class='card-img'><img src='{5}'/></div> <div class='first-column'> <div><span class='bold'>Amount: </span>{0} </div> <div><span class='bold'>Quantity: </span>{1} </div> </div> <div class='second-column'> <div><span class='bold'>Recipient: </span>{2} </div> <div><span class='bold'>Ship To: </span>{3} </div> </div> <div class='third-column'> <div><span class='bold'>Message: </span>{4} </div> </div> </li> </ul>";

        var sbEcard = new StringBuilder();
        var sbPcard = new StringBuilder();

        if (ptype == Buyatab.Apps.ProductDelivery.DeliveryMethod.Email)
        {
            foreach (var c in cr.Cart.CartCards)
            {
                var sbMsg = GetFormattedMsg(c);
                sbEcard.AppendFormat(s1, c.Amount, c.Quantity, c.Delivery.Recipient.FullName, c.Delivery.Recipient.Email, GetFormattedMsg(c), c.CardImg.ToString());
            }
        }

        if (ptype == Buyatab.Apps.ProductDelivery.DeliveryMethod.Plastic)
        {
            var sbAdd = new StringBuilder();
            foreach (var c in cr.Cart.CartCards)
            {
                sbAdd.AppendFormat("{0}, {1}", c.Shipment.ShippingAddress.City, c.Shipment.ShippingAddress.Country);
                sbPcard.AppendFormat(s2, c.Amount, c.Quantity, c.Delivery.Recipient.FullName, sbAdd.ToString(), GetFormattedMsg(c), c.CardImg.ToString());
            }
        }

        lblPurchaseDate.InnerText = cd.DateOfTrans.ToString();
        divCards.InnerHtml = sbEcard.ToString();
        lblOrder.InnerText = tdsData.OrderNum.ToString();

        //Credit card
        lblCreditCard.InnerText = ObscureCCNum(billingInfo.CardNumber);
        lblNameOnCard.InnerText = billingInfo.NameOnCard;

        //Billing info
        var sbAddress = new StringBuilder("<ul>");
        sbAddress.AppendFormat("<li>{0}, {1}</li>", billingInfo.Address1.ToString(), billingInfo.Address2.ToString());
        sbAddress.AppendFormat("<li>{0}</li>", billingInfo.City.ToString());
        sbAddress.AppendFormat("<li>{0}</li></ul>", billingInfo.Country.ToString());
        lblAddress.InnerHtml = sbAddress.ToString();

        //Purchaser info
        //lblBillingPhone.InnerText = billingInfo.Phone.ToString();
        lblPurchaserEmail.InnerText = billingInfo.Email.ToString();

        return cr;
    }

    private string GetFormattedMsg(gcp.objects.CartCard c)
    {
        var sbMsg = new StringBuilder();
        sbMsg.Append(c.Message);
        if (c.Message.Length > 200)
        {
            sbMsg.Clear();
            sbMsg.AppendFormat("{0}...", c.Message.Substring(0, 9));
        }
        return sbMsg.ToString();
    }

    private string ObscureCCNum(string cc)
    {
        var sbCard = new StringBuilder();

        if (cc.Length >= 10)
        {
            sbCard.AppendFormat("**** **** **** {0}", cc.Substring(cc.Length - 4, 4));
        }
        else
        {
            sbCard.Append("*******");
        }

        return sbCard.ToString();
    }

    protected void AppendStyleSheetToPage(int chainId, int merchantId)
    {
        var tdsOP = new TDSOrderPreview();
        try
        {
            stylesheet.Text = tdsOP.GetCustomStyleSheetFor3DSOrder(chainId, merchantId);
        }
        catch (Exception ex)
        {
            LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "Error getting custom style sheet", ex, false);
        }
    }

    protected void AppendDefaultStyleSheetToPage()
    {
        var tdsOP = new TDSOrderPreview();
        stylesheet.Text = tdsOP.GetDefaultStyleSheetFor3DSOrder();
    }

    protected void AddBuyatabContentClass(int merchantId)
    {
        var tdsOP = new TDSOrderPreview();

        try
        {
            buyatabContent.CssClass = tdsOP.GetBuyatabContentStyle(merchantId);
        }
        catch (Exception ex)
        {
            LogAction.WriteExceptionToLog(LogType.ERRORTYPE_ERROR, "Error getting Buyatab content style sheet", ex, false);
        }
    }
}