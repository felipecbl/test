using System.Net;
using Buyatab.Apps.GiftCards.ECard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using Buyatab.Apps.GiftCards.Preview;
using gcp.objects;
using System.Text;

public partial class ecard : System.Web.UI.Page
{
    ECardBuilder _previewBuilder;
    gcp.objects.Status _status;
    private int _cardId;
    private List<string> _redirectList;
    private StringBuilder scriptsHolder;

    //private string[] redirectBrowsers = { "msie 8", "msie 7", "msie 6" };

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            _status = new Status();
            // Create holder for all the scripts to be added to the page
            scriptsHolder = new StringBuilder();

            // Step 1: Check url parameters ( ref id & internal call)
            try
            {
                // Get the card ID from the URL and ensure it is in the correct format
                var idParser = new ECardLinkIDParser();
                _cardId = idParser.ParseProductReferenceId();
            }
            catch (Exception)
            {
                _status = new Status(gcp.objects.Error.EC_INVALID_ARGS);
            }
           
            // Get test indicator (If non buyatab user loads the preview page, the email is not triggered but the view is still recorded)
            bool isTestCall = false;
            
            if (Request["view"] != null && _status.Success)
            {
                string isTestString = Request["view"].ToString();
                if (!String.IsNullOrWhiteSpace(isTestString) && isTestString.ToLower().Equals("int"))
                    isTestCall = true;
            }

            // Step 1.5: check if page needs to be redirected
            // Temporary Code: Check for redirect to Old Preview page --- WILL BE REMOVED ONCE EVERYONE IS ON THE NEW ECARD
            if (CheckEcardRedirect() && _status.Success)
            {
                var linkBuilder = new Buyatab.Apps.LinkBuilder.LinkBuilder_Preview(_cardId, isTestCall);
                Response.Redirect(linkBuilder.GetLink());
            }
            
            // Step 2: Get card data
            if(_status.Success){
                //try
                //{
                    // Get the preview data 
                    _previewBuilder = ECardBuilderCreator.CreateByCardId(_cardId, isTestCall);
                //}
                //catch (Exception ex)
                //{
                //    _status = new Status(gcp.objects.Error.EC_GC_REGISTER_CARDNOTFOUND);
                //}
                if (_previewBuilder != null)
                {
                    // check if device is mobile (changed animation type)
                    //overrideAnimationByUserAgent();
                    var jsCreator = new JavaScriptSerializer();
                    string ecardInfo = jsCreator.Serialize(_previewBuilder.ecardData);
                    // naming conventions switch C# coding standards to Javascript coding standards
                    ecardInfo = ecardInfo.Replace("Card", "card");
                    ecardInfo = ecardInfo.Replace("Merchant", "merchant");
                    ecardInfo = ecardInfo.Replace("Options", "options");

                    var str = String.Format(@"<script type='text/javascript' > if(!window.ecard) {{ window.ecard = {{ }}; }} window.ecard.settings = {0}</script> ", ecardInfo);
                    scriptsHolder.Append(str);

                    // get the custom card images and set them in the javascript object
                    setCardImageUrls();
                }
                else
                {
                    // Error unable to get preview information
                    _status = new Status(gcp.objects.Error.EC_GC_CARDNOTFOUND);
                }
            }
            
            // Step 3: Add scripts and ecard data to page
            // add files data to the window.getecard element
            getECardFilePaths();

            // Load the js libraries dynamically
            // RenderJavascript();

            // Check if card uses barcode and load the appropriate js libraries
            // CheckBarcode();

            // pass the status (success/fail) to front end
            setStatus();

