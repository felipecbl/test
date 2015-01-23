/**
 * Buyatab Template jQuery plugin
 *	Author: Felipe Castelo Branco
 *	Version: 1.6.19
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
	var Template = {
		
		// Starts the plugin
		init: function( options, elem ) {
			$(document).trigger('functionIt', 'init');
			var self = this;

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

			$.ajaxSetup({ cache: true });

			self.elem = elem;
			self.$elem = $( elem );
			self.$elem.attr('data-currentPage', self.currentPage);

			$(document).find('#buyatabContent').css('visiblity', 'hidden');

			// Overwrite options if passed from the page
			self.options = $.extend( true, $.fn.bTemplate.options, options );

			// Get MerchantId either string or object
			self.MerchantId = (typeof options === 'string' || typeof options === 'number') ? options : options.MerchantId;

			// B2B
            self.b2b				= options.b2b || false;
            self.UserId             = options.UserId || null;
            self.PurchaseId         = options.PurchaseId || null;
            self.b2bDiscount		= options.discount || null;

			// Define default file names
            self.CSSFile            = $.fn.bTemplate.options.CSSFile;
            self.iniFile            = $.fn.bTemplate.options.iniFile;
            self.iniAdmin           = $.fn.bTemplate.options.iniAdmin;
            self.templateFile       = $.fn.bTemplate.options.templateFile;
            self.mobileTemplate     = $.fn.bTemplate.options.mobileTemplate;
            self.underFile          = $.fn.bTemplate.options.underFile;
            self.languageFile       = $.fn.bTemplate.options.languageFile;

			// Define paths
            self.defaultPath        = '/gcp/view/template/default/';
            self.customPath         = '/gcp/view/template/' + self.MerchantId + '/';

            self.url                = "services/BuyatabWS.asmx/GetCards";

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
						console.log( '[debugMode: function executed => ' + data + ']');
					}
				}
			});

			/*Update the cart position when embed and floated*/
			//inside an iFrame on the same domain
			try {
				if( $(elem).parents('iframe').length === 0 && window.parent != window){
					$(window.parent).scroll(function(){
						if(typeof self.settings !== 'undefined' && self.settings.Merchant.FC){
							self.updateFloatingCart($(window.parent).scrollTop());
						}
					});
				}
			} catch (err) {
				console.log(err);
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
			$.when( self.getStyle(),
					self.getOptions(),
					self.getIni() )
				.then( function( rStyle, rOpt, iniOpt  ) {
				$('img#verisign1').hide();

				self.settings = rOpt[0].d;


				//Merge ini options with self object 
				$.extend(true, self, iniOpt[0].options);
				// console.log(iniOpt);

				if(self.settings.Merchant.Language == 'fr'){
					self.underFile = 'fr-card.handlebars';
				}

				self.IsMobile = self.settings.Merchant.IsMobile;
				self.MaxCards = self.settings.Merchant.MaxCards || 30;

				self.today	= self.settings.ServerTime.slice(0, 10);
				self.day	= self.settings.ServerTime.slice(0, 10).split('/')[0];
				self.month	= self.settings.ServerTime.slice(0, 10).split('/')[1];
				self.year	= self.settings.ServerTime.slice(0, 10).split('/')[2];

				self.formatedDate = self.year + '-' + self.month + '-' + self.day;
				self.iFormatedDate = self.day + '-' + self.month + '-' + self.year;

				self.languageFile = self.settings.Merchant.Language + '.json';

				$(document).trigger('functionIt', self.settings);
				$(document).trigger('functionIt', 'generaIt');

				if(self.settings.Status.Success){
					$.when( self.getTemplate() ).then(function( rTemplt ){
						// Append the CSSFile.
						$.when( self.appendStyle( rStyle ), self.getLanguage(), self.customLanguage(), self.getUnder() ).then(function(appStyle, rLang, cLang, rUnder){

							$.extend(true, rLang[0], cLang[0]);

							self.Language = rLang[0];
							self.cTemplate = Handlebars.compile( rTemplt )( self.Language );
							self.uTemplate = rUnder[0];

							document.title = self.Language.title + self.settings.Merchant.Name;

							$(window).trigger('anaLog', 'merchantName: ' + document.title);


							// Call all the Style manipulation functions	
							$.when( self.styleTheme( self.settings.Style.PresetId ),
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
										self.getState( 'plastic_country', 'plastic_state', 'plastic_zip' ),
										self.getState( 'cc_country', 'cc_state', 'cc_zip' ),
										self.getMailShipping(),
										self.getCountry(),
										self.optizeIt(),
										self.charCount(),
										self.numbersOnly(),
										self.receiveCrossDomain(),
										self.singleValidation(),
										self.photoOnly(),
										self.phoneOnly()).done(function() {
									$.when(self.appendTemplate()).done(function(){

										// Show again
										self.$elem.fadeIn();

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

										// self.moveDelivery( 1 );

										self.moveIt( ['customize'] );
										self.moveDelivery( 0 );
										self.uploadPhoto();
										self.addSeal();
										self.addScript();
									});
								});
							});
						});

					});

				} else {
					if(self.settings.Status.Error.ErrorCode == 201 || self.settings.Status.Error.ErrorCode == 202){
						// self.$elem.html('<div id="noscript"> <p>' + self.Language.errors.inactive +'</p> </div>');
						self.$elem.html("<div id='inactive'><div id=\"noscript\"><span id=\"logo\"> <a href=\"https://henry.buyatab.com\"></a> </span> <p>Our apologies, this gift card application is no longer available for this merchant. The merchant will need to contact their Buyatab representative to reactivate. To purchase Gift cards for our other merchants please visit us at: <p><a href='https://www.buyatab.com'>www.buyatab.com</a></p></p> </div></div>").show();
					}
					else{

						alert('Error ' + self.settings.Status.Error.ErrorCode + ': ' + self.settings.Status.Error.Message);
					}
				}
			});
		},

		// Check if file exist using serverFile
		checkFile: function(file) {
			$(document).trigger('functionIt', 'checkFile');
			var self = this,
				customFile = self.customPath + file,
				defaultFile = self.defaultPath + file,
				myFile = '';

			self.serverFile( customFile ).done(function(response){
				myFile = (response.d) ? customFile : defaultFile;
			});
			return myFile;
		},

		// Check if file exists using server
		serverFile: function( file ){
			$(document).trigger('functionIt', 'serverFile');

			return $.ajax({
				type: "POST",
                url: "services/BuyatabWS.asmx/FileExists",
                data: "{filename:'/" + file + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
				async: false,
				timeout: 5000
            });
		},

		// Check file exist by url
		checkUrl: function(url){
			$(document).trigger('functionIt', 'checkUrl');

			return $.ajax({
				type: "POST",
				url: "services/BuyatabWS.asmx/UrlExists",
				data: "{url:'" + url + "'}",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				timeout: 5000
			});
		},

		// Check if file exists using server
		checkGostFile: function( file ){
			$(document).trigger('functionIt', 'serverFile');

			return $.ajax({
				type: "POST",
                url: "services/BuyatabWS.asmx/FileExists",
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
				checkoutData = {
					crq: {
						Cart: {
							CartCards: []
						},
						Payment: {
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
							PostalZip: $('input#cc_zip').val(),

							Telephone: $('input#cc_phone').val(),
							Email: $('input#cc_email').val(),
							AddCharge: self.totalAdditionalCharge || 0,
							AddChargeType: self.settings.Merchant.AddChargeType || 0
						},
						RA: {
							CP: self.ccp,
							UA: window.navigator.userAgent
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
						DiscountType: self.b2bDiscount.type
					};
				}

				// console.log(optIn);
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
				url: "services/BuyatabWS.asmx/Checkout",
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function( data ){
					console.log(data.d);
					if(data.d.Status.Success || data.d.Status.Error.ErrorCode == 404){

						$('.group-error').removeClass('error-in');
						try {
							localStorage.removeItem( 'cart' + getParam( 'id' ) );
						} catch (err) {
							if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
						}
						$(window).trigger('anaLog', 'checkoutSuccess');

						window.location.href = "receipt.html?on=" + data.d.OrderNumber + '&analytics=true';
					} else {
						var eCode = data.d.Status.Error.ErrorCode;

						if(self.b2b && self.PurchaseId == 7){
							// acctions for b2b error
							var gError = $('#summary-window .group-error')
									.addClass('error-in')
									.html('Error ' + data.d.Status.Error.ErrorCode + ': ' + data.d.Status.Error.Message);
						}

						if (eCode == 14  ||
							eCode == 444 ||
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
								.html(self.Language.dialogs.exception_error + ' Error Code: ' + data.d.Status.Error.ErrorCode);
						$(window).trigger('anaLog', 'checkoutExceptionError');
						} else {
							$('a.purchase').removeClass('dt-inactive')
								.parent()
								.find('.group-error')
								.addClass('error-in')
								.html('Error ' + data.d.Status.Error.ErrorCode + ': ' + data.d.Status.Error.Message);
							$(window).trigger('anaLog', 'checkoutError');
							console.log(data.d.Status.Error.Message);
						}
					}
				},
				error: function(e) {
					console.log(e);
					$('a.purchase').parent()
						.find('.group-error')
						.addClass('error-in')
						.html('Error ' + data.d.Status.Error.ErrorCode + ': ' +self.Language.dialogs.checkout_error);
						$(window).trigger('anaLog', 'checkoutError');
				}
			});
		},

		// check eligibility for disount and return value
		getDiscount: function( amount ){
			$(document).trigger('functionIt', 'getDiscount');
			var self = this;
			return $.ajax({
				type: 'POST',
				url: 'services/BuyatabWS.asmx/GetDiscount',
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
				url: "services/BuyatabWS.asmx/GetShippingRates",
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data) {
					if(data.d[0].Type == 'Undefined'){
						jLoader.hide();
						$('a.get-shipment').siblings('.group-error').html('Error: Please review address.');
					}else{
						$.each(data.d, function(i, e) {

							var myObj = $('<div />', {
								html: '<input name="sOpt" class="check" type="radio" id="opt' + i + '" value="{|Cost|: |' + e.Cost + '|, |Type|: |' + e.Type + '|}" alt="' + self.Language.dialogs.shipping_option + '">' +
								// '" value="' + JSON.stringify(e) + '">'+
								'<label for="opt' + i + '">' + e.Type + ' ' + self.getMoney(e.Cost.toFixed(2)) + '</label>'
							}).addClass('shipping-option');
							sObject.append(myObj);
						});

						sObject.append('<div class="field-error"></div>');
						sObject.prependTo('div#shipping-options');
						sObject.before('<h2>' + self.Language.dialogs.shipping_options + '</h2>');

						jLoader.hide();
						$('a.get-shipment').parents('div.pages-nav').hide();
						$('a.add-to-cart').parents('div.pages-nav').show();
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

		// Load the template file
		getTemplate: function(){
			$(document).trigger('functionIt', 'getTemplate');
			var self = this,
				file = (self.IsMobile) ? self.mobileTemplate : self.templateFile;
			return $.ajax({
				url: self.checkFile( file, 'script' ),
				dataType: "html"
			});
		},

		// Load Underscore template
		getUnder: function(){
			$(document).trigger('functionIt', 'getUnder');
			var self = this;
			return $.ajax({
				url: self.checkFile( self.underFile, 'script' ),
				dataType: "html"
			});
		},

		// Load the language file
		getLanguage: function(){
			$(document).trigger('functionIt', 'getLanguage');
			var self = this;
			return $.ajax({
				url: self.defaultPath + self.languageFile,
				dataType: "json"
			});
		},

		// Load the custom language file
		customLanguage: function(){
			$(document).trigger('functionIt', 'customLanguage');
			var self = this;

			return $.ajax({
				url: self.checkFile( self.languageFile, 'json' ),
				dataType: "json"
			});
		},

		// Load CSS file
		getStyle: function(){
			$(document).trigger('functionIt', 'getStyle');
			var self = this;
			return self.checkFile( self.CSSFile, 'text/css' );
		},

		// Load options from ini.json
		getIni: function(){
			$(document).trigger('functionIt', 'getIni');
			var self = this,
				myIni = (self.b2b) ? self.defaultPath + self.iniAdmin : self.checkFile( self.iniFile );
			return $.ajax({
				url: myIni,
				dataType: "json"
			});
		},

		// Apend CSSFile to the head
		appendStyle: function( CSSFile ){
			$(document).trigger('functionIt', 'appendStyle');
			var self = this,
				deferred = $.Deferred();

			if( CSSFile != $('#default-style').attr('href') && !self.b2b){
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
				path = '/gcp/view/template/' + self.MerchantId + '/cards/medium/',
				myImg = path + cards[0].ImageName,

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

				$('li#customize input, li#customize textarea').val(''); //reset all fields and then...

				//Images
				$('div.choose-card').css( 'background', 'url("' + myImg + '" )' );
				$('img#preview-image').attr('src', myImg.replace('medium', 'big') );
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
					//move design type selector (if exists)
					$('ul#custom-type > li')[0].click();

					if(self.hasEnclosure){
						$("select#enclosure").val('1');
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
				path = '/gcp/view/template/' + self.MerchantId + '/cards/medium/',
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
					myImage.css( 'background', 'url("' + path + myCard.ImageName + '" )' )
							.attr('title', myCard.Description );
					previewImg.attr('src', path + myCard.ImageName.replace('medium', 'big') );
					hField.val(myCard.StyleId);
					srcField.val(  path + myCard.ImageName );

					self.cTemplate = myTemplt;
				}else{
					// console.log('No pre selected card');
				}

			}
		},

		//display card preview
		cardPreview: function( image, photoCard, openCard, showValue, showMessage ){
			$(document).trigger('functionIt', 'cardPreview');

			//default values
            photoCard       = photoCard   || false;
            openCard        = openCard    || false;
            showValue       = showValue   || true;
            showMessage     = showMessage || true;

            var self        = this,
                previewBG   = $('div#preview-window-bg').fadeToggle(150).toggleClass('preview-show'),
                previewImg  = $('img#preview-image').attr('src', '');

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
					previewImg.attr('src', image.replace('medium', 'big') );
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
				path = '/gcp/view/template/' + self.MerchantId + '/cards/medium/',
				dPath = '/gcp/view/template/default/cards/medium/',
				previewBG = myTemplt.find('div#preview-window-bg'),
				imgWrap = myTemplt.find('#image-wrap'),
				previewImg = myTemplt.find('img#preview-image')
					.attr('src', (path + cards[0].ImageName).replace('medium', 'big') ),
				previewBt = myTemplt.find('span#pw-close'),

				customizeWrap = myTemplt.find('div#card-selector'),
				wrap = myTemplt
						.find( (self.topSelector ) ? 'figure#image-wrap' : 'div#image-wrap' )
							.addClass( (self.topSelector ) ? 'always-visible' : '' ),

				ulWrap = $('<div />').prependTo(wrap).attr('id', 'ulWrapper'),
				myImage = myTemplt.find('.choose-card')
					.css( 'background', 'url("' + path + cards[0].ImageName + '" )' )
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
				srcField = myTemplt.find('input#card_src').val( path + cards[0].ImageName ),

				myUl = $('<ul />').addClass('image-selector')
									.prependTo(ulWrap)
									.css({
										height: 150,
										width: self.isWidth,
										left: 40
									}),

				nextButton = $('<div />').addClass('next').prependTo(ulWrap),
				backButton = $('<div />').addClass('prev').prependTo(ulWrap),
				html = '';

			$(cards).each(function( i, card ){
				//Adds the open card animation for mobile
				if(self.openCard){
					html = html + '<li class="open-card"><div class="card"><div class="tile front"> <div class="tile outside"><img src="' + path + 'outside/' + card.ImageName + '" data-id="' + card.StyleId + '" /></div> <div class="tile inside"><img src="' + path + 'inside/' + card.ImageName + '"/></div> </div> <div class="tile in-right"><img src="' + path + 'in-right.png' + '"/></div> </div></li>';

				}else{
					html = (mob) ? html + '<li><img src="' + path + card.ImageName +'" data-id="' + card.StyleId + '" /></li>': html + '<li style="width: ' + self.cardWidth + 'px; height: ' + self.cardHeight + 'px;"><img src="' + path + card.ImageName + '" data-id="' + card.StyleId + '"></li>';
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
				nextButton.remove();
				backButton.remove();

				myUl.removeClass('image-selector').addClass('slides');

				var $flexslider = $(ulWrap).addClass('flexslider loading-slider').attr('id', 'ulFWrapper').flexslider({
					animation: "slide",
					slideshow: false,
					direction: "horizontal",
					easing: "swing",
					smoothHeight: true,
					startAt: 0,

					slideshowSpeed: 100,
					animationSpeed: 600,

					touch: false,

					after: function(slider){
						var myData = $('.flex-active-slide img').data('id'),
							myScr  = $('.flex-active-slide img').attr("src");
						myImage.css( 'background', 'url("' + myScr + '" )' );

						if(self.openCard){
							previewImg.attr('src', myScr.replace('medium/outside', 'big') );
						}else{
							previewImg.attr('src', myScr.replace('medium', 'big') );
						}

						hField.val(myData);
						srcField.val(  myScr );
					},
					before: function(slider){
						// // console.log(slider.slides[slider.animatingTo].childNodes[0].src);
						// if( $(slider.slides[slider.animatingTo].childNodes[0]).attr("src") == "") {
						// $(slider.slides[slider.animatingTo].childNodes[0]).attr("src", $(slider.slides[slider.animatingTo].childNodes[0]).attr("rel")); 
						// }

						// prevent vertical scroll > avoid slide to freeze
						// imgWrap.on('touchmove', function (event) {
						// event.preventDefault();
						// }, false);
					},
					start: function(slider){
						slider.flexAnimate(1);
						slider.flexAnimate(0);
						$flexslider.removeClass('loading-slider');
						// $('.flex-prev').click();
					},
					end: function(slider){
						// slider.pause();						
					}
				}).show();
				myImage.css('visiblity', 'hidden').hide();

			}else{
				$(myUl).roundabout({
					btnNext: nextButton,
					btnPrev: backButton
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
				self.cardPreview(  srcField.val() );
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
				cardWrapper = photoWrapper.find('.field-left');

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
									//resize image
									$('#photo-slider').slider({value: 1});
									self.photoSave = false;

								})
								.appendTo(btWrapper);
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
					}
				});
			}
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
					eHtml = '';

				$.each(enclosures, function(i, enclosure){
					eHtml += '<option value="' + enclosure.Id + '" data-cost="' + enclosure.Cost + '">' + enclosure.EnclosureTypeName + ' ' + self.getMoney(enclosure.Cost.toFixed(2)) +  '</option>';
				});

				var	html = '<div class="field">' +
								'<div class="field-left">' +
									'<div>' +
										'<label for="enclosure"> Enclosure </label>' +
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

				$(html).prependTo(wrapper);

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
						// alert('check it!')
					}
				});

				$('#photo-file').fileupload({
					// fileInput: $('#photo-file'),
					dataType: 'json',
					// loadImageFileTypes: /^image\/(gif|jpeg|png)$/,
					min_width : minWidth,
					min_height : minHeight,
					//url: 'server/php/?merchantId=' + self.MerchantId,
					// url: 'server/ImageUpload.ashx?merchantId=' + self.MerchantId,
					url: 'server/GhostProxy.ashx?action=u&merchantId=' + self.MerchantId + '&minWidth=' + minWidth + '&minHeight=' + minHeight,
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
						var myFile = data.result,
							eFile = myFile.error || true,
							uFile = myFile.url,
							status = myFile.status,
							resolution = myFile.resolution;

						if(eFile && status === 0){
							//check dpi then...

							// if(self.settings.Merchant.IsPlastic && resolution < 300){
							//// alert('You are uploading a low resolution image (' + resolution + ' dpi). We recomend to use 300+ dpi images. If you want to upload another picture please click on the Reset button after upload.');
							//$( '<div></div>' )
							//		.html('You are uploading a low resolution image (' + resolution + ' dpi). We recomend to use 300+ dpi images. If you want to upload another picture please click on the Reset button after upload.')
							//		.dialog({
							//			resizable: false,
							//			modal: true,
							//			buttons: {
							//				'Ok': function() {
							//					$( this ).dialog( "close" );
							//				}
							//			}
							//		});
							// }

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

			// console.dir(imgInfo);
			if(!self.photoSave){

				$.ajax({
					// url: 'server/ImageCrop.ashx',
					url: 'server/GhostProxy.ashx?action=c',
					type: "POST",
					data: imgInfo,
					success: function(response){
						// console.log(response);
						response = $.parseJSON(response);
						// console.log(response);
						// console.log({value: response.progress});
						if(response.success){
							$('input#saved-photo').val(imgInfo.src);
							self.photoSave = true;
							// console.log('Saving ok');
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
					case 0: //standard
					oWidth    = 200;
					oHeight   = 100;
					break;
					case 1: //Phisical (cineplex)
					oWidth    = 200;
					oHeight   = 95;
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
			}else{
				switch( cardStyle ){
					case 0: //standard
					oWidth    = 150;
					oHeight   = 124;
					break;
					case 1: //Phisical (cineplex)
					oWidth    = 150;
					oHeight   = 124;
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

				// console.log(unit);
				// console.log(percent);
				// console.log(propW);
				// console.log(this);

			if(myOrientation == 'bottom' || myOrientation == 'up'){
				myImage.width( ( unit * (percent - 1) ) + oWidth );
				myImage.height( 'auto' );
			}else{
				myImage.height( ( unitH * (percent - 1) ) + oHeight );
				myImage.width( 'auto' );
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

					self.summary.discount = -Math.abs( (sub * self.b2bDiscount.value) / 100 );
				}
			}

			$.map(self.summary, function(value, key) {
				if(value !== 0){
					n++;
					total += value;
					innerHtml += "<div class='sb-total'>" + self.Language.cart.text[key] +
								"<span class='t-total'>" +
									self.getMoney( self.numberWithCommas(value.toFixed(2)) ) +
								"</span>" +
							"</div>";
				}
			});

			if(n <= 1) {
				innerHtml = '';
			}

			html += innerHtml + "<div class='s-total'>" + self.Language.cart.text.summary +
									"<span class='t-total'>" +
										self.getMoney( self.numberWithCommas(total.toFixed(2)) ) +
									"</span>" +
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
				content = $(document).find('div#content').outerHeight(false),
				cartBottom = newPosition + cart.outerHeight(false),
				marginTop = parseInt(cart.css('margin-top'), 10);

			if(scrollAmount > 0){
				var topPos = (newPosition + self.top_offset) - marginTop ;

				topPos = (topPos > 0) ? topPos : 0;

				if(cartBottom > content){ //avoid to go to the bottom
					topPos = topPos - (cartBottom - content ) + 50; //extra 50px
				}
				cart.stop().animate({top: topPos});

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

			delTab.width(nNav * self.stepWidth);

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
						ccResult = 'Visa';

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
				.on('keydown keyup blur paste', function(){
				$(this).val( $(this).val().replace(/[^0-9+ ]/g,'') );
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
						// dayNamesMin: (lang == 'fr') ? ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
						// monthNames: (lang == 'fr') ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
						// dayNamesShort: (lang == 'fr') ? ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'] : ['Sum','Mon','Tue','Wed','Thu','Fri','Sat']
					},

					dataField = myTemplt.find('input#email_delivery_date, input#sms_delivery_date')
					.datepicker({
						minDate: 0,
						dateFormat: "D, d MM, yy"
						// dayNamesMin: language.dayNamesMin,
						// monthNames: language.monthNames,
						// dayNamesShort: language.dayNamesShort
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
							liN = ulLine * ( $('div#cards-wrapper li').length - 2) * -1;

						$(arrows).removeClass('hide-me');
						if( $(this).data('direction') == 'up' ){ //up

							if( ulMargn !== 0){
								ulMargn = ulMargn + ulLine;
								$(this).removeClass('hide-me');
							}else{
								$(this).addClass('hide-me');
							}
						}else{ //down
							if(ulMargn > liN){
								ulMargn = ulMargn - ulLine;
								$(this).removeClass('hide-me');
							}else{
								$(this).addClass('hide-me');
							}
						}

						$(cards).css('margin-top', ulMargn);
						// console.log(ulLine)
						clicked = true;
						//css transition currentlly 0.25s. 300 should be enought
						setTimeout(function(){ clicked = false; }, 300);
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
				self.$elem.buyalytics({
					Id: sAnalytics.Id,
					type: sAnalytics.Type,
					language: self.settings.Merchant.Language,
					mobile: self.settings.Merchant.IsMobile
				});
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
			if( vSize <= 5 && self.settings.Amount.Open && vType == 'buttons'){
				var dollar = (self.showDollar) ? '$' : '';
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
				
					// Update label for plastic photoCard
					myTemplt.find('#upload-photo > p').append(self.Language.customize.text.additional_charge + ' (' + self.getMoney(chargePerCard.toFixed(2)) + ')');

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
		lightBoxIt: function( url, title ){
			console.log(url);
			$(document).trigger('functionIt', 'lightBoxIt');
			var self = this,
				lbWindow = $('<div id="lightbox" />').css({
					position: 'relative',
					height: '400px',
					width: '600px'
				}),

				button_ok = 'Ok',
				dialog_buttons = {};

			if(self.validURL(url)){
				lbWindow.load(url);
			}else{
				lbWindow.html(url);
			}

			// console.log(url);

			dialog_buttons[button_ok] = function(){
				$( this ).dialog( "close" );
			};

			$( '<div></div>' )
			.html(lbWindow)
			.dialog({
				title: title,
				resizable: true,
				modal: true,
				minHeight: 500,
				minWidth: 640,
				maxHeight: 600,
				maxWidth: 700,
				buttons: dialog_buttons
			});
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
				url: 'services/BuyatabWS.asmx/GetCountries',
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
				url: 'services/BuyatabWS.asmx/GetShippingCountries',
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
			});
		},

		// Change states acording to country
		getState: function( countryField, stateField, zipField, forShipping){
			$(document).trigger('functionIt', 'getState');
			var self = this,
				myTemplt = $( self.cTemplate ),
				country = myTemplt.find('select#' + countryField),
				states = myTemplt.find('select#' + stateField),
				zip = myTemplt.find('input#' + zipField),
				sParents = states.parent(),
				html = '';

			country.on('change', function( e, f ){
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
						url: 'services/BuyatabWS.asmx/GetRegionsByCountry',
						type: "POST",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						data: "{country_id:" + JSON.stringify(myData) + "}"
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
								html = html + '<option value="' + data.Id + '">' + data.Name + '</option>';
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
					if($(this).val() != -1){
						var i = $(this).val(),
							address2 = self.mailShipping[i].Shipment.ShippingAddress.Address2,
							separator = (address2 === '') ? '' : ' - ';
						$('div#new-shipment').hide();
						$('div#new-shipment').find('input').addClass('dont-validate');

						html =  address2 + separator +
								self.mailShipping[i].Shipment.ShippingAddress.Address1 + ', ' +
								self.mailShipping[i].Shipment.ShippingAddress.City + ', ' +
								self.mailShipping[i].Shipment.ShippingAddress.Region +
								'<span>' + lang.text.shipping_option +
								': ' +  self.mailShipping[i].Shipment.ShippingOption.Type +
								' - ' + self.getMoney( self.mailShipping[i].Shipment.ShippingOption.Cost );
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
								packTotal += parseInt(models[i].PersonalizedEnclosure.Cost, 10) * models[i].Quantity;
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

							self.summary = {
								sub_total:   subTotal,
								shipping_total:   shipTotal,
								enclosure:  packTotal,
								discount:   discount,
								add_charges: self.totalAdditionalCharge
							};

							$('a.checkout, a.new-card').show();
							$('div#summary').html( self.summaryHtml() );
						});

						//Summary extra page
						$('div.cw-order span').html( self.getMoney( self.numberWithCommas(subTotal.toFixed(2)) ) );
						$('div.cw-shipping span').html( self.getMoney( self.numberWithCommas(shipTotal.toFixed(2)) ) );
						$('div.cw-additional span').html( self.getMoney( self.numberWithCommas(self.totalAdditionalCharge.toFixed(2)) ) );
						$('div.cw-discount span').html(self.getMoney( self.numberWithCommas(pDiscount.toFixed(2)) ));
						$('div.cw-total span').html( self.getMoney( self.numberWithCommas(total.toFixed(2)) ) );
						//summary pages end

						self.total = total;
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
							// console.log(myDate);

						}catch (error){
							myDate = self.today;
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
								if(lCart[i].Delivery.DeliveryType == 'plastic'){
									self.pushAddress(lCart[i]);
								}
							});
							
							var pArray = $.grep(lCart, function( n, i){
								// return everything but photo cards
								return (n.DesignType != 'photo');

								// $.when(self.checkUrl(n.CardImg)).then(function(response){
								// var fileAvailable = response.d;

								// console.log(n.DesignType);
								// console.log(fileAvailable);I have fully read, accepted and agreed to 

								// return (n.DesignType !== 'photo' || fileAvailable);
								// });
							}, false);

							if(pArray.length > 0){
								$(window).trigger('anaLog', 'localStorage');
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
									$( '<div></div>' )
										.html(self.Language.dialogs.load_local)
										.dialog({
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
						self.editingCard = false;
						self.moveIt( ['customize'] );
						App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
						// console.log(self.currentModel);
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					if(self.editingCard === true){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
								.html(self.Language.dialogs.editing_card)
								.dialog({
									resizable: false,
									modal: true,
									buttons: dialog_buttons
							});
						});
					}else{
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
							self.cardPreview(thisView.model.toJSON().CardImg, true);
							// console.log(thisView.model.toJSON());
						}else{
							App.prepareEditing(thisView);
							$('div#preview-window-bg').show();
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
							self.cardPreview(thisView.model.toJSON().CardImg, true);
							// console.log(thisView.model.toJSON());
						}else{
							// App.prepareEditing(thisView);
							$('div#preview-window-bg').show();
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
								resizable: false,
								modal: true,
								buttons: dialog_buttons
						});
					});
					self.checkQuantity();
				},

				remove: function() {
					this.$el.remove();
					self.checkQuantity();
				},

				render: function() {
					var data = this.model.toJSON();

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
									resizable: false,
									modal: true,
									buttons: dialog_buttons
							});
					}else{
						if( self.groupValidation( $('li#customize_card ul#design-selector > li.validate, li#customize_card div#customize-data, li#delivery-info li.validate') , $('a.update-cart') ) ) {
							myModel.set( App.submit() );
							self.editingCard = false;
							self.cardInit();
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

				tempObj.Message = $('textarea#card_message').val();
				tempObj.MerchantId = self.MerchantId;
				//tempObj.MerchantId = window.getParam( 'id' );

				tempObj.Delivery = {};
				tempObj.Delivery.Persons = [];
				tempObj.Delivery.Persons[0] = {};
				tempObj.Delivery.Persons[1] = {};

				var dType = $('input#delivery_type').val(),
					dContainer = $('li#delivery-info ul#delivery-content li#dc-' + dType);

				tempObj.Delivery.DeliveryType = dType;
				tempObj.Delivery.Persons[0].Type = 'Recipient';
				tempObj.Delivery.Persons[0].Name =  $(dContainer).find('input[id$="recipient_name"]').val();
				tempObj.Delivery.Persons[0].Email = $(dContainer).find('input[id$="recipient_email"]').val();
				tempObj.Delivery.Persons[1].Type = 'Sender';
				tempObj.Delivery.Persons[0].FB = ""; //unfinished
				tempObj.Delivery.Persons[1].Name =  $(dContainer).find('input[id$="from_name"]').val();
				tempObj.Delivery.Persons[1].FB = ""; //unfinished

				if(dType == 'email'){
					var eDate = Date.parse( $(dContainer).find('input#email_delivery_date').val().replace(/[-]/g, '/') ),
						cDate = new Date(eDate).toDateString();

					tempObj.Delivery.DeliveryDate = cDate;
					tempObj.Delivery.Persons[1].Email = '';
				}else if(dType == 'sms'){
					var eDate = Date.parse( $(dContainer).find('input#sms_delivery_date').val().replace(/[-]/g, '/') ),
						cDate = new Date(eDate).toDateString();

					tempObj.Delivery.DeliveryDate = cDate;
					tempObj.Delivery.Persons[0].Phone = $(dContainer).find('input[id$="recipient_phone"]').val();
				}
				else{
					tempObj.Delivery.DeliveryDate = '';
					tempObj.Delivery.Persons[1].Email = $(dContainer).find('input[id$="from_email"]').val();
				}

				if (dType == 'plastic') {
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
						tempObj.Shipment.ShippingAddress.Phone			=  myShipment.Shipment.ShippingAddress.Phone;
					}
				}
				var enclosures = self.settings.Enclosures || [];

				if(enclosures.length > 0){
					tempObj.PersonalizedEnclosure						= {};
					tempObj.PersonalizedEnclosure.Enclosure_Id			= $('#enclosure').val();
					tempObj.PersonalizedEnclosure.Cost					= $('#enclosure  option:selected').data('cost');
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
					$('li#delivery-info li.validate input[id$="recipient_phone"]').val(myCard.Delivery.Persons[1].Phone);

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
				okButton = $('<a class="button confirmation-cancel" href="#">' + self.Language.dialogs.ok + '</a>')
					.appendTo(pNav)
					.on('click', function(event) {
						event.preventDefault();
						if(!$(this).hasClass('loading')){
							$(this).addClass('loading');
							self.sendCheckout();
						}
					});

			pWindow.prependTo(self.elem);

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
		fieldValidation: function(field, status, type, errorCode) {
			$(document).trigger('functionIt', 'fieldValidation');
			var myParent = $(field).parents('div.field, div.half-field'),
				lang = this.Language.errors,
				errorType = '',
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
					.html(lang[errorCode]);
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
							fData = fData + ' ' + otherField;
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
						url: "services/BuyatabWS.asmx/Validate",
						data: "{validation_group:" + JSON.stringify(valObj) + "}",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function( data ){
							var d = data.d[0];
							// console.log(data.d[0])

							self.fieldValidation( myField,
													d.Success,
													d.Error.ExceptionDetails,
													d.Error.ErrorCode);
							if( !d.Success ){
								$(window).trigger('anaLog', 'singleValidation: ' + myField.attr('id'));
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
		// Execute validation for a group of fields
		groupValidation: function( groupsArray, triggeredBy ){
			$(document).trigger('functionIt', 'groupValidation');
			var self = this,
				valObj = [],
				errors = 0;

			if( !self.debugMode ){ //turn validation off on debug mode

				var fields = $(groupsArray).find('input[type=text], input[type=number], input[type=file], input[type=hidden].photo, input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, input[type=radio], input#saved-photo, textarea, select');
				$(fields).each(function() {
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
							fData = fData + ' ' + otherField;
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
				});
				// console.log(fields)

				$.ajax({
					type: "POST",
					url: "services/BuyatabWS.asmx/Validate",
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
									element.Error.ErrorCode) ){
								errors ++;
								$(window).trigger('anaLog', 'groupValidation');
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

			// console.log( message );

			try {
				// var domain = window.location.protocol + 'm-beta.bostonpizza.com';

				// var domain = 'local.buyatab.com'; //working on local
				var domain = decodeURIComponent( self.settings.Merchant.Domain.replace(/^#/, '') ) || 'buyatab.com/';

				if(domain !== ''){

					//Check for protocol
					if(!/http/i.test(domain)){
						domain = window.location.protocol  + '//' + domain;
					}

					window.parent.postMessage(message, domain);

					console.log(domain);

					//ie 9-
					window.parent.postMessage(message.value, domain);

				}
			} catch (err) {
				console.log(err);
			}
		},

		// Receive a Cross Domain Message
		receiveCrossDomain: function() {
			$(document).trigger('functionIt', 'receiveCrossDomain');
			var self = this,
				domain = decodeURIComponent( self.settings.Merchant.Domain.replace(/^#/, '') ),
				eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
				eventer = window[eventMethod],
				messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
				
			window.btbMessages = [];

			if(domain !== ''){
				var target = window.location.protocol  + '//' + domain,
					target2 = 'http://' + domain;

				// Listen to message from child window
				eventer(messageEvent,function(e) {
					// console.log(e);
					if ( e.origin !== target || e.origin !== target2 ) {
						return;
					}else{
						if(e.data.type == 'resize'){
							try{
								var parentScroll = Number( e.data.value.replace(/.*top=(\d+)(?:&|$)/, '$1') );
								self.updateFloatingCart(parentScroll);
							}
							catch(error){
								console.log(error);
							}
						}
					}
					// console.log(e);
					window.btbMessages.push(e);

				},false);
			}
			// we have to listen for 'message'
			// window.addEventListener('message', function(){
				// console.log('this');
			// }, false);

			window.onmessage = function(message){
				//prevent getting message from other domains
				// if ( message.origin !== target ) {
				// return;
				// }

				// console.log(message);

				if(typeof message.data == 'object'){
					if(message.data.type == 'scroll'){
						self.updateFloatingCart(message.data.value);
					}
				}else{
					self.updateFloatingCart(message.data);
				}
			};
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

		// Add the VeriSign Seal to the template
		addSeal: function(){
			$(document).trigger('functionIt', 'addSeal');

			var self = this,
				seal = $('img#verisign').remove()
				.on('click', function(){
					vrsn_splash();
				})
				.on("contextmenu",function(e){
					return false;
				}),

				seal1 = $('img#verisign1').hide();

			if(self.settings.Merchant.confirmationPage){
				seal.clone().appendTo('li#cc-info div.pages-nav, li#billing-info div.pages-nav, li#purchaser-info div.pages-nav');
			}else{
				seal.clone().appendTo('li#cc-info div.pages-nav, li#billing-info div.pages-nav');
			}
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

				self.waitLoad( self.additionalScript, function(){
					self.analytics();
				} );
			}
		},

		// Convert IOS date
		convertDate: function( date ){
			$(document).trigger('functionIt', 'convertDate');
			var dates = date.split('-');
			return dates[1] + '/' + dates[0];
		},

		// set quantity to 0 if no card available
		// checkQuantity: function(){
		// $(document).trigger('functionIt', 'checkQuantity');
		// var self = this,
		// available = self.MaxCards - self.totalCards,
		// field = $('#card_quantity');
		// if(available <= 0){
		// field.val(0);
		// $('input#card_quantity').spinner('option', 'min', 0);
		// }else{
		// $('input#card_quantity').spinner('option', 'min', 1);
		// }
		// },

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
				file = file.toLowerCase();

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

	$.fn.bTemplate = function( options ) {
		return this.each(function() {
			var template = Object.create( Template );

			template.init( options, this );

			$.data( this, 'bTemplate', template );
		});
	};

	$.fn.bTemplate.options = {
		CSSFile: 'css/style.css',
		iniFile: 'ini.json',
		iniAdmin: 'ini-admin.json',
		templateFile: 'template.handlebars',
		mobileTemplate: 'mobile.handlebars',
		underFile: 'card.handlebars',
		languageFile: 'en.json',
		onComplete: null
	};

})( jQuery, window, document );