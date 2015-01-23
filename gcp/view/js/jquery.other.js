// Utility (for old browsers)
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function($, window, document, undefined) {
	function getHostname(url) {
		var m = url.match(/^http[s]?:\/\/[^/]+/);
		return m ? m[0] : null;
	}

	var Other = {
		init: function(options, elem) {
			var self = this;

			// Overwrite options if passed from the page
			self.options = $.extend(false, $.fn._other.options, options);

			self.elem = elem;
			self.$elem = $(elem);
			self.MerchantId = options.MerchantId;

			self.purchaseType = options.purchaseType || options.PurchaseId || 0;
            console.log(self.purchaseType);

            self.eftBalance = 0;
			self.moneySign = '$';
			self.valueType = 'buttons';
			self.showDollar = true;
			self.messageMax = 200;
			self.lineMax = 5;
			self.loadingFrom = window.location.origin ? window.location.origin : window.location.protocol + '//' + document.domain;
			self.currentURL = ($('#buyatab_plugin').length > 0) ? getHostname( $('#buyatab_plugin').attr('src') ) : self.loadingFrom;

			self.Language = {
				title: "Buy a Gift Card for ",
				header: {
					customize: "customize",
					delivery: "delivery",
					editcart: "your cart",
					checkoutpage: "checkout",
					billing: "billing",
					purchaser: "final"
				},
				buttons: {
					cont: "Continue",
					back: "Back",
					checkout: "Checkout",
					complete: "Complete"
				},
				dialogs: {
					yes: "Yes",
					no: "No",
					ok: "Ok",
					cancel: "Cancel",
					editing_card: "A card is being edited. Are you sure you want to proceed?",
					load_local: "There are cards pending in your cart since your last visit. Would you like to keep them?",
					delete_card: "Are you sure you want to delete this card?",
					processing: "Processing your data...",
					shipping_options: "Shipping options",
					shipping_option: "You must select one option",
					checkout_error: "Sorry, your request couldn't be completed. Please contact the Customer Support using the contact below.",
					exception_error: "There has been an unexpected error with your transaction. Please contact support at the information below before attempting again.",
					max_transaction: "Sorry. You have reached the maximun value per transaction: "
				},
				errors: {
					quantity: "Choose between 1 and ",
					value: "Minimum of ",
					maxvalue: "Maximum of ",
					required: "This field is required",
					optional_sender_name: "The credit card name will be used instead",
					check: "You must agree with the terms",
					group: "There are some errors. Please view fields above.",
					past_date: "It cannot be a date in the past",

					1002: "The name on the credit card will be used",
					1003: "Make sure your card has no CVD",
					1010: "Required field",
					1012: "Use a valid email address",
					1015: "The credit card is expired",
					1016: "Enter a valid credit card number",
					1017: "Enter a valid Zip/Postal code",
					1018: "Enter a valid United States zip code",
					1019: "Enter a valid phone number",
					1022: "A name shouldn't be longer than 50 chars",
					1025: "A name shouldn't be longer than 50 chars",
					1027: "It must be a 10 digits Canada/US valid phone number",
					1030: "The sender's email will be used",
					1032: "The name on the credit card will be used",
					1033: "The purchaser's email will be used",
					1034: "Make sure you enter all the information",
					1035: "For shipping notification matters",
					1026: "Maximum number of cards reached",

					10: "Could not get merchant data",
					20: "Could not get chain data",

					100: "Error updating balance",
					110: "Error checking  balance",
					120: "Invalid number or API error checking balance",
					130: "Failed to create new external gift card",
					190: "A problem occurred checking balance",

					200: "EncryptedProductReferenceId could not be parsed",
					210: "Could not retrieve data for gift card",
					220: "An error occurred processing payment",
					230: "Payment was not accepted",
					240: "Failed to update balance (API error)",
					290: "A problem occurred reloading gift card",
					300: "The transaction was put on hold",
					310: "Card is not reloadable",
					320: "The card is on hold"
				},
				customize: {
					text: {
						title: "customize your card",
						customize_card: "Customize your card",
						delivery_info: "Delivery options",
						change_card: "Click here to change design",
						change_design_bt: "Select design",
						preview_bt: "Preview",
						add_to_cart_bt: "Add to cart",
						update_cart_bt: "Save changes",
						go_to_delivery: "Add to cart",
						back_to_card: "Back",
						open_card: "Click on the card to open/close"
					},
					label: {
						quantity: "Quantity",
						message: "Message",
						value: "Select/Enter a value",
						value_reload: "Add a value",
						value_mobile: "Value",
						email: "Email",
						print: "Print",
						facebook: "Facebook",
						uploading: "Uploading",
						browse_photo: "Browse photo"
					},
					detail: {
						message: "characters left",
						message_lines: "remaining lines",
						value_mobile: "Values between ",
						value: "Any value between ",
						value2: "Select a value"
					},
					placeholder: {
						message: "Add your personal message here...",
						value: "$$$"
					},
					email: {
						title: "Email",
						text: {
							page_info: ""
						},
						label: {
							recipient_name: "Recipient name",
							recipient_email: "Recipient email",
							from_name: "Sender name",
							delivery_date: "Delivery date"
						},
						detail: {
							recipient_name: "The name of the person you're sending the card to",
							recipient_email: "The email we're going to send the card to",
							from_name: "The name of the person the card is from",
							delivery_date: "Send the card now or someday in the future...",
							immediately: "Send immediately"
						},
						placeholder: {
							recipient_name: "Full name",
							recipient_email: "recipient@email.com",
							from_name: "Your name",
							delivery_date: ""
						}
					},
					plastic: {
						title: "Mail",
						text: {
							page_info: "Gift card(s) will be delivered to the provided address.",
							shipping_info: "Shipping information",
							new_address: "You can select a preview added address free of charge or enter a new address and choose another shipping method.",
							shipping_option: "Shipping option"
						},
						label: {
							recipient_name: "Recipient name",
							recipient_phone: "Recipient's phone",
							recipient_email: "Recipient email",
							from_name: "Sender name",
							from_email: "Sender email",
							address: "Address",
							address2: "Address 2",
							city: "City",
							country: "Country",
							state: "State/Province",
							zip: "Zip/Postal code",
							cont: "Continue",
							new_address: "New address"

						},
						detail: {
							recipient_name: "The name of the person you're sending the card to",
							recipient_phone: "The phone number of the recipient",
							recipient_email: "The email we're going to send the card to",
							from_name: "The name of the person the card is from",
							from_email: "So we can send the card to you to print it",
							name: "Just like on the card",
							expiration: "Month and year",
							address: "Recipient's address",
							address2: "Complement of the address",
							city: "Recipient's city",
							country: "Select Recipient's country",
							state: "Select Recipient's State/Province",
							zip: "Enter Recipient's Zip/Postal code"

						},
						placeholder: {
							recipient_name: "Full name",
							recipient_phone: "+1 (555) 666-777",
							from_name: "Your name",
							address: "1234 Your Street",
							address2: "Suite 1002",
							city: "Your city",
							country: "Select your country",
							state: "State/Province",
							zip: "A1B 2C3"
						}
					},
					print: {
						title: "Print",
						text: {
							page_info: "The gift card(s) will be delivered to your email account instead of the recipient's, for you to hand deliver."
						},
						label: {
							recipient_name: "Recipient name",
							recipient_email: "Recipient email",
							from_name: "Sender name",
							from_email: "Sender email"

						},
						detail: {
							recipient_name: "The name of the person you're giving the card to",
							recipient_email: "To assist in the future if the recipient calls us",
							from_name: "The name of the person the card is from",
							from_email: "So we can send the card to you to print it"
						},
						placeholder: {
							recipient_name: "Full name",
							recipient_email: "recipient@email.com",
							from_name: "Your name",
							from_email: "you@email.com"
						}
					},

					facebook: {
						title: "Facebook",
						text: {
							page_info: "The card will be delivered to the recipient's Facebook account."
						},
						label: {

						},
						detail: {

						},
						placeholder: {

						}
					},
					sms: {
						title: "SMS/Text",
						text: {
							page_info: "The card(s) will be delivered to the recipient's phone by SMS/Text."
						},
						label: {
							recipient_name: "Recipient name",
							recipient_phone: "Recipient phone",
							from_name: "Sender name",
							delivery_date: "Delivery date"
						},
						detail: {
							recipient_name: "The name of the person you're sending the card to",
							recipient_phone: "A valid US/Canada mobile phone number",
							from_name: "The name of the person the card is from",
							delivery_date: "Send the card now or someday in the future...",
							immediately: "Send immediately"
						},
						placeholder: {
							recipient_name: "Full name",
							recipient_phone: "(555) 666-7777",
							from_name: "Your name",
							delivery_date: ""
						}
					}
				},
				checkout: {
					text: {
						title: "checkout",
						pay_bt: "Purchase",
						card_info: "Credit card info",
						billing_info: "Billing info",
						purchaser_info: "Purchaser info",
						back_to_cart: "Edit cart",
						go_to_cc_billing: "Continue",
						back_to_cc_billing: "Back",
						go_to_purchaser_info: "Continue",
						back_to_purchaser_info: "Back"
					},
					label: {
						cc_number: "Credit card number",
						cc_name: "Name on card",
						cc_expiration: "Expiration date",
						cc_cvd: "CVD",
						cc_address: "Address",
						cc_address2: "Address 2",
						cc_city: "City",
						cc_country: "Country",
						cc_state: "State/Province",
						cc_zip: "Zip/Postal code",
						cc_phone: "Phone number",
						cc_email: "Email",
						cc_terms: "I agree to the Terms/Conditions & that this purchase will display on my statement as <strong> \"e-Gift\"</strong>",
						cc_term_buyatab: "I have agreed with the Buyatab Conditions"
					},
					detail: {
						cc_number: "",
						cc_name: "Just like on the card",
						cc_expiration: "Month and year",
						cc_cvd: "What is CVD?",
						cvd_url: "javascript:window.open('https://www.buyatab.com/controls/cvd.htm', 'Terms', 'width=485,height=510, menubar=0, scrollbars=1, status=0, titlebar=0, toolbar=0'); return false;",
						cc_address: "Billing address",
						cc_address2: "",
						cc_city: "Your city",
						cc_country: "Select your country",
						cc_state: "Select your State/Province",
						cc_zip: "Enter your Zip/Postal code",
						cc_phone: "For delivery notification matters",
						cc_email: "So we can send you a confirmation",
						cc_terms: "View Terms and Conditions",
						terms_url: "javascript:window.open('http://www.buyatab.com/termsConditions.aspx', 'Terms', 'width=800,height=600, menubar=0, scrollbars=1, status=0, titlebar=0, toolbar=0'); return false;",
						cc_term_buyatab: "I understand this purchase will display on my statament as \"e-Gift\""
					},
					placeholder: {
						cc_number: "0000 0000 0000 0000",
						cc_name: "Your Name",
						cc_expiration: "00/0000",
						cc_cvd: "123",
						cc_address: "1234 Your Street",
						cc_address2: "Suite 1002",
						cc_city: "Your city",
						cc_country: "Select your country",
						cc_state: "State/Province",
						cc_zip: "A1B 2C3",
						cc_phone: "+1 (555) 666-7777",
						cc_email: "you@email.com"
					}
				},
				cart: {
					text: {
						title: "Your cart",
						new_card: "New card",
						checkout: "Checkout",
						discount: "Discount",
						summary: "Total",
						sub_total: "Sub-total",
						shipping_total: "Shipping",
						empty: "<center>Your cart is empty.</center>"
					}
				},
				footer: {
					text: {
						customer_support: "Customer Support: ",
						direct_number: "Direct Number: 1-604-678-3275",
						buyatab_rights: "Buyatab Online Inc. All Rights Reserved"
					}
				},
				confirmation: {
					city: "City: ",
					total: "Total: ",
					coutry: "Country: ",
					address: "Address: ",
					phone: "Phone number: ",
					zip: "Zip/postal Code: ",
					card_type: "Card type: ",
					state: "State/province: ",
					card_number: "Card number: ",
					order_total: "Order total: ",
					order_summary: "Order summary",
					card_info: "Card information",
					email_address: "Email address: ",
					discount_total: "Discount total: ",
					shipping_total: "Shipping total: ",
					card_expiration: "Expiration date: ",
					billing_address: "Card Billing address"
				},
				reload: {
					text: {
						enter_card: "Reload your card",
						your_card: "Your card: ",
						balance: "Current balance: ",
						scene_points: "Please note: When reloading a gift card you will not earn SCENE points."
					},
					label: {
						gcard_number: "Gift card number"
					},
					detail: {
						gcard_number: "The number on the back of your card"
					},
					placeholder: {
						gcard_number: "0000 0000 0000 0000 0000"
					}
				}
			};

			
			

			// self.currentURL = "http://localhost:53698";

			//Web Service calls
			self.cardsWS = self.currentURL + self.options.webService + self.options.cardsWS;
			self.validateWS = self.currentURL + self.options.webService + self.options.validateWS;
			self.countriesWS = self.currentURL + self.options.webService + self.options.countriesWS;
			self.statesWS = self.currentURL + self.options.webService + self.options.statesWS;
			self.checkoutWS = self.currentURL + self.options.webService + self.options.checkoutWS;
			self.getItemsWS = self.currentURL + self.options.webService + self.options.getItemsWS;
			self.discountWS = self.currentURL + self.options.webService + self.options.discountWS;
            self.checkEFTUserBalanceWS = self.currentURL + self.options.webService + self.options.checkEFTUserBalanceWS;

			self.generateIt();

			/*Update the cart position when embed and floated*/
			//inside an iFrame on the same domain
			try {
				if ($(elem).parents('iframe').length === 0 && window.parent != window) {
					$(window.parent).scroll(function() {
						if (typeof self.settings !== 'undefined'/* && self.settings.Merchant.FC*/) {
							self.infoFloat($(window.parent).scrollTop());
						}
					});
				}
			} catch (err) {
				console.log(err);
			}

			//Stand... alone in the dark!
			$(window).scroll(function() {
				if (typeof self.settings.Merchant !== 'undefined') {
					self.infoFloat($(window).scrollTop());
				}
			});
		},

		// Get the height of the wrapper element and send this cross-domainlly
		updateHeight: function(){
			$(document).trigger('functionIt', 'updateHeight');
			var self = this,  
				height = 500;

			setInterval(function(){
				if (height != self.getHeight(self.elem) ){
					height = self.getHeight(self.elem);
					// self.sendCrossDomain({ gcpHeight: height });
					self.sendCrossDomain({ type: 'resize', value: self.getHeight(self.elem) });
					// self.sendCrossDomain({ type: 'scroll', value: 0 });
				}
			} , 1000);
		},

		// Get heith of a element
		getHeight: function( e ){
			// $(document).trigger('functionIt', 'getHeight');
			return $(document).find(e).outerHeight();
		},

		//Call the necessary functions at the right order to generate form
		generateIt: function() {
			var self = this;

			self.$elem.hide();

			$.when(self.getOptions(), self.getEFTUserBalance()).then(function(rOptions, rBalance) {

				// self.settings = rOptions[0].d;
				self.settings = rOptions[0].d;

				// self.settings.Merchant.SMS = true;
				//force disable facebook
				self.settings.Merchant.Facebook.Enabled = false;

				self.settings.balance = rBalance[0].d;

				self.IsMobile = self.settings.Merchant.IsMobile;
				// self.MaxCards = self.settings.Merchant.MaxCards || 30;
				self.MaxCards = 1000;

				self.today = self.settings.ServerTime.slice(0, 10);
				self.day = self.settings.ServerTime.slice(0, 10).split('/')[0];
				self.month = self.settings.ServerTime.slice(0, 10).split('/')[1];
				self.year = self.settings.ServerTime.slice(0, 10).split('/')[2];

				self.formatedDate = self.year + '-' + self.month + '-' + self.day;
				self.iFormatedDate = self.day + '-' + self.month + '-' + self.year;

				if (self.settings.Status.Success) {
					$.when(self.getTemplate()).then(function(rTemplt) {
						self.cTemplate = Handlebars.compile(rTemplt)(self.Language);

						$.when(
							self.stylePreview(self.settings.Merchant.PreviewType),
							self.setDatePicker(),
							self.generateImgSelector(),
							self.getValues(),
							self.deliverIt(),
							self.charCount(),
							self.singleValidation(),
							self.optizeIt(),
							self.setButtons(),
							self.setQuantity(),
							self.getCC(),

							self.handlePurchaseType(),

							// self.generateInfo(),
							self.checkDiscount(),
							self.getState('plastic_country', 'plastic_state', 'plastic_zip'),
							self.getState('cc_country', 'cc_state', 'cc_zip'),
							self.setExpDatePicker(),
							self.getCountry(),
							self.infoButtons()
						).done(function() {
							$.when(self.appendTemplate()).done(function() {
                                self.sendEmail();
								$('<h1 />', {
									html: self.settings.Merchant.Name
								}).prependTo(self.$elem.find('div#wrapper'));

								// Show again
								self.$elem.fadeIn();
								self.shippingInfo();

								self.moveDelivery(0);
								self.purchase();
								self.updateHeight();

							});
						});
					});
				}else{
					alert('Merchant disabled. Contact support.');
				}
			});
		},

		// Access the API
		getOptions: function() {
			var self = this,
				dataToSend = {};

			dataToSend.MerchantId = self.MerchantId;

			return $.ajax({
				type: "POST",
				url: self.cardsWS,
				data: "{gcr:" + JSON.stringify(dataToSend) + "}",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		},

		// Load the template file
		getTemplate: function() {
			var self = this,
				file = self.currentURL + '/Admin/view/templates/other.handlebars';
			return $.ajax({
				url: file,
				dataType: "html"
			});
		},
                
        // check EFT user balance
		getEFTUserBalance: function() {
			$(document).trigger('functionIt', 'getEFTUserBalance');
			var self = this;
			return $.ajax({
				type: 'POST',
				url: self.checkEFTUserBalanceWS, //'services/BuyatabWS.asmx/CheckEFTUserBalance',
				data: '',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
		},

		// check eligibility for disount and return value
		getDiscount: function(amount) {
			$(document).trigger('functionIt', 'getDiscount');
			var self = this;
			return $.ajax({
				type: 'POST',
				url: self.discountWS, //'services/BuyatabWS.asmx/GetDiscount',
				data: '{merchantId:' + self.MerchantId + ', total:' + amount + '}',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
		},

		checkDiscount: function() {
			var self = this,
				myTemplt = $(self.cTemplate),
				discount = 0,
				html = '',
				dInputs = myTemplt.find('input#card_quantity, #card_value').on('blur change keyup', function() {
					var total = parseInt($(dInputs[0]).val(), 10) * parseInt($(dInputs[1]).val().replace(',', ''), 10);

					$.when(self.getDiscount(total)).then(function(data) {
						discount = data.d;

						if (discount > 0) {
							html =	'<div class="card-info">' +
										'<div><span>Sub-total: </span>' + self.getMoney(self.numberWithCommas(total.toFixed(2))) + '</div>' +
										'<div><span>Discount: </span>' + self.getMoney(self.numberWithCommas(discount.toFixed(2))) + '</div>' +
										'<div><span>Total: </span>' + self.getMoney(self.numberWithCommas((total - discount).toFixed(2))) + '</div>' +
									'</div>';
						} else {
							html =	'<div class="card-info">' +
										'<div><span>Total: </span>' + self.getMoney(self.numberWithCommas(total.toFixed(2))) + '</div>' +
									'</div>';
						}
						$('div#cart-embed div#g-info').html(html);
					});
				});
			$(document).on('click', '.ui-spinner-button', function() {
				$(this).siblings('input').blur();
			});

			$(document).on('click', 'div.values-wrap a.half-button', function() {
				$(this).parents('.field-right').find('input').blur();
			});
		},

		// Generates the widget floating on the side of the page
		generateInfo: function() {
			var self = this,
				myTemplt = $(self.cTemplate).addClass('with-cart'),
				container = myTemplt.find('div#content'),
				// infoDiv = $('<div class="panel" />').appendTo(container),
				infoDiv = $('<div class="panel position-top" />').appendTo(container),
				balance = (self.purchaseType == 3) ? '<div id="balance-info" class="card-info"><div><span>Your balance: </span>' + self.getMoney(self.numberWithCommas(self.settings.balance))   + '</div></div>' : '',
				html = '<li id="cart"><h2>Info</h2>' +
					'<div id="cards-wrapper">' + balance +
					'<div id="g-info"></div>' +
					'<div id="s-info"></div>' +
					'<div id="l-info"></div>' +
					'<div id="b-info">' +
					'<a href="javascript:void(0)" id="clear-card" class="button clear-button no-icon"><span>Clear card info</span></a>' +
					'<a href="javascript:void(0)" id="clear-all" class="button clear-button no-icon"><span>Clear all</span></a>' +
					'</div>' +
					'</div></li>';

			infoDiv.html(html);
			self.cTemplate = myTemplt;
		},

		// manage info buttons
		infoButtons: function() {
			var self = this,
				myTemplt = $(self.cTemplate),
				cAll = myTemplt.find('#clear-all').on('click', function() {
					$('#customize_card :input, #delivery-info :input, #checkout :input').val('');
					$('input#card_quantity').val('1');
					$('#card_value').val('100');
				}),
				cCard = myTemplt.find('#clear-card').on('click', function() {
					$('#customize_card :input, #delivery-info :input').val('');
					$('input#card_quantity').val('1');
					$('#card_value').val('100');
				});

			self.cTemplate = myTemplt;
		},

		//add shipping info to widget
		shippingInfo: function(){
			var self = this,
			wrap = $('li#cart div#s-info');

			$(document).on('click', 'input[type=radio]', function(){

				var e = $.parseJSON($('input[name=sOpt]:checked').val().replace(/[|]/g, '"')),
					ship = Number(e.Cost),
					html =	'<div class="card-info">' +
								'<div><span>Shipping: </span>' + self.getMoney(self.numberWithCommas(ship.toFixed(2))) + '</div>' +
							'</div>';

				// console.log(ship );
				wrap.html(html);

			});

		},

		// Append template to the element
		appendTemplate: function() {
			var self = this;
			self.$elem.append(self.cTemplate);
		},

		// Set preview style 
		stylePreview: function(previewStyle) {
			var self = this,
				pStyle = 'previewStyle-' + ((previewStyle === '') ? '0' : previewStyle);
			self.$elem.addClass(pStyle.toLowerCase());
		},

		// Grab all data about the cards from the API and feed the imgeSelector
		generateImgSelector: function() {
			var self = this,
				mob = self.IsMobile,
				cards = self.settings.Cards,
				myTemplt = $(self.cTemplate),
				// path =  '', // /gcp/view/template/' + self.MerchantId + '/cards/medium/',
				// dPath =  '', //'/gcp/view/template/default/cards/medium/',
				previewBG = myTemplt.find('div#preview-window-bg'),
				previewImg = myTemplt.find('img#preview-image')
					.attr('src', ( cards[0].ImageName).replace('medium', 'big')),
				previewBt = myTemplt.find('span#pw-close'),

				customizeWrap = myTemplt.find('div#card-selector'),
				wrap = myTemplt.find('div#image-wrap'),

				ulWrap = $('<div />').prependTo(wrap).attr('id', 'ulWrapper'),
				myImage = myTemplt.find('.choose-card')
					.css('background', 'url("' + cards[0].ImageName.replace('/big/', '/medium/') + '" )')
					.attr('title', cards[0].Description)
					.on('click', function() {
						if (!self.topSelector && !mob) {
							ulWrap.fadeToggle(350);
							$(customizeWrap)
								.find('div.field-left, div.field-right')
								.addClass('hide-me');
						}
					}),
				hField = myTemplt.find('input#card_design').val(cards[0].StyleId),
				srcField = myTemplt.find('input#card_src').val( cards[0].ImageName.replace('/big/', '/medium/')),

				myUl = $('<ul />').addClass('image-selector')
					.prependTo(ulWrap)
					.css({
						height: 150,
						width: 440,
						left: 40
					}),

				nextButton = $('<div />').addClass('next').prependTo(ulWrap),
				backButton = $('<div />').addClass('prev').prependTo(ulWrap),
				html = '';

			$(cards).each(function(i, card) {
				html = html + '<li style="width: 200px; height: 150px;"><img src="' + card.ImageName.replace('/big/', '/medium/') + '" data-id="' + card.StyleId + '"></li>';
			});
			//Open card click
			if (self.openCard) {
				$(document).on('click', '.open-card .card', function(e) {
					$(this).toggleClass('open');
				});

				$('<div />', {
					html: self.Language.customize.text.open_card // 'Click on the card to open/close'
				}).addClass('open-card-desc').insertAfter(customizeWrap);
			}

			myUl.html(html);

			$(myUl).roundabout({
				btnNext: nextButton,
				btnPrev: backButton
			});

			var cDesignBtn = myTemplt.find('a.change_design_bt').on('click', function() {
				if (!self.topSelector) {
					ulWrap.fadeToggle(350);
					$(customizeWrap)
						.find('div.field-left, div.field-right')
						.addClass('hide-me');
				}
			});

			if (self.topSelector) {
				cDesignBtn.hide();
				myImage.html('').addClass('half-size');
			}

			myTemplt.find('a.preview_bt').on('click', function() {
				$('#preview-window-bg').fadeToggle(150);
			});

			previewBG.on('click', function() {
				$(this).fadeToggle(150);
			});

			myTemplt.find("ul.image-selector li img").on("click", function() {
				myImage.css('background', 'url("' + $(this).attr("src") + '" )');
				previewImg.attr('src', $(this).attr("src").replace('medium', 'big'));
				hField.val($(this).data('id'));
				srcField.val($(this).attr("src"));
				if (!self.topSelector) {
					$(ulWrap).fadeToggle(150);
					$(customizeWrap)
						.find('div.field-left, div.field-right')
						.removeClass('hide-me');
				}
			});
			previewBG.prependTo(self.elem);
			self.cTemplate = myTemplt;
		},

		// Set the quantity input
		setQuantity: function() {
			var self = this,
				myTemplt = $(self.cTemplate);
			if (!self.IsMobile) {
				myTemplt.find('input#card_quantity').spinner({
					min: 1,
					max: self.MaxCards,
					step: 1
				})
				.on('blur', function(e) {
					var availableCards = self.MaxCards;
					if ($(this).val() === '' || parseInt($(this).val(), 10) === 0) {
						$(this).val(1);
						$(this).parents('div.quantity')
							.find('div.field-error')
							.html(self.Language.errors.quantity);
					}
					if (parseInt($(this).val(), 10) > availableCards) {
						$(this).val(availableCards);
						$(this).parents('div.quantity')
							.find('div.field-error')
							.html(self.Language.errors.quantity + (availableCards));
					}
					$('input#card_quantity').spinner('option', 'max', availableCards);
				});
			}

			self.cTemplate = myTemplt;
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
				.on('keydown keyup blur', function(){
				$(this).val( $(this).val().replace(/[^0-9+ ]/g,'') );
			});
			self.cTemplate = myTemplt;
		},

		// Generates the datapicker for email_delivery_date
		setDatePicker: function() {
			var self = this,
				myTemplt = $(self.cTemplate);
			if (!self.IsMobile) {

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
						.on('keydown', function(e) {
							e.preventDefault();
						}),

					tdp = $('<a />').click(function(e) {
						if (dataField.datepicker('widget').is(':hidden')) {
							dataField.show().datepicker('show');
						}
						e.preventDefault();
					})
						.addClass('deliver-calendar')
						.appendTo(dataField.parent());
				self.cTemplate = myTemplt;
			} else {
				var mDate = self.formatedDate,
					dField = myTemplt.find('input#email_delivery_date');

				dField.attr('min', mDate).val(mDate).on('blur', function() {
					var nDate = new Date(dField.val()).toJSON();

					if (nDate < mDate) {
						dField.val(mDate);
						dField
							.parents('.field').addClass('validation-error')
							.find('.field-error').html(self.Language.errors.past_date);
					}
				});
			}
			self.cTemplate = myTemplt;
		},

		// Manages the card values and create the buttons based on the range parsed from API
		getValues: function() {
			var self = this,
				myTemplt = $(self.cTemplate),
				values = self.settings.Amount.Range.split(','),
				vSize = values.length,
				iAmount = self.settings.Merchant.centsAllowed && self.purchaseType == 4 ? parseFloat(self.settings.Amount.InitialAmount).toFixed(2) : self.settings.Amount.InitialAmount,
				lang = self.settings.Merchant.Language,
				minValue = (self.purchaseType == 4 || self.purchaseType == 5) ? 1 : self.settings.Amount.MinVal,
				maxValue = (self.purchaseType == 4 || self.purchaseType == 5) ? 10000 : self.settings.Amount.MaxVal,
				vCont = myTemplt.find('#card_value')
					.val(iAmount)
					.on('blur', function() {
						if ($(this).val() < minValue) {
							$(this).val(minValue);
							previewVal.html(self.getMoney($(this).val()));
							$(this).parents('div.field')
								.find('div.field-error')
								.html(self.Language.errors.value + self.getMoney(minValue));
						}

						if ($(this).val() > maxValue) {
							$(this).val(maxValue);
							previewVal.html(self.getMoney($(this).val()));
							$(this).parents('div.field')
								.find('div.field-error')
								.html(self.Language.errors.maxvalue + self.getMoney(maxValue));
						}
					})
					.on('blur change', function() {
						if (lang !== 'fr') {
							// $(this).val( self.numberWithCommas( $(this).val() ) ) 
						}
					}),
				previewVal = $(self.elem).find('span#pw-value')
					.html(self.getMoney(iAmount)),
				vWrap = myTemplt.find('div.values-wrap'),
				html = '',
				vType = self.valueType;

			vCont.on('keyup', function() {
				previewVal.html(self.getMoney($(this).val()));

			});
			if ( self.settings.Amount.Open) {
				var dollar = (self.showDollar) ? '$' : '';
				$(values).each(function(i, e) {
					$('<a></a>', {
						html: (lang == 'fr') ? self.numberWithCommas(e) + dollar : dollar + self.numberWithCommas(e), //if french... Call Chine!
						href: 'javascript:void(0)'
					}).addClass('half-button')
						.on('click', function(event) {
							event.preventDefault();
							$(vCont).val((lang == 'fr') ? e : self.numberWithCommas(e));
							previewVal.html(self.getMoney(e));

							//remove validation error
							$(vCont).parents('div.field')
								.removeClass('validation-error')
								.find('div.field-error')
								.html('');
						})
						.appendTo(vWrap);
				});

				var valueTxt = self.IsMobile ? self.Language.customize.detail.value_mobile : self.Language.customize.detail.value;
				vCont.parent()
					.find('div.field-detail')
					.html(valueTxt +
						self.getMoney(minValue) + " - " + self.getMoney(maxValue));

			} else {
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

		// Execute functions according to the purchaseType
		handlePurchaseType: function(){
			var self = this,
            myTemplt = $(self.cTemplate),
            pType = self.purchaseType;

            switch ( parseInt(pType, 10) ){
				case 0: //GCP
					// do nothing;
				break;
				case 1: // Other purchase.
					// No changes. Keep billing info and cart
					self.generateInfo();
					$(document).attr('title', 'Other Purchase');
				break;
				case 2: //Promo purchase
					/*	
					Hide billing info
					Purchase go to receipt
					We may not need cart extra buttons
					Purchase button shouldn't be visible before getting shipment
					*/
					self.generateInfo();
					self.hideBilling();
					$(document).attr('title', 'eSatisfy');
					myTemplt.find('div#card-selector div.quantity').css({'visibility': 'hidden'});
					myTemplt.find('#delivery-type').css({'display': 'none'});
					myTemplt.find('#delivery-info h2').html('Delivery information');
				break;
				case 3: //EFT
					// console.log('EFT');
					/*
					Get balance
					Hide billing info
					hide extra fields > email delivery
					Conditional action for email delivery
					*/
					self.generateInfo();
					self.hideBilling();
					self.hideEmailFields();
					$(document).attr('title', 'Electronic Funds Transfer');
				break;
				case 4: //Promo purchase
					/*	
					Hide billing info
					Purchase go to receipt
					We may not need cart extra buttons
					Purchase button shouldn't be visible before getting shipment
					*/
					self.generateInfo();
					self.hideBilling();
					self.addPassword();
					$(document).attr('title', 'eSatisfy');
				break;
				case 5: //Bonus purchase
					/*	
					Hide billing info
					Purchase go to receipt
					We may not need cart extra buttons
					Purchase button shouldn't be visible before getting shipment
					*/
					self.generateInfo();
					self.hideBilling();
					$(document).attr('title', 'eSatisfy');
				break;
				default:
					// defaultAction;
            }
		},

		//check options and hide/display billing
		hideBilling: function(){
			var self = this,
			myTemplt = $(self.cTemplate);

			myTemplt.find('li#checkout').hide();
		},

		addPassword: function(){
			var self = this,
			myTemplt = $(self.cTemplate),
			// pwWrapper = myTemplt.find('#page-navigation'), customize
			pwWrapper = myTemplt.find('#customize'),
			field = $('<div class="field" />'),
			html = '<div class="field-left">' +
								'<div>' +
									'<label for="promo_password"> Password</label>' +
								'</div>' +
								'<div class="field-error"></div>' +
							'</div>' +
							'<div class="field-right">' +
								'<div class="input-holder">' +
									'<input type="password" class="password" id="promo_password" name="promo_password">' +
								'</div>' +
								'<div class="field-detail">Password for Promo Purchasing</div>' +
							'</div>';

			field.html(html).prependTo(pwWrapper);
			//console.log(field);
		},

        //check options and hide/display billing
        hideEmailFields: function(){
			var self = this,
				myTemplt = $(self.cTemplate);

			myTemplt.find('div#dc-email-recipient-name').hide();
			myTemplt.find('div#dc-email-recipient-email').hide();
			myTemplt.find('div#dc-email-recipient-send').hide();

			myTemplt.find('input#email_recipient_name').removeClass('name required');
			myTemplt.find('input#email_recipient_email').removeClass('email required');

        },

		// Split delivery lis into tabs
		deliverIt: function() {
			var self = this,
				myTemplt = $(self.cTemplate),
				deliveryInfo = myTemplt.find('li#delivery-info'),
				delType = myTemplt.find('ul#delivery-type'),
				delTab = myTemplt.find('ul#delivery-content'),
				hasPlastic = self.settings.Merchant.IsPlastic,
				hasElectronic = self.settings.Merchant.IsElectronic,
				hasSMS = self.settings.Merchant.SMS,
				hasFacebook = self.settings.Merchant.Facebook.Enabled;

			//remove non-used lists
			if (!hasPlastic) {
				deliveryInfo.find('li[data-dnature=plastic]').remove();
				delType.find('li[data-dnature=plastic]').remove();
				delTab.find('li[data-dnature=plastic]').remove();
			}
			if (!hasFacebook) {
				deliveryInfo.find('li[data-delivery=facebook]').remove();
				delType.find('li[data-delivery=facebook]').remove();
				delTab.find('li#dc-facebook').remove();
			}
			if (!hasSMS) {
				deliveryInfo.find('li[data-delivery=sms]').remove();
				delType.find('li[data-delivery=sms]').remove();
				delTab.find('li#dc-sms').remove();
			}
			if (!hasElectronic) {
				deliveryInfo.find('li[data-dnature=electronic]').remove();
				delType.find('li[data-dnature=electronic]').remove();
				delTab.find('li[data-dnature=electronic]').remove();
			}

			var delNav = myTemplt.find('ul#delivery-type li'),
				nNav = delNav.length;

			delType.addClass('dnumber-' + nNav);

			delTab.width(nNav * self.stepWidth);

			delNav.each(function(i) {
				if (!$(this).hasClass('dt-inactive')) {
					$(this).on('click', function(e) {
						if (!$(this).hasClass('dt-active')) {
							self.moveDelivery(i);
							// self.updateHeight();
						}
					});
				}
			});
			//go to the first tab
			self.cTemplate = myTemplt;
			// self.moveDelivery( 0 ); => moved to generateIt() 
		},

		// Move Delivery panel @param tab => number of the delivery page (0 indexed) or the name corresponding to data-delivery attribute
		moveDelivery: function(tab) {
			var self = this,
				myTemplt = $(self.cTemplate),
				delNav = myTemplt.find('ul#delivery-type li'),
				delTab = myTemplt.find('ul#delivery-content'),
				delTabs = myTemplt.find('ul#delivery-content li'),
				hField = myTemplt.find('input#delivery_type'),
				deliveryError = myTemplt.find('li#delivery-info div.group-error');

			if (typeof tab === 'string') {
				$.each(delNav, function(i, e) {
					if ($(e).data('delivery') == tab) {
						tab = i;
					}
				});
			}


			// delTab.css('margin-left', - ( tab * self.stepWidth ))
			//	.data('index',tab );

			$(delTabs).hide();
			$(delTabs[tab]).fadeIn('slow');


			$(hField).attr('value', $(delNav[tab]).data('delivery'));
			delNav.removeClass('dt-active');
			$(delNav[tab]).addClass('dt-active');

			//Clean Validation
			$(delTabs[tab]).find('div.field').removeClass('validation-error');
			$(delTabs[tab]).find('div.field').removeClass('validation-warning');
			$(delTabs[tab]).find('div.field-error').html('');
			deliveryError.html('');

			delTabs.removeClass('validate');
			$(delTabs[tab]).addClass('validate');

			// hide purchase button
			var deliveryType = $(delNav[tab]).data('dnature');
			if(deliveryType == 'plastic'){
				myTemplt.find('.main-button.purchase').hide();
			}else{
				myTemplt.find('.main-button.purchase').show();
			}
		},

		// Get countries from the API and populate select
		getCountry: function() {
			$(document).trigger('functionIt', 'getCountry');
			var self = this,
				myTemplt = self.cTemplate,
				cSelect = myTemplt.find('select#cc_country, select#plastic_country'),
				html = '';

			$.ajax({
				url: self.countriesWS,
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			}).done(function(data) {
				var list = data.d;

				$.each(list, function(i, e) {
					//Canada as default
					if (e.Id == 2) {
						html = html + '<option selected="selected" value="' + e.Id + '">' + e.Name + '</option>';
					} else {
						html = html + '<option value="' + e.Id + '">' + e.Name + '</option>';
					}
				});
				cSelect.html(html).trigger('change');
			});
		},

		// Change states acording to country
		getState: function(countryField, stateField, zipField, forShipping) {
			$(document).trigger('functionIt', 'getState');
			var self = this,
				myTemplt = $(self.cTemplate),
				country = myTemplt.find('select#' + countryField),
				states = myTemplt.find('select#' + stateField),
				zip = myTemplt.find('input#' + zipField),
				sParents = states.parent(),
				html = '';

			country.on('change', function(e, f) {
				var myData = parseInt(country.val(), 10);

				//change the zip/postal code validation => CA x US
				switch (myData) {
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
					url: self.statesWS,
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: "{country_id:" + JSON.stringify(myData) + ", language:" + JSON.stringify(self.settings.Merchant.Language) + "}"
				}).done(function(data) {
					var regions = data.d;
					if (regions) {
						if (regions.length == 1) {
							//not null but with a region code

							if ($('input#' + stateField).length === 0) {
								$('<input />', {
									type: 'text',
									'data-region': regions[0].Id
								}).attr('id', stateField).addClass('required')
									.prependTo(sParents);
								states.remove();
								$('select#' + stateField).remove();
							} else {
								$('input#' + stateField).attr('data-region', regions[0].Id);
							}
						} else {
							// it has a nice list of regions

							//if the select was removed, create a brand new one!
							if ($('select#' + stateField).length === 0) {
								$('<select  />', {}).attr('id', stateField).addClass('required')
									.prependTo(sParents);
								$('input#' + stateField).remove();
							}

							$(regions).each(function(i, data) {
								html = html + '<option value="' + data.Id + '">' + data.Name + '</option>';
							});

							states.html(html);
							$('select#' + stateField).html(html);
							html = '';
						}
					} else {
						if ($('input#' + stateField).length === 0) {
							$('<input />', {
								type: 'text',
								'data-region': 84
							}).attr('id', stateField).addClass('required')
								.prependTo(sParents);
							states.remove();
							$('select#' + stateField).remove();
						} else {
							console.log('7');
							$('input#' + stateField).attr('data-region', 84);
						}
					}
				})
					.fail(function(e) {
						console.log(e); //fail? Use a text input!

						if ($('input#' + stateField).length === 0) {
							$('<input />', {
								type: 'text',
								'data-region': 84
							}).attr('id', stateField).addClass('required')
								.prependTo(sParents);
							states.remove();
							$('select#' + stateField).remove();
						} else {
							$('input#' + stateField).attr('data-region', 84);
						}
					});
			});
		},


		// Send a Cross Domain Message
		sendCrossDomain: function( message ){
			$(document).trigger('functionIt', 'sendCrossDomain');
			var self = this;

			// console.log( message );

			try {
				// var domain = 'local.buyatab.com'; //working on local
				var domain = decodeURIComponent( self.settings.Merchant.Domain.replace(/^#/, '') ) || 'buyatab.com/',
					hDomain = window.location.host || window.location.hostname;

				if(domain !== ''){
					var target = window.location.protocol  + '//' + domain,
						target2 = window.location.protocol  + '//' + hDomain;

					window.parent.postMessage(message, target);
					window.parent.postMessage(message, target2);

					//ie 9-
					window.parent.postMessage(message.value, target);
					window.parent.postMessage(message.value, target2);

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

			if(domain !== ''){
				var target = window.location.protocol  + '//' + domain;

				// Listen to message from child window
				eventer(messageEvent,function(e) {
					// console.log(e);
					if ( e.origin !== target ) {
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
				},false);
			}
			// we have to listen for 'message'
			// window.addEventListener('message', function(){
				// console.log('this');
			// }, false);

			window.onmessage = function(message){
				//prevent getting message from other domains
				// if ( message.origin !== target ) {
				//	return;
				// }

				// console.log(message.data);

				if(typeof message.data == 'object'){
					if(message.data.type == 'scroll'){
						self.updateFloatingCart(message.data.value);
					}
				}else{
					self.updateFloatingCart(message.data);
				}
			};
		},

        //unable data field if not sending email
		sendEmail: function(){
			var self = this,
				fDate = $('input#email_delivery_date'),
				dField = fDate.parents('div.field').addClass('hide-me'),
				check = $('input#send_email').on('click', function(){
					if(check.is(':checked')){
						dField.removeClass('hide-me');
					}else{
						dField.addClass('hide-me');
					}
				});
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
			if (self.settings.Merchant.Language == 'fr') {
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			}
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		// Handles the message and limit chars to the self.messageMax value
		charCount: function() {
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

			function getLines(element) {
				var text = $(element).val(),
					lines = text.split(/\r|\r\n|\n/);
				return lines.length;
			}

			mBox.on('keyup keydown paste', function(e) {
				var n = mBox.val().length,
					l = getLines(mBox);

				if (n <= limit) {
					$(chars).html(limit - n);
				} else {
					var text = mBox.val().substr(0, limit);
					$(this).val(text);
				}

				if (l <= limitLine) {
					$(charsLine).html(limitLine - l);
				} else {
					var textLines = mBox.val().split("\n");

					//remove last line
					textLines.pop();
					textLines = textLines.join("\n");
					$(this).val(textLines);
				}

				//update the text in the preview window
				$(self.elem).find('span#pw-message').html($(this).val().replace(/\r?\n/g, '<br>'));
			});

			self.cTemplate = myTemplt;
		},

		// Float cart
		infoFloat: function(scrollAmount) {
			var self = this,
				newPosition = scrollAmount,
				cart = $('#cart-embed.active'),
				content = $('div#content').outerHeight(false),
				cartBottom = newPosition + cart.outerHeight(false);

			if (scrollAmount > 0) {
				var topPos = newPosition;
				if (cartBottom > content) { //avoid to go to the bottom
					topPos = topPos - (cartBottom - content) - 50; //extra 50px
				}
				cart.stop().animate({
					top: topPos
				});

			} else {
				cart.stop().animate({
					top: 0
				});
			}
		},

		// Set validation class and error message
		fieldValidation: function(field, status, type, errorCode) {
			$(document).trigger('functionIt', 'fieldValidation');
			var myParent = $(field).parents('div.field, div.half-field'),
				lang = this.Language.errors,
				errorType = '',
				tempRet = true;

			if (status) {
				myParent.find('div.field-error').fadeOut(1200, 'swing', function() {

					myParent.removeClass('validation-error')
						.removeClass('validation-warning')
						.find('div.field-error')
						.html('')
						.show();
				});

				tempRet = true;

			} else {
				if (type == 'error') {
					errorType = 'validation-error';
					tempRet = false;
				} else {
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
		singleValidation: function() {
			$(document).trigger('functionIt', 'singleValidation');
			var self = this,
				fields = 'input[type=text], input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, textarea, select';

			$(document).on('change, blur, focusout', fields, function() {

				if ($(this).attr('type') === 'checkbox') {

					if ($(this).is(':checked')) {
						$(this).parents('div.terms-field').removeClass('validation-error')
							.find('div.field-error')
							.html('');
					} else {
						$(this).parents('div.terms-field')
							.addClass('validation-error')
							.find('div.field-error')
							.html(self.Language.errors.check);
					}
				} else {
					var fData = $(this).val();
					if ($(this).attr('type') === 'month') {
						fData = self.convertDate(fData);
					}
					var valObj = [{
						Classes: $(this).attr('class'),
						Data: fData
					}],

						myField = $(this);

					$.ajax({
						type: "POST",
						url: self.validateWS,
						data: "{validation_group:" + JSON.stringify(valObj) + "}",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function(data) {
							var d = data.d[0];
							// console.log(data.d[0])

							self.fieldValidation(myField,
								d.Success,
								d.Error.ExceptionDetails,
								d.Error.ErrorCode);
							if (!d.Success) {
								$(window).trigger('anaLog', 'singleValidation: ' + myField.attr('id'));
							}
						},
						error: function(e) {
							console.log(e.statusText + ': ' + e.responseText);
						}
					});
				}

			});
		},

		// Execute validation for a group of fields
		groupValidation: function(groupsArray, triggeredBy) {
			$(document).trigger('functionIt', 'groupValidation');
			var self = this,
				valObj = [],
				errors = 0;

			if (!self.debugMode) { //turn validation off on debug mode

				var fields = $(groupsArray).find('input[type=text], input[type=file], input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, input[type=radio], textarea, select');
				$(fields).each(function() {
					var myObj = {};

					if ($(this).attr('type') === 'checkbox') {

						if ($(this).is(':checked')) {
							$(this).parents('div.terms-field').removeClass('validation-error')
								.find('div.field-error')
								.html('');
						} else {
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
						var fData = $(this).val();
						if ($(this).attr('type') === 'month') {
							fData = self.convertDate(fData);
						}
						myObj.Classes = $(this).attr('class');
						myObj.Data = fData;

						if (!$(this).hasClass('dont-validate')) {
							valObj.push(myObj);
						}
					}

				});
				// console.log(fields)

				$.ajax({
					type: "POST",
					url: self.validateWS,
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function(data) {
						var d = data.d;
						$.each(d, function(i, element) {
							if (!self.fieldValidation(fields[i],
								element.Success,
								element.Error.ExceptionDetails,
								element.Error.ErrorCode)) {
								errors++;
								$(window).trigger('anaLog', 'groupValidation');
							}
						});
					},
					error: function(e) {
						console.log(e.statusText + ': ' + e.responseText);
					}
				});
			}

			var gError = $(triggeredBy).parents('div.pages-nav').find('div.group-error');

			if (errors > 0) {
				gError.addClass('error-in').html(self.Language.errors.group);
				setTimeout(function() {
					gError.fadeOut('slow', 'swing', function() {
						gError.html('').removeClass('error-in');
						gError.show();
					});
				}, 5200);
			} else {
				gError.removeClass('error-in').html('');
			}

			return (errors > 0) ? false : true;
		},

		// Append a span (optional) to the optional (class) fields labels
		optizeIt: function() {
			$(document).trigger('functionIt', 'optizeIt');
			var self = this,
				myTemplt = $(self.cTemplate),
				optional = myTemplt.find('.optional');

			$(optional).each(function() {
				$(this).parents('.field').find('label').append((self.settings.Merchant.Language == 'fr') ? '<span>(facultatif)</span>' : '<span>(optional)</span>');
			});
		},

		// set functions for the buttons
		setButtons: function() {
			var self = this;

			//Continue button for plastic delivery
			$(document).on('click', 'a.get-shipment', function() {

				if (self.groupValidation($('ul#delivery-content li.validate'), $('a.get-shipment'))) {
					// self.moveIt( ['purchaser'] );
					self.getShipment();
				}
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
					merchantId: getParam('id'),
					numberOfEnvelopes: 1,
					numberOfGiftboxes: 0,
					extra: 99
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
				url: "../../../gcp/services/BuyatabWS.asmx/GetShippingRates",
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
								'<label for="opt' + i + '">' + e.Type + ' ' + self.getMoney(e.Cost) + '</label>'
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

						$('.main-button.purchase').show();
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

		// Set Expiration Data Picker for Credit Card
		setExpDatePicker: function() {
			$(document).trigger('functionIt', 'setExpDatePicker');
			var self = this,
				myTemplt = self.cTemplate,
				expField = myTemplt.find('input#cc_expiration'),
				lang = self.settings.Merchant.Language,
				todayED = self.year + '-' + self.month;
			if (!self.IsMobile) {
				var showing = false,
					keepFocus = false,

					// split months in to ul
					monthsHTML = function() {
						var html = '',
							months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

						$.each(months, function(i, e) {
							var active = '';
							if (i === 0) {
								html = html + '<ul>';
								active = ' ewm-active';
							} else {
								active = '';
							}
							if (i == 6) {
								html = html + '</ul><ul>';
							}
							if (i == 12) {
								html = html + '</ul>';
							}
							html = html + '<li class="ew-month-single' + active + '" data-month="' +
								((i + 1)) + '">' +
								e + '</li>';
						});
						return html;
					},

					month = (lang == 'fr') ? 'Mois' : 'Month',
					year = (lang == 'fr') ? 'Année' : 'Year',

					theMonth = '01',
					theYear = (new Date()).getFullYear() + 1,

					years = function() {
						var currentYear = (new Date()).getFullYear(),
							active = '';

						myYears = [];
						for (var i = 0; i < 25; i++) {
							if (i == 1) {
								active = ' ewm-active';
							} else {
								active = '';
							}
							myYears.push('<li class="ew-year-single' + active + '">' + currentYear + '</li>');
							currentYear++;
						}
						return myYears.join('');
					},

					//the widget
					expWidget = $('<div />', {}).attr('id', 'exp-widget')
						.css('display', 'none')
						.on('click focus', function(event) {
							event.stopPropagation();
						})
						.appendTo(expField.parent()),

					ewLeft = $('<div />').addClass('ew-left').appendTo(expWidget),
					ewMonth = $('<div />').addClass('ew-month').html(month).appendTo(ewLeft),
					ewMonths = $('<div />').addClass('ew-months').html(monthsHTML()).appendTo(ewLeft),

					ewRight = $('<div />').addClass('ew-right').appendTo(expWidget),
					ewYear = $('<div />').addClass('ew-year').html(year).appendTo(ewRight),
					arrowUp = $('<button />').addClass('ew-arrow ew-arrow-up').appendTo(ewRight),
					ewYearsWrap = $('<div />').addClass('ew-years-wrap').appendTo(ewRight),
					arrowDown = $('<button />').addClass('ew-arrow ew-arrow-down').appendTo(ewRight),
					ewYears = $('<ul />').addClass('ew-years').html(years()).appendTo(ewYearsWrap),

					//The ok buton
					okButton = $('<a />', {
						href: 'javascript:void(0)',
						html: 'Ok',
						tabindex: -1
					}).addClass('ew-ok half-button')
						.on('click', function(e) {
							e.preventDefault();
							expField.val(theMonth + '/' + theYear);
							expWidget.fadeOut('fast');
							expField.trigger('blur');
						})
						.appendTo(expWidget);

				//The arrow Up
				arrowDown.on('click', function(event) {
					event.stopPropagation();
					var ulMargn = parseInt(ewYears.css('margin-top'), 10),
						ulLine = parseInt(ewYears.css('line-height'), 10) + 2;

					keepFocus = true;
					showing = true;

					if (ulMargn > ulLine * 21 * -1) {
						ulMargn = ulMargn - ulLine;
						ewYears.css('margin-top', ulMargn);
					}
				});

				//The arrow Down
				arrowUp.on('click', function(event) {
					event.stopPropagation();
					var ulMargn = parseInt(ewYears.css('margin-top'), 10),
						ulLine = parseInt(ewYears.css('line-height'), 10) + 2;

					keepFocus = true;
					showing = true;

					if (ulMargn < 0) {
						ulMargn = ulMargn + ulLine;
						ewYears.css('margin-top', ulMargn);
					}
				});

				//The years table
				$.each(ewYears.find('li'), function(i, e) {
					$(e).on('click', function(event) {
						ewYears.find('li').removeClass('ewm-active');
						$(this).addClass('ewm-active');
						theYear = $(this).html();
						keepFocus = true;
						showing = true;
						expField.val(theMonth + '/' + theYear);
						expField.trigger('blur');
					});
				});

				//The months table
				$.each(ewMonths.find('li'), function(i, e) {
					$(e).on('click', function(event) {
						var d = $(this).data('month');
						ewMonths.find('li').removeClass('ewm-active');
						$(this).addClass('ewm-active');
						theMonth = ((d < 10) ? ('0' + d) : d);
						keepFocus = true;
						showing = true;
						expField.val(theMonth + '/' + theYear);
						expField.trigger('blur');
					});
				});

				//Show widget when focus on field
				expField.on('click focus', function(event) {
					event.stopPropagation();
					showIt();
				})
					.on('blur', function(event) {
						window.setTimeout(hideIt, 200);
					})
					.on('keydown', function(e) {
						//prevent user to type. Keep it?
						if (e.keyCode == 9) { //tab pressed
							$('input#cc_cvd').focus();
							// return e.keyCode = 9;
						}
						e.preventDefault();

					})
					.val(theMonth + '/' + theYear);

				$('html').on('click', function(e) {
					keepFocus = false;
					window.setTimeout(hideIt, 200);
				});

				$(document).keyup(function(e) {
					if (e.keyCode == 27) { // esc
						keepFocus = false;
						window.setTimeout(hideIt, 200);

					}
				});

				myTemplt.find('li#checkout input').on('focus', function(e) {
					if (e.currentTarget.id != 'cc_expiration') {
						window.setTimeout(hideIt, 200);
						keepFocus = false;
					}
				});

				function hideIt() {
					if (showing && !keepFocus) {
						expWidget.fadeOut('fast');
						expField.trigger('blur');
						showing = false;
					}
				}

				function showIt() {
					expWidget.fadeIn('fast');
					showing = true;

					var $doc = $(document),
						$win = $(window),
						$this = expWidget,
						offset = expField.offset(),
						dTop = offset.top - $doc.scrollTop(),
						dBottom = $win.height() - dTop - $this.height();

					if (dBottom < 0) {
						$this.addClass('down-false');
					} else {
						$this.removeClass('down-false');
					}
				}

			} else {
				var fDetail = expField.parents('.field-right').find('.field-detail'),
					dataEx = (lang == 'fr') ? ' (AAAA-MM)' : ' (YYYY-MM)';

				fDetail.html(fDetail.html() + dataEx);

				expField.val(todayED);
			}
			self.cTemplate = myTemplt;
		},

		// Generates cart
		generateCheckout: function() {
			var self = this,
				preDate = $('input#cc_expiration').val(),
				eDate = (self.IsMobile) ? self.convertDate(preDate) : preDate,

				dType = $('input#delivery_type').val(),
				pw = (self.purchaseType == 4) ? $('#promo_password').val() : '',
				dContainer = $('li#delivery-info ul#delivery-content li#dc-' + dType),

				checkoutData = {
					crq: {
						Cart: {
							CartCards: [{
								StyleId: $('input#card_design').val(),
								Amount: (self.settings.Merchant.CentsAllowed && self.purchaseType == 4 ) ? parseFloat($('#card_value').val().replace(/[^0-9.]/g, '')) : parseInt($('#card_value').val().replace(/[^0-9.]/g, '')) ,
								Quantity: $('input#card_quantity').val(),
								CardImg: $('input#card_src').val(),
								Message: $('textarea#card_message').val(),
								MerchantId: self.MerchantId,
								Delivery: {
									DeliveryDate: $('input#xxxxxxxx').val(),
									DeliveryType: dType,
									Persons: [{
										Type: "Recipient",
										Name: $(dContainer).find('input[name$="recipient_name"]').val(),
										Email: $(dContainer).find('input[name$="recipient_email"]').val(),
										FB: ''
									}, {
										Type: "Sender",
										Name: $(dContainer).find('input[name$="from_name"]').val(),
										Email: '',
										FB: ''
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
							}]
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
							AddCharge: "0",
							AddChargeType: "0"
						},
						RA: {
							CP: self.ccp,
							UA: window.navigator.userAgent
						},
						Language: self.settings.Merchant.Language,
                        PurchaseType: self.purchaseType,
                        DeliverCards: true,
                        PromoPass: pw
					}
				};

				if(self.purchaseType == 2 || self.purchaseType == 4){
					checkoutData.crq.B2BPurchase = {
						UserId: self.options.UserId,
						LoggedInUserId: self.options.uide || 0
					};
				}

			// checkoutData.crq.Cart.CartCards = self.cart;

			if (dType == 'email') {
				var eDate = Date.parse($(dContainer).find('input#email_delivery_date').val().replace(/[-]/g, '/')),
					cDate = new Date(eDate).toDateString();

				checkoutData.crq.Cart.CartCards[0].Delivery.DeliveryDate = cDate;
				checkoutData.crq.Cart.CartCards[0].Delivery.Persons[1].Email = '';

                checkoutData.crq.DeliverCards = $('input#send_email').is(':checked');
			} else if (dType == 'sms') {
				var eDate = Date.parse($(dContainer).find('input#sms_delivery_date').val().replace(/[-]/g, '/')),
					cDate = new Date(eDate).toDateString();

				checkoutData.crq.Cart.CartCards[0].Delivery.DeliveryDate = cDate;
				checkoutData.crq.Cart.CartCards[0].Delivery.Persons[0].Phone = $(dContainer).find('input[name$="recipient_phone"]').val();
                checkoutData.crq.Cart.CartCards[0].Delivery.Persons[0].SmsPhoneNumber = $(dContainer).find('input[name$="recipient_phone"]').val();
			} else {
				checkoutData.crq.Cart.CartCards[0].Delivery.DeliveryDate = '';
				checkoutData.crq.Cart.CartCards[0].Delivery.Persons[1].Email = $(dContainer).find('input[name$="from_email"]').val();
			}

			if (dType == 'plastic') {
				//if there is no address stored...
				// if ($('select#existing-address').val() == -1 || $('select#existing-address').length === 0) {

					checkoutData.crq.Cart.CartCards[0].Shipment = {};
					checkoutData.crq.Cart.CartCards[0].Shipment.Key = 1; //self.mailShipping.length + 1;

					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption = {};
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption = $.parseJSON($('input[name=sOpt]:checked').val().replace(/[|]/g, '"'));
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption.Cost = Number(checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption.Cost);

					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress = {};
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Address1 = $(dContainer).find('input#plastic_address').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Address2 = $(dContainer).find('input#plastic_address2').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.City = $(dContainer).find('input#plastic_city').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.PostalZip = $(dContainer).find('input#plastic_zip').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.RegionId = ($(dContainer).find('#plastic_state').is('select')) ? $('#plastic_state').val() : -1,
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Region = ($('#plastic_state').find(":selected").text() !== '') ? $('#plastic_state').find(":selected").text() : $('#plastic_state').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.CountryId = $(dContainer).find('select#plastic_country').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.RecipientName = $(dContainer).find('input[name$="recipient_name"]').val();
					checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Phone = $(dContainer).find('input#plastic_recipient_phone').val();

				// } else {
				//	var index = $('select#existing-address').val(),
				//		myShipment = self.mailShipping[index];

				//	checkoutData.crq.Cart.CartCards[0].Shipment = {};
				//	checkoutData.crq.Cart.CartCards[0].Shipment.Key = myShipment.Shipment.Key;

				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption = {};
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption.Type = myShipment.Shipment.ShippingOption.Type;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingOption.Cost = myShipment.Shipment.ShippingOption.Cost;

				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress = {};
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Address1 = myShipment.Shipment.ShippingAddress.Address1;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Address2 = myShipment.Shipment.ShippingAddress.Address2;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.City = myShipment.Shipment.ShippingAddress.City;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.PostalZip = myShipment.Shipment.ShippingAddress.PostalZip;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.RegionId = myShipment.Shipment.ShippingAddress.RegionId;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Region = myShipment.Shipment.ShippingAddress.Region;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.CountryId = myShipment.Shipment.ShippingAddress.CountryId;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.RecipientName = myShipment.Shipment.ShippingAddress.RecipientName;
				//	checkoutData.crq.Cart.CartCards[0].Shipment.ShippingAddress.Phone = myShipment.Shipment.ShippingAddress.Phone;
				//}

			}

			return checkoutData;
		},

		//make the purchase
		purchase: function() {
			var self = this,
				bt = $('a.main-button').on('click', function() {

				// prevent trigger of web form	-- mstrnal Jan 2015
				//event.preventDefault();	

                var myFields,
                    pType = self.purchaseType;
                
                switch ( parseInt(pType, 10) ){
					case 0:
						myFields = $('li#customize_card, #delivery-content li.validate, li#checkout');
						break;
					case 1:
						myFields = $('li#customize_card, #delivery-content li.validate, li#checkout');
						break;
					case 2:
						myFields = $('li#customize_card, #delivery-content li.validate');
						break;
					case 3:
						myFields = $('li#customize_card, #delivery-content li.validate');
						break;
					case 4:
						myFields = $('li#customize_card, #delivery-content li.validate');
						break;
					case 5:
						myFields = $('li#customize_card, #delivery-content li.validate');
						break;
					default:
						myFields = $('li#customize_card, #delivery-content li.validate, li#checkout');
						break;
					}

					if (!$(this).hasClass('progress') && self.groupValidation(myFields, $(this))) {

						var eMessage = $(this).siblings('.group-error'),
							// eDate = Date.parse($('input#email_delivery_date').val().replace(/[-]/g, '/')),
							// cDate = new Date(eDate).toDateString(),

							dataToSend = self.generateCheckout();

						$(this).addClass('progress');

						$.when(self.checkout(JSON.stringify(dataToSend))).then(function(dRequest) {
							var eMessage = bt.siblings('div.group-error'),
								data = dRequest.d,
								html = '';


							if (data.Status.Success) {
								switch ( parseInt(pType, 10) ){
									case 0:  //gcp
										//
										bt.removeClass('progress');
										$('div#cart-embed div#l-info').addClass('highlighted').html(html);

										break;
									case 1: //Other
										//Show receipt link (as a button?)
										html = '<div><h3>Order has been generated!</h3></div>' + '<div><input type="text" value="' + data.OrderNumber + '" /><a href="/gcp/receipt.html?on=' + data.OrderNumber + '" class="button clear-button no-icon" target="_blank"><span>View</span></a></div>';
										bt.removeClass('progress');
										$('div#cart-embed div#l-info').addClass('highlighted').html(html);
										break;
									case 2:
										//display eCard link(if only one card. Mere than one display:none)
										var myNumItems = $('input#card_quantity').val() || 1,
											dataForItems = {'encryptedOrderNumber': data.OrderNumber, 'sortBy': '', 'startIndex': 0, 'numItems' : myNumItems, 'userIdE' : self.options.uide || ''};

										$.when(self.getItems(JSON.stringify(dataForItems))).then(function(goiRequest){
											if(goiRequest.d.Status.Success){
												var obj = goiRequest.d;


												if(obj.LineItems.length == 1){
												console.log(obj.LineItems);
													html = '<div><h3>Order has been generated: ' + obj.LineItems[0].ProductReferenceId + '</h3></div>' + '<div><a href="' + obj.LineItems[0].Link + '" class="button clear-button no-icon" target="_blank"><span>View Card</span></a></div>';
												}else{
													html = '<div><h3>Order has been generated!</h3></div>';
												}

												bt.removeClass('progress');
												$('#l-info').addClass('highlighted').html(html);
												$(document).trigger('notify', {type: 'success', value: 'Order has been generated: ' + obj.LineItems[0].ProductReferenceId});


												// eMessage.html(html);

												// Check if loaded from Portal 
												if (self.loadedFromCPanel) {
													//self.$elem.bReceipt({ orderNumber: data.d.OrderNumber, MerchantId: self.MerchantId, chainId: self.chainId });
													console.log(obj.LineItems[0].Link);
												}

											}else{
												html = '<div><h3>Error!</h3></div>' +
												'<div><span>Code: </span>' + goiRequest.d.Status.CodeNumber + '</div>' +
												'<div><span>Mesasge: </span>' + goiRequest.d.Status.CodeMessage + '</div>';
												eMessage.html('Error: ' + goiRequest.d.Status.CodeMessage + ': ' + self.Language.dialogs.checkout_error);
												$(document).trigger('notify', {type: 'error', value: 'Error: ' + goiRequest.d.Status.CodeMessage + ': ' + self.Language.dialogs.checkout_error});
											}
										});
										break;
									case 3:
										//
										bt.removeClass('progress');
										$('div#cart-embed div#l-info').addClass('highlighted').html('<div><h3>Order has been generated!</h3></div>');

										//update balance
										$.when(self.getEFTUserBalance()).then(function(nBalance){
											console.log(nBalance);
											self.settings.balance = nBalance.d;

											$('div#balance-info').html('<div><span>Your balance: </span>' + self.getMoney(self.numberWithCommas(self.settings.balance))   + '</div>');

											// self.generateInfo();
										});
										break;
									case 4:
										//display eCard link(if only one card. Mere than one display:none)
										var myNumItems = $('input#card_quantity').val() || 1,
										dataForItems = {'encryptedOrderNumber': data.OrderNumber, 'sortBy': '', 'startIndex': 0, 'numItems' : myNumItems, 'userIdE' : self.options.uide || ''};

										$.when(self.getItems(JSON.stringify(dataForItems))).then(function(goiRequest){
											if(goiRequest.d.Status.Success){
												var obj = goiRequest.d;

												if(obj.LineItems.length == 1){
													html = '<div><h3>Order has been generated!</h3></div>' + '<div><a href="' + obj.LineItems[0].Link + '" class="button clear-button no-icon" target="_blank"><span>View Card</span></a></div>';
												}else{
													html = '<div><h3>Order has been generated!</h3></div>';
													$.each(obj.LineItems, function(i, e){
														html = html + '<div><a href="' + obj.LineItems[i].Link + '" class="button clear-button no-icon" target="_blank"><span>View Card</span></a></div>';
													});
												}
												
												bt.removeClass('progress');
												$('div#cart-embed div#l-info').addClass('highlighted').html(html);
											}else{
												html = '<div><h3>Error!</h3></div>' +
												'<div><span>Code: </span>' + goiRequest.d.Status.Error.ErrorCode + '</div>' +
												'<div><span>Mesasge: </span>' + goiRequest.d.Status.Error.Message + '</div>';
												eMessage.html('Error: ' + goiRequest.d.Status.Error.ErrorCode + ': ' + self.Language.dialogs.checkout_error);
												$(document).trigger('notify', {type: 'error', value: 'Error: ' + goiRequest.d.Status.CodeMessage + ': ' + self.Language.dialogs.checkout_error});
											}
										});
									case 5:
										//display eCard link(if only one card. Mere than one display:none)
										var myNumItems = $('input#card_quantity').val() || 1,
										dataForItems = {'encryptedOrderNumber': data.OrderNumber, 'sortBy': '', 'startIndex': 0, 'numItems' : myNumItems, 'userIdE' : self.options.uide || ''};

										$.when(self.getItems(JSON.stringify(dataForItems))).then(function(goiRequest){
											if(goiRequest.d.Status.Success){
												var obj = goiRequest.d;

												if(obj.LineItems.length == 1){
													html = '<div><h3>Order has been generated!</h3></div>' + '<div><a href="' + obj.LineItems[0].Link + '" class="button clear-button no-icon" target="_blank"><span>View Card</span></a></div>';
												}else{
													html = '<div><h3>Order has been generated!</h3></div>';
													$.each(obj.LineItems, function(i, e){
														html = html + '<div><a href="' + obj.LineItems[i].Link + '" class="button clear-button no-icon" target="_blank"><span>View Card</span></a></div>';
													});
												}
												
												bt.removeClass('progress');
												$('div#cart-embed div#l-info').addClass('highlighted').html(html);
											}else{
												html = '<div><h3>Error!</h3></div>' +
												'<div><span>Code: </span>' + goiRequest.d.Status.Error.ErrorCode + '</div>' +
												'<div><span>Mesasge: </span>' + goiRequest.d.Status.Error.Message + '</div>';
												eMessage.html('Error: ' + goiRequest.d.Status.Error.ErrorCode + ': ' + self.Language.dialogs.checkout_error);
												$(document).trigger('notify', {type: 'error', value: 'Error: ' + goiRequest.d.Status.CodeMessage + ': ' + self.Language.dialogs.checkout_error});
											}
										});
										break;
									default:
										//
										bt.removeClass('progress');
										$('div#cart-embed div#l-info').addClass('highlighted').html(html);
										break;
									}

								// html = '<div><h3>Order has been generated!</h3></div>' + '<div><span>Encripted order number: </span><input type="text" value="' + data.OrderNumber + '" /></div>';
								// console.log(data);
							} else {
								html = '<div><h3>Error!</h3></div>' +
									'<div><span>Code: </span>' + data.Status.Error.ErrorCode + '</div>' +
									'<div><span>Mesasge: </span>' + data.Status.Error.Message + '</div>';
								eMessage.html('Error: ' + data.Status.Error.ErrorCode + ': ' + self.Language.dialogs.checkout_error);
							}
							self.sendCrossDomain({ type: 'scroll', value: 0 });

						});
					}
				});
		},

		//Call ceckout
		checkout: function(dataToSend) {
			var self = this;
			return $.ajax({
				type: "POST",
				url: self.checkoutWS,
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		},

		//Call GetOrderItems
		getItems: function(dataToSend) {
			var self = this;
			return $.ajax({
				type: "POST",
				url: self.getItemsWS,
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		}
	};

	$.fn._other = function(options) {
		return this.each(function() {
			var other = Object.create(Other);

			other.init(options, this);

			$.data(this, '_other', other);
		});
	};

	$.fn._other.options = {
		webService: '/gcp/services/BuyatabWS.asmx',
		cardsWS: "/GetCards",
		validateWS: '/Validate',
		countriesWS: '/GetCountries',
		statesWS: '/GetRegionsByCountry',
		checkoutWS: '/Checkout',
		getItemsWS: '/GetOrderItems',
		discountWS: '/GetDiscount',
        checkEFTUserBalanceWS: '/CheckEFTUserBalance'
	};

})(jQuery, window, document);