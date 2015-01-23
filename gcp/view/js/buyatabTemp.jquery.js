/**
 * Buyatab Template jQuery plugin
 *	Author: Felipe Castelo Branco
 *	Version: 2.0b
 *
 */

// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {
	function getHostname(url) {
		var m = url.match(/^http[s]?:\/\/[^/]+/);
		return m ? m[0] : null;
	}

	window.deviceIsMobile = function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true; })(navigator.userAgent||navigator.vendor||window.opera); return check; };

	var Template = {

		// Starts the plugin
		init: function( options, elem ) {
			$(document).trigger('functionIt', 'init');
			var self = this;

			self.startTime = new Date().getTime();

			self.debugMode = false;

			//Backbone
			window.App = {
				Models: {},
				Collections: {},
				Views: {}
			};

			_.templateSettings = {
				evaluate		: /\{\{=(.*?)\}\}/g,
				escape			: /\{\{-(.*?)\}\}/g,
				interpolate		: /\{\{\{(.*?)\}\}\}/g
			};
			//Backbone ends

			var d = new Date();

			self.month = d.getMonth()+1;
			self.day = d.getDate();
			self.year = d.getFullYear();

			self.today =	(self.month < 10 ? '0' : '') + self.month + '/' +
							(self.day < 10 ? '0' : '') + self.day + '/' +
							self.year;

			self.settings = {};

			self.settings.browserIsMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

			// For debugging purposses with Visual Studio include port number in origin - 27/10/2014 - mstrnal
			self.loadingFrom = window.location.origin ? window.location.origin : window.location.protocol + '//' + document.domain;
			self.currentURL = ($('#buyatab_plugin').length > 0) ? getHostname( $('#buyatab_plugin').attr('src') ) : self.loadingFrom;

			self.cart = {};
			self.totalCards = 0;
			self.mailShipping = [];
			self.gettingShipment = false;
			self.total = 0;
			self.ccp = false;

			self.currentPage = 'customize'; //Start with the zero indexed first page
			self.steps = {}; //Set the seps acording to the number of pages
			self.stepWidth = 592; //This is the width of the page with no cart embed
			self.editingCard = false; //Init with no card being edited
			self.cardHeight = 150;
			self.cardWidth = 200;

			self.CartPosition = 0;
			self.top_offset = 0;

			self.messageMax = 200;
			self.lineMax = 5;
			self.justHashed = ''; //prevents double triggering for change hash events
			self.pageReady = false; //prevents any template manipulation before page is ready
			self.enclosureType = 0; //if -1 (no enclosure) sends a empty message

			$.ajaxSetup({ cache: true });

			self.elem = elem;
			self.$elem = $( elem );
			self.$elem.attr('data-currentPage', self.currentPage);

			$(document).find('#buyatabContent').css('visiblity', 'hidden');

			// Overwrite options if passed from the page
			self.options = $.extend( true, $.fn.bTemplate.options, options );

			// Get MerchantId either string or object
			self.MerchantId = (typeof options === 'string' || typeof options === 'number') ? options : options.MerchantId;

			//get shipping and billing from DB (inside options)
			options.userShippingAddresses = options.userShippingAddresses || [];
			options.userBillingInfo = options.userBillingInfo || [];

			// Check if user has stored shipping and billing info
			self.preShipping		= (options.userShippingAddresses.length > 0);
			self.preBilling			= (options.userBillingInfo.length > 0);

			// Check if gcp was loaded from CPanel
			self.loadedFromCPanel   = options.loadedFromCPanel || false;

			// B2B
            self.b2b				= options.b2b || false;
            self.UserId             = options.UserId || null;
            self.PurchaseId         = options.PurchaseId || null;
            self.b2bDiscount		= options.discount || null;

			// Define default file names
            self.CSSFile            = $.fn.bTemplate.options.CSSFile;
            self.iniFile            = $.fn.bTemplate.options.iniFile;
            self.iniAdmin           = $.fn.bTemplate.options.iniAdmin;
            self.iniCPanel          = $.fn.bTemplate.options.iniCPanel;
            self.templateFile       = $.fn.bTemplate.options.templateFile;
            self.mobileTemplate     = $.fn.bTemplate.options.mobileTemplate;
            self.underFile          = $.fn.bTemplate.options.underFile;
            self.languageFile       = $.fn.bTemplate.options.languageFile;

            self.url                = self.currentURL + "/gcp/services/BuyatabWS.asmx/GetCards";

            self.generaIt();

			$(document).on('stepped', function( element, param ){
				if(param){
					self.getStep( param );
				}
			});

			$(window).on('load', function(){
				var page = document.location.hash.substring(1);

				if(!page){
					self.justHashed = 'customize';
					document.location.hash = 'customize';
				}
			});

			//Resize mesurements for mobile
			self.lastSize = $(window).outerWidth(true);
			$(window).on('resize ready', function() {
				if($(window).outerWidth(true) != self.lastSize && self.IsMobile){
				// alert(self.lastSize + ' on window ready')
					var page = document.location.hash.substring(1);
					self.resizing = true;
					self.mobileIt();
					self.moveDelivery( $('ul#delivery-type li.dt-active').data('delivery'));
					self.moveIt( [page] );
					self.resizing = false;
					self.lastSize = $(window).outerWidth(true);
				}
			});

			$(document).on('ready', function(){
				self.deviceIsMobile = deviceIsMobile();
				self.mobileIt();
			});

			/**
			* Move page on hashchange event
			*/
			$(window).on('hashchange', function( event ){
				if(self.pageReady){
					var page = document.location.hash.substring(1);

					if (self.justHashed !== page){
						self.moveIt( [page] );
						console.log('page from hashchange: ' + ' #' + page );
					}
				}
			});

			/*Debug Mode event*/
			$(document).on('functionIt', function( event, data ){
				if(self.debugMode){
					if(typeof(data) == 'object'){
						console.log(data);
					}else{
						var nowTime = new Date().getTime() - self.startTime;

						console.log( '[debugMode: function executed => ' + data + ']: ' + nowTime);
						self.startTime = new Date().getTime();
					}
				}
			});

			/*Update the cart position when embed and floated*/
			//inside an iFrame with same domain
			try {
				if( $(elem).parents('iframe').length === 0 && window.parent != window){
					$(window.parent).scroll(function(){
						if(typeof self.settings !== 'undefined' && self.settings.Merchant.FC){
							var myScroll = (window.parent.window.iframeScrollOffset) ? $(window.parent).scrollTop() - window.parent.window.iframeScrollOffset : $(window.parent).scrollTop();

							self.updateFloatingCart(myScroll);
						}
					});
				}
			} catch (err) {
				console.info('Developer message: Not loading from same domain. Function designed to work on pages hosted at buyatab.com.Please ignore warning => ' + err);
			}

			//Stand... alone in the dark!
			$(window).scroll(function(){
				if(typeof self.settings.Merchant !== 'undefined'){
					if(self.settings.Merchant.FC){
						self.updateFloatingCart($(window).scrollTop());
					}
				}
			});

			self.updateHeight();
		},

		// Call all the necessary functions and execute when it returns all the results
		generaIt: function(){
			$(document).trigger('functionIt', 'generaIt');
			var self = this;

			self.$elem.hide();

			/* Execute all the ajax calls and wait for answer*/
			$.when( self.getOptions() ).then( function( rOpt ) {

				self.settings = rOpt.d;

				// Define paths
				self.chainId			= self.settings.Merchant.ChainId;
				self.defaultPath        = '/gcp/view/template/default/';
				self.chainPath			= '/gcp/view/template/' + self.chainId + '/';
				self.customPath         = self.chainPath + self.MerchantId + '/';

				self.IsMobile = self.deviceIsMobile ? true : self.settings.Merchant.IsMobile;
				self.MaxCards = self.settings.Merchant.MaxCards || 30;

				//no cart embeded for mobile
				//**************comment this line to add embedded cart to mobile**************
				self.settings.Merchant.EC  = self.IsMobile ? false : self.settings.Merchant.EC;
				//Disable floating cart for mobile
				self.settings.Merchant.FC  = self.IsMobile ? false : self.settings.Merchant.EC;
				//Split fields into pages for mobile
				self.settings.Merchant.SFP = self.IsMobile ? true : self.settings.Merchant.SFP;

				self.today	= self.settings.ServerTime.slice(0, 10);
				self.day	= self.settings.ServerTime.slice(0, 10).split('/')[0];
				self.month	= self.settings.ServerTime.slice(0, 10).split('/')[1];
				self.year	= self.settings.ServerTime.slice(0, 10).split('/')[2];

				self.formatedDate = self.year + '-' + self.month + '-' + self.day;
				self.iFormatedDate = self.day + '-' + self.month + '-' + self.year;

				self.languageFile = 'data/language/' + self.settings.Merchant.Language + '.json';

				self.cardsPath		= 'https://' + self.settings.ImageServerUrl + '/gcp/view/';

				$.when(  self.getAllFiles() ).then(function(){
					$.when(  self.getIni() ).then( function( iniOpt ){

						$('img#verisign1').hide();

						//Merge ini options with self object
						$.extend(true, self, iniOpt.options);

							$(document).trigger('functionIt', self.settings);
							$(document).trigger('functionIt', 'generaIt');

						if(self.settings.Status.Success){
							$.when( self.getTemplate() ).then(function( rTemplt ){
								// Append the CSSFile.
								$.when( self.getUnder(), self.appendStyle( self.availableFiles.css ), self.getLanguage() ).then(function(rUnder, appStyle, rLang ){

									self.cTemplate = Handlebars.compile( rTemplt )( self.Language );
									self.uTemplate = rUnder[0];

									document.title = self.Language.title + self.settings.Merchant.Name;

									$(window).trigger('anaLog', '[GCP] Merchant page: ' + document.title);

									// Call all the Style manipulation functions
									$.when( self.styleTheme( self.settings.Style.PresetId ),
										self.styleDelivery(),
										self.styleSize( self.settings.Style.Size ),
										self.styleMob( self.IsMobile ),
										self.styleFont( self.settings.Style.FontFamily ),
										self.stylePreview( self.settings.Merchant.PreviewType ),
										self.styleLang( self.settings.Merchant.Language ),
										self.stylePhoto(),
										self.styleBrowser()

										).then(function(){
											$.when(
												self.defineConsole(),
												self.embedCart(),
												self.stepify(),
												self.setSteps(),
												self.splitGroups(),
												self.generateHeader(),
												self.generateImgSelector(),
												self.generatePhotoCard(),
												self.getEnclosures(),
												self.handleEnclosure(),
												self.generateSummary(),
												self.optIn(),
												self.preSelectCard(),
												self.deliverIt(),
												self.setDatePicker(),
												self.getCC(),
												self.setExpDatePicker(),
												self.setCartArrows(),
												self.setButtons(),
												self.getValues(),
												self.forceLigtBox(),
												self.checkAdditionalCharges(),
												self.getContact(),
												self.getQuantity(),
												self.handlePurchaseType(self.PurchaseId),
												self.setQuantity(),
												self.quantityPerCard(),
												// self.wrapSelectors(),
												self.getState( 'plastic_country', 'plastic_state', 'plastic_zip' ),
												self.getState( 'cc_country', 'cc_state', 'cc_zip' ),
												self.getMailShipping(),
												self.getPreShipping(),
												self.getPreBilling(),
												self.getCountry(),
												self.optizeIt(),
												self.charCount(),
												self.numbersOnly(),
												self.receiveCrossDomain(),
												self.singleValidation(),
												self.photoOnly(),
												self.analytics(),
												self.checkPOBox(),
												self.phoneOnly()).done(function() {
													$.when(self.appendTemplate()).done(function(){
														//remove loader
														$('#page_loader').remove();

														// Show again
														console.info('>>>>>>>>>>>>>>>>Appending HTML<<<<<<<<<<<<<<<<');
														self.$elem.fadeIn('fast');

														self.getDataSrc();

														// Make it ready for hashchanges
														self.pageReady = true;
														self.manipulateCart();
														if(self.intro){
															self.animateIntro();
														}

														self.mobileIt();
														self.autoComplete();

														$('input#cc_number').on('paste', function(){
															self.ccp = true;
														});

														if(self.debugMode){
															self.fillCheckout();
														}

														self.moveIt( ['customize'] );
														self.moveDelivery( 0 );
														self.uploadPhoto();
														// self.addSeal();
														self.addScript();
													});
												});
											});
								});

							});

						} else {
							if(self.settings.Status.Error.ErrorCode == 201 || self.settings.Status.Error.ErrorCode == 202){
								// self.$elem.html('<div id="noscript"> <p>' + self.Language.errors.inactive +'</p> </div>');
								self.$elem.html("<div id='inactive'><div id=\"noscript\"><span id=\"logo\"> <a href=\"https://www.buyatab.com\"></a> </span> <p>Our apologies, this gift card application is no longer available for this merchant. The merchant will need to contact their Buyatab representative to reactivate. To purchase Gift cards for our other merchants please visit us at: <p><a href='https://www.buyatab.com'>www.buyatab.com</a></p></p> </div></div>").show();
							}
							else{
								alert('Error ' + self.settings.Status.Error.ErrorCode + ': ' + self.settings.Status.Error.Message);
							}
						}
					});
				});
			});
		},

		// Check if file exists using server
		getFilePath: function( files ){
			$(document).trigger('functionIt', 'getFilePath');
			var self = this,
			dataToSend = {
				filenames: files,
				chainId: self.chainId,
				merchantId: self.MerchantId
			};

			return $.ajax({
				type: "POST",
				url: self.currentURL + "/gcp/services/BuyatabWS.asmx/GetFilePath",
				data: JSON.stringify(dataToSend),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false
			});
		},

		// Check if file exists using server
		checkGostFile: function( file ){
			$(document).trigger('functionIt', 'checkGostFile');
			var self = this;

			return $.ajax({
				type: "POST",
                url: self.currentURL + "/gcp/services/BuyatabWS.asmx/FileExists",
                data: "{filename:'" + file + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
				async: false,
				timeout: 5000
            });
		},

		// Access the API
		getOptions: function(){
			$(document).trigger('functionIt', 'getOptions');
			var self = this,
				dataToSend = {};

			dataToSend.MerchantId = self.MerchantId;

			return $.ajax({
				type: "POST",
                url: self.url,
                data: "{gcr:" + JSON.stringify(dataToSend) + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json"
			});
		},

		// Generates cart
		generateCheckout: function(){
			$(document).trigger('functionIt', 'generateCheckout');

			var self = this,
				preDate = $('select#cc_exp_month').val() + '/' + $('select#cc_exp_year').val(),
				eDate = (self.IsMobile) ? self.convertDate($('input#cc_expiration').val()) : preDate,
				optIn = (self.settings.Merchant.OptIn) ? $('input#opt-in').is(':checked') : false,
				uBilling = ($('select#user-billing').length === 0 || $('select#user-billing').val() == -1) ? '' : $('select#user-billing').val(),
				saveIt = ( $('#save-billing').length > 0 ) ? $('#save-billing').is(':checked') : false,
				checkoutData = {
					crq: {
						Cart: {
							CartCards: []
						},
						Payment: {
							UserBillingInfoId: uBilling,
							CCType: $('input#cc_type').val(),
							CCNum: $('input#cc_number').val(),
							NameOnCard: $('input#cc_name').val(),
							ExpDate: eDate,
							CVD: $('input#cc_cvd').val(),

							Address1: $('input#cc_address').val(),
							Address2: $('input#cc_address2').val(),
							City: $('input#cc_city').val(),
							Country: $('select#cc_country').val(),
							RegionId: ($('#cc_state').is('select')) ? $('#cc_state').val() : -1,
							Region: ($('#cc_state').find(":selected").text() !== '') ? $('#cc_state').find(":selected").text() : $('#cc_state').val(),
							PostalZip: $.trim($('input#cc_zip').val()),

							Telephone: $.trim($('input#cc_phone').val()),
							Email: $.trim($('input#cc_email').val()),
							AddCharge: self.totalAdditionalCharge || 0,
							AddChargeType: self.settings.Merchant.AddChargeType || 0,
							SavePayment: saveIt

						},
						RA: {
							CP: self.ccp,
							UA: window.navigator.userAgent,
							TD: (getParam('td') == 'null')? false : true
						},
						OptIn: optIn,
						Language: self.settings.Merchant.Language,
                        PurchaseType: self.PurchaseId,
                        DeliverCards: true
					}
				};

				if(self.b2b){
					checkoutData.crq.B2BPurchase = {
						UserId: self.UserId,
						ApplyDiscount: (self.b2bDiscount.value !== 0),
						DiscountAmount: self.b2bDiscount.value,
						DiscountType: self.b2bDiscount.type,
						LoggedInUserId: self.options.uide || 0
					};
				}

			checkoutData.crq.Cart.CartCards = self.cart;

			return checkoutData;
		},

		// Access the API for checkout
		sendCheckout: function(){
			$(document).trigger('functionIt', 'sendCheckout');
			var self = this,
				dataToSend = self.generateCheckout();

			var jLoader = $('<span />', {
				html: self.Language.dialogs.processing
			}).addClass('ajax-loader');

			$('a.purchase').parent()
								.find('.group-error')
								.html(jLoader);

			dataToSend = JSON.stringify(dataToSend);

			$.ajax({
				type: "POST",
				url: self.currentURL + "/gcp/services/BuyatabWS.asmx/Checkout",
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function( data ){
					console.log(data.d);

					// 3DS required
					if(data.d.PaymentAppResponse.PaymentDecision == 6){
						var tdsResponse = data.d.PaymentAppResponse;

						// window.location.href = "receipt.html?on=" + data.d.OrderNumber + '&cid=' + self.chainId + '&analytics=true';
						window.location.href = "3DSCheckout.aspx?md=" + tdsResponse.TDSTransactionInfoId;
						// $.post('3DSCheckout.aspx', {TermUrl: self.currentURL + '/ResumeCheckout.aspx', PaReq: tdsResponse.TDSEnrollmentResponse.PaymentRequest, MD: tdsResponse.TDSTransactionInfoId});

					}else{
						if(data.d.Status.Success || data.d.Status.Error.ErrorCode == 404){

							$('.group-error').removeClass('error-in');
							try {
								localStorage.removeItem( 'cart' + getParam( 'id' ) );
							} catch (err) {
								if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
							}

							$(window).trigger('anaLog', '[GCP] checkoutSuccess');

							//Display details of the the checkout for analytics purpose
							$(window).trigger('analyticsDetails', $.extend(true, {}, $.parseJSON(dataToSend), data.d, {Merchant: {Name: self.settings.Merchant.Name + ' [' + self.settings.Merchant.ChainId + ']'}}) );

							if (!self.b2b && (!self.purchaseId || self.PurchaseId === 0)) {
								if (self.loadedFromCPanel) {
									self.$elem.bReceipt({ orderNumber: data.d.OrderNumber, MerchantId: self.MerchantId, chainId: self.chainId });
								}
								else {
									window.location.href = "confirm.aspx?on=" + data.d.OrderNumber + '&cid=' + self.chainId + '&analytics=true';
								}
							} else {
								if(self.b2b){
									self.$elem.bReceipt( {orderNumber: data.d.OrderNumber, MerchantId: self.MerchantId, chainId: self.chainId } );
								}else{
									window.location.href = "receipt.html?on=" + data.d.OrderNumber + '&cid=' + self.chainId + '&analytics=true';
								}
							}
						} else {
							var eCode = data.d.Status.Error.ErrorCode;

							if(self.b2b && self.PurchaseId == 7){
								// acctions for b2b error
								var gError = $('#summary-window .group-error')
										.addClass('error-in')
										.html(data.d.Status.Error.Message + ' Issue #: ' + data.d.Status.Error.ErrorCode);
							}

							if (eCode == 14  ||
								//eCode == 444 ||
								eCode == 500 ||
								eCode == 501 ||
								eCode == 510 ||
								eCode == 520 ||
								eCode == 521 ||
								eCode == 530 ||
								eCode == 531 ||
								eCode == 540 ||
								eCode == 541 ||
								eCode == 550 ||
								eCode == 600 ||
								eCode == 601 ||
								eCode == 610 ||
								eCode == 611 ||
								eCode == 612 ||
								eCode == 613) {

								$('a.purchase').parent() //don't remove the inactive class
									.find('.group-error')
									.html(self.Language.dialogs.exception_error + ' Issue #: ' + data.d.Status.Error.ErrorCode);
								$(window).trigger('anaLog', '[GCP] checkoutExceptionError');
							} else {
								$('a.purchase').removeClass('dt-inactive')
									.parent()
									.find('.group-error')
									.addClass('error-in')
									.html( data.d.Status.Error.Message + ' Issue #: ' + data.d.Status.Error.ErrorCode);
								$(window).trigger('anaLog', '[GCP] checkoutError');
								console.log(data.d.Status.Error.Message);
							}
						}
					}
				},
				error: function(e) {
					console.log(e);
					$('a.purchase').parent()
						.find('.group-error')
						.addClass('error-in')
						.html(e.statusText + ': ' + self.Language.dialogs.checkout_error);
						// .html('Error ' + data.d.Status.Error.ErrorCode + ': ' +self.Language.dialogs.checkout_error);
						$(window).trigger('anaLog', '[GCP] checkoutError');
				}
			});
		},

		// check eligibility for disount and return value
		getDiscount: function( amount ){
			$(document).trigger('functionIt', 'getDiscount');
			var self = this;

			return $.ajax({
				type: 'POST',
				url: self.currentURL + '/gcp/services/BuyatabWS.asmx/GetDiscount',
				data: '{merchantId:' + self.MerchantId + ', total:' + amount + '}',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
		},

		// Access the API for checkout
		getShipment: function() {
			$(document).trigger('functionIt', 'getShipment');
			var self = this,
				dataToSend = {
					address: {
						RecipientName: $('input#plastic_recipient_name').val(),
						Phone: $('input#plastic_recipient_phone').val(),
						CountryId: $('select#plastic_country').val(),
						RegionId: ($('#plastic_state').is('select')) ? $('#plastic_state').val() : -1,
						// RegionId: ($('#plastic_state').val() != 0) ? $('#plastic_state').val() : 8453,
						PostalZip: $('input#plastic_zip').val(),
						Address1: $('input#plastic_address').val(),
						Address2: $('input#plastic_address2').val(),
						City: $('input#plastic_city').val()
					},
					merchantId: self.MerchantId,
					numberOfEnvelopes: 1,
					numberOfGiftboxes: 0,
					extra: 4568162
				};

			var jLoader = $('<span />', {
				html: self.Language.dialogs.processing
			}).addClass('ajax-loader'),
				sObject = $('<div />').addClass('shipping-options field');

			$('a.get-shipment').parent()
				.find('.group-error')
				.html(jLoader);

			dataToSend = JSON.stringify(dataToSend);

			$.ajax({
				type: "POST",
				url: self.currentURL + "/gcp/services/BuyatabWS.asmx/GetShippingRates",
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data) {
					if(data.d[0].Type == 'Undefined'){
						jLoader.hide();
						$('a.get-shipment').siblings('.group-error').html('Error: Please review address.');
					}else{
						$.each(data.d, function(i, e) {

						var value = (self.settings.Merchant.Language == 'fr') ? self.getMoney(e.Cost.toFixed(2)).replace('.', ',') : self.getMoney(e.Cost.toFixed(2));
							myObj = $('<div />', {
								html: '<input name="sOpt" class="check" type="radio" id="opt' + i + '" value="{|Cost|: |' + e.Cost + '|, |Type|: |' + e.Type + '|}" alt="' + self.Language.dialogs.shipping_option + '">' +
								// '" value="' + JSON.stringify(e) + '">'+
								'<label for="opt' + i + '">' + e.Type + ' ' + value + '</label>'
							}).addClass('shipping-option');
							sObject.append(myObj);
						});

						sObject.append('<div class="field-error"></div>');
						sObject.prependTo('div#shipping-options');
						sObject.before('<h2>' + self.Language.dialogs.shipping_options + '</h2>');

						jLoader.hide();
						$('a.get-shipment').parents('div.pages-nav').hide();
						$('a.add-to-cart').parents('div.pages-nav').show();

						if(self.editingMode){
							$('.update-cart').show();
						}else{
							$('.update-cart').hide();
						}
						// resizes the div
						// self.mailShipping.push(data.d);
						self.gettingShipment = true;
						self.moveDelivery('plastic');
					}
				},
				error: function(e) {
					console.log(e);
					$('a.purchase').parent()
						.find('.group-error')
						.html(self.Language.dialogs.checkout_error);
				}
			});
		},

		//check the url for all the files
		getAllFiles: function(){
			$(document).trigger('functionIt', 'getAllFiles');
			var self = this,
				cssFile = self.CSSFile,
				iniFile = '',
				templateFile = (self.IsMobile) ? self.mobileTemplate : self.templateFile,
				languageFile = self.languageFile,
				underFile = (self.settings.Merchant.Language == 'fr') ? 'template/card-fr.handlebars' : self.underFile;

			if(self.loadedFromCPanel){
				iniFile = self.iniCPanel;
			}else if(self.b2b){
				iniFile = self.iniAdmin;
			}else{
				iniFile = self.iniFile;
			}

			var allFiles = [cssFile, iniFile, templateFile, languageFile, underFile];

			$.when( self.getFilePath(allFiles) ).then(function( allFiles ){

				allFiles = allFiles.d;

				self.availableFiles = {
					css: allFiles[0],
					ini: allFiles[1],
					template: allFiles[2],
					language: allFiles[3],
					underscore: allFiles[4]
				};
			});
		},

		// Load the template file
		getTemplate: function(){
			$(document).trigger('functionIt', 'getTemplate');
			var self = this;

			return $.ajax({
				// url: self.currentURL +  self.checkFile( file, 'script' ),
				url: self.currentURL + self.availableFiles.template,
				dataType: "html"
			});
		},

		// Load Underscore template
		getUnder: function(){
			$(document).trigger('functionIt', 'getUnder');
			var self = this;

			return $.ajax({
				url: self.currentURL + self.availableFiles.underscore,
				dataType: "html"
			});
		},

		// get available language files and merge them
		getLanguage: function(){
			$(document).trigger('functionIt', 'getLanguage');
			var self = this,
				language = {},
				deferred = $.Deferred(),
				customLanguage = {};

			$.when(self.getDefaultLanguage()).then(function(dLang){

				if(self.defaultPath + self.languageFile !== self.availableFiles.language){
					$.when(self.customLanguage()).then(function(cLang, textStatus, jqXHR){
						customLanguage = cLang;
					});
				}
				self.Language = $.extend(true, {}, dLang, customLanguage);
				deferred.resolve();
			});
			return deferred.promise();
		},

		// Load the language file
		getDefaultLanguage: function(){
			$(document).trigger('functionIt', 'getDefaultLanguage');
			var self = this;

			return $.ajax({
				url: self.currentURL + self.defaultPath + self.languageFile,
				dataType: 'json'
			});
		},

		// Load the custom language file
		customLanguage: function(){
			$(document).trigger('functionIt', 'customLanguage');
			var self = this;
			return $.ajax({
				// url: self.currentURL + self.checkFile( self.languageFile, 'json' ),
				url: self.currentURL + self.availableFiles.language,
				dataType: 'json',
				async: false
			});
		},

		// Load CSS file
		// getStyle: function(){
		// $(document).trigger('functionIt', 'getStyle');
		// var self = this;

		// return self.currentURL + self.checkFile( self.CSSFile, 'text/css' );
		// },

		// Load options from ini.json
		getIni: function(){
			$(document).trigger('functionIt', 'getIni');
			var self = this;

			return $.ajax({
				url: self.currentURL + self.availableFiles.ini,
				dataType: "json"
			});
		},

		// Apend CSSFile to the head
		appendStyle: function( CSSFile ){
			$(document).trigger('functionIt', 'appendStyle');
			var self = this,
				deferred = $.Deferred();

			if( CSSFile != $('#default-style').attr('href') && !self.b2b && !self.loadedFromCPanel){
				$.ajax({
					url: CSSFile,
					async: false, //don't load the page until css is cached!
					timeout: 5000
				}).done(function(){
					$('#default-style').attr('href', CSSFile);
					self.waitLoad([CSSFile], function(){
						deferred.resolve();
					});
				});
				return deferred.promise();
			}
		},

		// Add delivery type as classes to the main element
		styleDelivery: function(){
			$(document).trigger('functionIt', 'styleDelivery');
			var self = this,
				merchantSettings = self.settings.Merchant,
				classes = '';

			if(merchantSettings.EC)						{classes += ' sd-embedded-cart';} else{classes += ' sd-no-embedded-cart';}
			if(merchantSettings.FC)						{classes += ' sd-floating-cart';} else{classes += ' sd-no-floating-cart';}
			if(merchantSettings.IsPlastic)				{classes += ' sd-plastic';} else{classes += ' sd-no-plastic';}
			if(merchantSettings.HasCustom)				{classes += ' sd-photo';} else{classes += ' sd-no-photo';}
			if(merchantSettings.PhotoCard.photoOnly)	{classes += ' sd-photo-only';} else{classes += ' sd-no-photo-only';}
			if(merchantSettings.IsElectronic){
				classes += ' sd-electronic';
				if(merchantSettings.SMS){classes += ' sd-sms';} else{classes += ' sd-no-sms';}
			}else{classes += ' sd-no-electronic';}

			self.$elem.addClass( classes );
		},

		// Set the style id to the element class (i.e. theme-1)
		styleTheme: function( themeID ){
			$(document).trigger('functionIt', 'styleTheme');
			var self = this,
				theme = 'theme-' + themeID;

			self.$elem.addClass( theme.toLowerCase() );
		},

		// Set The size of the theme to the element class (large, medium, small)
		styleSize: function( themeSize ){
			$(document).trigger('functionIt', 'styleSize');
			var self = this;
			self.$elem.addClass( 'size-' + themeSize );
		},

		// Set  mobile class
		styleMob: function( mobile ){
			$(document).trigger('functionIt', 'styleMob');
			var self = this;
			if(mobile){
				self.$elem.addClass( 'ui-mobile' );
				// $('head').prepend('<meta name="viewport" content="width=device-width">');
				$('head').prepend('<meta name="format-detection" content="telephone=yes">');
				$('head').prepend('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
			}
		},

		// Set The font family of the theme to the element class. Must be pre-defined (i.e. arial)
		styleFont: function( themeFont ){
			$(document).trigger('functionIt', 'styleFont');
			var self = this,
				font = ( ( themeFont === '' )? 'arial' : themeFont ) + '-font';
			self.$elem.addClass( font.toLowerCase() );
		},

		// Set preview style
		stylePreview: function( previewStyle ){
			$(document).trigger('functionIt', 'stylePreview');
			var self = this,
				pStyle = 'previewStyle-' + ( ( previewStyle === '' )? '0' : previewStyle );
			self.$elem.addClass( pStyle.toLowerCase() );
		},

		// Set the Language
		styleLang: function( themeLang ){
			$(document).trigger('functionIt', 'styleLang');
			var self = this,
				lang = 'lang-' + themeLang;
			self.$elem.addClass( lang.toLowerCase() );
		},

		// Set photo style
		stylePhoto: function(){
			$(document).trigger('functionIt', 'stylePhoto');
			var self = this;

			if( self.photoEnabled() ){
				self.$elem.addClass( 'photo-card' );
			}
		},

		// Add extra classs to the main element if IE
		styleBrowser: function(){
			$(document).trigger('functionIt', 'styleBrowser');
			var self = this;

			if (navigator.appName == 'Microsoft Internet Explorer'){
			// if ( $.browser.msie ){
				self.$elem.addClass( 'bad-browser' );
				self.badBrowser = true;
			}
		},

		// Get heith of a element
		getHeight: function( e ){
			// $(document).trigger('functionIt', 'getHeight');
			return $(document).find(e).outerHeight();
		},

		// Move pages * @param page => Array > [Page, Sub-page] * @param changeHeigtht => when false doesn't resize the page
		moveIt: function( page ){
			$(document).trigger('functionIt', 'moveIt');

			if(page != 'undefined' && page !== ''){
				var self = this,
					myTemplt = $( self.cTemplate ),
					steps = self.steps,
					pages = myTemplt.find('ul#pages'),
					lis = pages.children('li'),
					subPage = $(lis[ steps[ page[0] ][0] ]).find('ul.fields'),
					subLis = $(subPage).children('li');

				if(self.settings.Merchant.SFP){
					if(self.badBrowser){

						$(lis).animate({left: -999}, 'fast', 'linear', function(){
							$(this).css({left: 0});
						}).hide();

						$(subLis).animate({left: -999}, 'fast', 'linear', function(){
							$(this).css({left: 0});
						}).hide();
					}else{
						$(lis).hide();
						$(subLis).hide();
					}
					$(lis[ steps[ page[0] ][0] ]).fadeIn('slow');
					$(subLis[ steps[ page[0] ][1] ]).fadeIn('slow');

				}else{ //not sub-pages

					if(self.badBrowser){
						$(lis).animate({left: -999}, 'fast', 'linear', function(){
							$(this).css({left: 0});
						}).hide();
					}else{
						$(lis).hide();
					}
					$(lis[ steps[ page[0] ][0] ]).fadeIn('slow');

				}

				if(!self.resizing){
					$('html, body').animate({ scrollTop: 0 }, "fast");
					self.sendCrossDomain({ type: 'scroll', value: 0 });
				}

				self.hideNotification(page);

				$(document).trigger('stepped', page);
			}
		},

		// Initialize Card Customization
		cardInit: function(){
			$(document).trigger('functionIt', 'cardInit');
			var self = this,
				myTemplt = $( self.cTemplate ),
				header = myTemplt.find('ul#status-bar'),
				pages = myTemplt.find('ul#pages'),
				output = self.today,
				cards = self.settings.Cards,
				// path = '/gcp/view/template/' + self.MerchantId + '/cards/medium/', <*>
				// path = self.cardsPath,// + '/medium/',
				myImg = cards[0].ImageName,

				button_yes = self.Language.dialogs.yes,
				button_no = self.Language.dialogs.no,
				dialog_buttons = {};

				dialog_buttons[button_yes] = function(){
					doIt();
					self.editingCard = false;
					$( this ).dialog( "close" );
				},
				dialog_buttons[button_no] = function(){
					$( this ).dialog( "close" );
				};

			function doIt(){
			$(document).trigger('functionIt', 'cardInit > doIt');

				$('li#customize input[type!="hidden"], li#customize textarea').val(''); //reset all fields and then...

				//Images
				$('div.choose-card').css( 'background', 'url("' + myImg.replace('big', 'medium') + '" )' );
				$('img#preview-image').attr('src', /*self.currentURL +*/ myImg.replace('medium', 'big') );
				$('input#card_design').val(cards[0].StyleId);
				$('input#card_src').val( myImg );

				//Special fields
				$('input#card_value').val(self.settings.Amount.InitialAmount);
				// $('input#email_delivery_date').val(output);
				$('input#email_delivery_date').datepicker("setDate", self.iFormatedDate);
				$('input#sms_delivery_date').datepicker("setDate", self.iFormatedDate);
				$('input#delivery_type').val('email');
				$('input#card_quantity').val(1);
				$('span#pw-value').html( self.getMoney(self.settings.Amount.InitialAmount) );
				$('span#pw-message').html('');
				self.checkQuantity();

				$('html, body').animate({ scrollTop: 0 }, "fast");
				if(!self.settings.Merchant.EC){
					self.moveIt( ['editcart'] );
				}

				if(self.settings.Merchant.EC && self.settings.Merchant.SFP){
					self.moveIt( ['customize'] );
				}

				if (self.settings.Merchant.IsPlastic) {
					$('div#shipping-options').html('');
					self.gettingShipment = false;
				}

				self.moveDelivery(0);

				try{
					if(self.settings.Merchant.PhotoCard.PhotoOnly){
						//reset photo
						$('[data-action=reset]').click();
					}else{
						//move design type selector (if exists)
						$('ul#custom-type > li')[0].click();
					}

					if(self.hasEnclosure){
						$("select#enclosure").val($("select#enclosure option:first").val());
					}


				}catch(e){
					console.log(e);
				}

				//Buttons
				$('a.add-to-cart').show();
				$('a.update-cart').hide();
			}

			// Check for any card being edited
			if(!self.editingCard){
				doIt();
			}else{
				$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
					$( '<div></div>' )
						.html(self.Language.dialogs.editing_card)
						.dialog({
							position: [self.$elem.width() / 2 - (this.width / 2), 200],
							resizable: false,
							// height:140,
							modal: true,
							buttons: dialog_buttons
					});
				});
			}
		},

		// Prepare the page according to the step passed @param page => Array > [Page, Sub-page]
		getStep: function( pageAndSub ){
			$(document).trigger('functionIt', 'getStep');
			var self = this,
				myTemplt = $( self.cTemplate ),
				header = myTemplt.find('ul#status-bar'),
				pages = myTemplt.find('ul#pages'),
				lis = pages.children('li'),
				steps = self.steps,
				gPage = 0,
				page = steps[ pageAndSub ];

				self.justHashed = pageAndSub;
				document.location.hash = pageAndSub;

			self.hideIt();
			if( self.settings.Merchant){
				if (self.settings.Merchant.EC){

					if(self.settings.Merchant.SFP){//5 pages
						gPage = (self.minCustomize) ? 1 : 2;
						switch( page[0] ){
							case 0:
								// myTemplt.find('.checkout').show();
								switch( page[1] ){
									case 0:
										self.logDebug('customize');
										self.currentPage = 'customize';
										self.updateHeader(0);
										self.showIt();
										break;
									case 1:
										self.logDebug('delivery');
										self.currentPage = 'delivery';
										var myN = (self.minCustomize) ? 0 : 1;
										self.updateHeader(myN);
										break;
									default:
										self.logDebug('default');
								}
								break;
							case 1:
								myTemplt.find('.checkout').hide();
								switch( page[1] ){
									case 0:
										self.logDebug('checkoutpage');
										self.currentPage = 'checkoutpage';
										self.updateHeader(gPage);
										break;
									case 1:
										self.logDebug('billing');
										self.currentPage = 'billing';
										self.updateHeader((self.minCheckout) ? gPage : gPage + 1);
										break;
									case 2:
										self.logDebug('purchaser');
										self.currentPage = 'purchaser';
										self.updateHeader((self.minCheckout) ? gPage : gPage + 2);
										break;
									default:
										self.logDebug('default');
								}
								break;
							default:
								self.logDebug('default');
						}

					}else{ //2 pages
						switch( page[0] ){
							case 0:
								// self.cardInit();
								myTemplt.find('.checkout').hide();
								self.logDebug('customize');
								self.currentPage = 'customize';
								self.updateHeader(0);
								self.showIt();
								break;
							case 1:
								myTemplt.find('.checkout').hide();
								self.updateHeader(1);
								self.logDebug('checkoutpage');
								self.currentPage = 'checkoutpage';
								break;
							default:
								self.logDebug('GS: default ' + page);
						}
					}
				}else{
					if(self.settings.Merchant.SFP){//6 pages
						gPage = (self.minCustomize) ?  2 : 3;
						switch( page[0] ){
							case 0:
								switch( page[1] ){
									case 0:
										self.logDebug('customize');
										self.currentPage = 'customize';
										// self.cardInit();
										self.updateHeader(0);
										self.showIt();
										break;
									case 1:
										self.logDebug('delivery');
										self.currentPage = 'delivery';
										self.updateHeader( (self.minCustomize) ? 0 : 1 );
										break;
									default:
										self.logDebug('default');
								}
								break;
							case 1:
								self.logDebug('editcart');
								self.currentPage = 'editcart';
										self.updateHeader( (self.minCustomize) ? 1 : 2 );
								break;
							case 2:
								switch( page[1] ){

									case 0:
										self.logDebug('checkoutpage');
										self.currentPage = 'checkoutpage';
										self.updateHeader(gPage);
										break;
									case 1:
										self.logDebug('billing');
										self.currentPage = 'billing';
										self.updateHeader( (self.minCheckout) ? gPage : gPage + 1 );
										break;
									case 2:
										self.logDebug('purchaser');
										self.currentPage = 'purchaser';
										self.updateHeader( (self.minCheckout) ? gPage : gPage + 2 );
										break;
									default:
										self.logDebug('default');
								}
								break;
							default:
								self.logDebug('default');
						}

					}else{//3 pages
						switch( page[0] ){
							case 0:
								// self.cardInit();
								self.updateHeader(0);
								self.showIt();
								break;
							case 1:
								self.logDebug('editCart');
								self.updateHeader(1);
								break;
							case 2:
								self.logDebug('Checkoutpage');
								self.updateHeader(2);
								break;
							default:
								self.logDebug('default');
						}
					}
				}
			}

			self.$elem.attr('data-currentPage', self.currentPage);

			self.cTemplate = myTemplt;
		},

		// Split Main groups into steps (Customize, Cart, Checkout)
		stepify: function(){
			$(document).trigger('functionIt', 'stepify');
			var self = this,
				myTemplt = $( self.cTemplate ),
				pages = myTemplt.find('ul#pages'),

				lis = pages.children('li'),
				// liWidth = 592, //hardcoded!
				liLen = lis.length,
				lisWidth = liLen * self.stepWidth;

			// self.setStep;

			self.currentPage = 'customize';

			lis.hide();
			$(lis[0]).show();

			// Set pages width = all li width
			// pages.width(lisWidth);

			self.cTemplate = myTemplt;
		},

		// Set Buttons
		setButtons: function(){
			$(document).trigger('functionIt', 'setButtons');
			var self = this,
				myTemplt = $( self.cTemplate ),
				cart = self.settings.Merchant.EC,
				split = self.settings.Merchant.SFP,
				backToCard      = myTemplt.find('a.back-to-card'),
				updateCart      = myTemplt.find('a.update-cart'),
				newCard         = myTemplt.find('a.new-card'),
				checkout        = myTemplt.find('a.checkout'),
				backToCart      = myTemplt.find('a.back-to-cart'),
				backToCCBill    = myTemplt.find('a.back-to-cc-billing'),
				backToPurchaser = myTemplt.find('a.back-to-purchaser-info');

			if(cart){ //if we have a embed cart don't change page
				updateCart.on('click', function( event ){
					event.preventDefault();
				});
			}else{
				updateCart.on('click', function( event ){
					event.preventDefault();
					self.moveIt( ['editcart'] );
				});
			}
			newCard.on('click', function( event ){
				event.preventDefault();
				self.cardInit();
				self.moveIt( ['customize'] );

				// beta >> Show checkout if cart embed
				if(self.settings.Merchant.EC){
					$('a.checkout').show();
				}
			});
			checkout.on('click', function( event ){
				// event.preventDefault();
				// self.moveIt( ['customize'] );
				// self.moveIt( ['checkoutpage'] );
			});
			backToCard.on('click', function( event ){
				event.preventDefault();
				self.editingCard = false;
				self.moveIt( ['customize'] );
			});
			backToCart.on('click', function( event ){
				event.preventDefault();
				self.moveIt( ['checkoutpage'] );
				self.moveIt( ['editcart'] );
			});
			backToCCBill.on('click', function( event ){
				event.preventDefault();
				self.moveIt( ['checkoutpage'] );
			});
			backToPurchaser.on('click', function( event ){
				event.preventDefault();
				self.moveIt( ['billing'] );
			});
		},

		// Generates header according to the pages configuration
		generateHeader: function(){
			$(document).trigger('functionIt', 'generateHeader');
			var self = this,
				myTemplt = self.cTemplate,
				header = myTemplt.find('header ul#status-bar'),
				embed = self.settings.Merchant.EC,
				split = self.settings.Merchant.SFP,
				minCustomize = self.minCustomize,
				minCheckout = self.minCheckout,
				headers = [],
				hCustomize = [],
				hCheckout = [],
				nHeaders = 0,
				html = '';

			if(self.minHeader){
				header.addClass('minimized-header');
			}

			if(embed){
				if(split){

					if(minCustomize){
						hCustomize = ['customize'];
					}else{
						hCustomize = ['customize','delivery'];
					}

					if(minCheckout){
						hCheckout = ['checkoutpage'];
					}else{
						hCheckout = ['checkoutpage','billing', 'purchaser'];
					}

					headers = $.merge(hCustomize, hCheckout);
					nHeaders = headers.length;

					headIt( headers );
					header.addClass('titles-' + nHeaders);
				}else{
					headIt(['customize', 'checkoutpage']);
					header.addClass('titles-2');
				}
			}else{
				if(split){
					if(minCustomize){
						hCustomize = ['customize', 'editcart'];
					}else{
						hCustomize = ['customize','delivery', 'editcart'];
					}

					if(minCheckout){
						hCheckout = ['checkoutpage'];
					}else{
						hCheckout = ['checkoutpage','billing', 'purchaser'];
					}

					headers = $.merge(hCustomize, hCheckout);
					nHeaders = headers.length;

					headIt( headers );
					header.addClass('titles-' + nHeaders);
				}else{
					headIt(['customize', 'editcart', 'checkoutpage']);
					header.addClass('titles-3');
				}
			}

			/**
			* Generates the html for the header
			* @param pages => Array of objects (string)
			* that grabs values from Language file
			*/
			function headIt( pages ){
			$(document).trigger('functionIt', 'headIt');
				$.each(pages, function(i, e){
					var active = (i === 0) ? 'active' : '';
					html = html + "<li class='header-title status-page " + active + "'>" +
						"<div class='theme-color-bg'><div>" + self.beforeStep + (i + 1) +
						"</div></div><div class='page-title'> " + self.Language.header[e] + " </div></li> ";
				});
				$(header).html(html);
			}
			self.cTemplate = myTemplt;
		},

		// Update header everytime the page moves @param page => index of the active page
		updateHeader: function( page ){
			$(document).trigger('functionIt', 'updateHeader');
			var self = this,
				myTemplt = self.cTemplate,
				title = myTemplt.find('header ul#status-bar li.header-title');
			$(title).removeClass('active');
			$(title[ page ]).addClass('active');
		},

		// Pre select card from url
		preSelectCard: function(){
			$(document).trigger('functionIt', 'preSelectCard');
			var self = this,
				cards = self.settings.Cards,
				// path = '/gcp/view/template/' + self.MerchantId + '/cards/medium/', <*>
				// path = self.cardsPath,// + '/medium/',
				myCard = {},

				myTemplt = $( self.cTemplate ),

				myImage = myTemplt.find('.choose-card'),
				previewImg = myTemplt.find('img#preview-image'),
				hField = myTemplt.find('input#card_design'),
				srcField = myTemplt.find('input#card_src');

			self.psCard = window.getParam('c');
			// console.log(self.psCard)

			if(self.psCard){
				$.each(cards, function( i, e ){
					if(e.ClientId == self.psCard){
						myCard = e;
					}
				});

				if( !$.isEmptyObject(myCard) ){
					myImage.css( 'background', 'url(' + myCard.ImageName + ')' ) .attr({'title': myCard.Description, 'data-background': 'url(' + myCard.ImageName + ')'} );
					previewImg.attr('src', myCard.ImageName.replace('medium', 'big') );
					hField.val(myCard.StyleId);
					srcField.val(  myCard.ImageName );

					self.cTemplate = myTemplt;
				}else{
					// console.log('No pre selected card');
				}

			}
		},

		//display card preview
		cardPreview: function( image, photoCard, openCard, showValue, showMessage, val, message ){
			$(document).trigger('functionIt', 'cardPreview');

			//default values
            photoCard       = photoCard   || false;
            openCard        = openCard    || false;
            showValue       = showValue   || true;
            showMessage     = showMessage || true;
            val             = val         || $('#card_value').val();
            message         = message     || $('#card_message').val();


            var self        = this,
                previewBG   = $('div#preview-window-bg').fadeToggle(150).toggleClass('preview-show'),
                previewImg  = $('img#preview-image').attr('src', '');

            pwValue = $('#pw-value').html(self.getMoney(val));
            pwMessage = $('#pw-message').html(message);

            if(photoCard){
				//get filename
				var fileNameIndex = image.lastIndexOf("/") + 1,
					filename = image.substr(fileNameIndex),
					extension = filename.substr( (filename.lastIndexOf('.') +1) );

				previewBG.addClass('photo-preview');

				previewImg.attr('src', image.replace(filename, 'big.' + extension) + '?' + Math.random() );
				self.photoSave = true;

            }else{
				previewBG.removeClass('photo-preview');
				if(openCard){
					previewImg.attr('src', image.replace('medium/outside', 'big') );
				}else{
					previewImg.attr('src', image.replace('medium', 'big').replace('small', 'big') );
				}
            }
        },

		// Grab all data about the cards from the API and feed the imgeSelector
		generateImgSelector: function(){
			$(document).trigger('functionIt', 'generateImgSelector');
			var self = this,
				mob = self.IsMobile,
				cards = self.settings.Cards,
				myTemplt = $( self.cTemplate ),
				// path = self.currentURL + '/gcp/view/template/' + self.MerchantId + '/cards/medium/', <*>
				// path = self.cardsPath,
				// dPath = self.currentURL + '/gcp/view/template/default/cards/medium/', <*>
				// dPath = self.currentURL + '/gcp/view/cards/default/cards/medium/',
				previewBG = myTemplt.find('div#preview-window-bg'),
				imgWrap = myTemplt.find('#image-wrap'),
				previewImg = myTemplt.find('img#preview-image')
					.attr('data-src', (cards[0].ImageName).replace('medium', 'big') ),
				previewBt = myTemplt.find('span#pw-close'),

				customizeWrap = myTemplt.find('div#card-selector'),
				wrap = myTemplt
						.find( (self.topSelector ) ? 'figure#image-wrap' : 'div#image-wrap' )
							.addClass( (self.topSelector ) ? 'always-visible' : '' ),

				ulWrap = $('<div />').prependTo(wrap).attr('id', 'ulWrapper'),
				myImage = myTemplt.find('.choose-card')
					.attr( 'data-background', 'url("' + cards[0].ImageName.replace('big', 'medium') + '" )' )
					.attr('title', cards[0].Description)
					.on('click', function(){
						if(!self.topSelector && !mob){
							if($(cards).length > 1){
								ulWrap.fadeToggle(350);
								$(customizeWrap)
									.find('div.field-left, div.field-right')
									.addClass('hide-me');
							}else{
								//display preview
								previewBt.click();
							}
						}
					}),
				hField = myTemplt.find('input#card_design').val(cards[0].StyleId),
				srcField = myTemplt.find('input#card_src').val( cards[0].ImageName.replace('big', 'medium') ),

				myUl = $('<ul />').addClass('image-selector')
									.prependTo(ulWrap)
									.css({
										height: 150,
										width: self.isWidth,
										left: 40
									}),

				nextButton = $('<div />').addClass('next'),
				backButton = $('<div />').addClass('prev'),
				html = '';

			//hide arrows if no more than one card
			if(	cards.length > 1){
				nextButton.prependTo(ulWrap);
				backButton.prependTo(ulWrap);
			}

			$(cards).each(function( i, card ){
				//Adds the open card animation for mobile
				var iName = card.ImageName.replace('big', 'medium'),
					px1 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

				if(self.settings.Merchant.PreviewType == 2){
					self.cardWidth = 108;
					self.cardHeight = 160;
				}

				if(self.openCard){
					html = html + '<li class="swiper-slide open-card"><div class="card"><div class="tile front"> <div class="tile outside"><img src="' + iName.replace('medium', 'medium/outside') + '" data-id="' + card.StyleId + '" /></div> <div class="tile inside"><img src="' + iName.replace('medium', 'medium/inside')+ '"/></div> </div> <div class="tile in-right"><img src="' + self.cardsPath + 'cards/' + self.chainId + '/' + self.MerchantId + '/medium/in-right.png' + '"/></div> </div></li>';

				}else{
					html = (mob) ? html + '<li class="swiper-slide"><img data-src="' + iName +'" data-id="' + card.StyleId + '" src="' + px1 + '" /></li>': html + '<li style="width: ' + self.cardWidth + 'px; height: ' + self.cardHeight + 'px;"><img src="' + iName + '" data-id="' + card.StyleId + '"></li>';
				}
			});


			//Open card click
			if(self.openCard){
				$(document).on('click', '.open-card .card', function(e){
					$(this).toggleClass('open');
				});

				$('<div />', {
					html: self.Language.customize.text.open_card// 'Click on the card to open/close'
				}).addClass('open-card-desc').insertAfter(customizeWrap);
			}

			myUl.html(html);

			if(mob){
				myUl.removeClass('image-selector').addClass('swiper-wrapper');
				ulWrap.addClass('swiper-container');
				self.$elem.append('<div class="pagination"></div>');
				// wrap;
				// console.log(wrap.html());

				$(ulWrap).show();
				var mySwiper = ulWrap.swiper({
					pagination: '.pagination',
					createPagination: true,
					paginationClickable: true,
					grabCursor: true,
					loop: $(cards).length > 1,
					calculateHeight: false,

					onFirstInit: function(swiper){},
					onInit: function(swiper){},
					onSwiperCreated: function(swiper){},
					onTouchStart: function(swiper){},
					onSlideChangeStart: function(swiper){},

					onImagesReady: function(swiper){
						var time = 80;

						$.each(swiper.slides, function(index, val) {
							setTimeout( function(){
								mySwiper.swipeTo(index);
							}, time);
							time += 80;
						});

						$('.pagination').appendTo(wrap);
					},

					onTouchEnd: function(swiper){
						// console.log('onTouchEnd', swiper);

						var myData = $('.swiper-slide-active img').data('id'),
							myScr  = $('.swiper-slide-active img').attr("src");
						myImage.css( 'background', 'url("' + myScr + '" )' );

						if(self.openCard){
							previewImg.attr('src', myScr.replace('medium/outside', 'big') );
						}else{
							previewImg.attr('src', myScr.replace('medium', 'big') );
						}

						hField.val(myData);
						srcField.val( myScr );
					},

					// centeredSlides: true,
					// speed: 300,
					// eventTarget: 'wrapper',
					// autoplay: 5000,,
					// autoplayDisableOnInteraction: true,
					// autoplayStopOnLast: false,
					// mode: 'horizontal',
					// loop: true, //false,
					// loopAdditionalSlides: 0,
					// loopedSlides: 1,
					// slidesPerView: 1,
					// slidesPerViewFit: true,
					// slidesPerGroup: 1,
					// calculateHeight: true, //false,
					// roundLengths: false,
					// cssWidthAndHeight: false,
					// updateOnImagesReady: true,
					// releaseFormElements: true,
					// watchActiveIndex: false,
					// visibilityFullFit: false,
					// autoResize: true,
					// resizeReInit: false,
					// DOMAnimation: true,
					// resistance: true,
					// noSwiping: false,
					// preventLinks: true,
					// preventLinksPropagation: true, //false,
					// initialSlide: 0, //2,
					// useCSS3Transforms: true,
				});

				backButton.on('click', function(e){
					e.preventDefault();
					mySwiper.swipePrev();
					console.log('this');
				});

				nextButton.on('click', function(e){
					e.preventDefault();
					mySwiper.swipeNext();
				});

				myImage.css('visiblity', 'hidden').hide();

			}else{
				$(myUl).roundabout({
					btnNext: nextButton,
					btnPrev: backButton,
					responsive: true
				});
			}

			var cDesignBtn = myTemplt.find('a.change_design_bt').on('click', function(){
				if(!self.topSelector){
					ulWrap.fadeToggle(350);
					$(customizeWrap)
						.find('div.field-left, div.field-right')
						.addClass('hide-me');
				}
			});

			if( $(cards).length <= 1){
				cDesignBtn.hide();
				myImage.find('span').hide();
			}

			if(self.topSelector){
				cDesignBtn.hide();
				myImage.html('').addClass('half-size');
			}

			myTemplt.find('a.preview_bt').on('click', function(){
				// $('#preview-window-bg').fadeToggle(150);
				self.cardPreview( srcField.val() );
			});

			previewBG.on('click', function(){
				// console.log($(this).hasClass('preview-show'));
				if(!$(this).hasClass('preview-show')){
					self.cardPreview(  srcField.val() );
				}else{
					self.cardPreview('');
				}
				// $(this).fadeToggle(150);
			});

			myTemplt.find("ul.image-selector li img").on("click", function(){
				myImage.css( 'background', 'url("' + $(this).attr("src") + '" )' );
				previewImg.attr('src', $(this).attr("src").replace('medium', 'big') );
				hField.val($(this).data('id'));
				srcField.val(  $(this).attr("src") );
				if(!self.topSelector){
					$(ulWrap).fadeToggle(150);
					$(customizeWrap)
						.find('div.field-left, div.field-right')
							.removeClass('hide-me');
				}
			});
			previewBG.prependTo(self.elem);

			//hide pagination if no more than one card
			if(	cards.length <= 1){
				// $('.pagination').hide();
				$('.pagination').addClass('hide-me');
			}
		},

		//Check photoCard object and returns the number of available orientations
		checkPhotoOrientations: function(){
			$(document).trigger('functionIt', 'checkPhotoOrientations');
			var self = this,
				pcObj = self.settings.Merchant.PhotoCard.Orientations || {},
				n = 0;

			$.each(pcObj, function(key, value){
				if(value){
					n += 1;
				}
			});

			return n;
		},

		//return availability for photocard
		photoEnabled : function(){
			$(document).trigger('functionIt', 'photoEnabled');
			var self = this;

			return (self.checkPhotoOrientations() > 0) ? true : false;
		},

		//Generates photo card system based on ini file
		generatePhotoCard: function(){
			$(document).trigger('functionIt', 'generatePhotoCard');
			var self = this,
				myTemplt = $(self.cTemplate),
				options = myTemplt.find('ul#custom-type'),
				panels = myTemplt.find('ul#design-selector > li'),
				title = myTemplt.find('li#customize_card > h2'),
				headers = myTemplt.find('ul#custom-type > li'),
				photoOnly = self.settings.Merchant.PhotoCard.PhotoOnly || false;
				oNumber = self.checkPhotoOrientations();

			$(panels[1]).hide();

			if(self.photoEnabled()){
				title.hide();
				headers.on('click', function(){
					var cType = photoOnly ? 'photo' : $(this).data('ctype');

					$('#customize-type').val(cType);
					if(!$(this).hasClass('dt-active')){
						// self.resetPhoto();
						myTemplt.find('div.photo-message').html('');

						//check if any photo is uploaded
						if($('div#photo-selector #photo-in img').length === 0){
							//no photo? reset background
							$('div#photo-selector #photo-in').addClass('reset').removeClass('photo-in');
						}
					}
				});

				// Activate the move design panels functionality
				self.moveDesign();

				//generate orientation buttons
				self.setPhotoOrientationButtons();

				//preview photo card
				myTemplt.find('#photo-wrap span').on('click', function(){
					if($('#photo-wrap img').length !== 0){
						// make sure to save image before preview card (deferred function)
						// console.log($('#photo-wrap img').attr('src'));
						$.when(self.saveImage()).then(function(){
							 self.cardPreview( $('#photo-wrap img').attr('src'), true );
						});
					}
				});
			}else{
				options.hide();
			}
		},

		//generate the photoCard orientation buttons
		setPhotoOrientationButtons: function(){
			$(document).trigger('functionIt', 'setPhotoOrientationButtons');
			var self = this,
				myTemplt = $(self.cTemplate),
				photoWrapper = myTemplt.find('#photo-selector'),
				cardWrapper = photoWrapper.find('.field-left'),
				btStyle = $('<style class="photo-buttons"/>');

			if(self.checkPhotoOrientations() > 1){
				var btWrapper = $('<div id="orientation-buttons" />'),
					btCount = 0;

				$.each(self.settings.Merchant.PhotoCard.Orientations, function(key, value){
					if(value){
						btCount++;
						var oButton = $('<div class="button photo-button orientation-' + key + '" data-orientation="' + key + '" />')
								.on('click', function(){

									//remove active class from all buttons
									$('.photo-button').removeClass('active');

									//add to the one
									$(this).addClass('active');
									var myOrientation = $(this).data('orientation');

									//change data-orientation to be used by functions
									myTemplt.find('#photo-wrap').attr( 'data-orientation', myOrientation );
									$('#preview-window').attr( 'data-orientation', myOrientation );

									//set the banner background
									myTemplt.find('#photo-wrap span').css('background','url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/medium-' + key + '.png) no-repeat ' + key);
									$('#preview-window-bg .photo-banner').css('background','url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/big-' + key + '.png) no-repeat ' + key);

									//resize image
									$('#photo-slider').slider({value: 1});
									self.photoSave = false;

								})
								.appendTo(btWrapper)
								.attr('data-background', 'url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/small-' + key + '.png)');

						try{

							btStyle.append('.photo-button.orientation-' + key + ':after{background: url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/small-' + key + '.png)}</style>');
							btStyle.append('.card-img.photo.' + key + '{background-image: url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/small-' + key + '.png)}</style>');
						}catch(e){
							// Do nothing
						}
					}
				});

				photoWrapper.addClass('even-width');
				btWrapper.addClass('buttons-' + btCount).appendTo(cardWrapper);
				myTemplt.find('.photo-button[data-orientation=' + self.settings.Merchant.PhotoCard.DefaultOrientation + ']').first().click();
			}

			if(self.checkPhotoOrientations() == 1){
				$.each(self.settings.Merchant.PhotoCard.Orientations, function(key, value){
					if(value){
						//change data-orientation to be used by functions
						myTemplt.find('#photo-wrap').attr( 'data-orientation', key );
						$('#preview-window').attr( 'data-orientation', key );

						myTemplt.find('#photo-wrap span').css('background','url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/medium-' + key + '.png) no-repeat ' + key);
						$('#preview-window-bg .photo-banner').css('background','url(' + self.cardsPath +'cards/' + self.chainId + '/' +  'photo/big-' + key + '.png) no-repeat ' + key);
						btStyle.append('.card-img.photo.' + key + '{background-image: url(' + self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/small-' + key + '.png)}</style>');
					}
				});
			}

				//append style to page (head)
				$('head').append(btStyle);
		},

		//check if enclosures are available end generate it
		getEnclosures: function(){
			$(document).trigger('functionIt', 'getEnclosures');
			var self = this,
				enclosures = self.settings.Enclosures || [];

			if(enclosures.length){
				self.hasEnclosure = true;
				var myTemplt = $(self.cTemplate),
					wrapper = myTemplt.find('#customize-data'),
					lang = self.Language,
					eHtml = '',
					images = 0,
					imagesHtml = '<div id="enclosures-preview">';

				$.each(enclosures, function(i, enclosure){

					var value = (self.settings.Merchant.Language == 'fr') ? self.getMoney(enclosure.Cost.toFixed(2)).replace('.', ',') : self.getMoney(enclosure.Cost.toFixed(2)),
						typeName = (enclosure.Id == 3) ? self.Language.customize.plastic.enclosure_none : enclosure.EnclosureType; //language for "none enclosure"

					eHtml += '<option value="' + enclosure.Id + '" data-cost="' + enclosure.Cost + '">' + typeName + ' ' + value + '</option>';

					if(enclosure.Image){
						images++;
						imagesHtml += '<div class="enclosure-image" data-enclosure="' + enclosure.Id + '"><img src="' + enclosure.Image + '"><span>' + enclosure.EnclosureType + '</span></div>';
					}
				});

				imagesHtml += '</div>';

				// if the only enclosure is the default "None"; then there is no reason to display it
				var html = (enclosures.length == 1 && enclosures[0].Cost == 0) ? 
						'<div class="field" style="display: none">' 
						: '<div class="field">';
				
				html += '<div class="field-left">' +
									'<div>' +
										'<label for="enclosure"> ' + self.Language.cart.text.enclosure + ' </label>' +
									'</div>' +
									'<div class="field-error"></div>' +
								'</div>' +
								'<div class="field-right">' +
									'<div class="input-holder">' +
										'<select class="required" id="enclosure" name="enclosure">' + eHtml + '</select>' +
									'</div>' +
									'<div class="field-detail"> <a href="javascript:void(0)" class="view-enclosure" style="display: none">View</a> </div>' +
								'</div>' +
							'</div>';

				var language = self.Language.customize.plastic;	

				// if(self.enclosureTo ){
				$( self.getField( language.label.enclosure_from, language.detail.enclosure_from,  $('<input type="text" placeholder="Full name" name="enclosure_from" id="enclosure_from" class="required name"/>') ) ).prependTo(wrapper);
				
				// }

				// if(self.enclosureFrom ){
				$( self.getField( language.label.enclosure_to, language.detail.enclosure_to, $('<input type="text" placeholder="Full name" name="enclosure_to" id="enclosure_to" class="required name" "/>') ) ).prependTo(wrapper);
				// }

				// $( self.getField( 'Enclosure', $('<select type="text" name="enclosure" id="enclosure" class="required" data-details=" <a href=\"javascript:void(0)\" class=\"view-enclosure\" style=\"display: none;\">View</a> ">View</a>">' + eHtml + '</select>') ) ).prependTo(wrapper);
				$(html).prependTo(wrapper);

				if(images){
					//2 images per row
					var pairs = Math.round(images/2);

					$('<a id="preview-enclosure" href="javascript:void(0)">Preview</a>')
						.on('click', function(event) {
							event.preventDefault();
							// total height is the number of pairs times the row height
							self.lightBoxIt(imagesHtml, 'Enclosures', pairs * 280);
						})
						.appendTo(wrapper.find('#enclosure').parent());
				}

				myTemplt.find('.view-enclosure').on('click', function(e){
					e.preventDefault();
					var myEnclosure = enclosures[$('#enclosure').val() - 1],
						myHtml = '<img src="' + self.customPath + 'cards/enclosure/' + myEnclosure.Image + '" />';
					self.lightBoxIt(myHtml, 'Enclosure: ' + myEnclosure.EnclosureTypeName);
				});
			}else{
				self.hasEnclosure = false;
			}
		},

		//return a field with label and input as string
		getField: function(label, details, input){
			$(document).trigger('functionIt', 'handleEnclosure');
			var fieldTemplate = "<div class='field'> <div class='field-left'> <div> {{label}} </div> </div> <div class='field-right'> <div class='input-holder'> {{input}} </div> <div class='field-detail'> {{details}} </div> <div class='field-error'></div> </div> </div>",
				labelFor = $(input).attr('id'),
				inputHtml = $(input).get(0).outerHTML,
				labelHtml = '<label for="' + labelFor + '">' + label + ' </label>';
				// details = $(input).attr('data-details') || '';

			return fieldTemplate.replace('{{label}}', labelHtml).replace('{{input}}', inputHtml).replace('{{details}}', details);
		},

		// hide/show message field accordingly
		handleEnclosure: function(){
			$(document).trigger('functionIt', 'handleEnclosure');

			var self = this,
				myTemplt = $(self.cTemplate),
				messageArea = myTemplt.find('textarea#card_message'),
				message = messageArea.parents('.field'),
				msgText = $(messageArea).val(),
				enclosures = self.settings.Enclosures || [],
				enclosure = myTemplt.find('select#enclosure').on('click', function(event) {

					// msgText = ($(messageArea).val() == '-')? msgText : $(messageArea).val();

					//no enclosure
					if($(this).val() == 3){
                        // messageArea.val( '-no message-' );
                        if(self.hideMesageNoneEnclosure){
							message.hide();
                        }

					}else{
                        // $(messageArea).val(msgText);
						message.show();
					}

					//set enclosureType to be accessible from the main object
					self.enclosureType = $(this).val();
				});

			//check for any enclosure and simulate event click
			if(enclosures.length && enclosures[0].Id == 3){
				enclosure.trigger('click');
			}
		},

		//helper for generatePhotoCard > reset photo-card System
		resetPhoto: function(){
			$(document).trigger('functionIt', 'resetPhoto');
			var self = this,
				myTemplt = $(self.cTemplate),
				wrapper = myTemplt.find('div#photo-selector'),
				photoButon = myTemplt.find('div#photo-selector .add_photo'),
				photoSpan = myTemplt.find('div#photo-selector .add_photo span'),
				pBar = myTemplt.find('div#photo-selector .add_photo div#p-bar'),
				lang = self.Language.customize.label;

			$('div#up-panel').show();
			$('div#up-panel div.photo-message').html('');
			wrapper.find('div#photo-wrap img').remove();
			$('input#saved-photo').val('');
			$('div#photo-selector #photo-in').addClass('reset').removeClass('photo-in');

			$('div#tools-wrap').hide();

			photoSpan.html(lang.browse_photo).css('width', '100%');
			pBar.removeClass('progress-bar');
			photoButon.removeClass('loading-wrap');

			if(wrapper.find('div.photo-message').length >= 1){
				// wrapper.find('div.photo-message').html('');
			}
			self.photoSave = false;
			$('div#photo-selector half-field').removeClass('validation-error')
				.find('div.field-error').html('');
		},

		//helper fot generatePhotoCard > Uplaod photo using 3rd part plugin
		uploadPhoto: function(){
			$(document).trigger('functionIt', 'uploadPhoto');
			var self = this,
				wrapper = $('div#photo-selector'),
				photoFile = $('input#photo-file').attr('disabled', true),
				terms = $('input#photo-terms'),
				photoButon = $('div#photo-selector .add_photo').addClass('dt-inactive'),
				photoSpan = $('div#photo-selector .add_photo span'),
				pBar = $('div#photo-selector .add_photo div#p-bar'),
				message,
				lang = self.Language.customize.label,
				enabled = self.photoEnabled(),
				cardStyle = self.settings.Merchant.PreviewType,
				minWidth = 590,
				minHeight = 295;

				switch( cardStyle ){
					case 0: //standard
                        minWidth = 590;
						minHeight = 295;
					break;
					case 1: //Physical (cineplex)
                        minWidth = 590;
						minHeight = 265;
					break;
					case 2: // Carrier (fairmont)
                        minWidth = 380;
						minHeight = 370;
					break;
					case 3: // Greeting (Boston Pizza)
                        minWidth = 590;
						minHeight = 295;
					break;
					case -1: //custom
                        minWidth = 590;
						minHeight = 295;
					break;
					default:
                        minWidth = 590;
						minHeight = 295;
				}

			if(enabled){

				terms.on('click', function(){
					if($(this).is(':checked')){
						photoFile.attr('disabled', false);
						photoButon.removeClass('dt-inactive');
					}else{
						photoFile.attr('disabled', true);
						photoButon.addClass('dt-inactive');
					}
				});

				$('#photo-file').fileupload({
					dataType: 'json',
					// dataType: 'text',
					min_width: minWidth,
					min_height: minHeight,
					// url: self.currentURL + '/gcp/server/GhostProxy.ashx?action=cs&merchantId=' + self.MerchantId + '&chainId=7&size=big',
					url: self.currentURL + '/gcp/server/GhostProxy.ashx?action=u&merchantId=' + self.MerchantId + '&minWidth=' + minWidth + '&minHeight=' + minHeight,
					add: function(e, data){
						$.each(data.files, function(index, file){

							if(file.size){

								var fileSize = 0;
								if(file.size > 1024 * 1024){
									fileSize = (Math.round( file.size * 100 / (1024 * 1024) ) / 100).toString() + ' MB';
								}else{
									fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + ' KB';
								}

								photoSpan.html('0%');
								pBar.addClass('progress-bar').css({'width': '0%'});
								photoButon.addClass('loading-wrap');

								//Check if element exist. if not, create
								if(wrapper.find('div.photo-message').length < 1){
									message = $('<div class="photo-message"></div>').html(lang.uploading + ' <b>' + self.shortString(file.name, 25) + '</b> (' + fileSize + ')').appendTo(photoButon.parent());
								}else{
									message = wrapper.find('div.photo-message').html(lang.uploading + ' <b>' + self.shortString(file.name, 25) + '</b> (' + fileSize + ')');
								}
							}else{
								photoSpan.html('Uploading');
								pBar.addClass('progress-bar').css({'width': '100%'});
								photoButon.addClass('loading-wrap');
							}
						});
						var jqXHR = data.submit();
					},

					change: function(e, data){
						// console.log('file changed');
					},

					progress: function (e, data) {
						var progress = parseInt(data.loaded / data.total * 100, 10) / 2;

						// $('#progress .bar').css('width', progress + '%');
						photoSpan.html(progress + '%').css({'width': progress + '%'});
						pBar.addClass('progress-bar').css({'width': progress + '%'});
					},

					done: function (e, data) {
						// console.log(data);
						var myFile = data.result,
							eFile = myFile.error || true,
							uFile = myFile.url,
							status = myFile.status,
							resolution = myFile.resolution;

						if(eFile && status === 0){

							// Remove error
							$('#photo-selector .half-field').removeClass('validation-error')
								.find('.field-error').html('');

							// if message exist
							if(typeof message !== 'undefined' && message.length > 0){
								message.html('');
							}

							// photoSpan.html('Loading...');
							self.photoReady(uFile);
						}else{
							alert(self.Language.photo.errors[status]);
							self.resetPhoto();
						}
						self.photoSave = false;
					},

					fail: function (e, data) {
						console.log('Error!');
						console.log(data);
						console.log(e);
						message.html('Error: ' + data.errorThrown + '. Please, try again.');
						self.resetPhoto();
						$(window).trigger('anaLog','[GCP] ' + data.errorThrown);

						// data.errorThrown
						// data.textStatus;
						// data.jqXHR;
					}
				});
			}
		},

		//open tools when photo is ready
		photoReady : function( image ){
			$(document).trigger('functionIt', 'photoReady');
			var self = this,
				photoSpan = $('div#photo-selector .add_photo span'),
				pBar = $('div#photo-selector .add_photo div#p-bar'),
				progress = 50,
				i = 1,
				tempo = 2000;

			// the fake progress...
			setInterval(function(){
				if (progress <= 98){
					photoSpan.html(progress + '%').css({'width': progress + '%'});
					pBar.addClass('progress-bar').css({'width': progress + '%'});
					progress = progress + Math.floor(Math.random() * 4) + 1;
					tempo = Math.floor(Math.random() * 1500 + 3500);
				}
			} , tempo);

			var pWrap = $('div#photo-selector div#photo-wrap'),
				uImage = $('<img />', {
					src: image
			}).load(function(){
				var myImg = this;
				progress = 100;
				photoSpan.html(progress + '%').css({'width': progress + '%'});
				pBar.addClass('progress-bar').css({'width': progress + '%'});

				pWrap.find('div#photo-in').html(uImage).addClass('photo-in');
				uImage.css({
					top: 0,
					left: 0
				});

				setTimeout(function(){
					self.photoTools();

					$('div#photo-selector #photo-in').removeClass('reset');
					$('div#photo-tools').find('a[data-action="fit"]').click();
				}, 500);

				self.lImage = {};
				self.lImage.w = myImg.width;
				self.lImage.h = myImg.height;

			}).addClass('drag-me').draggable({
				stop: function(){
					self.fixPosition(this);
					self.photoSave = false;
				}
			});
		},

		//helper > Fix image position when goes over the parent border
		fixPosition: function( image ){
			$(document).trigger('functionIt', 'fixPosition');
			var p = $(image).position(),
				top = p.top,
				left = p.left,
				bottom = top + $(image).height(),
				right = left + $(image).width(),
				myOrientation = $('#photo-wrap').attr('data-orientation'),
				minBottom = (myOrientation == 'bottom' || myOrientation == 'up') ? 100 : 124,
				minRight = (myOrientation == 'bottom' || myOrientation == 'up') ? 200 : 150;

			// console.log(p);
			// console.log(top);
			// console.log(left);
			// console.log(bottom);
			// console.log(right);
			// console.log(myOrientation);
			// console.log(minBottom);
			// console.log(minRight);

			if(top > 0){
				$(image).css('top', 0);
			}
			if(left > 0){
				$(image).css('left', 0);
			}
			if(bottom < minBottom){
				$(image).css({'top' : '' , 'bottom': 0});
			}
			if(right < minRight){
				$(image).css({'left' : '', 'right': 0});
			}
		},

		// Generates the tools to manipulate updated photo
		photoTools: function(){
			$(document).trigger('functionIt', 'photoTools');
			if($('#tools-wrap').length < 1){
				var self    = this,
				lTools		= self.Language.photo,
				image       = $('div#photo-wrap img'),
				pWrap       = $('div#photo-selector .field-right'),
				upPhoto     = $(pWrap).find('div#up-panel').hide(),

				tWrap       = $('<div id="tools-wrap" />').appendTo(pWrap),
				title       = $('<h2 class="photo-title" />').html(lTools.edit_photo).appendTo(tWrap),
				desc        = $('<p />').html(lTools.photo_instructions).appendTo(tWrap),

				tools       = $('<div id="photo-tools" />').appendTo(tWrap),

				sLabel      = $('<p />').html('Zoom').appendTo(tools),
				slider      = $('<div id="photo-slider" />')
				.slider({
					orientation: "horizontal",
					range: "min",
					min: 1,
					max: 100,
					value: 100,
					slide: function( event, ui ) {
						self.resizePhoto(ui.value);
						self.photoSave = false;

					},
					change: function( event, ui ) {
						self.resizePhoto(ui.value);
						self.photoSave = false;
					}
				})
				.appendTo(tools),
				// buttons = $('<div id="pt-buttons" />').appendTo(tools),
				fitBt = $('<a href="javascript:void(0)" class="button photo-bt" data-action="fit" />').html('<span>' + lTools.buttons.fit + '</span>').appendTo(tools),
				zoomBt = $('<a href="javascript:void(0)" class="button photo-bt" data-action="zoom" />').html('<span>' + lTools.buttons.zoom + '</span>').appendTo(tools);
				resetBt = $('<a href="javascript:void(0)" class="button photo-bt" data-action="reset" />').html('<span>' + lTools.buttons.reset + '</span>').appendTo(tools),
				saveBt = $('<a href="javascript:void(0)" class="button photo-bt psave" data-action="save" />').html('<span>' + lTools.buttons.save + '</span>').appendTo(tools),

				$('div#photo-tools > a').on('click', function(){
					var action = $(this).data('action');
					switch( action ){
						case 'save':
							self.saveImage();
							alert(self.Language.dialogs.photo_saved);
						break;
						case 'reset':
							self.resetPhoto();
						break;
						case 'fit':
							image.css({top : 0, left : 0});
							slider.slider({value: 1});
						break;
						case 'zoom':
							slider.slider({value: 100});
						break;
						default:
					}
				});
			}else{
				$('div#up-panel').hide();
				$('#tools-wrap').show();
			}
		},

		//Helper => crop original image and save based on the dimensions on screen
		saveImage: function(){
			$(document).trigger('functionIt', 'saveImage');
			var self = this,
				image = $('div#photo-wrap img'),
				p = $(image).position(),
				top = p.top * -1,
				left = p.left * -1,
				x_factor = self.lImage.w / image.width(),
				cardStyle = self.settings.Merchant.PreviewType,
				myOrientation = $('#photo-wrap').attr('data-orientation');

			if(myOrientation == 'bottom' || myOrientation == 'up'){
				switch( cardStyle ){
					case 0: //standard
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 300;
						mobile_h    = 150;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
					break;
					case 1: //Phisical (cineplex)
						big_w       = 590;
						big_h       = 282;
						mobile_w    = 300;
						mobile_h    = 143;
						medium_w    = 200;
						medium_h    = 95;
						small_w     = 56;
						small_h     = 27;
					break;
					case 2: // Carrier (fairmont)
						big_w       = 380;
						big_h       = 370;
						mobile_w    = 300;
						mobile_h    = 292;
						medium_w    = 110;
						medium_h    = 107;
						small_w     = 30;
						small_h     = 29;
					break;
					case 3: // Greeting (Boston Pizza)
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
					break;
					case -1: //custom
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
					break;
					default:
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;

				}
			}else{
				switch( cardStyle ){
					case 0: //standard
						big_w       = 443;
						big_h       = 366;
						mobile_w    = 225;
						mobile_h    = 186;
						medium_w    = 150;
						medium_h    = 124;
						small_w     = 42;
						small_h     = 35;
					break;
					case 1: //Phisical (cineplex)
						big_w       = 443;
						big_h       = 366;
						mobile_w    = 225;
						mobile_h    = 186;
						medium_w    = 150;
						medium_h    = 124;
						small_w     = 42;
						small_h     = 35;
					break;
					case 2: // Carrier (fairmont)
						big_w       = 380;
						big_h       = 370;
						mobile_w    = 300;
						mobile_h    = 292;
						medium_w    = 110;
						medium_h    = 107;
						small_w     = 30;
						small_h     = 29;
					break;
					case 3: // Greeting (Boston Pizza)
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
					break;
					case -1: //custom
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
					break;
					default:
						big_w       = 590;
						big_h       = 295;
						mobile_w    = 200;
						mobile_h    = 100;
						medium_w    = 200;
						medium_h    = 100;
						small_w     = 56;
						small_h     = 28;
				}
			}

			imgInfo = {
				src:            image.attr('src'),
				banner_src:		self.cardsPath + 'cards/' + self.chainId + '/' +  'photo/big-' + myOrientation + '.png',
				orientation:    myOrientation,
				real_w:         medium_w * x_factor,
				real_h:         medium_h * x_factor,
				real_x:         x_factor * left,
				real_y:         x_factor * top,

				big_w:          big_w,
				big_h:          big_h,
				mobile_w:       mobile_w,
				mobile_h:       mobile_h,
				medium_w:       medium_w,
				medium_h:       medium_h,
				small_w:        small_w,
				small_h:        small_h
			},
			dfd = $.Deferred();

			if(!self.photoSave){

				$.ajax({
					url: self.currentURL + '/gcp/server/GhostProxy.ashx?action=c',
					type: "POST",
					data: imgInfo,
					success: function(response){
						response = $.parseJSON(response);
						if(response.success){
							$('input#saved-photo').val(imgInfo.src);
							self.photoSave = true;
						}
						dfd.resolve();
					},
					progress: function(response){
						console.log(response);
					},
					fail: function(e){
						console.log(e);
						console.log(fail);
					}
				});
				return dfd.promise();
			}else{
				// console.log('already saved');
				return true;
			}
		},

		//Helper for slider to resize photo based on the %
		resizePhoto: function(percent){
			$(document).trigger('functionIt', 'resizePhoto');
			var self = this,
				myOrientation = $('#photo-wrap').attr('data-orientation'),
				cardStyle = self.settings.Merchant.PreviewType,
				oWidth = 0,
				oHeight = 0,
				propW = self.lImage.w / 2.95,
				propH = self.lImage.h / 2.95,
				myImage = $('div#photo-wrap img');


			if(myOrientation == 'bottom' || myOrientation == 'up'){
				switch( cardStyle ){
					case 0: //Standard
					oWidth    = 200;
					oHeight   = 100;
					break;
					case 1: //Physical (Cineplex)
					oWidth    = 200;
					oHeight   = 95;
					break;
					case 2: // Carrier (Fairmont)
					oWidth    = 110;
					oHeight   = 107;
					break;
					case 3: // Greeting (Boston Pizza)
					oWidth    = 200;
					oHeight   = 100;
					break;
					case -1: //custom
					oWidth    = 200;
					oHeight   = 100;
					break;
					default:
					oWidth    = 200;
					oHeight   = 100;

				}
			}else{
				switch( cardStyle ){
					case 0: //standard
					oWidth    = 150;
					oHeight   = 140;
					break;
					case 1: //Physical (cineplex)
					oWidth    = 150;
					oHeight   = 140;
					break;
					case 2: // Carrier (fairmont)
					oWidth    = 110;
					oHeight   = 107;
					break;
					case 3: // Greeting (Boston Pizza)
					oWidth    = 200;
					oHeight   = 100;
					break;
					case -1: //custom
					oWidth    = 200;
					oHeight   = 100;
					break;
					default:
					oWidth    = 200;
					oHeight   = 100;
				}
			}
			var	unit = (propW - oWidth) / 100,
				unitH = (propW - oHeight) / 100;

			var height = ( unitH * (percent - 1) ) + oHeight,
				width = ( unit * (percent - 1) ) + oWidth;

			if(myOrientation == 'bottom' || myOrientation == 'up'){

				myImage.width( width );
				myImage.height( 'auto' );

				// after changing width of image to fit, check if height is greater than minimum
				if(myImage.height() <= height){
					myImage.height( height );
					myImage.width( 'auto' );
				}

			}else{
				myImage.height( height );
				myImage.width( 'auto' );

				// after changing the height, check the width of is greater than minimum
				if(myImage.width() <= width){
					myImage.width( width );
					myImage.height( 'auto' );

				}
			}

			self.fixPosition('div#photo-wrap img');
		},

		//Move card design panels
		moveDesign: function(){
			$(document).trigger('functionIt', 'moveDesign');
			var self = this,
				myTemplt = $(self.cTemplate),
				panels = myTemplt.find('ul#design-selector > li'),
				options = myTemplt.find('#custom-type > li').on('click', function(){
					var panel = $(this).data('id');

					if(!$(this).hasClass('dt-active')){
						$(options).removeClass('dt-active');
						$(this).addClass('dt-active');

						$(panels).hide();
						$(panels).removeClass('validate');

						$(panels[panel]).fadeIn('slow');
						$(panels[panel]).addClass('validate');
					}
				});
		},

		// generates the summary page before receipt
		generateSummary: function(){
			$(document).trigger('functionIt', 'generateSummary');
			var self = this,
				myTemplt = $( self.cTemplate ),
				cPage = myTemplt.find('div#confirmation-window-bg'),
				lPage = myTemplt.find('li#purchaser-info'),
				origNav = lPage.find('div.pages-nav'),
				newNav = cPage.find('div.pages-nav'),
				backBt = origNav.find('a.back-to-purchaser-info'),
				contBt = newNav.find('a.go-to-summary');

			if( self.settings.Merchant.confirmationPage ){
				cPage.prependTo(self.elem);
				origNav.appendTo(cPage.find('div#confirmation-window'));
				newNav.appendTo(lPage);

				contBt.on('click', function(){
					if ( self.groupValidation( $('li#cc-info, li#billing-info, li#purchaser-info'), contBt ) ) {
						cPage.fadeToggle();
						self.summaryIt();
						$('html, body').animate({ scrollTop: 0 }, "fast");
					}
				});

				backBt.on('click', function(){
					cPage.fadeToggle();
				});
			}
			self.cTemplate = myTemplt;
		},

		// get html for summary
		summaryHtml: function(){
			$(document).trigger('functionIt', 'summaryHtml');
			var self = this,
				html = '<div>',
				innerHtml = '',
				total = 0,
				n = 0;
			if(self.b2b && self.b2bDiscount.value !== 0){

				if(self.b2bDiscount.type == '$'){

					self.summary.discount = -Math.abs(self.b2bDiscount.value);

				}else{ // %

					self.summary.discount = 0;

					var sub = 0;
					$.each(self.summary, function(i, e){
						sub += e;
					});

					//remove shippment from subtotal
					sub -= self.summary.shipping_total;
					self.summary.discount = -Math.abs( (sub * self.b2bDiscount.value) / 100 );
				}
			}

			$.map(self.summary, function(value, key) {
				if(value !== 0){
					var val = (self.settings.Merchant.Language == 'fr') ? self.getMoney( self.numberWithCommas(value.toFixed(2)) ).replace('.', ',') : self.getMoney( self.numberWithCommas(value.toFixed(2)) );
					n++;
					total += value;
					innerHtml += "<div class='sb-total'>" + self.Language.cart.text[key] +
									"<span class='t-total'>" + val + "</span>" +
								"</div>";
				}
			});

			if(n <= 1) {
				innerHtml = '';
			}

			var tValue = (self.settings.Merchant.Language == 'fr') ? self.getMoney( self.numberWithCommas(total.toFixed(2)) ).replace('.', ',') : self.getMoney( self.numberWithCommas(total.toFixed(2)) );

			html += innerHtml + "<div class='s-total'>" + self.Language.cart.text.summary +
									"<span class='t-total'>" + tValue + "</span>" +
									"</div>" +
								"</div>";

			self.cartTotal = total;

			return html;
		},

		// generates the opt in checkbox when available
		optIn: function(){
			$(document).trigger('functionIt', 'optIn');
			var self = this,
				lang = self.Language,
				enabled = self.settings.Merchant.OptIn;

			if(enabled){
				var tContainer = self.cTemplate.find('#purchaser-info .terms-field'),
					optContainer = $('<div id="opt-container" />'),
					optBox = $('<input type="checkbox" id="opt-in" name="opt-in" />').appendTo(optContainer),
					optLabel = $('<label for="opt-in" />').html(lang.checkout.label.cc_optin).appendTo(optContainer);
				optContainer.prependTo(tContainer);
			}
		},

		// Re-estructure the page placing the cart floating aside
		embedCart : function(){
			$(document).trigger('functionIt', 'embedCart');
			var self = this,
				myTemplt = $( self.cTemplate );
			if ( self.settings.Merchant.EC ){
				var $toEmbed = myTemplt.find('#cart-embed');

				myTemplt.addClass( 'with-cart' );
				myTemplt.find('#cart').appendTo( $toEmbed );
				myTemplt.find('#page-cart').remove();
				$toEmbed.addClass( 'active' );
				myTemplt.find('a.back-to-cart').hide();

				if(self.IsMobile){
					var cartBar = $('<div id="cart-bar" />').on('click', function(event) {
						self.$elem.toggleClass('cartslider-on');
					}).appendTo(self.$elem);
					self.$elem.addClass('cart-slider');

					// slide back when click any button inside the cart
					$(document).on('click', '.cart-slider #cart-embed .button', function(event) {
						self.$elem.removeClass('cartslider-on');
					});
				}
			}else{
				myTemplt.addClass( 'no-cart' );
			}
			self.cTemplate = myTemplt;
		},

		// Add dynamically the data-step on the pages used for the moveIt function to generate the new page hash tag
		setSteps: function(){
			$(document).trigger('functionIt', 'setSteps');
			var self = this,
				myTemplt = $( self.cTemplate ),
				lis = myTemplt.find('#pages > li');

			lis.each( function( i ){
				$(this).attr( 'data-step', 'step' + (i + 1) );
			});

			if( self.settings.Merchant){
				if (self.settings.Merchant.EC){
					if(self.settings.Merchant.SFP){//5 pages
						//Define page number
						self.steps.customize      = [0, 0];
						self.steps.delivery       = [0, 1];
						self.steps.checkoutpage   = [1, 0];
						self.steps.billing        = [1, 1];
						self.steps.purchaser      = [1, 2];
					}else{ //2 pages
						//Define page number
						self.steps.customize      = [0, 0];
						self.steps.checkoutpage   = [1, 0];
					}
				}else{
					if(self.settings.Merchant.SFP){//6 pages
						//Define page number
						self.steps.customize      = [0, 0];
						self.steps.delivery       = [0, 1];
						self.steps.editcart       = [1, 0];
						self.steps.checkoutpage   = [2, 0];
						self.steps.billing        = [2, 1];
						self.steps.purchaser      = [2, 2];
					}else{//3 pages
						//Define page number
						self.steps.customize      = [0, 0];
						self.steps.editcart       = [1, 0];
						self.steps.checkoutpage   = [2, 0];
					}
				}
			}
		},

		// Float cart
		updateFloatingCart: function( scrollAmount ){
			// $(document).trigger('functionIt', 'updateFloatingCart');
			var self = this,
				newPosition = self.CartPosition + scrollAmount,
				cart = $(document).find('#cart-embed.active'),
				dialog = $(document).find('.ui-dialog'),
				content = $(document).find('div#content').outerHeight(false),
				cartBottom = newPosition + cart.outerHeight(false),
				marginTop = parseInt(cart.css('margin-top'), 10),
				dHeight = dialog.outerHeight(false),
				dialogBottom = newPosition + dHeight;

			if(scrollAmount > 0){
				var topPos = (newPosition + self.top_offset) - marginTop,
					dialogTopPos = 0;

				if ( window !== top ) {
					// you're in an iframe
					// dialogTopPos = (scrollAmount + ($(window.top).height() / 2) - (dHeight / 2));
				}else{
					dialogTopPos = ($(window.top).height() / 2) - (dHeight / 2);
				}

				topPos = (topPos > 0) ? topPos : 0;
				dialogTopPos = (dialogTopPos > 0) ? dialogTopPos : 0;

				if(cartBottom > content){ //avoid to go to the bottom
					topPos = topPos - (cartBottom - content ) + 50; //extra 50px
				}
				if(dialogBottom > content){ //avoid to go to the bottom
					dialogTopPos = dialogTopPos - (dialogBottom - content ) + 50; //extra 50px
				}
				cart.stop().animate({top: topPos});
				dialog.stop().animate({top: dialogTopPos});

			}else{
				cart.stop().animate({top: 0});
			}
		},

        //check options and hide/display billing
        hideEmailFields: function(){
			var self = this,
				myTemplt = $(self.cTemplate);

			myTemplt.find('input#email_recipient_name').removeClass('name required');
			myTemplt.find('input#email_recipient_email').removeClass('email required');
			myTemplt.find('input#print_recipient_name').removeClass('name required');
        },

		// Split delivery lis into tabs
		deliverIt: function(){
			$(document).trigger('functionIt', 'deliverIt');
			var self = this,
				myTemplt = $( self.cTemplate ),
				deliveryInfo =  myTemplt.find('li#delivery-info'),
				delType = myTemplt.find('ul#delivery-type'),
				delTab = myTemplt.find('ul#delivery-content'),
				hasPlastic = self.settings.Merchant.IsPlastic,
				hasElectronic = self.settings.Merchant.IsElectronic,
				hasSMS = self.settings.Merchant.SMS,
				hasFacebook = self.settings.Merchant.Facebook.Enabled;

			//remove non-used lists
			if(!hasPlastic){
				deliveryInfo.find('li[data-dnature=plastic]').remove();
				delType.find('li[data-dnature=plastic]').remove();
				delTab.find('li[data-dnature=plastic]').remove();
			}
			if(!hasFacebook){
				deliveryInfo.find('li[data-delivery=facebook]').remove();
				delType.find('li[data-delivery=facebook]').remove();
				delTab.find('li#dc-facebook').remove();
			}
			if(!hasSMS){
				deliveryInfo.find('li[data-delivery=sms]').remove();
				delType.find('li[data-delivery=sms]').remove();
				delTab.find('li#dc-sms').remove();
			}
			if(!hasElectronic){
				deliveryInfo.find('li[data-dnature=electronic]').remove();
				delType.find('li[data-dnature=electronic]').remove();
				delTab.find('li[data-dnature=electronic]').remove();
			}

			var delNav = myTemplt.find('ul#delivery-type li'),
				nNav = delNav.length;

			delType.addClass('dnumber-' + nNav);

			// delTab.width(nNav * self.stepWidth);

			delNav.each(function( i ){
				if( !$( this ).hasClass('dt-inactive') ){
					$( this ).on('click', function( e ){
						if(!$(this).hasClass('dt-active')){
							self.moveDelivery( i );
						}
					});
				}
			});
			//go to the first tab
			self.cTemplate = myTemplt;
			// self.moveDelivery( 0 ); => moved to generateIt()
		},

        // Execute functions according to the purchaseType
		handlePurchaseType: function(pType){
			var self = this,
            myTemplt = $(self.cTemplate);
            //pType = self.PurchaseId;

            switch ( parseInt(pType, 10) ){
				case 0: //GCP
					// do nothing;
				break;

				case 6: //B2B
                    self.hideEmailFields();
                break;

                case 7: //B2B
					self.hideEmailFields();
				break;

				default:
					// defaultAction;
            }
		},

		// Move Delivery panel @param tab => number of the delivery page (0 indexed) or the name corresponding to data-delivery attribute
		moveDelivery: function( tab ){
			$(document).trigger('functionIt', 'moveDelivery');
			var self = this,
				myTemplt = $( self.cTemplate ),
				delNav = myTemplt.find('ul#delivery-type li'),
				delTab = myTemplt.find('ul#delivery-content'),
				delTabs = myTemplt.find('ul#delivery-content li'),
				hField = myTemplt.find('input#delivery_type'),
				deliveryError = myTemplt.find('li#delivery-info div.group-error');

			if(typeof tab === 'string' ){
				$.each(delNav, function( i, e ){
					if($(e).data('delivery') == tab){
						tab = i;
					}
				});
			}

			$(delTabs).hide();
			$(delTabs[tab]).fadeIn('slow');

			//use data attr or 'plastic' if null (good for merchants with no selector)
			$(hField).attr('value', $(delNav[tab]).data('delivery') || 'plastic');

			$(hField).attr('value', $(delNav[tab]).data('delivery') || 'plastic' );
			delNav.removeClass('dt-active');
			$(delNav[tab]).addClass('dt-active');

			//Clean Validation
			$(delTabs[tab]).find('div.field').removeClass('validation-error');
			$(delTabs[tab]).find('div.field').removeClass('validation-warning');
			$(delTabs[tab]).find('div.field-error').html('');
			deliveryError.html('');

			delTabs.removeClass('validate');
			$(delTabs[tab]).addClass('validate');

			//handle buttons
			self.handleButtons(tab);
		},

		// Handle delivery buttons
		handleButtons: function( tab ){
			$(document).trigger('functionIt', 'handleButtons');
			var self = this,
				myTemplt = $( self.cTemplate ),
				delNav = myTemplt.find('ul#delivery-type li'),
				delTab = myTemplt.find('ul#delivery-content'),
				delTabs = myTemplt.find('ul#delivery-content li');

			tab = (typeof tab == 'undefined') ? delTab.data('index') : tab;

			if ($(delNav[tab]).data('delivery') == 'plastic' && ( $('select#existing-address').val() == -1 || $('select#existing-address').length === 0) ){

				if ( self.gettingShipment === false ) {

					$(delTabs[tab]).find('div.pages-nav').show();
					$('li#delivery-info > div.pages-nav').hide();
				} else {
					$(delTabs[tab]).find('div.pages-nav').hide();
					$('li#delivery-info > div.pages-nav').show();
				}
			} else {
				$('li#delivery-info > div.pages-nav').show();
			}
		},

		// get Credit Card number and display the flag
		getCC: function(){
			$(document).trigger('functionIt', 'getCC');
			var self = this,
				myTemplt = self.cTemplate,
				ccInput = myTemplt.find('input#cc_number'),
				ccResult = '';

			ccInput.validateCreditCard(function(result) {
				if (result.card_type === null) {
					$('ul#cc-type-selector li').removeClass('off');
					ccInput.removeClass('valid');
					return;
				}

				console.log(result.card_type.name);

				//Change the result for DB => Syed's fault!
				switch( result.card_type.name ){
					case 'visa':
						ccResult = 'Visa';
					break;
					case 'mastercard':
						ccResult = 'MasterCard';
					break;
					case 'amex':
						ccResult = 'American Express';
					break;
					default:
						ccResult = 'MasterCard';
					}

					$('input#cc_type').val( ccResult );
					$('ul#cc-type-selector li').addClass('off');
					$('ul#cc-type-selector .' + result.card_type.name).removeClass('off');

					if (result.length_valid && result.luhn_valid) {
						return ccInput.addClass('valid');
					} else {
						return ccInput.removeClass('valid');
					}
				})
				.on('keypress', function(key) {
					//numbers only
					if(key.charCode < 48 || key.charCode > 57){
						if(key.charCode !== 0){ //backspace, delete, tab...
							return false;
						}
					}
				})
				.on('keydown keyup blur paste', function(){
					$(this).val( $(this).val().replace(/[^0-9+ ]/g,'') ); //just in case... replaces any no number
				});
			self.cTemplate = myTemplt;
		},

		// Generates the datapicker for email_delivery_date
		setDatePicker: function(){
			$(document).trigger('functionIt', 'setDatePicker');
			var self = this,
				myTemplt = self.cTemplate;
			if(!self.IsMobile){

				var d = new Date(),
					month = d.getMonth() + 1,
					day = d.getDate(),
					lang = self.settings.Merchant.Language,

					output = (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + '/' + d.getFullYear(),
					language = {
						dayNamesMin: (lang == 'fr') ? ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
						monthNames: (lang == 'fr') ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
						dayNamesShort: (lang == 'fr') ? ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
					},

					dataField = myTemplt.find('input#email_delivery_date, input#sms_delivery_date')
					.datepicker({
						minDate: 0,
						dateFormat: "D, d MM, yy",
						altFormat: "yy-mm-dd",
						dayNamesMin: language.dayNamesMin,
						monthNames: language.monthNames,
						dayNamesShort: language.dayNamesShort
					}).datepicker("setDate", self.iFormatedDate)
					.addClass('ui-date-picker')
					.on('keydown', function( e ){
							e.preventDefault();
					}),

					tdp = $('<a />').click(function(e) {
						e.preventDefault();
						dataField.focus();
					})
					.addClass('deliver-calendar')
					.appendTo(dataField.parent());
				self.cTemplate = myTemplt;
			}else{
				var mDate = self.formatedDate,
					dField = myTemplt.find('input#email_delivery_date, input#sms_delivery_date');

				dField.attr('min', mDate).val(mDate).on('blur', function(){
					var nDate = new Date($(this).val()).toJSON();

					if(nDate < mDate){
						$(this).val(mDate);
						$(this)
							.parents('.field').addClass('validation-error')
								.find('.field-error').html(self.Language.errors.past_date);
					}
				});
			}
		},

		// Set Expiration Data Picker for Credit Card
		setExpDatePicker: function(){
			$(document).trigger('functionIt', 'setExpDatePicker');
			var self = this,
				myTemplt = self.cTemplate,
				expField = myTemplt.find('input#cc_expiration'),
				expParent = expField.parent(),
				lang = self.settings.Merchant.Language,
				todayED = self.year + '-' + self.month;
			if( !self.IsMobile ){
				var showing = false,
					keepFocus = false,
				theYear = (new Date()).getFullYear() + 1,

				// generate html for month
				monthsHTML = function(){
					var html = '<select id="cc_exp_month" class="exp-left" name="cc_exp_month">',
						theMonth = (new Date()).getMonth();

					for (var i = 1; i <= 12; i++ ){
						var value = (i < 10) ? '0' + i : i,
							selected = ((i - 1) == theMonth)? 'selected= "selected"' : '';

						html = html + '<option value="' + value +'" ' + selected + '>' + value + '</option>';
					}

					return html + '</select>';
				},

				// generate html for year
				yearsHTML = function(){

					var html = '<select id="cc_exp_year" class="exp-right" name="cc_exp_year">',
						theYear = (new Date()).getFullYear(),
						currentYear = theYear;

					for(var i = 0; i <= 25; i++){
						var selected = ((currentYear + i) == theYear)? 'selected= "selected"' : '';

						html = html + '<option value="' + (currentYear + i) +'" ' + selected + '>' + (currentYear + i) + '</option>';
					}
					return html + '</select>';
				},

				container = $('<div id="double-exp" />').html(monthsHTML() + yearsHTML()).appendTo(expParent);
				expField.remove();

			}else{
				var fDetail = expField.parents('.field-right').find('.field-detail'),
					dataEx = (lang == 'fr') ? ' (AAAA-MM)' : ' (YYYY-MM)';

				fDetail.html(fDetail.html() + dataEx);
				expField.val( todayED );
			}
			self.cTemplate = myTemplt;
		},

		// Set function for the cart arrows
		setCartArrows: function(){
			$(document).trigger('functionIt', 'setCartArrows');
			var self = this,
				myTemplt = self.cTemplate,
				cards = myTemplt.find('ul#cards'),
				arrows = myTemplt.find('div#cart-embed button.ew-arrow'),
				clicked = false;

			$(arrows).each(function( i, e ){
				$(this).on('click', function(){

					if (!clicked){

						var ulMargn = parseInt( (cards).css('margin-top'), 10 ),
							ulLine = parseInt( self.getHeight($('div#cards-wrapper li')[0]) + 20, 10);
							liN = ulLine * ( $('div#cards-wrapper li').length - 2) * -1,
							thisButton = $(this);

						$(arrows).removeClass('hide-me');
						if( $(this).data('direction') == 'up' ){ //up

							if( ulMargn !== 0){
								ulMargn = ulMargn + ulLine;
								// $(this).removeClass('hide-me');
							}else{
							$(this).addClass('hide-me');
							}
						}else{ //down
							if(ulMargn > liN){
								ulMargn = ulMargn - ulLine;
								// $(this).removeClass('hide-me');
							}else{
							$(this).addClass('hide-me');
							}
						}

						$(cards).css('margin-top', ulMargn);

						clicked = true;
						//css transition currentlly 0.25s. 300 should be enough
						setTimeout(function(){
							thisButton.addClass('hide-me');
							if( (thisButton.data('direction') == 'up' && ulMargn !== 0) || (thisButton.data('direction') == 'down' && ulMargn > liN) ){
								thisButton.removeClass('hide-me');
							}
							clicked = false;
						}, 300);
					}else{
						return false;

					}

				});
			});
			self.cTemplate = myTemplt;
		},

		// Handles the message and limit chars to the self.messageMax value
		charCount: function(){
			$(document).trigger('functionIt', 'charCount');
			var self = this,
				myTemplt = self.cTemplate,
				chars = myTemplt.find('#chars'),
				charsLine = myTemplt.find('#chars-lines').html(self.lineMax),
				mBox = myTemplt.find('textarea#card_message'),
				limit = self.messageMax,
				limitLine = self.lineMax,
				prevText = myTemplt.find('span#pw-message');

			$(chars).html(limit);

			function getLines( element ){
				var text = $(element).val(),
					lines = text.split(/\r|\r\n|\n/);
				return lines.length;
			}

			mBox.on('keyup keydown paste', function( e ){
				var n = mBox.val().length,
					l = getLines(mBox);

				//replace "<" and ">" for "(" and ")"
				mBox.val(mBox.val().replace('<', '(').replace('>', ')'));

				if( n <= limit ){
					$(chars).html(limit - n);
				}else{
					var text = mBox.val().substr(0, limit);
					$(this).val(text);
				}

				if( l <= limitLine ){
					$(charsLine).html(limitLine - l);
				}else{
					var textLines  = mBox.val().split("\n");

					//remove last line
					textLines.pop();
					textLines = textLines.join("\n");
					$(this).val(textLines);
				}

				//update the text in the preview window
				$(self.elem).find('span#pw-message').html( $(this).val().replace(/\r?\n/g, '<br>') );
			});

			self.cTemplate = myTemplt;
		},

		// Turn on the autocomplete attribute for all inputs
		autoComplete: function(){
			$(document).trigger('functionIt', 'autoComplete');
			$('input').attr('autocomplete', 'on');
		},

		// Run buyalytics plugin
		analytics: function(){
			$(document).trigger('functionIt', 'analytics');
			var self = this,
				sAnalytics = self.settings.Merchant.Analytics;

			if(sAnalytics.Enabled){

				window.buyalytics = window.buyalytics || [];

				// buyalitics array ahs a push event prototype. Merchant name sent witn no scpaces and bracketsse
				window.buyalytics.push({id: sAnalytics.Id, name: self.settings.Merchant.Name.replace(/[\s]+/gi, ''), type: sAnalytics.Type});

				// self.$elem.buyalytics({Id: sAnalytics.Id, name: self.settings.Merchant.Name.replace(/[\s]+/gi, ''), type: sAnalytics.Type, language: self.settings.Merchant.Language, mobile: self.settings.Merchant.IsMobile });
			}
		},

		//add the pobox class to the shipping address
		checkPOBox: function(){
			$(document).trigger('functionIt', 'allowPOBox');
			var self = this,
				myTemplt = self.cTemplate,
				noPOBox = (typeof(self.allowPOBox) == 'undefined') ? true : self.allowPOBox;

			if(!noPOBox){
				myTemplt.find('#plastic_address, #plastic_address2').addClass('nopobox');
			}
		},

		// Prevent user to type leters.Good for number class on inputs
		numbersOnly: function(){
			$(document).trigger('functionIt', 'numbersOnly');
			var self = this,
				myTemplt = self.cTemplate,
				nFields = myTemplt.find('input.number');

			nFields.each(function(){
				$(this).on('keyup', function(){
					$(this).val( $(this).val().replace(/[^0-9]/g,'') );
				});
			});
		},

		// Prevent user to type anything but phone chars. Good for phone class on inputs
		phoneOnly: function(){
			$(document).trigger('functionIt', 'phoneOnly');
			var self = this,
				myTemplt = self.cTemplate,
				nFields = myTemplt.find('input.phone, input.sms');

			nFields.each(function(){
				$(this).on('keyup', function(){
					this.value = this.value.replace(/[^0-9+ \.\(\)\x-]/g,'');
				});
			});
		},

		// Manages the card values and create the buttons based on the range parsed from API
		getValues: function(){
			$(document).trigger('functionIt', 'getValues');
			var self = this,
				myTemplt = $( self.cTemplate ),
				values = self.settings.Amount.Range.split(','),
				vSize = values.length,
				iAmount = self.settings.Amount.InitialAmount,
				minValue = self.settings.Amount.MinVal,
				lang = self.settings.Merchant.Language,
				maxValue = self.settings.Amount.MaxVal,
				vCont = myTemplt.find('input#card_value')
									.val(iAmount)
									.on('blur', function(){
										if($(this).val() < minValue){
											$(this).val(minValue);
											previewVal.html( self.getMoney($(this).val()) );
											$(this).parents('div.field')
												.find('div.field-error')
													.html( self.Language.errors.value +  self.getMoney(minValue) );
										}

										if($(this).val() > maxValue){
											$(this).val(maxValue);
											previewVal.html( self.getMoney($(this).val()) );
											$(this).parents('div.field')
												.find('div.field-error')
													.html( self.Language.errors.maxvalue +  self.getMoney(maxValue) );
										}
									})
									.on('blur change', function(){
										if(lang !== 'fr'){
											// $(this).val( self.numberWithCommas( $(this).val() ) )
										}
									}),
				previewVal = $(self.elem).find('span#pw-value')
									.html(self.getMoney(iAmount)),
				vWrap = myTemplt.find('div.values-wrap'),
				html = '',
				vType = self.valueType;

			vCont.on('keyup', function(){
				previewVal.html( self.getMoney($(this).val()) );

			});
			if( (vSize <= 5 && self.settings.Amount.Open && vType == 'buttons') || self.b2b){
				var dollar = (self.showDollar) ? self.moneySign : '';

				//resize array for b2b
				if(self.b2b){
					while (values.length > 5){
						values.splice(0, 1);
					}
				}

				$(values).each(function( i, e ){
					$('<a></a>', {
					html: (lang == 'fr') ? self.numberWithCommas(e) + dollar : dollar + self.numberWithCommas(e), //if french... Call Chine!
					href: 'javascript:void(0)'
				}).addClass('half-button')
					.on('click', function( event ){
						event.preventDefault();
						$(vCont).val( (lang == 'fr') ?  e : self.numberWithCommas(e) );
						previewVal.html( self.getMoney(e) );

					//remove validation error
					$(vCont).parents('div.field')
								.removeClass('validation-error')
								.find('div.field-error')
									.html('');
					})
					.appendTo(vWrap);
				});

				var valueTxt =  self.IsMobile ? self.Language.customize.detail.value_mobile : self.Language.customize.detail.value;
				vCont.parent()
						.find('div.field-detail')
						.html( valueTxt +
								self.getMoney(minValue) + " - " + self.getMoney(maxValue) );
			}else{
				// Generate a selector
				var selector = $('<select />', {
						id: 'card_value'
					}).addClass('required ammount number')
						.attr('name', 'card_value')
						.prependTo( vCont.parent() ),
					output = [];

				$(values).each(function( i, e ){
					var eText = self.getMoney(e); //(lang == 'fr') ? e + '$' :'$' + e;

					// if (i === 0){
						// previewVal.html( e );
					// }

					if(e == self.settings.Amount.InitialAmount){
						output.push('<option selected="selected" value="' + e + '">' + eText + '</option>');
					}else{
						output.push('<option value="' + e + '">' + eText + '</option>');
					}
				});

				selector.html(output.join(''))
						.on('change', function(){
							previewVal.html( self.getMoney($(this).val()) );
						});

				vCont.parent().find('div.field-detail')
								.html( self.Language.customize.detail.value2);

				vCont.parent().find('span').remove();
				vCont.remove();
			}
		},

		//Check ini file for additional charges and proceed with changes
		checkAdditionalCharges: function(){
			$(document).trigger('functionIt', 'checkAdditionalCharges');
			var self = this,
				myTemplt = $( self.cTemplate ),
				chargeType = self.settings.Merchant.AddChargeType || 0,
				chargePerCard = self.settings.Merchant.ChargeForCustomCard || 0;

			switch( chargeType ){
				case 0: //nothing
					//
				break;
				case 1: //donation
					// actions
				break;
				case 2: //Plastic photoCard Additional Charge
					var value = (self.settings.Merchant.Language == 'fr') ? self.getMoney(chargePerCard.toFixed(2)).replace('.', ',') : self.getMoney(chargePerCard.toFixed(2));
					// Update label for plastic photoCard
					myTemplt.find('#upload-photo > p').append(self.Language.customize.text.additional_charge.replace('$$$', value ) /*+ ' (' + value + ')'*/);

				break;
				default:
					// actions
			}
		},

		// Transform external links into lightbox windows
		forceLigtBox: function(){
			$(document).trigger('functionIt', 'forceLigtBox');
			var self = this,
				myTemplt = $( self.cTemplate ),
				links = myTemplt.find('a[onclick]');

			if(!self.IsMobile){

				try{

					$.each(links, function(i, e){
						var script = $(e).attr("onclick"),
							reg = /open\(\'([^\']+)\'/,
							wOpen = script.match(reg),
							url = wOpen[1];

							$(e).attr("onclick", null);
							$(e).attr("target", null);

							$(e).data('url', url);
						});

					$(links).on('click', function(event){
						event.preventDefault();
						self.lightBoxIt( $(this).data('url'), $(this).html().replace(/^./, $(this).html()[0].toUpperCase()) );
					});
				}catch(e){
					console.log(e);
				}
			}
		},

		//Show url in a lightbox
		lightBoxIt: function( url, title, lbHeight ){
			$(document).trigger('functionIt', 'lightBoxIt');
			var self = this,
				lbWindow = $('<div id="lightbox" />').css({
					position: 'relative',
					height: lbHeight || '400px',
					width: '600px'
				}),

				button_ok = 'Ok',
				dialog_buttons = {};

			// console.log(self.currentURL + '/gcp/' + url);
			if(self.validURL(self.currentURL + '/gcp/' + url)){
				lbWindow.load(self.currentURL + '/gcp/' + url);
			}else{
				lbWindow.html(url);
			}

			if((window.navigator.userAgent).indexOf("MSIE ") > 0){
				window.open(url, '_blank');
			}else{
				dialog_buttons[button_ok] = function(){
					$( this ).dialog( "close" );
				};

				$( '<div></div>' )
				.html(lbWindow)
				.dialog({
					position: [self.$elem.width() / 2 - (this.width / 2), 200],
					title: title,
					resizable: true,
					modal: true,
					minHeight: lbHeight || 500,
					minWidth: 640,
					maxHeight: lbHeight + 100 || 600,
					maxWidth: 700,
					buttons: dialog_buttons
				});
			}
		},

		validURL: function(str) {
			var pattern = new RegExp('\.html|\.htm$','i');
			if(!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		},

		// get value converted to language (french)
		getMoney: function(value) {
			$(document).trigger('functionIt', 'getMoney');
			var self = this,
				lang = self.settings.Merchant.Language;

			return (lang == 'fr') ? value + ' ' + self.moneySign : self.moneySign + '' + self.numberWithCommas(value);
		},

		// format number using "," after 1000 => 1,000
		numberWithCommas: function(x) {
			$(document).trigger('functionIt', 'numberWithCommas');
			var self = this;
			if(self.settings.Merchant.Language == 'fr'){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "");
			}
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		// Gets the contact number from setting and update footer
		getContact: function(){
			$(document).trigger('functionIt', 'getContact');
			var self = this,
				myTemplt = self.cTemplate,
				numberSpan = myTemplt.find('footer span#contact-number');

			numberSpan.html('<a href="tel:' + self.settings.Merchant.ContactNumber + '">' + self.settings.Merchant.ContactNumber + '</a>');
			self.cTemplate = myTemplt;
		},

		//hidequantity field if quantityPerCard = 1
		quantityPerCard: function(){
			$(document).trigger('functionIt', 'quantityPerCard');
			var self = this,
				myTemplt = $( self.cTemplate ),
				qField = myTemplt.find('div.quantity'),
				qpc = self.settings.Merchant.QuantityPerCard || self.settings.Merchant.MaxCards;

			if(qpc == 1){
				qField.hide();
			}else{
				qField.show();
				$('input#card_quantity').spinner('option', 'max', qpc);
			}
		},

		// Get total number or available cards for mobile
		getQuantity: function(){
			$(document).trigger('functionIt', 'getQuantity');
			var self = this,
				myTemplt = $( self.cTemplate ),
				availableCards = self.MaxCards - self.totalCards;

			if(self.IsMobile){
				var field = $('select#card_quantity'),
					html = '';

				if(availableCards > 0){
					for(var i = 1; i <= availableCards; i++){
						html = html + "<option  value='" + i +"''>" + i + "</option>" ;
					}
				}else{
						html = html + "<option  value='0'>0</option>" ;
				}

				field.html(html);
			}
			self.checkQuantity();

			// for photoCard we move the quantity field away from the card selector area
			if(self.checkPhotoOrientations() > 1){
				var quantField = myTemplt.find('#card-selector #card_quantity').parents('.half-field').removeClass('half-field').addClass('field'),
					valueField = myTemplt.find('#card_value').parents('.field');

				quantField.find('label, .field-error').wrapAll('<div class="field-left"></div>');
				quantField.find('.field-left').siblings('div').addClass('field-right');
				valueField.after(quantField);
			}
		},

		//Check number of available cards
		checkQuantity: function(){
			$(document).trigger('functionIt', 'checkQuantity');
			var self = this,
				myTemplt = $( self.cTemplate ),
				availableCards = self.MaxCards - self.totalCards,
				qpc = self.settings.Merchant.QuantityPerCard || self.settings.Merchant.MaxCard,
				field = $('#card_quantity'),
				qField = $('div.quantity');

			if(availableCards > 0){
				// qField.show();
				$('input#card_quantity').spinner('option', 'min', 1);
				$('input#card_quantity').spinner('option', 'max', Math.min(availableCards, qpc));
				// field.val(1);
			}else{
				$('input#card_quantity').spinner('option', 'min', 0);
				field.val(0);
				// qField.hide();
			}
		},

		// Set the quantity input
		setQuantity: function(){
			$(document).trigger('functionIt', 'setQuantity');
			var self = this,
				myTemplt = $( self.cTemplate ),
				qpc = self.settings.Merchant.QuantityPerCard || self.settings.Merchant.MaxCard;
			if(!self.IsMobile){
				myTemplt.find('input#card_quantity').spinner({
					min: 1,
					max: self.MaxCards  - self.totalCards,
					step: 1
				})
				.on('blur', function(e) {
					var availableCards = self.MaxCards - self.totalCards;
					if ($(this).val() === '' || parseInt($(this).val(), 10) === 0 ) {
						$(this).val(1);
						$(this).parents('div.quantity')
						.find('div.field-error')
						.html(self.Language.errors.quantity);
					}
					if (parseInt($(this).val(), 10) > availableCards) {
						$(this).val(availableCards);
						$(this).parents('div.quantity')
							.find('div.field-error')
							.html(self.Language.errors.quantity + (availableCards) );
					}
					$('input#card_quantity').spinner('option', 'max', Math.min(availableCards, qpc));
					// if(availableCards == 0){
					// $('div.quantity').hide();
					//// $('input#card_quantity').spinner('option', 'min', 0);
					// }else{
					// $('div.quantity').show();
					// }

					self.checkQuantity();
				});
			}

			self.cTemplate = myTemplt;
		},

		// Get countries from the API and populate select
		getCountry: function(){
			$(document).trigger('functionIt', 'getCountry');
			var self = this,
				myTemplt = self.cTemplate,
				cSelectCC = myTemplt.find('select#cc_country'),
				cSelectPlastic = myTemplt.find('select#plastic_country'),
				defaultCountry = self.settings.Merchant.CountryId || 2,
				html1 = '',
				html2 = '';

			$.ajax({
				url: self.currentURL + '/gcp/services/BuyatabWS.asmx/GetCountries',
				type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json"
			}).done(function( data ){
				var countryList = data.d;

				$.each(countryList, function(i, e) {
					// console.log(e);
					//Canada as default
					if (e.Id == defaultCountry) {
						html1 = html1 + '<option selected="selected" value="' + e.Id + '">' + e.Name + '</option>';
					} else {
						html1 = html1 + '<option value="' + e.Id + '">' + e.Name + '</option>';
					}
				});
				cSelectCC.html( html1 ).trigger('change');
			});

			$.ajax({
				url: self.currentURL + '/gcp/services/BuyatabWS.asmx/GetShippingCountries',
				type: "POST",
                contentType: "application/json; charset=utf-8",
				data: "{merchantId:" + self.MerchantId + "}",
                dataType: "json"
			}).done(function( data ){
				var countryList = data.d;
				// console.log(countryList);

				$.each(countryList, function(i, e) {
					//Canada as default
					if (e.Id == defaultCountry) {
						html2 = html2 + '<option selected="selected" value="' + e.Id + '">' + e.Name + '</option>';
					} else {
						html2 = html2 + '<option value="' + e.Id + '">' + e.Name + '</option>';
					}
				});
				cSelectPlastic.html( html2 ).trigger('change');

				if(countryList.length == 1){
					//disable dropdown if we have only one country
					cSelectPlastic.attr('disabled', 'disabled');
				}
			});
		},

		// Change states acording to country
		getState: function( countryField, stateField, zipField ){
			$(document).trigger('functionIt', 'getState');
			var self = this,
				myTemplt = $( self.cTemplate ),
				country = myTemplt.find('select#' + countryField),
				states = myTemplt.find('select#' + stateField),
				zip = myTemplt.find('input#' + zipField),
				sParents = states.parent(),
				html = '';

			country.on('change', function( e, selectedId ){

				var myData = parseInt( country.val(), 10 );

				//change the zip/postal code validation => CA x US
				switch( myData ){
						case 1: //US
						zip.addClass('zipus');
						zip.removeClass('zipca');
						break;
						case 2: //Canada
						zip.removeClass('zipus');
						zip.addClass('zipca');
						break;
						default:
						zip.removeClass('zipus');
						zip.removeClass('zipca');
					}

					$.ajax({
						url: self.currentURL + '/gcp/services/BuyatabWS.asmx/GetRegionsByCountry',
						type: "POST",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						data: "{country_id:" + JSON.stringify(myData) + ", language:" + JSON.stringify(self.settings.Merchant.Language) + "}"
					}).done(function( data ){
						var regions = data.d;
						if( regions ){
							if(regions.length == 1){
							//not null but with a region code

							if( $('input#' + stateField).length === 0 ){
								$('<input />', {
									type: 'text',
									'data-region': regions[0].Id
								}).attr('id', stateField).addClass('required')
								.prependTo( sParents );
								states.remove();
								$('select#' + stateField).remove();
							} else {
								$('input#' + stateField).attr('data-region', regions[0].Id);
							}
						}else{
							// it has a nice list of regions

							//if the select was removed, create a brand new one!
							if ($('select#' + stateField).length === 0) {
								$('<select  />', {}).attr('id', stateField).addClass('required')
								.prependTo( sParents );
								$('input#' + stateField).remove();
							}

							$(regions).each(function(i, data) {
								var pSelected = '';

								if( selectedId && (data.Id == selectedId.id) ){
									pSelected = 'selected="selected"';
								}

								html = html + '<option value="' + data.Id + '" ' + pSelected +'>' + data.Name + '</option>';
							});

							states.html(html);
							$('select#' + stateField).html(html);
							html = '';
						}
					}else{
						if( $('input#' + stateField).length === 0 ){
							$('<input />', {
								type: 'text',
								'data-region': 84
							}).attr('id', stateField).addClass('required')
							.prependTo( sParents );
							states.remove();
							$('select#' + stateField).remove();
						}else{
								console.log('7');
							$('input#' + stateField).attr('data-region', 84);
						}
					}
				})
				.fail(function(e){
					console.log(e); //fail? Use a text input!

					if( $('input#' + stateField).length === 0 ){
						$('<input />', {
							type: 'text',
							'data-region': 84
						}).attr('id', stateField).addClass('required')
						.prependTo( sParents );
						states.remove();
						$('select#' + stateField).remove();
					}else{
						$('input#' + stateField).attr('data-region', 84);
					}
				});
			});
		},

		//get shipments from dB and dysplay as a drop down
		getPreBilling: function(){
			$(document).trigger('functionIt', 'getPreBilling');
			var self = this,
				myTemplt = $( self.cTemplate ),
				mainWrap = myTemplt.find('#checkout .fields'),
				originalWrap = myTemplt.find('#checkout #cc-info, #checkout #billing-info, #checkout #purchaser-info'),
				terms = myTemplt.find('#purchaser-info .terms-field'),
				nav = myTemplt.find('#purchaser-info .pages-nav'),
				hasBiling = self.preBilling;

			if(hasBiling){
				var addresses = self.options.userBillingInfo,
				html = '<option value= "-1">New Billing Information</option>',
				psParagraph = $('<p />', {html: 'You can select pre stored billing info or enter a new one.', css:{ width: '100%'}}),
				dbSelect = $('<select id="user-billing" />').on('change', function(){

					if($(this).val() != -1){
						$('#default-billing').hide();
						// pagNav.show();
						$('#default-billing').addClass('ignore-validation');

						//to keep tracking on app.submit
						self.userBillingSelected = true;
						$('#save-billing').hide();
						$('#save-billing-label').hide();
					}else{
						$('#default-billing').show();
						self.userBillingSelected = false;
						$('#default-billing').removeClass('ignore-validation');
						$('#save-billing').show();
						$('#save-billing-label').show();
					}
				});

				$.each(addresses, function( index, element ){
					html = html + '<option value= "' + element.Id +'">' + element.Description + '</option>';
				});

				dbSelect.html(html);

				//wrap elements into a div
				mainWrap.prepend($('<div id="default-billing" class="dynamic-panel"/>').append(originalWrap))
                             .prepend($('<div id="user-billing" class="dynamic-panel"/>')
								.append(psParagraph, dbSelect)).append(terms, nav);
			}

			//b2b and ???
			if(self.b2b && self.PurchaseId == 6){
				terms.prepend('<div><input type="checkbox" id="save-billing" /><label id="save-billing-label" for="save-billing">Save Billing information</label></div>');
			}
		},

		//get shipments from dB and dysplay as a drop down
		getPreShipping: function(){
			$(document).trigger('functionIt', 'getPreShipping');
			var self = this,
				myTemplt = $( self.cTemplate ),
				deliveryTitle = myTemplt.find('#delivery-info > h2'),
				originalWrap = myTemplt.find('#delivery-info #delivery-type, #delivery-info #delivery-content'),
				pagNav = myTemplt.find('#delivery-info > .pages-nav'),
				validationGroups = myTemplt.find('#dc-plastic'),
				hasShip = self.preShipping,
				saveShipping = '';

			//b2b and ???
			if( self.b2b && (self.PurchaseId == 6 || self.PurchaseId == 7) ){
				saveShipping = $('<div class="terms-field no-border"><input type="checkbox" id="save-shipping" /><label id="save-shipping-label" for="save-shipping">Save shipping information</label></div>');
			}

			if(hasShip && self.settings.Merchant.IsPlastic){
				var addresses = self.options.userShippingAddresses,
				html = '<option value= "-1">New address</option>',
				psParagraph = $('<p />', {html: 'You can select pre stored shipments or enter a new one.', css:{ width: '100%'}}),
				dbSelect = $('<select id="user-address" />').on('change', function(){
					if($(this).val() != -1){
						self.fillShipping(self.options.userShippingAddresses[$(this).val()]);
						//to keep tracking on app.submit
						self.userAddressSelected = true;
						$('#save-shipping').hide();
						$('#save-shipping-label').hide();
					}else{
						self.clearShipping();
						self.userAddressSelected = false;
						$('#save-shipping').show();
						$('#save-shipping-label').show();
					}
				});

				$.each(addresses, function( index, element ){
					html = html + '<option value= "' + index +'">' + element.Address1 + '</option>';
				});

				dbSelect.html(html);

				//wrap elements into a div
				deliveryTitle.after($('<div id="default-shipment" class="dynamic-panel"/>').append(originalWrap))
                             .after($('<div id="user-shipment" class="dynamic-panel"/>').append(psParagraph, dbSelect));

			}

            validationGroups.append(saveShipping);

		},

		//fil address from previews stored address
		fillShipping: function( address ){
			var self = this;

			// console.log(address);
			$('#plastic_recipient_name').val(address.RecipientName);
			$('#plastic_recipient_phone').val(address.Phone);
			$('#plastic_from_name').val(address.FirstName + ' ' + address.LastName);
			$('#plastic_address').val(address.Address1);
			$('#plastic_address2').val(address.Address2);
			$('#plastic_city').val(address.City);
			$('#plastic_zip').val(address.PostalZip);


			// $('select#plastic_country option').attr('selected', false);
			$('select#plastic_country option').filter(function() {
				// console.log($(this));
				// console.log(address.CountryId);
				return $(this).val() == address.CountryId;
			}).attr('selected', true);

			$('select#plastic_country').trigger('change', [{id:address.RegionId}]);
		},

		//clear shiping fields
		clearShipping: function(){
			var self = this;

			$('#dc-plastic input').val('');
		},

		// Waits for the mailShipping event and execute
		getMailShipping: function(){
			$(document).trigger('functionIt', 'getMailShipping');
			var self = this,
				html = '',
				lang = self.Language.customize.plastic,
				eaDetails = $('<p />').addClass('shipping-details'),
				qpc = self.settings.Merchant.QuantityPerCard || self.settings.Merchant.MaxCards,
				myParagraph = $('<p />',{
					id: 'mail-description',
					html: lang.text.new_address
				}),
				eShipment = $('<select />', {
					id: 'existing-address'
				}).on('change', function(){
					// console.log(self.mailShipping[$(this).val()]);
					if($(this).val() != -1){
						var i = $(this).val(),
							address2 = self.mailShipping[i].Shipment.ShippingAddress.Address2,
							separator = (address2 === '') ? '' : ' - ',
							value = (self.settings.Merchant.Language == 'fr') ? self.getMoney( self.mailShipping[i].Shipment.ShippingOption.Cost ).replace('.', ',') : self.getMoney( self.mailShipping[i].Shipment.ShippingOption.Cost );

						$('div#new-shipment').hide();
						$('div#new-shipment').find('input').addClass('dont-validate');

						html =  self.mailShipping[i].Shipment.ShippingAddress.RecipientName + ', ' +
								address2 + separator +
								self.mailShipping[i].Shipment.ShippingAddress.Address1 + ', ' +
								self.mailShipping[i].Shipment.ShippingAddress.City + ', ' +
								self.mailShipping[i].Shipment.ShippingAddress.Region +
								'<span>' + lang.text.shipping_option +
								': ' +  self.mailShipping[i].Shipment.ShippingOption.Type +
								' - ' + value;
						eaDetails.html(html);

					}else{
						$('div#new-shipment').show();
						$('div#new-shipment').find('input').removeClass('dont-validate');
						eaDetails.html('');
					}
					self.handleButtons(0);
				});

			$(document).on('mailShipping', function(){

				var html = '<option value= "-1">' + self.Language.customize.plastic.label.new_address + '</option>';
				$.each(self.mailShipping, function( i, e ){
					html = html + '<option value= "' + i +'">' + e.Shipment.ShippingAddress.Address1 + '</option>';
				});

				eShipment.html(html);

				if( $('div#plastic-shipment #existing-address').length > 0 ){

					if(qpc > 1){
						eShipment.appendTo('div#plastic-shipment');
					}

				}else{
					if(qpc > 1){
						eShipment.prependTo('div#plastic-shipment');
						myParagraph.prependTo('div#plastic-shipment');
						eaDetails.insertAfter('div#plastic-shipment');
					}
				}

				$('div#new-shipment').show();
				$('div#new-shipment').find('input').removeClass('dont-validate');
				self.handleButtons(0);
			});
		},

		// Append a span (optional) to the optional (class) fields labels
		optizeIt: function(){
			$(document).trigger('functionIt', 'optizeIt');
			var self = this,
				myTemplt = $( self.cTemplate ),
				optional = myTemplt.find('.optional');

			$(optional).each(function() {
				$(this).parents('.field').find('label').append( (self.settings.Merchant.Language == 'fr') ? '<span>(facultatif)</span>' : '<span>(optional)</span>');
			});
		},

		// Split field goups into steps
		splitGroups: function(){
			$(document).trigger('functionIt', 'splitGroups');
			var self = this,
				myTemplt = self.cTemplate,
				//nav fields
				navFields = myTemplt.find('div.customize-nav, div.checkout-nav'),
				mainFields = myTemplt.find('div.pages-nav'),

				//fields li
				fields = myTemplt.find('ul.fields'),
				split = self.settings.Merchant.SFP;

			if(split === true){

				var sub = 1;
				$.each(fields, function(){
					var field = $(this),
						lis = field.children('li');
						i = 1;

					lis.each(function(ind){
						$(this).attr('data-substep', 'sub' + sub );
						i++;
						sub++;
					});
					// field.css({ 'width': self.stepWidth * i * 2 });
				});
			}else{ //don't split
				//Hide the buttons
				navFields.hide();
				mainFields.find('a.back-to-purchaser-info, a.back-to-card').hide();

				if(self.settings.Merchant.confirmationPage){
					mainFields.find('a.back-to-purchaser-info').show();
				}
			}
			self.cTemplate = myTemplt;
		},

		// Append template to the element
		appendTemplate: function(){
			$(document).trigger('functionIt', 'appendTemplate');
			var self = this;
			self.$elem.append( self.cTemplate);
		},

		// Uses backbone to manipulate the cart
		manipulateCart: function() {
			$(document).trigger('functionIt', 'manipulateCart');
			var self = this,
				viewHelper = {
					getAmount: function(amount) {
						return self.numberWithCommas(amount);
					},
					isPlastic: function( type, shipping ){
						if(type == 'plastic'){
							// return '(+' + self.getMoney(shipping) + ')';
							return '';
						}
						return '';
					}
				};

			App.Models.Card = Backbone.Model.extend({
				defaults: {
					StyleId: "",
					Amount: 100,
					Quantity: 1,
					CardImg: "",
					Message: "",
					MerchantId: 1,
					DesignType: "default",
					Orientation: "bottom",
					Delivery: {
						DeliveryDate: "",
						DeliveryDateUTC: "",
						DeliveryType: "",
						Persons: [{
							Type: "Recipient",
							Name: "123",
							Email: "123",
							FB: "123"
						}, {
							Type: "Sender",
							Name: "456",
							Email: "456",
							FB: "456"
						}]
					},

                    Shipment: {
                        Key: 0,

                        ShippingOption: {
							Cost: 0,
							Type: ""
						},

                        ShippingAddress: {
							Address1: "",
							Address2: "",
							City: "",
							PostalZip: "",
							RegionId: 0,
							Region: "",
                            CountryId: 0,
                            RecipientName: "",
                            Phone: ""
                        }
                    },

                    PersonalizedEnclosure: {
                        Key: 0,
                        Enclosure_Id: 0,
                        To: "",
                        From: "",
                        Message: ""
                    }
				}
			});

			App.Collections.Cart = Backbone.Collection.extend({
				model: App.Models.Card,

				initialize: function(){
					this.on('add change', this.render, this);
					this.on('destroy', this.render, this);
				},

				render: function(){

					//update step > back to first step if cart is empty
					this.updateStep();
					//update Summary
					this.updateSummary();
					//update checkout button
					this.updateCartButton();
					//update the header notification
					this.updateHeader_();
					//Update the global variable
					window.Cart = this.toJSON();
					//Save cart to local storage
					this.setStorage();
					//update quantity field (show/hide)
					this.updateQuantity();
				},

				updateHeader_: function(){
					self.notificateHeader(this.length);
				},

				updateQuantity: function(){
					self.checkQuantity();
				},

				updateCartButton: function(){//and  Sumary
					if(this.length === 0){
						$('a.checkout').hide();
						if (self.settings.Merchant.EC) {
							$('a.new-card').hide();
						}
						$('div#cards-wrapper').addClass('no-ew-arrows');
						$('div#cart-embed button.ew-arrow').hide();
					}else{

						if(self.settings.Merchant.EC){
							//hide checkout button from the checkout page
							if (self.currentPage == 'checkoutpage' || self.currentPage == 'billing' || self.currentPage == 'purchaser') {
								$('a.checkout').hide();
							}else{
								$('a.checkout').show();
							}

							if(this.length > self.cartScroll){
								$('div#cart-embed button.ew-arrow').show();
								$('div#cards-wrapper').removeClass('no-ew-arrows');
							}else{
								$('div#cart-embed button.ew-arrow').hide();
								$('ul#cards').css('margin-top', 0);
								$('div#cards-wrapper').addClass('no-ew-arrows');
							}
						}else{
							$('li#cart button.ew-arrow').hide();
						}
					}
				},

				updateSummary: function(){
					if(this.length === 0){
						$('div#summary').html(self.Language.cart.text.empty);
					}else{
						var models = this.toJSON(),
							subTotal = 0,
							shipTotal = 0,
							packTotal = 0,
							total = 0,
							hasPlastic = false,
							plastics = [],
							plasticsCost = [],
							html = '',
							totalCards = 0,
							pDiscount = 0;

						self.totalAdditionalCharge = 0;

						for (var i = 0; i < models.length; i++) {
							subTotal = subTotal + (models[i].Amount * models[i].Quantity);
							totalCards += parseInt(models[i].Quantity, 10);


							if(self.hasEnclosure){
								packTotal += parseFloat(models[i].PersonalizedEnclosure.Cost) * models[i].Quantity;
							}

							//check for plastic cards
							if(models[i].Delivery.DeliveryType == 'plastic'){
								hasPlastic = true;

								if( $.inArray(models[i].Shipment.Key, plastics) == -1 ){
									plastics.push(models[i].Shipment.Key);
									plasticsCost.push(models[i].Shipment.ShippingOption.Cost);
								}
							}

							//check for photo cards
							if(models[i].DesignType == 'photo'){
								//if it gets additional charges
								if(self.settings.Merchant.AddChargeType == 2){
									//add it to the total
									self.totalAdditionalCharge += self.settings.Merchant.ChargeForCustomCard * models[i].Quantity;
								}
							}
						}

						// console.log(self.totalAdditionalCharge);

						for(var i2 = 0; i2 < plastics.length; i2++){
							shipTotal = shipTotal + plasticsCost[i2];
						}

						total = subTotal + shipTotal + self.totalAdditionalCharge;
						self.cartTotal = total;

						self.totalCards = totalCards;
						$('input#card_quantity').spinner('option', 'max', self.MaxCards  - self.totalCards);
						self.getQuantity();

						var jLoader = $('<span />', {
							html: self.Language.dialogs.processing
						}).addClass('ajax-loader');

						//loader
						$('div#summary').html(jLoader);

						$.when(self.getDiscount( total )).then(function( discount ){
							discount = -Math.abs(discount.d);
							pDiscount = discount;
							var cTotal = 0;

							self.summary = {
								sub_total:   subTotal,
								shipping_total:   shipTotal,
								enclosure:  packTotal,
								discount:   discount,
								add_charges: self.totalAdditionalCharge
							};

							$.map(self.summary, function(value, key) {
								if(value !== 0){
									cTotal += value;
								}
							});

							$('a.checkout, a.new-card').css('display', 'block');
							$('div#summary').html( self.summaryHtml() );

							//Summary extra page
							$('div.cw-order span').html( self.getMoney( self.numberWithCommas(subTotal.toFixed(2)) ) );
							$('div.cw-shipping span').html( self.getMoney( self.numberWithCommas(shipTotal.toFixed(2)) ) );
							$('div.cw-additional span').html( self.getMoney( self.numberWithCommas(self.totalAdditionalCharge.toFixed(2)) ) );
							$('div.cw-discount span').html(self.getMoney( self.numberWithCommas(pDiscount.toFixed(2)) ));
							$('div.cw-total span').html( self.getMoney( self.numberWithCommas(cTotal.toFixed(2)) ) );
							//summary pages end

							self.total = total;
						});


					}
				},

				updateStep: function(){
					if(this.length === 0){
						self.moveIt( ['customize'] );
					}
				},

				setStorage: function(){
					self.cart = this.toJSON();
					if(typeof(Storage)!=="undefined"){
						try {
							localStorage.setItem( 'cart' + getParam( 'id' ), JSON.stringify( self.cart ) );
						} catch (err) {
							if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {

							}
						}
					}
				}
			});

			App.Views.Cart = Backbone.View.extend({
				// tagName: 'ul', // div now

				initialize: function() {
					this.collection.on('change', this.render, this);
					this.collection.on('add', this.addOne, this);
					this.getStorage();
				},

				render: function() {
					// this.collection.each(this.addOne, this);
					return this;
				},

				addOne: function(card) {
					var cardView = new App.Views.Card({ model: card });

					//send event to GA
					$(window).trigger('addToCart', card.toJSON());
					this.$el.append(cardView.render().el);
					this.render();
				},

				//Load local storage an adds to collection
				getStorage: function(){
					if( typeof(Storage)!=="undefined" && self.PurchaseId != 6 && self.PurchaseId != 7 ){
						try{
							var eDate = (self.IsMobile) ? Date.parse( ( $('input#email_delivery_date').val() ).replace(/[-]/g, '/') ) : Date.parse( $('input#email_delivery_date').val() ),
								myDate = '';
							if(eDate){
								myDate = new Date(eDate).toDateString();
							}

						}catch (error){
							myDate = self.today;
							eDate = Date.UTC(self.year, self.month, self.day);
						}
							var lCart = JSON.parse( localStorage.getItem('cart' + getParam( 'id' ) ) ),
								self2 = this,
								card,
								button_yes = self.Language.dialogs.yes,
								button_no = self.Language.dialogs.no,
								dialog_buttons = {};

						dialog_buttons[button_yes] = function(){
							$.each(lCart, function( i, e ){
								// now they all have date!
								lCart[i].Delivery.DeliveryDate = myDate;
								lCart[i].Delivery.DeliveryDateUTC = eDate;
								if(lCart[i].Delivery.DeliveryType == 'plastic'){
									self.pushAddress(lCart[i]);
								}
							});

							var pArray = $.grep(lCart, function( n, i){
								// return everything but photo cards
								return (n.DesignType != 'photo');

							}, false);

							if(pArray.length > 0){
								$(window).trigger('anaLog', '[GCP] localStorage');
								self2.collection.add( pArray );
								//if no embeded cart move to cart page
								if(!self.settings.Merchant.EC){
									self.moveIt(['editcart']);
								}
							}else{
								alert(self.Language.photo.errors.local_storage);
								// alert('Some or all of the images for photoCard are no longer available.');
								try {
									localStorage.removeItem( 'cart' + getParam( 'id' ) );
								} catch (err) {
									if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
								}
							}
							$( this ).dialog( "close" );
						};
						dialog_buttons[button_no] = function(){
							try {
								localStorage.removeItem( 'cart' + getParam( 'id' ) );
							} catch (err) {
								if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
							}
							$( this ).dialog( "close" );
						};

						if( lCart !== null && lCart.length > 0 && !self.settings.Merchant.PhotoCard.PhotoOnly){
							if( self.psCard == 'null' ){
								$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
									var aa = $( '<div></div>' )
										.html(self.Language.dialogs.load_local)
										.dialog({
											position: [self.$elem.width() / 2 - (this.width / 2), 200],
											resizable: false,
											modal: true,
											buttons: dialog_buttons
										});

								});
							}else{
								// console.log('self.psCard not null')
								$.each(lCart, function( i, e ){
									// now they all have date!
									lCart[i].Delivery.DeliveryDate = myDate;
									lCart[i].Delivery.DeliveryDateUTC = eDate;
									if(lCart[i].Delivery.DeliveryType == 'plastic'){
										self.pushAddress(lCart[i]);
									}
								});
								self2.collection.add( lCart );
							}
						}
					}
				}
			});

			App.Views.Card = Backbone.View.extend({
				tagName: 'li',

				template: self.uTemplate,

				initialize: function() {
					_.bindAll(this, 'render');
					this.initializeTemplate();

					this.model.on('change', this.render, this);
					this.model.on('destroy', this.remove, this);
				},

				initializeTemplate: function(){
					this.template = _.template( self.uTemplate );
				},

				events: {
					'click .edit'  : 'editCard',
					'click img'    : 'previewCard',
					'click .delete': 'destroy'
				},

				editCard: function(e) {
					var thisView = this,
						button_yes = self.Language.dialogs.yes,
						button_cancel = self.Language.dialogs.cancel,
						dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						self.editingMode = true;
						self.editingCard = false;
						self.moveIt( ['customize'] );
						App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
						// console.log(self.currentModel);
					},
					dialog_buttons[button_cancel] = function(){
						self.editingMode = false;
						$( this ).dialog( "close" );
					};
					if(self.editingCard === true){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
								.html(self.Language.dialogs.editing_card)
								.dialog({
									position: [self.$elem.width() / 2 - (this.width / 2), 200],
									resizable: false,
									modal: true,
									buttons: dialog_buttons
							});
						});
					}else{
						self.editingMode = true;
						self.editingCard = false;
						self.moveIt( ['customize'] );
						App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
					}
					// console.log(self.currentModel)
					self.checkQuantity();
				},

				//Display card preview
				previewCard: function(){
					var thisView = this,
						button_yes = self.Language.dialogs.yes,
						button_cancel = self.Language.dialogs.cancel,
						dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						self.editingCard = false;
						// self.moveIt( ['customize'] );
						// App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
						if(thisView.model.toJSON().DesignType == 'photo'){
							// editing deactivated for photo for now
							//image, photoCard, openCard, showValue, showMessage, value, message
							//self.cardPreview(thisView.model.toJSON().CardImg, true, null, null, null, thisView.model.toJSON().Amount, thisView.model.toJSON().Message);
							// console.log(thisView.model.toJSON());
						}else{
							App.prepareEditing(thisView);
							//self.cardPreview(thisView.model.toJSON().CardImg, false, null, null, null, thisView.model.toJSON().Amount, thisView.model.toJSON().Message);
							// $('div#preview-window-bg').show();
						}
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					if(self.editingCard === true){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
								.html(self.Language.dialogs.editing_card)
								.dialog({
									position: [self.$elem.width() / 2 - (this.width / 2), 200],
									resizable: false,
									modal: true,
									buttons: dialog_buttons
							});
						});
					}else{
						// App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
						self.editingCard = false;
						if(thisView.model.toJSON().DesignType == 'photo'){
							// editing deactivated for photo for now
							//self.cardPreview(thisView.model.toJSON().CardImg, true, null, null, null, thisView.model.toJSON().Amount, thisView.model.toJSON().Message);
						}else{
							// console.log(thisView.model.toJSON());
							// App.prepareEditing(thisView);
							//self.cardPreview(thisView.model.toJSON().CardImg, false, null, null, null, thisView.model.toJSON().Amount, thisView.model.toJSON().Message);
							// $('div#preview-window-bg').show();
						}
					}
					// console.log(thisView.model.toJSON().Delivery.Persons[0] )
				},

				destroy: function() {
					var thisView = this,

						button_yes = self.Language.dialogs.yes,
						button_cancel = self.Language.dialogs.cancel,
						dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						thisView.model.destroy();
						$( this ).dialog( "close" );
						$('.add-to-cart').show();
						$('.update-cart').hide();
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
						$( '<div></div>' )
							.html(self.Language.dialogs.delete_card)
							.dialog({
								position: [self.$elem.width() / 2 - (this.width / 2), 200],
								resizable: false,
								modal: true,
								buttons: dialog_buttons
						});
					});
					self.checkQuantity();
				},

				remove: function() {

					//Send event to GA
					$(window).trigger('removeFromCart', this.model.toJSON());

					this.$el.remove();
					self.checkQuantity();
				},

				render: function() {
					var data = this.model.toJSON();
					this.initializeTemplate();
					_.extend(data, viewHelper);

					var html = this.template(data);
					this.$el.html(html);
					return this;
				}
			});

			App.Views.AddCard = Backbone.View.extend({
				el: self.elem,

				events: {
					'click a.add-to-cart': 'submit', //add card
					'click a.update-cart': 'update', //save changes
					'change li#customize input, li#customize textarea': 'setEditing', //
					'click div.choose-card, ul.image-selector img, div.udBox a': 'setEditing', //self.editingCard = true
					'click a.purchase': 'purchase',
					'click a.checkout': 'checkout',
					'click a.get-shipment': 'checkPlastic',
					'click a.go-to-delivery': 'step1', // SFP > page 1
					'click a.go-to-cc-billing': 'step2', // SFP > page 2
					'click a.go-to-purchaser-info': 'step3' // SFP > page 3
				},

				step1: function(){
					// if( self.groupValidation( $('li#customize_card'), $('a.go-to-delivery') ) ) {
					if($('input#customize-type').val() == 'photo'){
						$('input#saved-photo').val($('#photo-in img').attr('src'));

						if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data'), $('a.go-to-delivery') ) ) {
							$.when(self.saveImage()).then(function(){
								self.moveIt( ['delivery'] );
							});
						}
					}else{
						if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data'), $('a.go-to-delivery') ) ) {
							self.moveIt( ['delivery'] );
						}
					}
				},
				step2: function(){
					if( self.groupValidation( $('li#cc-info'), $('a.go-to-cc-billing') ) ) {
						self.moveIt( ['billing'] );
					}
				},
				step3: function(){
					if( self.groupValidation( $('li#billing-info'), $('a.go-to-purchaser-info') ) ) {
						self.moveIt( ['purchaser'] );
					}
				},

				hideIt: function(){
					if(self.topSelector){
						$('#image-wrap').addClass('hide-it');
					}
				},

				showIt: function(){
					$('#image-wrap').removeClass('hide-it');
				},

				purchase: function() {
					if (self.groupValidation($('li#cc-info, li#billing-info, li#purchaser-info'), $('a.purchase')) && $('a.purchase').hasClass('dt-inactive') === false) {
						self.sendCheckout();
						$('a.purchase').on('click', function( e ){
							e.preventDefault();
						}).addClass('dt-inactive');
					}
				},

				checkout: function(){
					var button_yes = self.Language.dialogs.yes,
						button_cancel = self.Language.dialogs.cancel,
						dialog_buttons = {},
						self2 = this;

					if(self.cartTotal > 0){


						dialog_buttons[button_yes] = function(){
							$( this ).dialog( "close" );
							self.editingCard = false;

							//check if is b2b and promo
							if(self.b2b && self.PurchaseId == 7){
								self.cartToSummary();
							}else{

								self.moveIt( ['customize'] );
								self.moveIt( ['checkoutpage'] );
							}
							self2.hideIt();
						};

						dialog_buttons[button_cancel] = function(){
							$( this ).dialog( "close" );
						};

						if(self.editingCard === true){
							$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
								$( '<div></div>' )
								.html(self.Language.dialogs.editing_card)
								.dialog({
									position: [self.$elem.width() / 2 - (this.width / 2), 200],
									resizable: false,
									modal: true,
									buttons: dialog_buttons
								});
							});
						}else{
							//check if is b2b and promo
							if(self.b2b && self.PurchaseId == 7){
								self.cartToSummary();
							}else{
								// self.moveIt( ['customize'] );
								self.moveIt( ['checkoutpage'] );
							}
							this.hideIt();
						}
					}else{
						alert(self.Language.dialogs.negative_cart);
					}
				},
				checkPlastic: function() {
					if (self.groupValidation($('li#delivery-info li.validate'), $('a.get-shipment'))) {
						// self.moveIt( ['purchaser'] );
						self.getShipment();
					}
				},

				submit: function(e) {
					var card = new App.Models.Card( App.submit() ),
						slf2 = this,
						currentCart = slf2.collection.toJSON(),
						total = 0,
						maxTransaction = self.settings.Amount.MaxTransVal,
						dialog_buttons = {},
						button_ok = self.Language.dialogs.ok;

						//console.log(card);
					dialog_buttons[button_ok] = function(){
						$( this ).dialog( "close" );
					};

					for(i=0;i<currentCart.length;i++){
							total = total + ( currentCart[i].Amount * currentCart[i].Quantity);
					}

					total = parseInt( total, 10 ) + ( parseInt( $('input#card_value').val(), 10 ) *  parseInt($('input#card_quantity').val(), 10) );

					if(total > maxTransaction){

						$( '<div></div>' )
								.html(self.Language.dialogs.max_transaction + self.getMoney(maxTransaction))
								.dialog({
									position: [self.$elem.width() / 2 - (this.width / 2), 200],
									resizable: false,
									modal: true,
									buttons: dialog_buttons
						});
					}else{
						if($('input#customize-type').val() == 'photo'){
							$('input#saved-photo').val($('#photo-in img').attr('src'));
							if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data, li#delivery-info li.validate') , $('a.add-to-cart') ) ) {
								$.when(self.saveImage()).done(function(){
									self.editingCard = false;
									self.animateCard (App.submit().CardImg, function(){
										slf2.collection.add(card);

										if(card.toJSON().Delivery.DeliveryType == 'plastic'){
											var jCard = card.toJSON();
											self.pushAddress(jCard);
										}
										self.sendCrossDomain({ type: 'scroll', value: 0 });

										console.log(jCard);
										$(window).trigger('addToCart', jCard);

										self.cardInit();
										self.resetPhoto();
									});

									self.cardInit();
									self.resetPhoto();
								}).fail(function(){
									alert('Error!');
								});
							}
						}else{
							if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data, li#delivery-info li.validate') , $('a.add-to-cart') ) ) {
								self.animateCard (App.submit().CardImg, function(){
									slf2.collection.add(card);
									self.editingCard = false;

									if(card.toJSON().Delivery.DeliveryType == 'plastic'){
										var jCard = card.toJSON();
										self.pushAddress(jCard);
									}
									self.sendCrossDomain({ type: 'scroll', value: 0 });

									self.cardInit();
									self.resetPhoto();
								});
							}
						}
					}
					// self.sendCrossDomain({ type: 'scroll', value: 0 });
				},

				update: function(e){
					var myModel = this.collection.getByCid(self.currentModel),
						slf2 = this,
						currentCart = slf2.collection.toJSON(),
						total = 0,
						maxTransaction = self.settings.Amount.MaxTransVal,
						dialog_buttons = {},
						button_ok = self.Language.dialogs.ok;

					dialog_buttons[button_ok] = function(){
						$( this ).dialog( "close" );
					};

					// console.log(myModel.toJSON().Amount)
					for(i=0;i<currentCart.length;i++){
							total = total + ( currentCart[i].Amount * currentCart[i].Quantity);
					}

					total = parseInt( total - myModel.toJSON().Amount, 10 ) + ( parseInt($('input#card_value').val(), 10 ) *  parseInt($('input#card_quantity').val(), 10) );

					if(total > maxTransaction){

						$( '<div></div>' )
								.html(self.Language.dialogs.max_transaction + self.getMoney(maxTransaction))
								.dialog({
									position: [self.$elem.width() / 2 - (this.width / 2), 200],
									resizable: false,
									modal: true,
									buttons: dialog_buttons
							});
					}else{
						if($('input#customize-type').val() == 'photo'){
							$('input#saved-photo').val($('#photo-in img').attr('src'));
							if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data, li#delivery-info li.validate') , $('a.add-to-cart') ) ) {
								$.when(self.saveImage()).done(function(){
									myModel.set( App.submit());
									self.editingCard = false;
									self.cardInit();
									$('a.checkout').show();
								}).fail(function(){
									alert('Error!');
								});
							}
						}else{
							if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data, li#delivery-info li.validate') , $('a.update-cart') ) ) {
								myModel.set( App.submit());
								self.editingCard = false;
								self.cardInit();
								$('a.checkout').show();
							}
						}
					}
				},

				setEditing: function(){
					self.editingCard = true;
				}
			});

			App.submit = function(){
				$(document).trigger('functionIt', 'App.submit');
				var tempObj = {},
					image;

				tempObj.DesignType = $('input#customize-type').val() || 'default';
				tempObj.Orientation = $('#photo-wrap').attr('data-orientation') || 'bottom';
				tempObj.StyleId = $('input#card_design').val();
				tempObj.Amount = $('#card_value').val().replace(/[^0-9]/g,'');
				tempObj.Quantity = $('#card_quantity').val();

				// console.log(tempObj.DesignType);

				if(tempObj.DesignType == 'default'){
					image = $('input#card_src').val().replace('medium', 'small').replace('/outside', '');
				}else{
					image = $('div#photo-in img').attr('src') || '',
					//get file name
					fileNameIndex = image.lastIndexOf("/") + 1,
					filename = image.substr(fileNameIndex),
					//get extension
					extension = filename.substr( (filename.lastIndexOf('.') +1) );

					image = image.replace(filename, 'small.' + extension).replace('/outside', '');
				}

				tempObj.CardImg = image;

				tempObj.Message = (self.enclosureType == -1) ? ' ' :  $('textarea#card_message').val();
				tempObj.MerchantId = self.MerchantId;
				//tempObj.MerchantId = window.getParam( 'id' );

				tempObj.Delivery = {};
				tempObj.Delivery.Persons = [];
				tempObj.Delivery.Persons[0] = {};
				tempObj.Delivery.Persons[1] = {};

				var dType = $('input#delivery_type').val(),
					dContainer = $('li#delivery-info ul#delivery-content li#dc-' + dType);

				// check if delivery option is plastic and card will be shipped to an existing shipping address
				// if(dType == 'plastic' && !($('select#existing-address').val() == -1 || $('select#existing-address').length === 0)){
				// 	var index = $('select#existing-address').val(),
				// 	 shippingA;
				// 	// fill in recipient name from saved selected shipment
				// 	$(dContainer).find('input[id$="recipient_name"]').val(.RecipientName);
				// 	// fill in recipient phone number from saved selected shipment
				// 	$(dContainer).find('input[id$="recipient_phone"]').val(self.mailShipping[index].Shipment.ShippingAddress.Phone);
				// }

				// Delivery Info: sets the recipient and sender of cards 
				tempObj.Delivery.DeliveryType = dType;
				tempObj.Delivery.Persons[0].Type = 'Recipient';
				tempObj.Delivery.Persons[0].FB = ""; //unfinished
				tempObj.Delivery.Persons[0].Email = $(dContainer).find('input[id$="recipient_email"]').val() || '';
				tempObj.Delivery.Persons[0].Name =  $('#enclosure_to').val() || $(dContainer).find('input[id$="recipient_name"]').val() || '';
				tempObj.Delivery.Persons[1].Type = 'Sender';
				tempObj.Delivery.Persons[1].FB = ""; //unfinished
				tempObj.Delivery.Persons[1].Name =  $('#enclosure_from').val() || $(dContainer).find('input[id$="from_name"]').val() || '';
				
				// if(dType == 'plastic' && !($('select#existing-address').val() == -1 || $('select#existing-address').length === 0)){
				// 	// Set the recipient and sender from enclosure information 
				// 	tempObj.Delivery.Persons[0].Name =  $(dContainer).find('input[id$="recipient_name"]').val();
				// 	tempObj.Delivery.Persons[1].Name =  $(dContainer).find('input[id$="from_name"]').val();

				// Shipment Info: only set for plastic cards
				if(dType == 'email'){
					tempObj.Delivery.DeliveryTypeLabel = self.Language.customize.email.title;
					var eDate = Date.parse( $(dContainer).find('input#email_delivery_date').val().replace(/[-]/g, '/').replace('.', '') ) || Date.parse( $(dContainer).find('input#email_delivery_date').datepicker("getDate").toDateString() ),
						cDate = new Date(eDate).toDateString();

					tempObj.Delivery.DeliveryDate = cDate;
					tempObj.Delivery.DeliveryDateUTC = eDate;
					tempObj.Delivery.Persons[1].Email = '';
				}else if(dType == 'sms'){
					tempObj.Delivery.DeliveryTypeLabel = self.Language.customize.sms.title;
					var eDate = Date.parse( $(dContainer).find('input#sms_delivery_date').val().replace(/[-]/g, '/') ) || Date.parse( $(dContainer).find('input#sms_delivery_date').datepicker("getDate").toDateString() ),
						cDate = new Date(eDate).toDateString();

					tempObj.Delivery.DeliveryDate = cDate;
					tempObj.Delivery.DeliveryDateUTC = eDate;
					// tempObj.Delivery.Persons[0].Phone = $(dContainer).find('input[id$="recipient_phone"]').val();
					tempObj.Delivery.Persons[0].Phone = $(dContainer).find('input#sms_recipient_phone').val();
				}
				else{
					tempObj.Delivery.DeliveryTypeLabel = self.Language.customize.print.title;
					tempObj.Delivery.DeliveryDate = '';
					tempObj.Delivery.DeliveryDateUTC = '';
					tempObj.Delivery.Persons[1].Email = $(dContainer).find('input[id$="from_email"]').val();
				}

				if (dType == 'plastic') {
					tempObj.Delivery.DeliveryTypeLabel = self.Language.customize.plastic.title;
					//if there is no address stored...
					if( $('select#existing-address').val() == -1 || $('select#existing-address').length === 0 ){

						tempObj.Shipment								= {};
						tempObj.Shipment.Key							= self.mailShipping.length + 1;

						tempObj.Shipment.ShippingOption					= {};
						tempObj.Shipment.ShippingOption					= $.parseJSON( $('input[name=sOpt]:checked').val().replace(/[|]/g, '"'));
						tempObj.Shipment.ShippingOption.Cost			= Number(tempObj.Shipment.ShippingOption.Cost);

						tempObj.Shipment.ShippingAddress				= {};
						tempObj.Shipment.ShippingAddress.Address1		= $(dContainer).find('input#plastic_address').val();
						tempObj.Shipment.ShippingAddress.Address2		= $(dContainer).find('input#plastic_address2').val();
						tempObj.Shipment.ShippingAddress.City			= $(dContainer).find('input#plastic_city').val();
						tempObj.Shipment.ShippingAddress.PostalZip		= $(dContainer).find('input#plastic_zip').val();
						tempObj.Shipment.ShippingAddress.RegionId		= ($(dContainer).find('#plastic_state').is('select')) ? $('#plastic_state').val() : -1,
						tempObj.Shipment.ShippingAddress.Region			= ($('#plastic_state').find(":selected").text() !== '') ? $('#plastic_state').find(":selected").text() : $('#plastic_state').val();
						tempObj.Shipment.ShippingAddress.CountryId		= $(dContainer).find('select#plastic_country').val();
						tempObj.Shipment.ShippingAddress.RecipientName  = $(dContainer).find('input[id$="recipient_name"]').val();
						tempObj.Shipment.ShippingAddress.Phone			= $(dContainer).find('input#plastic_recipient_phone').val();

						if( $('#save-shipping').length > 0){
							// console.log('addres checked for saving');
							//tempObj.Shipment.ShippingAddress.SaveAddress = $('#save-shipping').is(':checked');
                            tempObj.SaveAddress = $('#save-shipping').is(':checked');
						}else{
							//tempObj.Shipment.ShippingAddress.SaveAddress = false;
                            tempObj.SaveAddress = false;
						}

					}else{
						var index = $('select#existing-address').val(),
							myShipment = self.mailShipping[index];

						tempObj.Shipment								= {};
						tempObj.Shipment.Key							= myShipment.Shipment.Key;

						tempObj.Shipment.ShippingOption					= {};
						tempObj.Shipment.ShippingOption.Type			= myShipment.Shipment.ShippingOption.Type;
						tempObj.Shipment.ShippingOption.Cost			= myShipment.Shipment.ShippingOption.Cost;

						tempObj.Shipment.ShippingAddress				= {};
						tempObj.Shipment.ShippingAddress.Address1		= myShipment.Shipment.ShippingAddress.Address1;
						tempObj.Shipment.ShippingAddress.Address2		= myShipment.Shipment.ShippingAddress.Address2;
						tempObj.Shipment.ShippingAddress.City			= myShipment.Shipment.ShippingAddress.City;
						tempObj.Shipment.ShippingAddress.PostalZip		= myShipment.Shipment.ShippingAddress.PostalZip;
						tempObj.Shipment.ShippingAddress.RegionId		= myShipment.Shipment.ShippingAddress.RegionId;
						tempObj.Shipment.ShippingAddress.Region			= myShipment.Shipment.ShippingAddress.Region;
						tempObj.Shipment.ShippingAddress.CountryId		= myShipment.Shipment.ShippingAddress.CountryId;
						tempObj.Shipment.ShippingAddress.RecipientName	= myShipment.Shipment.ShippingAddress.RecipientName;
						tempObj.Shipment.ShippingAddress.Phone			= myShipment.Shipment.ShippingAddress.Phone;
					}
					// Plastic enclosures
				}
				var enclosures = self.settings.Enclosures || [];

				if(enclosures.length > 0){
					tempObj.PersonalizedEnclosure						= {};
					tempObj.PersonalizedEnclosure.Enclosure_Id			= $('#enclosure').val();
					tempObj.PersonalizedEnclosure.Cost					= $('#enclosure  option:selected').data('cost');
					tempObj.PersonalizedEnclosure.From					= $('#enclosure_from' ).val() || $(dContainer).find('input[id$="from_name"]').val() || '';
					tempObj.PersonalizedEnclosure.To					= $('#enclosure_to').val() || $(dContainer).find('input[id$="recipient_name"]').val() || '';
					tempObj.PersonalizedEnclosure.Message				= $('textarea#card_message').val();
                } 
				return tempObj;
			};

			App.prepareEditing = function( view ){
				$(document).trigger('functionIt', 'App.prepareEditing');
				var myCard = view.model.attributes,
					deliveryType = myCard.Delivery.DeliveryType,
					designType = myCard.DesignType;

				$('li#customize input, li#customize textarea').val(''); //reset all fields and then...

				//Images
				if(designType == 'default'){
					var myImg =  myCard.CardImg.replace('small', 'medium');

					//move to default design
					$('ul#custom-type > li')[0].click();

					$('input#card_src').val(myImg);
					$('.choose-card').css( 'background', 'url("' + myImg + '" )' );
					$('img#preview-image').attr( 'src', myImg.replace('medium', 'big') );
				}else{
					//move to custom design
					$('ul#custom-type > li')[1].click();
					//call photoReady
					self.photoReady(myCard.CardImg.replace('small', 'big'));
				}

				//Buttons
				$('a.add-to-cart').hide();
				$('a.update-cart').show();

				//fields
				$('input#card_design').val(myCard.StyleId);
				$('input#card_value').val(myCard.Amount);
				$('span#pw-value').html(self.getMoney(myCard.Amount));

				//In case of select instead of input
				$("select#card_value option").filter(function() {
					return $(this).val() == myCard.Amount;
				}).attr('selected', true);

				$("select#enclosure").val(myCard.PersonalizedEnclosure.Enclosure_Id);

				$("#enclosure_to").val(myCard.PersonalizedEnclosure.To);
				$("#enclosure_from").val(myCard.PersonalizedEnclosure.From);

				$('span#pw-message').html(myCard.Message);

				$('#card_quantity').val(myCard.Quantity);
				$('textarea#card_message').val(myCard.Message);

				$('a.purchase').parent()
					.find('.group-error')
					.html('');

				var setValidate = function(){
					var dfd = $.Deferred();
					$('input#delivery_type').val(deliveryType);
					//move to the right delivery panel

					self.moveDelivery(deliveryType);

					dfd.resolve();
					return dfd.promise();
				};

				setValidate().done(function(){
					var myDate = new Date(myCard.Delivery.DeliveryDate),
						date2 = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate();
						// console.log(date2);

					$('li#delivery-info li.validate input#email_delivery_date[type=date]').val(date2);
					$('li#delivery-info li.validate input#email_delivery_date[type=text]').datepicker("setDate", myDate);
					$('li#delivery-info li.validate input[id$="recipient_name"]').val(myCard.Delivery.Persons[0].Name);
					$('li#delivery-info li.validate input[id$="recipient_email"]').val(myCard.Delivery.Persons[0].Email);
					$('li#delivery-info li.validate input[id$="from_name"]').val(myCard.Delivery.Persons[1].Name);
					$('li#delivery-info li.validate input[id$="from_email"]').val(myCard.Delivery.Persons[1].Email);

					//plastic
					$('li#delivery-info li.validate input#plastic_recipient_phone').val(myCard.Shipment.ShippingAddress.Phone);
					$('li#delivery-info li.validate input#plastic_address').val(myCard.Shipment.ShippingAddress.Address1);
					$('li#delivery-info li.validate input#plastic_address2').val(myCard.Shipment.ShippingAddress.Address2);
					$('li#delivery-info li.validate input#plastic_city').val(myCard.Shipment.ShippingAddress.City);
					$('li#delivery-info li.validate input#plastic_zip').val(myCard.Shipment.ShippingAddress.PostalZip);

					//sms
					$('li#delivery-info li.validate input#sms_delivery_date[type=date]').val(date2);
					$('li#delivery-info li.validate input#sms_delivery_date[type=text]').datepicker("setDate", myDate);
					// $('li#delivery-info li.validate input[id$="recipient_phone"]').val(myCard.Delivery.Persons[1].Phone);
					$('li#delivery-info li.validate input#sms_recipient_phone').val(myCard.Delivery.Persons[0].Phone);

					$('select#existing-address option').filter(function() {
						return $(this).text() == myCard.Shipment.ShippingAddress.Address1;
					}).attr('selected', true);
					$('select#existing-address').trigger('change');

					$("select#plastic_country option").filter(function() {
						return $(this).val() == myCard.Shipment.ShippingAddress.CountryId;
					}).attr('selected', true);

					$('input#plastic_state').val(myCard.Shipment.ShippingAddress.Region);

					//select version
					$("select#plastic_state option").filter(function() {
						return $(this).val() == myCard.Shipment.ShippingAddress.RegionId;
					}).attr('selected', true);
				});
			};

			var CartCollection = new App.Collections.Cart([]),
				addCardView = new App.Views.AddCard({ collection: CartCollection }),
				cartView = new App.Views.Cart({ collection: CartCollection });

			$('ul#cards').html(cartView.render().el);

		},

		//clone cart and diaplay as summary
		cartToSummary: function(){
			$(document).trigger('functionIt', 'cartToSummary');
			var self = this,
				pWindow = $('<div id="summary-bg"></div>').addClass('full-bg'),
				sWindow = $('<div id="summary-window"></div>').appendTo(pWindow),
				sTite = $('<h2>' + self.Language.confirmation.order_summary + '</h>').appendTo(sWindow),
				sSummary = $('<div id="summary-list"></div>').html(self.summaryHtml()).appendTo(sWindow),
				pNav = $('<div class="pages-nav"></div>').appendTo(sWindow),
				sError = $('<div class="group-error"></div>').appendTo(pNav),
				cancelButton = $('<a class="button confirmation-cancel" href="#">' + self.Language.dialogs.cancel + '</a>')
					.appendTo(pNav)
					.on('click', function(event) {
						event.preventDefault();
						$('#summary-bg').remove();
					}),
				okButton = $('<a class="button confirmation-cancel main-button" href="#">' + self.Language.dialogs.ok + '</a>')
					.appendTo(pNav)
					.on('click', function(event) {
						event.preventDefault();
						if(!$(this).hasClass('loading')){
							$(this).addClass('loading');
							self.sendCheckout();
						}
					});

			pWindow.prependTo(self.elem);
			$('#summary-bg').show();

		},

		// generate the notification icon above the cart on the header
		notificateHeader: function( nCards ){
			$(document).trigger('functionIt', 'notificateHeader');
			var self = this,
				cIndex = 1,
				hClass = (self.currentPage == 'editcart') ? 'hide-me' : '',
				nIcon = $('<span />', {
					id: 'notification-icon',
					html: nCards
				}).addClass(hClass).on('click', function(){
					self.moveIt( ['editcart'] );
				}),
				hTitles = $('header ul#status-bar .header-title');

			$(hTitles[cIndex]).find('.theme-color-bg #notification-icon').remove();

			if(nCards > 0 && !self.settings.Merchant.EC){

				if(self.settings.Merchant.SFP){ //6 pages
					cIndex = (self.minCustomize) ?  1 : 2;
				}
				var niContainer = (self.minHeader) ? '.page-title' : '.theme-color-bg',
					cHeader = $(hTitles[cIndex]).find(niContainer)
									.append(nIcon)
									.parent().addClass('clickable').on('click', function(){
										self.moveIt( ['editcart'] );
									});
			}else{
				$(hTitles[cIndex]).find('.theme-color-bg').parent()
											.removeClass('clickable')
											.off('click');
			}
		},

		//Hide notification icon after cart page
		hideNotification: function(page){
			$(document).trigger('functionIt', 'hideNotification');
			var self = this,
				icon = $('span#notification-icon');

			if(!self.settings.Merchant.EC){

				if(page[0] == 'customize' || page[0] == 'delivery'){
					icon.removeClass('hide-me');
				}else{
					icon.addClass('hide-me');
				}
			}
		},

		// Set validation class and error message
		fieldValidation: function(field, status, type, errorCode, errorMessage) {
			$(document).trigger('functionIt', 'fieldValidation');
			var myParent = $(field).parents('div.field, div.half-field'),
				lang = this.Language.errors,
				errorType = '',
				message = lang[errorCode] ? lang[errorCode] : errorMessage,
				tempRet = true;


			if( status ){
				myParent.find('div.field-error').fadeOut(1200, 'swing', function(){

					myParent.removeClass('validation-error')
							.removeClass('validation-warning')
						.find('div.field-error')
							.html('')
							.show();
				});

				tempRet = true;

			}else{
				if( type == 'error' ){
					errorType = 'validation-error';
					tempRet = false;
				}else{
					errorType = 'validation-warning';
					tempRet = true;
				}

				myParent.addClass(errorType)
				.find('div.field-error')
				.html(message);

			}
			return tempRet;
		},

		// Execute validation onBlur
		singleValidation: function(){
			var self = this,
				fields = 'input[type=text], input[type=number], input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, textarea, select';

			$(document).on('change, blur, focusout', fields,  function(){
				$(document).trigger('functionIt', 'singleValidation');

				if( $(this).attr('type') === 'checkbox' ){

					if( $(this).is(':checked') ){
						$(this).parents('div.terms-field').removeClass('validation-error')
									.find('div.field-error')
										.html('');
					}else{
						$(this).parents('div.terms-field')
									.addClass('validation-error')
									.find('div.field-error')
										.html(self.Language.errors.check);
					}
				}else{
					var fData = $(this).val(),
						cData = $(this).data('confirm'),
						addressData = $(this).data('address');

					if(cData){
						var vData = $('#' + cData).val();

						if(fData !== ''){
							fData = (vData == fData);
						}
					}

					if(addressData){
						var otherField = $('#' + addressData).val();
						if(fData.replace(/\s+/g, '') !== ''){
							fData = fData + ' ' + otherField;
						}
					}

					if( $(this).attr('type') === 'month' ){
						fData = self.convertDate(fData);
					}

					//new expiration date (double field)
					if( $(this).hasClass('exp-left') ||  $(this).hasClass('exp-right') ){
						$(this).addClass('expdate');
						fData = $('#cc_exp_month').val() + '/' + $('#cc_exp_year').val();
					}
					var valObj = [{
							Classes: $(this).attr('class'),
							Data: fData
						}],

						myField = $(this);

					$.ajax({
						type: "POST",
						url: self.currentURL + "/gcp/services/BuyatabWS.asmx/Validate",
						data: "{validation_group:" + JSON.stringify(valObj) + "}",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function( data ){
							var d = data.d[0];
							// console.log(data.d[0])

							self.fieldValidation( myField,
													d.Success,
													d.Error.ExceptionDetails,
													d.Error.ErrorCode,
													d.Error.Message);
							if( !d.Success ){
								$(window).trigger('anaLog', '[GCP] singleValidation: ' + myField.attr('id'));
							}
						},
						error: function( e ){
							console.log(e.statusText + ': ' + e.responseText);
						}
					});
				}
			});
		},

		//Check ini file to define if merchant has photo only
		photoOnly: function(){
			$(document).trigger('functionIt', 'photoOnly');
			var self = this,
				myTemplt = $( self.cTemplate ),
				panels = myTemplt.find('ul#design-selector > li'),
				photoOnly = self.settings.Merchant.PhotoCard.PhotoOnly || false;

				if(photoOnly){
					myTemplt.find('input#customize-type').val('photo'); //ok
					myTemplt.find('ul#custom-type li').hide(); //ok

					$(panels).hide();
					$(panels).removeClass('validate');
					$(panels[1]).fadeIn('slow');
					$(panels[1]).addClass('validate');
				}

		},

		//surround all selectors for css porpuse
		wrapSelectors: function(){
			$(document).trigger('functionIt', 'wrapSelectors');
			var self = this,
				myTemplt = $( self.cTemplate );

			$(self.cTemplate).find('select').wrap( "<div class='select-wrap'></div>" );
		},

		// Execute validation for a group of fields
		groupValidation: function( groupsArray, triggeredBy ){
			$(document).trigger('functionIt', 'groupValidation');
			var self = this,
				valObj = [],
				errors = 0;

			if( !self.debugMode ){ //turn validation off on debug mode

				var fields = $(groupsArray).find('input[type=text], input[type=number], input[type=file], input[type=hidden].photo, input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, input[type=radio], input#saved-photo, textarea, select');
				$(fields).each(function() {
					if($(this).parents('.ignore-validation').length === 0){
						var myObj = {};

						if( $(this).attr('type') === 'checkbox' ){

							if( $(this).is(':checked') ){
								$(this).parents('div.terms-field').removeClass('validation-error')
								.find('div.field-error')
								.html('');
							}else{
								$(this).parents('div.terms-field')
								.addClass('validation-error')
								.find('div.field-error')
								.html(self.Language.errors.check);
								errors++;
							}
						}

						if ($(this).attr('type') == 'radio') {
							var gName = $(this).attr('name');
							if ($("input:radio[name='" + gName + "']").is(":checked")) {
								$(this).parents('div.field').removeClass('validation-error')
								.find('div.field-error')
								.html('');
							} else {
								$(this).parents('div.field')
								.addClass('validation-error')
								.find('div.field-error')
								.html($(this).attr('alt'));
								errors++;
							}
						} else {
							var fData = $(this).val(),
							cData = $(this).data('confirm'),
							addressData = $(this).data('address');

							if(cData){
								var vData = $('#' + cData).val();

								if(cData !== ''){
									fData = (vData == fData);
								}
							}

							if(addressData){
								var otherField = $('#' + addressData).val();
								if(fData.replace(/\s+/g, '') !== ''){
									fData = fData + ' ' + otherField;
								}
							}

							if( $(this).attr('type') === 'month' ){
								fData = self.convertDate(fData);
							}

							//new expiration date (double field)
							if( $(this).hasClass('exp-left') ||  $(this).hasClass('exp-right') ){
								$(this).addClass('expdate');
								fData = $('#cc_exp_month').val() + '/' + $('#cc_exp_year').val();
							}

							myObj.Classes = $(this).attr('class');
							myObj.Data = fData;

							if( !$(this).hasClass('dont-validate') ){
								valObj.push(myObj);
							}
						}
					}
				});
				// console.log(fields)

				$.ajax({
					type: "POST",
					url: self.currentURL + "/gcp/services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						var d = data.d;
						$.each( d, function(i, element){
							if( !self.fieldValidation( fields[i],
									element.Success,
									element.Error.ExceptionDetails,
									element.Error.ErrorCode,
									element.Error.Message) ){
								errors ++;
								$(window).trigger('anaLog', '[GCP] groupValidation');
							}
						});
					},
					error: function( e ){
						console.log(e.statusText + ': ' + e.responseText);
					}
				});
			}

			var gError = $(triggeredBy).parents('div.pages-nav').find('div.group-error');

			if(errors > 0){
				gError.addClass('error-in').html(self.Language.errors.group);
				setTimeout(function() {
					gError.fadeOut('slow', 'swing', function(){
						gError.html('').removeClass('error-in');
						gError.show();
					});
				}, 5200);
			}else{
				gError.removeClass('error-in').html('');
			}

			return (errors > 0) ? false : true;
		},

		// show the image-wrap
		showIt: function(){
			$(document).trigger('functionIt', 'showIt');
			var self = this;
			$('#image-wrap').removeClass('hide-it');
		},

		// show the image-wrap
		hideIt: function(){
			$(document).trigger('functionIt', 'hideIt');
			var self = this;
			$('#image-wrap').addClass('hide-it');
		},

		// Get the height of the wrapper element and send this cross-domainlly
		updateHeight: function(){
			$(document).trigger('functionIt', 'updateHeight');
			var self = this,
				height = 0;
			setInterval(function(){
				if (height != self.getHeight(self.elem) ){
					height = self.getHeight(self.elem);
					// self.sendCrossDomain({ gcpHeight: height });
					self.sendCrossDomain({ type: 'resize', value: height });
					// self.sendCrossDomain({ type: 'scroll', value: 0 });
				}
			} , 1000);
		},

		// Send a Cross Domain Message
		sendCrossDomain: function( message ){
			$(document).trigger('functionIt', 'sendCrossDomain');
			var self = this;

			try {
				// var domain = decodeURIComponent( self.settings.Merchant.Domain.replace(/^#/, '') ) || 'buyatab.com/';
				// if(domain !== ''){
					//Check for protocol
					// if(!/http/i.test(domain)){
						// domain = window.location.protocol  + '//' + domain;
					// }
				// }

				window.parent.postMessage(message, '*');
				//ie 9-. Of course.
				window.parent.postMessage(message.value, '*');

			} catch (err) {
				console.log(err);
			}
		},

		// Receive a Cross Domain Message
		receiveCrossDomain: function() {
			$(document).trigger('functionIt', 'receiveCrossDomain');
			var self = this,
				domainValue = self.settings.Merchant.Domain,
				// domain = decodeURIComponent( self.settings.Merchant.Domain.replace(/^#/, '') ),
				domain = (self.isStringArray(domainValue)) ? self.stringToArray(domainValue) : self.stripDomain(domainValue.replace(/^#/, '') ) || 'buyatab.com',
				eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
				eventer = window[eventMethod],
				messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			window.btbMessages = [];

			if(domain !== ''){
				// Listen to message from child window
				eventer(messageEvent,function(e) {
					var postOrigin = self.stripDomain(e.origin);

					//prevent getting message from other domains
					if(typeof domain == 'string'){
						if ( postOrigin !== domain ) {
							return;
						}
					}else{
						//domain is an array!
						if(!self.domainInArray(postOrigin, domain)){
							return;
						}
					}

					if(e.data.type == 'resize'){
						try{
							var parentScroll = Number( e.data.value.replace(/.*top=(\d+)(?:&|$)/, '$1') );
							console.log(parentScroll);
							self.updateFloatingCart(parentScroll);
						}
						catch(error){
							// console.log(error);
						}
					}

					// console.log(e);
					window.btbMessages.push(e);

				},false);
			}

			window.onmessage = function(message){
				var postOrigin = self.stripDomain(message.origin);

				//prevent getting message from other domains
				if(typeof domain == 'string'){
					if ( postOrigin !== domain ) {
						console.info('Domain as string. Not well set on the DB: postMessage.Origin: "' +
										postOrigin + '". Domain from DB/ini/default: "' + domain + '". Cart will not float.');
						return;
					}
				}else{
					//domain is an array!
					if(!self.domainInArray(postOrigin, domain)){
						console.info('Domain as array. Not well set on the DB: postMessage.Origin: "' +
										postOrigin + '". Domain from DB/ini/default: "' + domain + '". Cart will not float.');
						return;
					}
				}

				if(typeof message.data == 'object'){
					if(message.data.type == 'scroll'){
						self.updateFloatingCart(message.data.value);
					}
				}else{
					self.updateFloatingCart(message.data);
				}
			};
		},

		//returns domain from string
		stripDomain: function(domain){
			$(document).trigger('functionIt', 'stripDomain');
			return domain.replace(/(https?:?(\/\/)?)?(www\.)?/i, '').replace(/\/$/i, ''); //< remove last '/'
		},

		// check if domain is in array
		domainInArray: function(domain, array){
			$(document).trigger('functionIt', 'domainInArray');
			var self = this,
				is = false,
				strippedArray = [];

			domain = self.stripDomain(domain);

			$.each(array, function(index, val) {
				strippedArray.push(self.stripDomain(val));
			});

			if(strippedArray.indexOf(domain) > -1){
				return true;
			}

			return false;
		},

		//return true if string first char is [
		isStringArray: function(arrayString){
			$(document).trigger('functionIt', 'isStringArray');
			if(arrayString.charAt(0) == '[' || arrayString.indexOf(',') != -1){
				return true;
			}
			return false;
		},

		// return an array from string
		stringToArray: function(arrayString){
			$(document).trigger('functionIt', 'stringToArray');
			// arrayString can be: "[buytab.com, dev.vm, local.vm]"
			// or "buytab.com, dev.vm, local.vm"
			// or "buytab.com,dev.vm,local.vm"
			//removing spaces and brackets and split
			return arrayString.replace(/[\s]+/gi, '').split(",");
		},

		// Generates the animation after customizing the card
		animateCard: function( cardSrc, callback ){
			$(document).trigger('functionIt', 'animateCard');
			var self = this,
				fromCard = self.cTemplate.find('div.choose-card'),
				toCard = self.cTemplate.find('li#cart'),
				topCard = self.cTemplate.find('ul#status-bar > li'),
				cIndex = (self.settings.Merchant.SFP && self.minCustomize) ?  1 : 2,
				noCartL = ($(topCard[cIndex]).offset() === undefined) ? $(document).width()/2 : $(topCard[cIndex]).offset().left ,
				noCartT = ($(topCard[cIndex]).offset() === undefined) ? 0 : $(topCard[cIndex]).offset().top ,
				bezier_params = {
					start: {
						x: fromCard.offset().left,
						y: fromCard.offset().top + 300,
						angle: -300
					},
					end: {
						x: (self.settings.Merchant.EC) ? toCard.offset().left  : noCartL,
						y: (self.settings.Merchant.EC) ? toCard.offset().top : noCartT,
						angle: -50,
						length: 0.5
					}
				},
				gCard = $('<div />').css({
					background: 'url(' + cardSrc.replace('small', 'medium') + ')',
					'background-size': '100%',
					position: 'absolute',
					'z-index': 99999,
					opacity: 1,
					height: fromCard.outerHeight(),
					width : fromCard.outerWidth(),
					top: fromCard.offset().top,
					left: fromCard.offset().left
				}).appendTo(self.elem)
					.addClass('ghost-card')
					.animate({
						height: 42,
						width: 56,
						opacity: 0.5,
						path : new $.path.bezier(bezier_params)
						// top: (self.settings.Merchant.EC) ? toCard.offset().top : $(topCard[cIndex]).offset().top,
						// left: (self.settings.Merchant.EC) ? toCard.offset().left  : $(topCard[cIndex]).offset().left
					}, 666, function() {
						callback();
						$(this).remove();
				});
		},

		// Animates the intro showcasing the cards available
		animateIntro: function(){
			$(document).trigger('functionIt', 'animateIntro');
			var self = this,
				cards = self.settings.Cards,
				chooseCard = self.cTemplate.find('div.choose-card'),
				i = cards.length -1;

			setInterval(function() {
				if (i >= 0){
					var cardSrc = self.customPath + 'cards/medium/' + cards[i].ImageName,
						gCard = $('<div />').css({
							background: 'url(' + cardSrc + ')',
							'background-size': '100%',
							position: 'absolute',
							order: 'none',
							'z-index': 99999,
							opacity: 0.1,
							// height: chooseCard.outerHeight() * 10,
							// width : chooseCard.outerWidth() * 10,
							// top: 0,
							// left: 0,
							height: chooseCard.outerHeight(),
							width : chooseCard.outerWidth(),
							top: chooseCard.offset().top,
							left: chooseCard.offset().left
						})
						.appendTo(self.elem)
						.addClass('g-card')
						.animate({
							opacity: 1,
							height: chooseCard.outerHeight(),
							width : chooseCard.outerWidth(),
							top: chooseCard.offset().top,
							left: chooseCard.offset().left
						}, 800, function(){
							gCard.css({
								'background':'#fff',
								opacity: 1
							});
						})
						.animate({
							background: 'url(' + cardSrc + ')',
							height: chooseCard.outerHeight() * 3,
							width : chooseCard.outerWidth() * 3,
							top: '-=' + chooseCard.outerHeight()/2,
							left: '-=' + chooseCard.outerWidth()/2,
							opacity: 0

						}, 300 , function(){
							gCard.remove();

						});
					}
					i--;
			}, 400);
		},

		// load additional script from inifile
		addScript: function(){
			$(document).trigger('functionIt', 'addScript');
			var self = this,
				html = '';

			if(self.additionalScript && self.additionalScript.length > 0){
				for(var i = 0; i < self.additionalScript.length; i++){
					if(self.additionalScript[i].indexOf('/') == -1){
						self.additionalScript[i] = self.customPath + 'js/' + self.additionalScript[i];
					}
				}

				self.waitLoad( self.additionalScript, function(e){
					self.analytics();
					$(window).trigger('scriptLoaded');
				} );
			}
		},

		// Convert IOS date
		convertDate: function( date ){
			$(document).trigger('functionIt', 'convertDate');
			var dates = date.split('-');
			return dates[1] + '/' + dates[0];
		},

		// Push card address
		pushAddress: function( card ){
			$(document).trigger('functionIt', 'pushAddress');
			var self = this,
				myObjeto = {};

			myObjeto.Shipment = card.Shipment;

			//Check if address already exist in array
			var unique = true;
			$.each(self.mailShipping, function ( i, e ){
				if(e.Shipment.Key == myObjeto.Shipment.Key){
					unique = false;
				}
			});

			if(unique){
				self.mailShipping.push(myObjeto);
			}

			$(document).trigger('mailShipping');
		},

		// Load files and wait until they're fully loaded
		waitLoad: function(files, callback) {
			$(document).trigger('functionIt', 'waitLoad');
			var filesToLoad = 0,
				file,
				obj,
				newStylesheetIndex = document.styleSheets.length-1;

			for (var index in files) {
				filesToLoad++;

				file = files[index];

				if(getFileType(file)=='css') {
					appendStylesheet(file);
					newStylesheetIndex++;
					if (!window.opera && navigator.userAgent.indexOf("MSIE") == -1) callCallbackForStylesheet(newStylesheetIndex);
				}

				if( getFileType(file) == 'js' ) {
					appendScriptAndCallCallback(file);
				}
			}

			function getFileType(file) {
				file = file.toString().toLowerCase();

				var jsIndex = file.indexOf('js'),
					cssIndex = file.indexOf('css');

				if(jsIndex==-1 && cssIndex==-1)
					return false;

				if(jsIndex > cssIndex)
					return 'js';
				else
					return 'css';
			}

			function appendStylesheet(url) {
				var oLink = document.createElement("link");
				oLink.href = url;
				oLink.rel = "stylesheet";
				oLink.type = "text/css";
				oLink.onload = decrementAndCallGlobalCallback;
				oLink.onreadystatechange = function() {
					if (this.readyState == 'loaded' || this.readyState == 'complete') decrementAndCallGlobalCallback();
				};
				document.getElementsByTagName("head")[0].appendChild(oLink);
			}

			function callCallbackForStylesheet(index) {

				try {
					if (document.styleSheets[index].cssRules) {
						decrementAndCallGlobalCallback();
					} else {
						if (document.styleSheets[index].rules && document.styleSheets[index].rules.length) {
							decrementAndCallGlobalCallback();
						} else {
							setTimeout(function() {
								callCallbackForStylesheet(index);
							}, 250);
						}
					}
				}
				catch(e) {
					setTimeout(function() {
						callCallbackForStylesheet(index);
					}, 250);
				}
			}

			function appendScriptAndCallCallback(url) {
				var oScript = document.createElement('script');
				oScript.type = 'text/javascript';
				oScript.src = url;
				oScript.onload = decrementAndCallGlobalCallback;
				document.getElementsByTagName("head")[0].appendChild(oScript);
			}

			function decrementAndCallGlobalCallback() {
				filesToLoad--;

				if(filesToLoad === 0)
					callback();
			}
		},

		//Switch src attribute to data-src
		getDataSrc: function(){
			// var cardImages = $('.image-selector img');
			var cardImages = $('[data-src]'),
				bgImages = $('[data-background]');

			// console.log(cardImages);
			$.each(cardImages, function(index, val) {
				$(val).attr('src', $(val).attr('data-src') );
			});

			$.each(bgImages, function(index, val) {
				$(val).css('background', $(val).attr('data-background') );
			});
		},

		// Make the necessary changes for mobile
		mobileIt: function(){
			$(document).trigger('functionIt', 'mobileIt');
			var self = this;
			if(self.IsMobile){
				if(window.location == window.parent.location){
					self.stepWidth = $('#content').width();
				}else{ //inside iframe
					self.stepWidth = $(window).width() - 20; // margin
				}


				var divisor = ( self.settings.Merchant.PreviewType == 1 ) ? 1.601626016260163 : 1.33333333333333,
					myHeight = parseInt(self.stepWidth / divisor, 10);

				$('#delivery-content, #pages, .fields').css( 'width', self.stepWidth * 5 );
				$('#pages-wrapper, #pages > li, ul#delivery-content li, ul.fields > li').css( 'width', self.stepWidth );
				$('body > img#verisign1').css('margin-top', 80);

				if(self.stepWidth >= 460){ //landscape
					if(self.settings.Merchant.PreviewType == 2){
						$('.flexslider').css({
							'width': 290,
							'height': 436
						});
					}else{
						$('.flexslider').css({
							'width': 346,
							'height': 260
						});
					}
				}else{ // portrait
					if(self.settings.Merchant.PreviewType == 2){
						$('.flexslider').css({
							'width': 290,
							'height': 436
						});
					}else{
						$('.flexslider').css({
						'width': 290,
						'height': 218
						});
					}
				}
			}
		},

		// Fills the summary page with the cart information
		summaryIt: function(){
			$(document).trigger('functionIt', 'summaryIt');
			var self = this,
				cData = self.generateCheckout();

			String.prototype.replaceAt = function(index, character) {
				return this.substr(0, index) + character + this.substr(index+character.length);
			};

			var myNumber = '' + cData.crq.Payment.CCNum + '';
			for(var i = 6; i < 12; i++){
				myNumber = myNumber.replaceAt( i, '*' );
			}
			//Card Information
			$('div.cw-type span').html(cData.crq.Payment.CCType);
			$('div.cw-number span').html(myNumber);
			$('div.cw-date span').html(cData.crq.Payment.ExpDate);

			//Card Billing Address
			$('div.cw-email span').html(cData.crq.Payment.Email);
			$('div.cw-phone span').html(cData.crq.Payment.Telephone);
			$('div.cw-address span').html(cData.crq.Payment.Address1);
			$('div.cw-city span').html(cData.crq.Payment.City);
			$('div.cw-state span').html(cData.crq.Payment.Region);
			$('div.cw-country span').html($('#cc_country option:selected').text());
			$('div.cw-zip span').html(cData.crq.Payment.PostalZip);
		},

		// Convert string to a limited length
		shortString: function( theString, maxLength){
			$(document).trigger('functionIt', 'shortString');
			var size = theString.length;

			if(size > maxLength){
				var half = Math.round(maxLength / 2),
					begin = theString.substr(0, half - 3),
					end = theString.substr(size - half + 2, half);

				return begin + '[...]' + end;
			}

			return theString;
		},

		// Protect window.console method calls
		defineConsole: function() {
			$(document).trigger('functionIt', 'defineConsole');

			if (!window.console) {
				window.console = {};
			}
			// union of Chrome, FF, IE, and Safari console methods
			var m = [
				"log", "info", "warn", "error", "debug", "trace", "dir", "group",
				"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
				"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
			// define undefined methods as noops to prevent errors
			for (var i = 0; i < m.length; i++) {
				if (!window.console[m[i]]) {
					window.console[m[i]] = function() {};
				}
			}
		},

		// show parameter when in debug mode
		logDebug: function( what ){
			$(document).trigger('functionIt', 'logDebug');
			var self = this;
			if(self.debugMode){
				if(typeof what === 'string'){
					console.log( '[logDebug]: ' + what );
				}else{
					console.log(what);
				}
			}
		},

		// Fill Checkout form with ramdom values
		fillCheckout: function(){
			$(document).trigger('functionIt', 'fillCheckout');
			$('input#cc_type').val('mastercard');
			$('input#cc_number').val('5454 5477 8384 5787');
			$('input#cc_name').val('Peter Pan');
			$('input#cc_expiration').val('12/2016');
			$('input#cc_cvd').val('123');
			$('input#cc_address').val('Second to the right, and straight on till morning');
			$('input#cc_address2').val('Lost Boys House');
			$('input#cc_city').val('Neverland');
			$('input#cc_phone').val('+1 (987) 654-3210');
			$('input#cc_zip').val('P3T 2A4');
			$('input#cc_email').val('peter@neverland.com');
			$('input#cc_terms').attr('checked', true);
			$('input#cc_term_buyatab').attr('checked', true);
			$('input#cc_number').trigger('keyup');
		}
	};

		function augment(withFn) {
		var name, fn;
		for (name in Template) {
			fn = Template[name];
			if (typeof fn === 'function') {
				Template[name] = (function(name, fn) {
					var args = arguments;

					return function() {
						withFn.apply(this, args);
						return fn.apply(this, arguments);
					};
				})(name, fn);
			}
		}
	}

	augment(function(name, fn) {
		if(Template.debugMode){
			if(name != 'getHeight'){
				console.log(name );
			}
		}
	});

	$.fn.bTemplate = function( options ) {
		return this.each(function() {
			var template = Object.create( Template );

			template.init( options, this );

			$.data( this, 'bTemplate', template );
		});
	};

	$.fn.bTemplate.options = {
		CSSFile: 'css/style.css',
		iniFile: 'data/ini.json',
		iniAdmin: 'data/ini-admin.json',
		iniCPanel: 'data/ini-cpanel.json',
		templateFile: 'template/template.handlebars',
		mobileTemplate: 'template/mobile.handlebars',
		underFile: 'template/card.handlebars',
		languageFile: 'data/language/en.json',
		onComplete: null
	};

})( jQuery, window, document );
