// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {

	var fs = {
		ini: function(){
			var self = this;

			self.merchantID = window.getParam('id');
			self.enclosurePrice = 6;
			self.mailShipping = [];

			self.underFile = 'template/cardc.handlebars';

			//Backbone
			window.App = {
				Models: {},
				Collections: {},
				Views: {}
			};

			_.templateSettings = {
				evaluate		: /\{\{=(.*?)\}\}/g,
				escape			: /\{\{-(.*?)\}\}/g,
				interpolate     : /\{\{\{(.*?)\}\}\}/g
			};
			//Backbone ends

			self.cart = {};
			self.totalCards = 0;
			self.cardErrors = 0;
			self.language = {
				dialogs : {
					yes : "Yes",
					no : "No",
					ok : "Ok",
					cancel : "Cancel",
					editing_card : "A card is being edited. Are you sure you want to proceed?",
					load_local : "There are cards pending in your cart since your last visit. Would you like to keep them?",
					delete_card : "Are you sure you want to delete this card?",
					processing : "Processing your data...",
					shipping_options : "Shipping options",
					shipping_option : "You must select one option",
					checkout_error : "Sorry, your request couldn't be completed. Please contact the Customer Support using the contact below.",
					exception_error : "There has been an unexpected error with your transaction. Please contact support at the information below before attempting again.",
					max_transaction : "Sorry. You have reached the maximun value per transaction: "
				},
				errors : {
					quantity : "Choose between 1 and ",
					value : "Minimum of ",
					maxvalue : "Maximum of ",
					required : "This field is required",
					optional_sender_name : "The credit card name will be used instead",
					check : "You must agree with the terms",
					group: "There are some errors. Please view fields above.",
					confirm: "Emails do not match",
					general: "Error",
					expiration: "Enter the credit card expiration date",
					222 : "Address shouldn't be longer than 50 chars",
					1002 : "The name on the credit card will be used",
					1003 : "Make sure your card has no CVD",
					1010 : "Required field",
					1012 : "Use a valid email address",
					1015 : "Use a valid expiration date",
					1016 : "Enter a valid credit card number",
					1017 : "Enter a valid Zip/Postal code",
					1018 : "Enter a valid United States zip code",
					1019 : "Enter a valid phone number",
					1024 : "Address shouldn't be longer than 50 chars",
					1025 : "The name field must be between 0 and 50 characters long",
					1025 : "A name shouldn't be longer than 50 chars",
					1026 : "Maximun number of cards reached",
					1030 : "The sender's email will be used",
					1032 : "The name on the credit card will be used",
					1033 : "The purchaser's email will be used",
					1034 : "Make sure you enter all the information",
					1060 : "The field exceeded the maximum number of characters",
					1062 : "The message must contain letters",

					po_box: "Sorry, P.O. Box are not allowed."
				}
			};

			//get today date
			var d = new Date();

			self.month = d.getMonth() + 1;
			self.day = d.getDate();
			self.year = d.getFullYear();

			self.today = (self.month < 10 ? '0' : '') + self.month + '/' +
			(self.day < 10 ? '0' : '') + self.day + '/' +
			d.getFullYear();

			$(window).on('load', function(){
				var page = document.location.hash.substring(1);

				if(!page){
					self.justHashed = '0';
					document.location.hash = '0';
				}
			});

			/**
			* Move page on hashchange event
			*/
			$(window).on('hashchange', function( event ){
				var page = document.location.hash.substring(1);

				if (self.justHashed !== page){
					self.showPage( [page] );
				}
			});

			//execute initial functions
			self.start();
		},

		//> Call other functions
		start: function(){
			var self = this;

			//when calling API is done...
			$.when( self.getOptions() ).then( function( rOpt ) {

				self.settings = rOpt.d;
				self.MaxCards = self.settings.Merchant.MaxCards || 30;

				// console.log(self.settings);

				//general
				self.showPage(0);
				self.numbersOnly();
				self.phoneOnly();
				self.noPOBox();

				// customize page>>
				self.getCard();
				self.showPack();
				self.getMailShipping();

				self.getAmount();
				self.getQuantity();
				self.setQuantity();
				self.charCount();
				self.getState( 'shipping_coutry', 'shipping_state', 'shipping_zip' );
				self.setLinks();

				//checkout>>
				self.getExpire();
				self.getCountry();
				self.getState( 'checkout_cc_country', 'checkout_cc_state', 'checkout_cc_zip' );
				self.addSeal();

				//buttons>>
				self.handleButtons();
				$.when( self.getUnder() ).then(function( rUnder ){
					self.uTemplate = rUnder;
					self.manipulateCart();
				});
			});
		},

		//> Access the API for checkout
		sendCheckout: function(){
			var self = this,
				tCountry = $('select#checkout_cc_country').val(),
				tRegion = ($('#checkout_cc_state').is('select')) ? $('#checkout_cc_state').val() : -1;
				if(tCountry instanceof Array ){
					tCountry = tCountry.join('');
				}
				if(tRegion instanceof Array ){
					tRegion = tRegion.join('');
				}

			var	dataToSend = {
					crq: {
						Cart: {
							CartCards: []
						},
						Payment: {
							CCType: $('select#checkout_cc_type').val(),
							CCNum: $('input#checkout_cc_number').val(),
							NameOnCard: $('input#checkout_cc_name').val(),
							ExpDate: $('select#checkout_cc_month').val() + '/' + $('select#checkout_cc_year').val(),
							CVD: $('input#checkout_cc_cvd').val(),

							Address1: $('input#checkout_cc_address').val(),
							Address2: $('input#checkout_cc_address2').val(),
							City: $('input#checkout_cc_city').val(),
							Country: tCountry,
							RegionId: tRegion,
							Region: ($('#checkout_cc_state').find(":selected").text() !== "") ? $('#checkout_cc_state').find(":selected").text() : $('#checkout_cc_state').val(),
							PostalZip: $('input#checkout_cc_zip').val(),

							Telephone: $('input#checkout_cc_phone').val(),
							Email: $('input#info_email').val(),
							AddCharge: "0",
							AddChargeType: "0"
						},
						RA: {
							CP: self.ccp,
							UA: window.navigator.userAgent
						},
						OptIn: $('input#opt-in').is(':checked'),
						Language: self.settings.Merchant.Language
					}
				};

			dataToSend.crq.Cart.CartCards = self.cart;
			var jLoader = $('<span />', {
				html: self.language.dialogs.processing
			}).addClass('ajax-loader');

			$('a.purchase').parent()
								.find('.group-error')
								.html(jLoader);

			dataToSend = JSON.stringify(dataToSend);
			// console.log(dataToSend);

			$.ajax({
				type: "POST",
                url: "../../../../services/BuyatabWS.asmx/Checkout",
                data: dataToSend,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function( data ){

					if(data.d.Status.Success || data.d.Status.Error.ErrorCode == 404){
						try {
							localStorage.removeItem( cart + getParam( 'id' ) );
						} catch (err) {
							if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
						}

						window.location.href = "confirm.html?on=" + data.d.OrderNumber + '&analytics=true';
					} else {
						if (data.d.Status.Error.ErrorCode == 14 || data.d.Status.Error.ErrorCode == 444 || data.d.Status.Error.ErrorCode == 500 || data.d.Status.Error.ErrorCode == 501 || data.d.Status.Error.ErrorCode == 510 || data.d.Status.Error.ErrorCode == 520 || data.d.Status.Error.ErrorCode == 521 || data.d.Status.Error.ErrorCode == 530 || data.d.Status.Error.ErrorCode == 531 || data.d.Status.Error.ErrorCode == 540 || data.d.Status.Error.ErrorCode == 541 || data.d.Status.Error.ErrorCode == 550 || data.d.Status.Error.ErrorCode == 600 || data.d.Status.Error.ErrorCode == 601 || data.d.Status.Error.ErrorCode == 610 || data.d.Status.Error.ErrorCode == 611 || data.d.Status.Error.ErrorCode == 612 || data.d.Status.Error.ErrorCode == 613) {

							$('a.purchase').parent() //don't remove the inactive class
							.find('.group-error')
								.html(self.language.dialogs.exception_error + ' Error Code: ' + data.d.Status.Error.ErrorCode);
							$('a.edit-checkout').css('visibility', 'hidden');
						} else {
							$('a.purchase')//.removeClass('dt-inactive')
								.parent()
								.find('.group-error')
								.html(data.d.Status.Error.Message);
							// console.log(data.d.Status.Error.Message)
						}
					}
				},
				error: function(e) {
					console.log(e);
					$('a.purchase').parent()
						.find('.group-error')
						.html(self.language.dialogs.checkout_error);
				}
			});
		},

		//> Access the API
		getOptions: function(){
			var self = this,
				dataToSend = {};

			dataToSend.MerchantId = self.merchantID;

			return $.ajax({
				type: "POST",
				url: '../../../../services/BuyatabWS.asmx/GetCards',
				data: "{gcr:" + JSON.stringify(dataToSend) + "}",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		},

		//> Load Underscore template
		getUnder: function(){
			$(document).trigger('functionIt', 'getUnder');
			var self = this;
			return $.ajax({
				url: self.underFile,
				dataType: "html"
			});
		},

		//> gets Four Seasons Plastic card
		getCard: function(){
			var self = this,
			cards = self.settings.Cards,
			card = $('img#card-image').attr('src', cards[0].ImageName.replace('/big/', '/medium/') ),
			pCard = $('a.preview-card').on('click', function(){
				self.showPreview();
			});
			// pImage = $('div#preview-window img#preview-image').attr('src', 'cards/big/' + cards[0].ImageName);
		},

		//> generates Slider from API call
		generateSlider: function(){
			var self = this,
			cards = self.settings.Cards,
			display = $('.choose-card').css({
				background:'url("' + cards[0].ImageName.replace('/big/', '/medium/') + '")'
			}).on('click', function(){
				self.showPreview();
			}),
			hField = $('input#card_design').val( cards[0].StyleId ),
			hSource = $('input#card_src').val(  cards[0].ImageName.replace('/big/', '/medium/') ),
			pCard = $('a.preview-card').on('click', function(){
				self.showPreview();
			}),
			selector = $('div.container'),
			wrapper = $('div.wt-scroller'),
			list = $('div.wt-scroller ul');

			$('.wt-scroller .prev-btn, .wt-scroller .next-btn').show();
			$('div#preview-window img#preview-image').attr( 'src',  cards[0].ImageName.replace('/big/', '/medium/')  );

			$.each(cards, function( i, e ){
				var myImg = $('<img />', {
					'data-id': e.StyleId,
					src: e.ImageName
				}).on('click', function(){
					self.selectCard(this);
				});

				list.append( $('<li />').append(myImg) );
			});

			selector.wtScroller({
				num_display: 4,
				slide_width: 141,
				slide_height: 100,
				slide_margin: 40,
				margin: 20,
				auto_scroll: false,
				scroll_speed: 800,
				ctrl_type: "",
				mousewheel_scroll: true
			});
		},

		//> Show preview
		showPreview: function(){
			var pWindow = $('div#preview-window-bg').fadeToggle().on('click', function(){
				//close preview
				pWindow.fadeOut();
			}),
			to = $('div#preview-window-bg span#pw-to').html( 'To: ' + $('input#email_recipient_name').val() ),
			from = $('div#preview-window-bg span#pw-from').html( 'From: ' + $('input#email_sender_name').val() );
		},

		//> Show Packaging
		showPack : function(){
			var pWindow = $('div#pack-window-bg').on('click', function(){
				//close preview
				pWindow.fadeOut();
				}),
				pButton = $('label[for=email_packaging] a').on('click', function(){
					pWindow.fadeToggle();
				}),
				drop = $('select#email_packaging'),
				pack = $('div#pack-window-bg a').on('click', function(){
					drop.val( $(this).data('pack') );
				});
		},

		//> Select a card
		selectCard: function( cardImg ){
			$('.choose-card').css('background', 'url("' + cardImg.src + '")');
			$('div#preview-window img#preview-image').attr( 'src', cardImg.src.replace('medium', 'big') );
			$('input#card_design').val( $(cardImg).data('id') );
			$('input#card_src').val( cardImg.src );
		},

		//> get Amount
		getAmount: function(){
			var self = this,
			initial = self.settings.Amount.InitialAmount,
			iaField = $('#input_amount').val(initial)
										.on('blur', function(){
											self.setTotal();
										})
										.on('keyup', function(){
											$(this).val( $(this).val().replace(/[^0-9]/g,'') );
										}),
			aField = $('#email_amount').on('change', function(){
				if( $('#email_amount').val() != -1 ){

					iaField.val( $(this).val() ).css('visibility', 'hidden');
					self.setTotal();
				}else{
					iaField.css('visibility', 'visible').focus().select();
					self.setTotal();
				}
			}),
			range = self.settings.Amount.Range.split(','),
			html = '';

			$.each(range, function( i, e ){
				if( e == initial ){
					html = html + '<option selected="selected" value="' + e + '">USD ' + self.nComma(e) + '</option>';
				}else{
					html = html + '<option value="' + e + '">USD ' + self.nComma(e) + '</option>';
				}
			});
			html = html + '<option value="-1">Other Value</option>';

			aField.html(html);
		},

		//> Get total number or avilable cards for mobile
		setQuantity: function(){
			var self = this,
				myTemplt = $( self.cTemplate ),
				field = $('select#email_quantity'),
				availableCards = self.MaxCards - self.totalCards,
				html = '';

			if(availableCards > 0){
					for(var i = 1; i <= availableCards; i++){
						html = html + "<option  value='" + i +"''>" + i + "</option>" ;
					}

				}else{
						html = html + "<option  value='0'>0</option>" ;
					}

				field.html(html);
		},

		//> get quantity
		getQuantity: function(){
			var self = this,
			qField = $('select#email_quantity').on('change', function(){
				self.setTotal();
			}),
			html = '';

			for(var i = 1; i <= 10; i ++){
				if(i == 1){
					html = html + '<option selected="selected" value="' + i + '">' + i + '</option>';
				}else{
					html = html + '<option value="' + i + '">' + i + '</option>';
				}
			}
			qField.html(html);
			self.setTotal();
		},

		//> set total to the card
		setTotal: function(){
			var self = this,
				min = self.settings.Amount.MinVal,
				max = self.settings.Amount.MaxVal,
				aSelect = $('#input_amount'),
				qSelect = $('select#email_quantity'),
				sTotal = $('div.total span'),
				pValue = $('div#preview-window span#pw-value');

			if(aSelect.val() < min){
				aSelect.val(min);
			}

			if(aSelect.val() > max){
				aSelect.val(max);
			}

			var	value = self.getMoney( ( aSelect.val() * qSelect.val() ).toFixed(2) );

			sTotal.html( value );
			pValue.html( 'Amount: ' + value );
		},

		//> Open links on a popup window
		setLinks: function(){
			var self = this,
				links = $('ul#u-links .u-link');

			links.each(function(){
				$(this).on('click', function(){
					if( $(this).data('link')){
						var url = $(this).data('link');
						window.open(url, 'cofre', 'height=500,width=500,menubar=0,status=0,titlebar=0,toolbar=0');
					}
				});
			});
		},

		//> Handles the message and limit chars to the self.messageMax value
		charCount: function(){
			var chars = $('#chars'),
			charsLine = $('#chars-lines').html(17),
			mBox = $('textarea#email_message'),
			limit = 48,
			limitLine = 17,
			limitPerLine = 48,
			prevText = $('span#pw-message');

			$(chars).html(limit);

			function getLines( element ){
				var text = $(element).val(),
					times = 0;
				lines = text.split(/\r|\r\n|\n/);
				$.each(lines, function( i, e ){
					if(e.length > limitPerLine){
						times = parseInt(e.length / limitPerLine, 10);
					}
				});
				return lines.length + times;
			}

			mBox.on('keyup keydown', function( e ){
				var n = mBox.val().length,
					l = getLines(mBox);


				if( l <= limitLine ){
					$(charsLine).html( limitLine - l );
				}else{
					var textLines  = mBox.val().split("\n"),
						lastLine = textLines.pop(),
						nextLine = '',
						newText = [];

					if(lastLine.length >= limitPerLine){
						nextLine = lastLine.substr(0, limitPerLine);
					}

					for (var i = 0; i < limitLine; i++) {
						newText.push(textLines[i]);
					}

					newText.push(nextLine);

					newText = newText.join("\n");
					$(this).val(newText).scrollTop(5200);
				}

				//update the text in the preview window
				$('span#pw-message').html( $(this).val().replace(/\r?\n/g, '<br>') );
			});
			mBox.trigger('keyup');
		},

		//> generate expiration
		getExpire: function(){
			var self = this,
			mField = $('select#checkout_cc_month'),
			yField = $('select#checkout_cc_year'),
			mHtml = '<option value="-1">--</option>',
			yHtml = '<option value="-1">--</option>';

			for(mI = 1; mI <= 12; mI++){
				mHtml = mHtml + '<option value="' + ( (mI >= 10) ? mI : '0' + mI ) + '">' +
				( (mI >= 10) ? mI : '0' + mI ) + '</option>';
			}

			for(yI = self.year; yI < self.year + 10; yI++){
				yHtml = yHtml + '<option value="' + yI + '">' + yI  + '</option>';
			}

			mField.html(mHtml);
			yField.html(yHtml);
		},

		//> Get countries from the API and populate select
		getCountry: function(){
			var cSelect = $('select#checkout_cc_country, select#shipping_coutry'),
			html = '';

			$.ajax({
				url: '../../../../services/BuyatabWS.asmx/GetCountries',
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			}).done(function( data ){
				var list = data.d;

				$.each(list, function(i, e) {
					//Canada as default
					if (e.Id == 1) {
						html = html + '<option selected="selected" value="' + e.Id + '">' + e.Name + '</option>';
					} else {
						html = html + '<option value="' + e.Id + '">' + e.Name + '</option>';
					}
				});
				cSelect.html( html )
				.trigger('change');
			});
		},

		//> Change states acording to country
		getState: function( countryField, stateField, zipField){
			var country = $('select#' + countryField),
				states = $('select#' + stateField),
				zip = $('input#' + zipField),
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
						url: '../../../../services/BuyatabWS.asmx/GetRegionsByCountry',
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
								.insertAfter( sParents.find('label') );
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
								.insertAfter( sParents.find('label') );
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
							.insertAfter( sParents.find('label') );
							states.remove();
							$('select#' + stateField).remove();
						}else{
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
						.insertAfter( sParents.find('label') );
						states.remove();
						$('select#' + stateField).remove();
					}else{
						$('input#' + stateField).attr('data-region', 84);
					}
				});
			});
		},

		//> Hides al the pages and then show a specific one
		showPage: function( pageNumber ){
			var self = this,
			lPage = $('ul#pages > li');

			lPage.hide();
			$(lPage[pageNumber]).show();
			self.header = $(lPage[pageNumber]).data('header');
			self.currentPage = pageNumber;
			document.location.hash = pageNumber;

			self.updateHeader(self.header);
			self.setSummary();
			$(window).trigger('showPage', pageNumber);
		},

		//> Upadate header
		updateHeader: function( header ){
			var self = this,
			headers = $('header ul#status-bar > li');

			headers.removeClass('active');
			$(headers[header]).addClass('active');
		},

		//> handle buttons
		handleButtons: function(){
			var self = this;

			//regular buttons
			$('a.button.next').on('click', function(){
				if( self.validation( this ) ){
					self.showPage( Number(self.currentPage) + 1 );
					$('.group-error').html('');
					$('a.purchase').removeClass('dt-inactive');
				}
			});
			$('a.button.preview').on('click', function(){
				self.showPage( Number(self.currentPage) - 1 );
				$('.group-error').html('');
				$('a.purchase').removeClass('dt-inactive');
				// $('a#set-ship').show();
			});

			// To checkout
			$('a.checkout').on('click', function(){
					self.showPage( Number(self.currentPage) + 1 );
			});

			//send Checkout
			$('a.purchase').on('click', function(){
					if( self.validation( this ) && $('a.purchase').hasClass('dt-inactive') === false){
						self.sendCheckout();
						$('a.purchase').addClass('dt-inactive');
				}
			});

			//set Shippment
			$('#set-ship').on('click', function(){
				self.setShipping();
			});

			//set Sender
			$('#set-sender').on('click', function(){
				self.setSender();
			});
		},
		//Waits for the mailShipping event and execute
		getMailShipping: function(){
			var self = this,
				html = '',
				eaDetails = $('<p />').addClass('shipping-details'),
				myParagraph = $('<p />',{
					id: 'mail-description',
					html: 'Choose or enter a new address.'
				}),
				eShipment = $('<select />', {
					id: 'existing-address'
				}).on('change', function(){
					if($(this).val() != -1){
						var i = $(this).val();
						$('div#new-shipment').hide();
						$('div#new-shipment').find('input').addClass('dont-validate');
						eaDetails.html( self.addressToString(self.mailShipping[i].Shipment.ShippingAddress) );
					}else{
						$('div#new-shipment').show();
						$('div#new-shipment').find('input').removeClass('dont-validate');
						eaDetails.html('');
					}
				});

			$(document).on('mailShipping', function(){

				var html = '<option value= "-1">New Address</option>';
				$.each(self.mailShipping, function( i, e ){
					html = html + '<option value= "' + i +'">' + e.Shipment.ShippingAddress.Address1 + '</option>';
				});

				eShipment.html(html);

				if( $('div#plastic-shipment #existing-address').length > 0 ){

					eShipment.appendTo('div#plastic-shipment');

				}else{
					eShipment.prependTo('div#plastic-shipment');
					myParagraph.prependTo('div#plastic-shipment');
					eaDetails.insertAfter('div#plastic-shipment');
				}

				$('div#new-shipment').show();
				$('div#new-shipment').find('input').removeClass('dont-validate');
				// self.handleButtons(0);
				// self.resizeDelivery(0);
			});
		},

		//> Set validation class and error message
		fieldValidation: function(field, status, type, errorCode) {
			var self = this,
				myParent = $(field).parent(),
				eField = $(field).siblings('span.field-error'),
				lang = self.language.errors,
				errorType = '',
				tempRet = true;

			// myParent.find('span.field-error').html('') ;

			if( status ){
				if( $(field).hasClass('confirmation') ){
					if($(field).val() != $(field).parents('li').find('input.email1').val()){
						$(field).siblings('span.field-error').html(self.language.errors.confirm)
						.show();
						return false;
					}else{
						$(field).siblings('span.field-error').html('');
					}
				}else{
					if( $(field).attr('type') !== 'checkbox' ){
						eField.fadeOut(1200, 'swing', function(){
							myParent.removeClass('validation-error')
							.removeClass('validation-warning');
							$(this).html('').show();
						});
					}
				}

				tempRet = true;

			}else{

				eField.show();

				if( type == 'error' ){
					errorType = 'validation-error';
					tempRet = false;
				}else{
					errorType = 'validation-warning';
					tempRet = true;
				}

				myParent.addClass(errorType);
				eField.html(lang[errorCode]);
			}
			return tempRet;
		},

		//> validation
		validation: function( from ){
			var self = this,
			fields = $(from).parents('li').find('input[type=text], input[type=checkbox], input[type=radio].required, textarea, select'),
			valObj = [],
			errors = 0;

			$(fields).each(function() {
				var myObj = {};

				if( $(this).attr('type') === 'checkbox' && $(this).hasClass('required') ){

					if( $(this).is(':checked') ){
						$(this).parents('div.terms').removeClass('validation-error')
						.find('span.field-error')
						.html('');
					}else{
						$(this).parents('div.terms')
						.addClass('validation-error')
						.find('span.field-error')
						.html(self.language.errors.check);
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
					if($(this).hasClass('expmonth') || $(this).hasClass('expyear')){
						myObj.Classes = 'expdate';
						myObj.Data = $('.expmonth').val() + '/' + $('.expyear').val();
					}else{
						var fData = $(this).val(),
							maxData = $(this).data('max'); //for max length fields

						//when empty sends nothing. Otherwise... boolean! 
						if(fData.length > 0){
							// check length and return boolean
							if(maxData){
								fData = (fData.length <= maxData);
							}
						}

						myObj.Classes = $(this).attr('class');
						myObj.Data = fData;
					}

					if( !$(this).hasClass('dont-validate') ){
						valObj.push(myObj);
					}
				}

			});
			$.ajax({
				type: "POST",
				url: "../../../../services/BuyatabWS.asmx/Validate",
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
						}
					});
				},
				error: function( e ){
					console.log(e.statusText + ': ' + e.responseText);
				}
			});


			var gError = $(from).parents('div.pages-nav').find('div.group-error');

			if(errors > 0){
				gError.html(self.language.errors.group);
				setTimeout(function() {
					gError.fadeOut('slow', 'swing', function(){
						gError.html('');
						gError.show();
					});
				}, 5200);
			}else{
				gError.html('');
			}

			return (errors > 0) ? false : true;
		},

		//Uses backbone to manipulate the cart
		manipulateCart: function() {
			var self = this,
				viewHelper = {
					getAmount: function(amount) {
						return self.nComma(amount);
					},
					isPlastic: function( type, shipping ){
						if(type == 'plastic'){
							// return '(+' + self.getMoney(shipping) + ')';
							return '';
						}
						return "";
					}
				};
			App.test = function(){

				this.render();
			};

			App.Models.Card = Backbone.Model.extend({
				defaults: {
					StyleId: "",
					Amount: 100,
					Quantity: 1,
					CardImg: "",
					Message: "",
					MerchantId: 1,
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
					//update shippment
					this.updateShippment();
					//Save cart to local storage
					this.setStorage();
					//Update the global variable
					self.cart = this.toJSON();
					// window.Cart = this.toJSON();
					window.Cart = self.cart;
				},

				// updateHeader: function(){
					// self.notificateHeader(this.length);
				// },

				updateCartButton: function(){//and  Sumary
					if(this.length === 0){
						$('a.checkout').hide();
						// console.log(this.length);
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
						$('span.summary-order').html('USD 0.0');
						$('span.summary-total').html('USD 0.0');
						$('span.summary-shipping').html('USD 0.0');
						$('span.summary-pack').html('USD 0.0');
					}else{
						var models = this.toJSON(),
							subTotal = 0,
							shipTotal = 0,
							packTotal = 0,
							total = 0,
							hasPlastic = false,
							html = '',
							totalCards = 0,
							plastics = [],
							plasticsCost = [];

						for (var i = 0; i < models.length; i++) {
							subTotal = subTotal + (models[i].Amount * models[i].Quantity);
							totalCards += parseInt(models[i].Quantity, 10);

							if(models[i].PersonalizedEnclosure.Enclosure_Id == 2){
								packTotal = packTotal + self.enclosurePrice * models[i].Quantity;
							}

							hasPlastic = true;

							if( $.inArray(models[i].Shipment.Key, plastics) == -1 ){
								plastics.push(models[i].Shipment.Key);
								plasticsCost.push(models[i].Shipment.ShippingOption.Cost);
							}
						}

						for(var i2 = 0; i2 < plasticsCost.length; i2++){
							shipTotal = shipTotal + parseFloat(plasticsCost[i2], 10);
						}

						total = subTotal + shipTotal + packTotal;
						self.totalCards = totalCards;
						self.setQuantity();

						$('a.checkout, a.new-card').show();
						$('div#summary').html(html);

						$('span.summary-order').html('USD '		+ self.nComma( subTotal.toFixed(2) ) );
						$('span.summary-total').html('USD '		+ self.nComma( total.toFixed(2) ) );
						$('span.summary-shipping').html('USD '	+ self.nComma( shipTotal.toFixed(2) ) );
						$('span.summary-pack').html('USD '		+ self.nComma( packTotal.toFixed(2) ) );

						self.total = total;
						self.setSummary();

					}
				},

				updateStep: function(){
					if(this.length === 0){
						// self.moveIt( ['customize'] );
					}
				},

				updateShippment: function(){
					// var models = this.toJSON(),
					// var models = ( self.mailShipping.length > 0 ) ? self.mailShipping : this.toJSON(),
					var models = self.mailShipping,
						nModels = models.length,
						sShip = 0,
						cards = this.toJSON(),
						sArea = $('li#shipment div#shipping-options'),
						list = $('<ul />', {
							id: 'ships'
						}),
						pack = ['', '(Envelope)', '(Giftbox)'],
						curr = 1,
						error = false,
						setShip = $('a#set-ship').hide();

					self.cardErrors = 0;

					$.each(models, function( i, e ){
						var add = e.Shipment.ShippingAddress,
							key = e.Shipment.Key,

							dataToSend = {
								address: {
									RecipientName: add.RecipientName,
									Phone: add.RecipientPhone,
									CountryId: add.CountryId,
									RegionId: add.RegionId,
									PostalZip: add.PostalZip,
									Address1: add.Address1,
									Address2: add.Address2,
									City: add.City
								},
								merchantId: self.merchantId || 1089,
								numberOfEnvelopes: e.nEnvelope,
								numberOfGiftboxes: e.nBox,
								extra: 54873
							},
							item = $('<li />');

						var sameAddress = [],
							aCount = 0;
						$.each(cards, function( index, elem ){
							if( elem.Shipment.Key == key){
								sameAddress.push( elem );
								aCount++;
							}
						});

						if(aCount > 0){

							$('<h3 />', {
								html: ' Ship to: ' + self.addressToString(e.Shipment.ShippingAddress)
							}).appendTo(item);

							$.each(sameAddress, function( index, elem ){
								var cVal = parseInt(elem.Amount, 10 ).toFixed(2);

								$('<div />', {
									html:	'<span>' + curr + '. </span>' +
									'<span>' + elem.Delivery.Persons[0].Name + '</span>' +
									'<span>USD ' + self.nComma(cVal) + '</span>' +
									'<span>' + pack[elem.PersonalizedEnclosure.Enclosure_Id] + '</span>'
								}).addClass('ship-index').appendTo(item);
								curr++;
							});

							dataToSend = JSON.stringify(dataToSend);

							$('<label />', {
								html: 'Shipping Method'
							}).addClass('ship-method').appendTo(item);

							$('<input />', {
								type: 'hidden',
								name: 'hOpt' + i,
								value: i + 1
							}).appendTo(item);

							var sWrap = $('<div />', {
								id: 'ship-wrap'
							}),
							jLoader = $('<span />', {
								html: self.language.dialogs.processing
							}).addClass('ajax-loader').appendTo(sWrap);

							$.ajax({
								type: "POST",
								url: "../../../../services/BuyatabWS.asmx/GetShippingRates",
								data: dataToSend,
								contentType: "application/json; charset=utf-8",
								dataType: "json",
								// async: false,
								success: function(data) {
									data = data.d;
									if(data[0].Cost !== 0 && data[0].Type !== 'Undefined' ){

										$.each(data, function( index, elem ){
											var checkIt = '';
											if(index === 0){
												checkIt = 'checked="checked"';
											}
											var myObj = $('<div />', {
												html:	'<input name="sOpt' + i + '" class="check" type="radio" id="ship' + key + 'opt' + index + '" value="{|Cost|: |' + elem.Cost + '|, |Type|: |' + elem.Type + '|}" alt="' + self.language.dialogs.shipping_option + '"' + checkIt + ' >' +
												'<label for="ship' + key + 'opt' + index + '">' + elem.Type + ' ' + self.getMoney(elem.Cost) + '</label>'
											}).addClass('shipping-option');

											if(elem.Cost === 0 || elem.Type === 'Undefined'){
												error = true;
												self.cardErrors += 1;
											}

											sWrap.append(myObj);
										});
										sShip++;

										if(sShip !== nModels){
											setShip.hide();
										}else{
											setShip.show();
										}

									}else{
										//Undefined Shipment
										error = true;
										self.cardErrors += 1;
										setShip.hide();
										var myObj = $('<div />', {
											html:	'Address not found. Please review address.'
										}).addClass('shipping-option shipping-error');

										sWrap.append(myObj);
									}

									// ide/show continue button
									if(self.cardErrors > 0){
										setShip.hide();
									}else{
										setShip.show();
									}

									jLoader.remove();
								},
								error: function(e) {
									sWrap.html(e);
								}
							});
							sWrap.appendTo(item);
							item.appendTo(list);
						}
					});


					sArea.html(list);
				},

				setStorage: function(){
					self.cart = this.toJSON();
					if(typeof(Storage)!=="undefined"){
						try {
							localStorage.setItem( cart + getParam( 'id' ), JSON.stringify( self.cart ) );
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
					if( typeof(Storage)!=="undefined" ){
						var lCart = JSON.parse( localStorage.getItem(cart + getParam( 'id' ) ) ),
						self2 = this,
						card,
						button_yes = self.language.dialogs.yes,
						button_no = self.language.dialogs.no,
						dialog_buttons = {};

						dialog_buttons[button_yes] = function(){
							$( this ).dialog( "close" );
							self2.collection.add( lCart );
							//if no embeded cart move to cart page
							if(!self.settings.Merchant.EC){
								self.moveIt(['editcart']);
							}
						};
						dialog_buttons[button_no] = function(){
							try {
								localStorage.removeItem( cart + getParam( 'id' ) );
							} catch (err) {
								if ((err.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {}
							}
							$( this ).dialog( "close" );
						};

						if( lCart !== null && lCart.length > 0 ){
							$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
								$( '<div></div>' )
								.html(self.language.dialogs.load_local)
								.dialog({
									resizable: false,
									modal: true,
									buttons: dialog_buttons
								});
							});
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
					// 'click img'    : 'previewCard',
					'click .delete': 'destroy'
				},

				editCard: function(e) {
					var thisView = this,
						button_yes = self.language.dialogs.yes,
						button_cancel = self.language.dialogs.cancel,
						dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						self.editingCard = false;
						self.moveIt( ['customize'] );
						App.prepareEditing(thisView);
						self.currentModel = thisView.model.cid;
						console.log(self.currentModel);
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					if(self.editingCard){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
							.html(self.language.dialogs.editing_card)
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
				},

				//Display card preview
				previewCard: function(){
					var thisView = this,
						button_yes = self.language.dialogs.yes,
						button_cancel = self.language.dialogs.cancel,
						dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						self.editingCard = false;
						// self.moveIt( ['customize'] );
						App.preparePreview(thisView);
						self.currentModel = thisView.model.cid;
						self.showPreview();
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					if(self.editingCard){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
							.html(self.language.dialogs.editing_card)
							.dialog({
								resizable: false,
								modal: true,
								buttons: dialog_buttons
							});
						});
					}else{
						App.preparePreview(thisView);
						self.currentModel = thisView.model.cid;
						self.editingCard = false;
						self.showPreview();
					}
					// console.log(thisView.model.toJSON().Delivery.Persons[0] )
				},

				destroy: function() {
					var thisView = this,

					button_yes = self.language.dialogs.yes,
					button_cancel = self.language.dialogs.cancel,
					dialog_buttons = {};

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						$('.add-to-cart').show();
						$('.update-cart').hide();
						thisView.model.destroy();

						// console.log(thisView);
						// thisView.model.updateShippment();
						// thisView.collection.render(); 
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
					};
					$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
						$( '<div></div>' )
						.html(self.language.dialogs.delete_card)
						.dialog({
							resizable: false,
							modal: true,
							buttons: dialog_buttons
						});
					});
				},

				remove: function() {

					this.$el.remove();
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
				el: $('div#wrapper'),

				events: {
					'click a.add-to-cart': 'submit', //add card
					'click a#set-ship': 'update', //save changes
					'click a#set-sender': 'updateSender', //save changes
					'change li#customize input, li#customize textarea': 'setEditing', //
					'click div.choose-card, ul.image-selector img, div.udBox a': 'setEditing', //self.editingCard = true
					'click a.purchase': 'purchase',
					'click a.checkout': 'checkout',
					'click a.get-shipment': 'checkPlastic'
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
					/*if (self.groupValidation($('li#cc-info, li#billing-info, li#purchaser-info'), $('a.purchase')) && $('a.purchase').hasClass('dt-inactive') == false) {
						self.sendCheckout();
						$('a.purchase').on('click', function( e ){
							e.preventDefault();
						}).addClass('dt-inactive');
					}	*/
				},

				checkout: function(){
					var button_yes = self.language.dialogs.yes,
					button_cancel = self.language.dialogs.cancel,
					dialog_buttons = {},
					self2 = this;

					dialog_buttons[button_yes] = function(){
						$( this ).dialog( "close" );
						self.editingCard = false;

						self2.hideIt();
					},
					dialog_buttons[button_cancel] = function(){
						$( this ).dialog( "close" );
						self.showPage(0);
					};
					if(self.editingCard){
						$('html, body').animate({ scrollTop: 0 }, "fast").promise().done(function(){
							$( '<div></div>' )
							.html(self.language.dialogs.editing_card)
							.dialog({
								resizable: false,
								modal: true,
								buttons: dialog_buttons
							});
						});
					}else{
						// self.moveIt( ['customize'] );
						// self.moveIt( ['checkoutpage'] );
						// this.hideIt();
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
						button_ok = self.language.dialogs.ok;

					dialog_buttons[button_ok] = function(){
						$( this ).dialog( "close" );
					};

					for(i=0;i<currentCart.length;i++){
						total = total + ( currentCart[i].Amount * currentCart[i].Quantity);
					}
					total = parseInt( total, 10 ) + ( parseInt( $('input#card_value').val(), 10 ) *  parseInt( $('input#card_quantity').val(), 10 ) );

					if(total > maxTransaction){

						$( '<div></div>' )
						.html(self.language.dialogs.max_transaction + self.getMoney(maxTransaction))
						.dialog({
							resizable: false,
							modal: true,
							buttons: dialog_buttons
						});
					}else{

						if( self.validation( $('a.add-to-cart') ) ){
							var jCard = card.toJSON();

							self.pushAddress(jCard);
							slf2.collection.add(card);
							self.editingCard = false;
							self.resetFields();
						}
					}
				},

				update: function(e){
					var myModels = this.collection.toJSON(),
						sOptions = self.mailShipping;

					$.each(sOptions, function( i, e ){
						$.each(myModels, function( mi, me ){
							if(myModels[mi].Shipment.Key == sOptions[i].Shipment.Key){
								myModels[mi].Shipment.ShippingOption = sOptions[i].Shipment.ShippingOption;
							}
						});
					});

					this.collection.render();
				},

				updateSender: function(e){
					var myModel = this.collection.toJSON();

					$.each(myModel, function( i, e ){
						myModel[i].Delivery.Persons[1].Name  = $('input#info_first').val() + ' ' + $('input#info_last').val();
						myModel[i].Delivery.Persons[1].Email = $('input#info_email').val();
					});

					this.collection.render();
				},

				setEditing: function(){
					self.editingCard = true;
				}
			});

			App.submit = function(){
				var tempObj = {};

				tempObj.StyleId		= self.settings.Cards[0].StyleId;
				tempObj.Amount		= $('#input_amount').val().replace(/[^0-9]/g,'');
				tempObj.Quantity	= $('#email_quantity').val();
				tempObj.CardImg		= $('img#card-image').attr('src').replace('medium', 'small');
				tempObj.Message		= $('textarea#email_message').val();
				// tempObj.MerchantId = window.getParam( 'id' );
				tempObj.MerchantId = self.merchantID;

				tempObj.Delivery				= {};
				tempObj.Delivery.DeliveryDate	= self.today;
				tempObj.Delivery.Persons		= [];
				tempObj.Delivery.Persons[0]		= {};
				tempObj.Delivery.Persons[1]		= {};

				var dType = 'plastic';

				tempObj.Delivery.DeliveryType					= dType;
				tempObj.Delivery.Persons[0].Type				= 'Recipient',
				// tempObj.Delivery.Persons[0].Name				=  $(dContainer).find('input[name$="recipient_name"]').val();
				tempObj.Delivery.Persons[0].Name				=  $('#shipping_first').val();
				tempObj.Delivery.Persons[0].Email				= '';
				tempObj.Delivery.Persons[0].FB					= '';
				tempObj.Delivery.Persons[1].Type				= 'Sender';
				tempObj.Delivery.Persons[1].Name				= '';
				tempObj.Delivery.Persons[1].Email				= '';
				tempObj.Delivery.Persons[1].FB					= '';

                if( $('select#existing-address').val() == -1 || $('select#existing-address option').length === 0 ){

					tempObj.Shipment								= {};
					tempObj.Shipment.Key							= $('select#existing-address option').size() + 1;

					tempObj.Shipment.ShippingAddress				= {};
					tempObj.Shipment.ShippingOption					= {};
					// tempObj.Shipment.ShippingOption.Cost			= 0;
					tempObj.Shipment.ShippingAddress.ShippingId		= 0;

					// tempObj.Shipment.ShippingOption = $.parseJSON( $('input[name=sOpt' + i +']:checked').val().replace(/[|]/g, '"')) || {};
					// tempObj.Shipment.ShippingAddress.ShippingId = i + 1;

					tCountry = $('select#shipping_coutry').val(),
					tRegion = ($('#shipping_state').is('select')) ? $('#shipping_state').val() : -1;
					if(tCountry instanceof Array ){
						tCountry = tCountry.join('');
					}
					if(tRegion instanceof Array ){
						tRegion = tRegion.join('');
					}

					tempObj.Shipment.ShippingAddress.ShippingId		= 0;
					tempObj.Shipment.ShippingAddress.Address1		= $('input#shipping_address').val();
					tempObj.Shipment.ShippingAddress.Address2		= $('input#shipping_address2').val();
					tempObj.Shipment.ShippingAddress.City			= $('input#shipping_city').val();
					tempObj.Shipment.ShippingAddress.PostalZip		= $('input#shipping_zip').val();
					tempObj.Shipment.ShippingAddress.RegionId		= tRegion,
					tempObj.Shipment.ShippingAddress.Region			= ($('#shipping_state').find(":selected").text() !== "") ? $('#shipping_state').find(":selected").text() : $('#shipping_state').val();
					tempObj.Shipment.ShippingAddress.CountryId		= tCountry;
					tempObj.Shipment.ShippingAddress.RecipientName	= $('input#shipping_first').val();
					tempObj.Shipment.ShippingAddress.RecipientPhone = self.settings.Merchant.ContactNumber; //$('input#shipping_phone').val();
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
                        tempObj.Shipment.ShippingAddress.RecipientName  = myShipment.Shipment.ShippingAddress.RecipientName;
						tempObj.Shipment.ShippingAddress.Phone			= myShipment.Shipment.ShippingAddress.Phone;
					}

				tempObj.PersonalizedEnclosure					= {};
				tempObj.PersonalizedEnclosure.Enclosure_Id		= $('select#email_packaging').val();
				tempObj.PersonalizedEnclosure.From				= $('input#email_sender_name').val();
				tempObj.PersonalizedEnclosure.To				= $('input#email_recipient_name').val();
				tempObj.PersonalizedEnclosure.Message			= $('textarea#email_message').val();

				return tempObj;
			};

			App.preparePreview = function( view ){
				var myCard = view.model.attributes,
					deliveryType = myCard.Delivery.DeliveryType,
					myImg = myCard.CardImg.replace('small', 'medium');

				$('li#customize input, li#customize textarea').val('');
				$('#email_delivery_date').val(self.today);
				//Images

				$('input#card_src').val(myImg);
				$('.choose-card').css( 'background', 'url("' + myImg + '" )' );
				$('img#preview-image').attr( 'src', myImg.replace('medium', 'big') );

				// preview window
				$('span#pw-value').html(self.getMoney(myCard.Amount));
				$('span#pw-message').html(myCard.Message);
			};

			App.prepareEditing = function( view ){
				$(document).trigger('functionIt', 'App.prepareEditing');
				var myCard = view.model.attributes,
					deliveryType = myCard.Delivery.DeliveryType,
					myImg = myCard.CardImg.replace('small', 'medium');


				// self.editingCard = true;

				$('li#customize input, li#customize textarea').val(''); //reset all fields and then...

				//Images
				$('input#card_src').val(myImg);
				$('.choose-card').css( 'background', 'url("' + myImg + '" )' );
				$('img#preview-image').attr( 'src', myImg.replace('medium', 'big') );

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

				$('span#pw-message').html(myCard.Message);

				$('input#card_quantity').val(myCard.Quantity);
				$('textarea').val(myCard.Message);

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
					$('li#delivery-info li.validate input#email_delivery_date').val(myCard.Delivery.DeliveryDate);
					$('li#delivery-info li.validate input[name$="recipient_name"]').val(myCard.Delivery.Persons[0].Name);
					$('li#delivery-info li.validate input[name$="recipient_email"]').val(myCard.Delivery.Persons[0].Email);
					$('li#delivery-info li.validate input[name$="from_name"]').val(myCard.Delivery.Persons[1].Name);
					$('li#delivery-info li.validate input[name$="from_email"]').val(myCard.Delivery.Persons[1].Email);

					//plastic
					$('li#delivery-info li.validate input#plastic_recipient_phone').val(myCard.RecipientPhone);
					$('li#delivery-info li.validate input#plastic_address').val(myCard.Address1);
					$('li#delivery-info li.validate input#plastic_address2').val(myCard.Address2);
					$('li#delivery-info li.validate input#plastic_city').val(myCard.City);
					$('li#delivery-info li.validate input#plastic_zip').val(myCard.PostalZip);

					$('select#existing-address option').filter(function() {
						return $(this).text() == myCard.Address1;
					}).attr('selected', true);
					$('select#existing-address').trigger('change');

					$("select#plastic_country option").filter(function() {
						return $(this).val() == myCard.Country;
					}).attr('selected', true);

					$('input#plastic_state').val(myCard.Region);
					//select version
					$("select#plastic_state option").filter(function() {
						return $(this).val() == myCard.RegionId;
					}).attr('selected', true);
				});
			};

			var CartCollection = new App.Collections.Cart([]),
			addCardView = new App.Views.AddCard({ collection: CartCollection }),
			cartView = new App.Views.Cart({ collection: CartCollection });

			$('ul#cards').html(cartView.render().el);
		},

		// Set shipping options for the cards
		setShipping: function(){
			var self = this,
				list = $('ul#ships div.ship-index');

			$.each(list, function( i, e ){
				var k = self.cart[i].Shipment.Key;
				self.cart[i].Shipment.ShippingOption = $.parseJSON( $('input[id^=ship' + k +']:checked').val().replace(/[|]/g, '"'));
				self.cart[i].Shipment.ShippingAddress.ShippingId = k;
			});
		},

		// Set shipping options for the cards
		setSender: function(){
			var self = this;

			$.each(self.cart, function( i, e ){
				self.cart[i].Delivery.Persons[1].Name  = $('input#info_first').val() + ' ' + $('input#info_last').val();
				self.cart[i].Delivery.Persons[1].Email = $('input#info_email').val();
			});
		},

		//> 43lp3r - //Update summary
		setSummary: function(){
			var self = this,

			//fields
			sExp    = $('li#summary span.summary-expiration'),

			sType    = $('li#summary span.summary-type'),
			sNumber  = $('li#summary span.summary-number'),
			sEmail   = $('li#summary span.summary-email'),
			sPhone   = $('li#summary span.summary-phone'),
			sAddress = $('li#summary span.summary-address'),
			sState   = $('li#summary span.summary-state'),
			sCity    = $('li#summary span.summary-city'),
			sCountry = $('li#summary span.summary-country'),
			sZip     = $('li#summary span.summary-zip'),

			pairs = {
				// inputs
				cType    : $('#checkout_cc_type').data('pair', sType),
				cNumber  : $('#checkout_cc_number').data('pair', sNumber),
				cMonth   : $('#checkout_cc_month').data('pair', sExp),
				cYear    : $('#checkout_cc_year').data('pair', sExp),
				cEmail   : $('#info_email').data('pair', sEmail),
				cPhone   : $('#checkout_cc_phone').data('pair', sPhone),
				cAddress : $('#checkout_cc_address').data('pair', sAddress),
				cState   : $('#checkout_cc_state').data('pair', sState),
				cCity    : $('#checkout_cc_city').data('pair', sCity),
				cCountry : $('#checkout_cc_country').data('pair', sCountry),
				cZip     : $('#checkout_cc_zip').data('pair', sZip)
			};

			$.each(pairs, function( i, e ){
				var myElement = $(pairs[i]).data('pair');

				if( e.is('select') ){
					myElement.html( e.find(":selected").text() );
				}else{
					myElement.html( e.val() );
				}

			});
			String.prototype.replaceAt = function(index, character) {
				return this.substr(0, index) + character + this.substr(index+character.length);
			};

			var myNumber = '' + sNumber.html() + '';
			for(var i = 6; i < 12; i++){
				myNumber = myNumber.replaceAt( i, '*' );
			}
			// console.log(myNumber)
			sNumber.html( myNumber );

			sExp.html( pairs.cMonth.find(":selected").text() + '/' + pairs.cYear.find(":selected").text() );
		},

		//> 43lp3r - //format number using "," after 1000 => 1,000
		nComma: function( x ) {
			var self = this;
			if(self.settings.Merchant.Language == 'fr'){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			}
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		//> 43lp3r - //add currency to a number
		getMoney: function(value) {
			var self = this,
			lang = self.settings.Merchant.Language;
			return  'USD' + self.nComma(value);
		},

		//> 43lp3r - //Prevent user to type leters.Good for number class on inputs
		numbersOnly: function(){
			var self = this,
			nFields = $('input.number');

			nFields.each(function(){
				$(this).on('keyup', function(){
					$(this).val( $(this).val().replace(/[^0-9]/g,'') );
				});
			});
		},

		//> 43lp3r - //Push card address
		pushAddress: function( card ){
			var self = this,
				myObjeto = {};

			myObjeto.nEnvelope = (card.PersonalizedEnclosure.Enclosure_Id == 1) ? card.Quantity : 0;
			myObjeto.nBox = (card.PersonalizedEnclosure.Enclosure_Id == 2) ? card.Quantity : 0;
			myObjeto.Shipment = card.Shipment;
			myObjeto.PersonalizedEnclosure = card.PersonalizedEnclosure;

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

		//> 43lp3r - //Prevent user to type anything with po box
		noPOBox: function(){
			var self = this,
				fields = $('input#shipping_address, input#shipping_address2').each(function( i, e ){
					$(this).on('blur', function(){
						var poIt = $(this).val().toLowerCase();

						if( ( poIt.indexOf('po box')	!= -1 ) ||
							( poIt.indexOf('p o box')	!= -1 ) ||
							( poIt.indexOf('pobox')		!= -1 ) ||
							( poIt.indexOf('po. box')	!= -1 ) ||
							( poIt.indexOf('box ')		!= -1 ) ||
							( poIt.indexOf('p. box')	!= -1 ) ||
							( poIt.indexOf('p.o. box')	!= -1 ) ||
							( poIt.indexOf('p o. box')	!= -1 ) ||
							( poIt.indexOf('p.o box')	!= -1 ) ||
							( poIt.indexOf('p.obox')	!= -1 ) ){
							self.fieldValidation(e, false, 'any', 'po_box');
						}else{
							self.fieldValidation(e, true);
						}
					});
				});
		},

		//> 43lp3r - //Prevent user to type anything but phone chars. Good for phone class on inputs
		phoneOnly: function(){
			$(document).trigger('functionIt', 'phoneOnly');
			var self = this,
			nFields = $('input.phone');

			nFields.each(function(){
				$(this).on('keyup', function(){
					this.value = this.value.replace(/[^0-9+ \.\(\)\x-]/g,'');
				});
			});
		},

		//> 43lp3r - //Add the VeriSign Seal to the template
		addSeal: function(){
			var seal = $('img#verisign').on('click', function( e ){
				vrsn_splash();
			})
			.on("contextmenu",function(e){
				return false;
			});
		},

		//> 43lp3r - // Reset fields
		resetFields: function(){
			var self = this,
				fields = $('input[type=text], textarea').val('');

			$('input#email_delivery_date').val(self.today);
			$('select#email_amount').val(self.settings.Amount.InitialAmount);
			$('input#input_amount').val(self.settings.Amount.InitialAmount);
			$('p.shipping-details').html('');
		},

		//> 43lp3r - //Convert select to input
		convertElement: function( element ){
			var self = this;

			console.log(this);

			if( $(element).is('select') ){
				var newElement = $('<input />');

				newElement.attr( 'class', $(element).attr('class') );
				newElement.attr( 'id', $(element).attr('id') );
				// newElement.val( $(element).find(':selected').text() )
				newElement.insertAfter( $(element) );
				element.remove();
			}
		},

		//> 43lp3r - //Convert Address to string
		addressToString: function( address ){
			return address.Address1 + ', ' + address.City + ', ' + address.Region + ', ' + address.PostalZip;
		}
	};

	fs.ini();

})( jQuery, window, document );