            // Last thing to do: add all the scripts in the scriptHolder to the page
            if(scriptsHolder.Length > 0)
                ecard_info.Text = scriptsHolder.ToString();
        }
        
    }


    // add the necessary js libraries to the page
    private void CheckBarcode()
    {
        // check if page is suppoed to have a barcode
        if (_status.Success && _previewBuilder.ecardData.Merchant.barcode)
        {
            // add scripts to literal 
            scriptsHolder.Append(@"<script type='text/javascript' src='view/js/barcode/bwip.js'></script>
	                                <script type='text/javascript' src='view/js/barcode/symdesc.js'></script>
	                                <script type='text/javascript' src='view/js/barcode/needyoffset.js'></script>
	                                <script type='text/javascript' src='view/js/barcode/canvas.js'></script>");
        }

    }

    //private void CompressJavascript()
    //{
    //    SquishIt.Framework.Bundle.JavaScript()
    //        .Add("view/js/jquery-1.10.2.min.js")
    //        .Add("view/js/jquery-ui-1.10.4.min.js")
    //        .Add("view/js/modernizr-2.6.2.min.js")
    //        .Add("view/js/jquery.waitforimages.js")
    //        .Add("view/js/handlebars-v2.0.0.min.js")
    //        .Add("view/js/jquery-ui-1.10.4.min.js")
    //        .Add("view/js/barcode/bwip.js")
    //        .Add("view/js/barcode/symdesc.js")
    //        .Add("view/js/barcode/needyoffset.js")
    //        .Add("view/js/barcode/canvas.js")
    //        .Add("view/js/jquery.ecard.js")
    //        .ForceRelease()
    //        .AsCached("main", "view/js/combined.js");
    //}

    //private void RenderJavascript()
    //{
    //    CompressJavascript();
    //    var text = SquishIt.Framework.Bundle.JavaScript().RenderCached("main");
    //    scripts.Text = String.Format("<script type='text/javascript>{0}</script>", text);
    //}

    private bool CheckEcardRedirect()
    {
        return  CheckChainRedirect() || CheckBrowserRedirect();
    }

    private bool CheckChainRedirect()
    {
        // Test for Redirect: list of chains taken from static cache
        var cardInformationRetriever = new Buyatab.Apps.GiftCards.GiftCardInformationRetriever(_cardId, Buyatab.Apps.Common.ProductTypeCode.E);

        // Get list of chains to redirect from the static cache
        var redirectChainList = Buyatab.Apps.Common.StaticCache.GetECardCache();
        _redirectList = redirectChainList.NotRedirectChains;

        // filter through all chains not to be redirected to see if the chain id is in the "not redirect" list
        if (_redirectList != null && cardInformationRetriever != null)
        {
            int chainId = cardInformationRetriever.GetChainId();
            _redirectList = _redirectList.Where(c => c.Equals(chainId.ToString())).ToList();
        }
        return !(_redirectList == null || _redirectList.Count == 0);
    }

    private bool CheckBrowserRedirect()
    {
        var useragent = Request.UserAgent;
        //return redirectBrowsers.Any(x => useragent.ToLower().Contains(x));
        
        // Get list of chains to redirect from the static cache
        var eCardCache = Buyatab.Apps.Common.StaticCache.GetECardCache();
        _redirectList = eCardCache.BrowserRedirect;

        return _redirectList.Any(x => useragent.ToLower().Contains(x));

        
    }

    private void setCardImageUrls()
    {
        if (_previewBuilder != null)
        {
            string[] imageUrls = _previewBuilder.ecardData.Card.animation.animationImgs;
            scriptsHolder.Append(String.Format(@"<script type='text/javascript' > if(!window.ecard.settings) {{ window.ecard.settings = {{}}; }} window.ecard.settings.files = {{frontOut: '{0}', frontIn: '{1}', backIn: '{2}', backOut: '{3}' }} </script>", imageUrls[0], imageUrls[1], imageUrls[2], imageUrls[3]));
        }
    }

    internal void setStatus()
    {
        // if status object is null, everything was a success
        if (_status == null)
            _status = new Status();
          
        var jsCreator = new JavaScriptSerializer();
        string ecardInfo = jsCreator.Serialize(_status);
        scriptsHolder.Append(String.Format(@"<script type='text/javascript' > if(!window.ecard) {{ window.ecard = {{ settings: {{}} }}; }} window.ecard.settings.status = {0}</script> ", ecardInfo));
        
    }

    // This check has been moved to Buyatab.Apps.GiftCards.Ecard.ECardAnimationData
    //internal string[] getCardImageUrls()
    //{
    //    // data needed: animation type, chain id, image verifier
    //    var chain = _previewBuilder.previewData.Merchant.chainId;
    //    var animation = _previewBuilder.previewData.Card.animation.type;

        //// check for null animation type
        //string animationType =  (!animation.HasValue || animation.Value <= 0)
        //    ?  ""  
        //    : animationType = animation.Value.ToString();
        
    //    // image names
    //    string[] file = { "https://images.buyatab.com/gcp/view/cards/{0}/ecard/animation{1}/front-out.png", "https://images.buyatab.com/gcp/view/cards/{0}/ecard/animation{1}/front-in.png", "https://images.buyatab.com/gcp/view/cards/{0}/ecard/animation{1}/back-out.png", "https://images.buyatab.com/gcp/view/cards/{0}/ecard/animation{1}/back-in.png" };

    //    // only check the front-out if it is custom 

        
        //for (int i = 0; i < file.Length; i++)
        //{
            
        //    string filepath = string.Format(file[i], chain, animationType);
            
    //        if (!gcp.actions.CheckoutAction.UrlExists(filepath, false))
    //        {
    //            filepath = string.Format(file[i], "default", animationType);
    //        }
            
    //        file[i] = filepath;
    //        //try
    //        //{
    //        //    string filepath = rootpath + chain + string.Format(file[i], animationType);

    //        //    // check url, if invalid, will throw an exception
    //        //    var request = WebRequest.Create(filepath);
    //        //    request.GetResponse();

    //        //    file[i] = filepath;
    //        //}
    //        //catch (WebException ex)
    //        //{
    //        //    file[i] = rootpath + "default" + string.Format(file[i], animationType);
    //        //}
    //    }
        
    //    return file;
    //}

    internal void getECardFilePaths()
    {
        
        if (_previewBuilder != null && _status.Success)
        {
            // Need a check here for merchData if it exists
            var merchData = _previewBuilder.ecardData.Merchant;
        
            // get language of merchant
            string lang = merchData.languageType == Buyatab.Apps.Common.Language.French ? "-fr" : "";
            
            // get custom file paths for template, style and language files
            string[] files = { "template/ecard.js", "css/ecard.css", String.Format("data/language/ecard{0}.json", lang) };
            var paths = Buyatab.Apps.Common.FileOperations.GetCustomFilePath(@"view/template", merchData.chainId.ToString(), merchData.merchantId.ToString(), files);

            // add paths to the window.getecard.files object
            scriptsHolder.Append(String.Format(@"<script type='text/javascript' src='{0}'></script>", paths[0]));
            scriptsHolder.Append(String.Format(@"<link rel='stylesheet' type='text/css' href='{0}'>", paths[1]));
            scriptsHolder.Append(String.Format(@"<script type='text/javascript' src='{0}'></script>", paths[2]));

        }
        else
        {
            // set default values
            scriptsHolder.Append(@"<script type='text/javascript' src='view/template/default/template/ecard.js'></script> 
                                                <link rel='stylesheet' type='text/css' href='view/template/default/css/ecard.css'> 
                                                <script type='text/javascript' src='view/template/default/data/language/ecard.json'></script>");
        }
    }

    


}