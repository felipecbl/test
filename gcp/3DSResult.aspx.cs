using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Buyatab.Apps.Payment;

public partial class gcp_3DSResult : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            int transInfoId = GetTransInfoIdFromQuery();

            if (transInfoId != -1)
                ResumeCheckoutProcess(transInfoId, true);
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

    /// <summary>
    /// Creates and places on the page a javascript script. 
    /// </summary>
    /// <param name="script"></param>
    private void SetJavascriptEvent(string script, string key, bool addTags)
    {
        ScriptManager.RegisterStartupScript(eventListener, eventListener.GetType(), key,
                                                script, addTags);
        eventListener.Update();
    }

    private void ResumeCheckoutProcess(int transInfoId, bool isTDSTransaction)
    {
        var tdsAction = new gcp.actions.TDSAction();
        gcp.objects.RequestParams rp = null;

        try
        {
            rp = tdsAction.GetTDSRequestParams(transInfoId);
        }
        catch(Exception ex)
        {
            Buyatab.Apps.gcp.actions.LogAction.WriteExceptionToLog(Buyatab.Apps.gcp.actions.LogType.ERRORTYPE_ERROR, "Failed to create the RequestParams object for 3DS trans info. Id: " + transInfoId, ex, false);
        }

        if (rp != null)
        {
            int merchantId = rp.CheckoutRequest.Cart.CartCards[0].MerchantId;

            int languageId = tdsAction.GetLanguageId(rp.CheckoutRequest);

            var transactionData = tdsAction.GetTransactionData(rp, languageId, isTDSTransaction);
            
            var response = tdsAction.SendAuthenticationRequest(rp.PaRes, rp.ConfirmationNumber, transactionData, rp.tdsPayAppResponse, rp.tdsPayAppResponse.OrderNumber);

            var tdsAuthResp = response.TDSAuthenticateResponse;

            if (tdsAuthResp == null)
            {
                Buyatab.Apps.gcp.actions.LogAction.WriteMessageToLog(Buyatab.Apps.gcp.actions.LogType.ERRORTYPE_WARNING, "3DS Failed Authentication from 3dsresult page. tdsAuthResp is null -- " , rp.tdsPayAppResponse.OrderNumber, false);
                RedirectForFailedAuthentication(response, merchantId, (int)response.Status.Code);
                return;
            }

            string authenticationStatus = response.TDSAuthenticateResponse.AuthenticateStatus.ToString();
            string authenticationEci = response.TDSAuthenticateResponse.ECI;
            string authenticationSvv = response.TDSAuthenticateResponse.SignatureVerificationValue.ToString();

            var tdsDatabase = new Buyatab.Apps.DataLayer.TDSDatabase();
            tdsDatabase.SaveAuthenticationResults(transInfoId, authenticationEci, authenticationStatus, authenticationSvv);

            if ((response.PaymentDecision == PaymentDecision.Success &&
                response.Status.Code == PaymentAppStatus.PaymentCode.EC_SUCCESS) // Successfull Transactions
                || (response.PaymentDecision == PaymentDecision.Held &&
                response.Status.Code == PaymentAppStatus.PaymentCode.EC_TR_TRANSHELD)) // Held transaction
            {
                var shippingAddressesToSave = rp.CheckoutRequest.Cart.CartCards
                                              .Where(cc => cc.SaveAddress)
                                              .Select(cc => cc.Shipment.ShippingAddress)
                                              .ToList();

                ////Mark the user as verified after successful 3D check
                //if (rp.CheckoutData.User.Verified != Buyatab.Apps.Users.Verified.Verified)
                //{
                //    Buyatab.BOL.User.VerifyUser(rp.CheckoutData.User.Id, true);
                //}

                //int merchantId = rp.CheckoutRequest.Cart.CartCards[0].MerchantId;
                bool hasDiscountBeenApplied = rp.CheckoutData.PromotionId != -1;
                //Resume checkout after 3D check
                var resumeCA = new gcp.actions.ResumeCheckoutAction();
                var crs = resumeCA.ResumeCheckout(rp.CheckoutRequest, rp.CheckoutData, response, rp.CheckoutData.User, languageId, merchantId, shippingAddressesToSave, hasDiscountBeenApplied);

                // If successful or transaction held - continue for success.
                if (crs.Status.Success || (crs.Status.Error.ErrorCode == gcp.objects.Error.EC_TR_TRANSHELD))
                {
                    // Get the first card's merchant Id and treat this as the merchant ID for the entire transaction
                    int chainId = Buyatab.Apps.gcp.actions.MerchantAction.ChainId(merchantId);
                    RedirectForSuccess(crs.OrderNumber, chainId, merchantId, crs.Status.Error.ErrorCode);
                    Buyatab.Apps.gcp.actions.LogAction.WriteMessageToLog(Buyatab.Apps.gcp.actions.LogType.ERRORTYPE_WARNING, "3DS Secure success -- " + crs.PaymentAppResponse.ToString() + " --- " + crs.Status.ToString(), crs.PaymentAppResponse.OrderNumber, false);
                    
                }
                else
                {
                    Buyatab.Apps.gcp.actions.LogAction.BWSEarlyReturn_Insert(merchantId, crs.PaymentAppResponse.OrderNumber, crs.Status.Error.ErrorCode, "Failed to complete 3DS secure transaction after authentication pass. Exception: " + crs.PaymentAppResponse.ToString() + " --- " + crs.Status.ToString());

                    RedirectForFailedAuthentication(response, merchantId, crs.Status.Error.ErrorCode);
                }
            }
            else
            {
                Buyatab.Apps.gcp.actions.LogAction.BWSEarlyReturn_Insert(merchantId, response.OrderNumber, (int)response.Status.Code, "Failed to complete 3DS secure transaction. Authentication fail. Exception: " + response.ToString());

                RedirectForFailedAuthentication(response, merchantId, (int)response.Status.Code);
            }

            //TO DO: Redirect user to summary or receipt page.
            //Session["msg"] = String.Format("{0}:{1}, PaymentDecision:{2}, Response:- Authentication Status:{3}, ECI:{4}, Signature Verification Value:{5}", response.Status.Code, response.Status.CodeMessage, response.PaymentDecision, tdsAuthResp.AuthenticateStatus, tdsAuthResp.ECI, tdsAuthResp.SignatureVerificationValue);
        }
        else
        {
            Buyatab.Apps.gcp.actions.LogAction.WriteMessageToLog(Buyatab.Apps.gcp.actions.LogType.ERRORTYPE_ERROR, "Failed to retrieve TDS Info! This could mean a successful enrollment fails to call Authentication. TDSINFOID = " + transInfoId , -1, false);
            RedirectForError(-1);
        }
    }

    private string GenerateJavascriptEventScript(int statusCode)
    {
        var sBuilder = new System.Text.StringBuilder();
        // begin script
        sBuilder.Append("window.parent.postMessage(");
        sBuilder.Append(statusCode);
        // Add domain
        sBuilder.Append(", '");
        sBuilder.Append(Request.Url.Scheme);
        sBuilder.Append("://");
        sBuilder.Append(Request.Url.Authority);
        
        // end script
        sBuilder.Append("');");

        return sBuilder.ToString();
    }

    private void SetResultsScript(string on, int cid, int mid)
    {
        var sBuilder = new System.Text.StringBuilder();
        sBuilder.Append("<script type='text/javascript' >window.results = { 'on': '");
        sBuilder.Append(on);
        sBuilder.Append("', 'cid':");
        sBuilder.Append(cid);
        sBuilder.Append(", 'mid':");
        sBuilder.Append(mid);
        sBuilder.Append("};</script>");

        litResults.Text = sBuilder.ToString();
    }

    private void RedirectForFailedAuthentication(Buyatab.Apps.Payment.TDS.TDSPaymentAppResponse response, int mid, int statusCode)
    {
        SetResultsScript("", -1, mid);

        string script = GenerateJavascriptEventScript(statusCode);

        string key = "eventTrigger";
        // send a message to the parent iFrae via jQuery
        SetJavascriptEvent(script, key, true);
    }

    private void RedirectForSuccess(string on, int cid, int mid, int statusCode)
    {
        SetResultsScript(on, cid, mid);

        string script = GenerateJavascriptEventScript(statusCode);

        string key = "eventTrigger";
        // send a message to the parent iFrae via jQuery
        SetJavascriptEvent(script, key, true);
    }

    private void RedirectForError(int mid)
    {
        SetResultsScript("", -1, mid);

        string script = GenerateJavascriptEventScript(-1);

        string key = "eventTrigger";
        // send a message to the parent iFrae via jQuery
        SetJavascriptEvent(script, key, true);
    }
}