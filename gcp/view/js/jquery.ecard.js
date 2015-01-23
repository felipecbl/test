/**
*	eCard jQuery plugin
*	Author: Felipe Castelo Branco
*	Date: June 26th 2014
*	Last Update: June 26th 2014
*	Version: 1.0
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

//Add test preserv-3d to Modernizr
(function(Modernizr, win){
    Modernizr.addTest('csstransformspreserve3d', function () {

        var prop = Modernizr.prefixed('transformStyle');
        var val = 'preserve-3d';
        var computedStyle;
        if(!prop) return false;

        prop = prop.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

        Modernizr.testStyles('#modernizr{' + prop + ':' + val + ';}', function (el, rule) {
            computedStyle = win.getComputedStyle ? getComputedStyle(el, null).getPropertyValue(prop) : '';
        });

        return (computedStyle === val);
    });
}(Modernizr, window));

(function( $, window, document, undefined ) {

	Handlebars.registerHelper('curr', function( lang, value ){
		return F.getCurrency(lang, F.numberWithCommas(value.toFixed(2)) );
	});

	//compare specific values
	Handlebars.registerHelper('ifCond', function(v1, v2, options) {
		if(v1 === v2) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	var F = {

		// check if string is url
		validURL: function(str) {
			var pattern = new RegExp('html|htm$','i');
			if(!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		},

		//Show content in a lightbox
		lightBoxIt: function( content, title, dimensions, callback, okButton, cancelButton ){
			$(document).trigger('functionIt', 'lightBoxIt');
			$(window).trigger('anaLog', '[eCcard]  lightbox: ' + title);

			dimensions = dimensions || {height: 420, width: 600};
			callback = callback || null;
			okButton = okButton || (callback)? true : false;
			cancelButton = cancelButton || (callback)? true : false;

			var lbWindow = $('<div id="lightbox" />').css({
					position: 'relative',
					height: dimensions.height - 130,
					width: dimensions.width - 30
				}),
				sent = false,

				button_ok = (okButton) ? 'Ok' : null,
				button_cancel = (cancelButton) ? 'Cancel' : null,
				dialog_buttons = {};

			// check if content is URL
			if(F.validURL(content)){
				lbWindow.load(content);
			}else{
				lbWindow.html(content);
			}

			if(okButton){
				dialog_buttons[button_ok] = function(){
					var thisButton = $(this);

					if(callback !== null && !sent){
						sent = true;
						if(callback()){
							thisButton.dialog('close');
							thisButton.dialog('destroy').remove();
						}else{
							sent = false;
						}
					}
					$(document).trigger('anaLog', '[eCcard] lightBoxIt ok');
				};
			}

			if(cancelButton){
				dialog_buttons[button_cancel] = function(){
					$(document).trigger('anaLog', '[eCcard] lightBoxIt cancel');
					$( this ).dialog( "close" );
					$( this ).dialog('destroy').remove();
				};
			}

			$( '<div class="dialog-wrap"></div>' )
			.html(lbWindow)
			.dialog({
				// position: [self.$elem.width() / 2 - (this.width / 2), 200],
				title: title,
				resizable: false,
				modal: true,
				minHeight: dimensions.height,
				// maxHeight: dimensions.height,
				minWidth: dimensions.width,
				// maxWidth: dimensions.width,
				buttons: dialog_buttons
			});
		},

		//return specific parameter from url
		getParam: function( param ){

			return decodeURI( ( RegExp( param + '=' + '(.+?)(&|$)').exec(location.search) || [,null] )[1] );
		},

		// check if browser is iPhone
		isiPhone: function(){

			return navigator.userAgent.match(/iPhone/);
		},

		isMobile: function(){
			return navigator.userAgent.match(/Android/i) ||
			navigator.userAgent.match(/webOS/i) ||
			navigator.userAgent.match(/iPhone/i) ||
			navigator.userAgent.match(/iPad/i) ||
			navigator.userAgent.match(/iPod/i) ||
			navigator.userAgent.match(/BlackBerry/i) ||
			navigator.userAgent.match(/Windows Phone/i); },

		// check if browser is iPhone
		isAndroid: function(){

			return navigator.userAgent.match(/Android/);
		},

		// convert string to currency format
		getCurrency: function( lang, value, symbol ){
			symbol = symbol || '$';

			if(lang == 'fr'){
				return value + '<span class="fr-currency">' + symbol + '</span>';
			}else{
				return '<span>' + symbol + '</span>' + value;
			}
		},

		// format number using "," after 1000 => 1,000
		numberWithCommas: function(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		/*/ Validation  **********************************************
		**************************************************************
		**************************************************************
		**************************************************************
		**************************************************************
		*/
		singleValidation: function(){
			var self = this;
				fields = $('*[data-validation="true"]');

			fields.on('blur', function(event){
				var myField = $(this),

					valObj = [{
						Classes: myField.data('validation-type'),
						Data: myField.val()
					}];

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function( data ){
						var d = data.d[0];

						self.fieldValidation( myField, d.Success, d.Error.ExceptionDetails, d.Error.Message);

						if( !d.Success ){
							// $(window).trigger('anaLog', 'singleValidation: ' + myField.attr('id'));
						}
					},
					error: function( e ){
						$(window).trigger('anaLog', '[eCcard]  Single validation error: ' + myField);
						console.log(e.statusText + ': ' + e.responseText);
					}
				});
			});
		},

		// Set validation class and error message
		fieldValidation: function(field, status, type, errorMessage) {
			var myParent = $(field).parents('div.field, div.half-field'),
				errorType = '',
				tempRet = true;

			if( status ){
				myParent.find('.error-message').fadeOut(1200, 'swing', function(){

					myParent.removeClass('validation-error')
							.removeClass('validation-warning')
						.find('.error-message')
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
					.find('.error-message')
					// .html(lang[errorCode]);
					.html(errorMessage);
			}
			return tempRet;
		},

		groupValidation: function( group ){
			var self = this,
				fields = $(group).find('*[data-validation="true"]'),
				errors = 0;

			$.each(fields, function(index, val) {
				var myField = $(val),

					valObj = [{
						Classes: myField.data('validation-type'),
						Data: myField.val()
					}];

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						var d = data.d[0];

						self.fieldValidation( myField, d.Success, d.Error.ExceptionDetails, d.Error.Message);

						if( !d.Success ){
							errors++;
						}
					},

					error: function( e ){
						$(window).trigger('anaLog', '[eCcard]  Group validation error');
						console.log(e.statusText + ': ' + e.responseText);
						errors++;
					}
				});
			});
				return (errors > 0) ? false : true;
		}
	},

	ThankEmail = {

		// Starts the plugin
		init: function( elem ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );

			// self.options = options;

			self.$elem.on('click', function(event) {
				event.preventDefault();

				var html = $(Handlebars.compile( window.ecard.template._lightbox._thank )( settings ));

				F.lightBoxIt(html, settings.form.title.thank, null, self.sendEmail, true, true);
				F.singleValidation();
				$(window).trigger('anaLog', '[eCcard]  Open ThankEmail');
			});
		},

		sendEmail: function( email ){
			var rId = F.getParam('Id'),
				subject = $('#subject').val(),
				message = $('#message').val(),
				rValue = false,
				dataToSend = {
					encryptedReferenceId: rId,
					subject: subject,
					message: message
				};

			if( F.groupValidation($('#lightbox')) ){

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/SendThanksEmail",
					data: JSON.stringify( dataToSend ),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						$(window).trigger('anaLog', '[eCcard]  Send ThankEmail');
						if(data.d){
							rValue = true;
							return true;
						}

						alert('Error: Sorry, the email could not be sent');
						$(window).trigger('anaLog', '[eCcard]  Error sending ThankEmail');
						return false;
					},
					error: function( e ){
						console.log( e );
						$(window).trigger('anaLog', '[eCcard]  Error sending ThankEmail');
						alert('Error: >', e);
						return false;
					}
				});
			}

			return rValue;
		}
	},

	ReGift = {

		// Starts the plugin
		init: function( elem ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );

			// self.options = options;

			self.$elem.on('click', function(event) {
				event.preventDefault();
				var html = $(Handlebars.compile( window.ecard.template._lightbox._regift )( settings ));
				F.lightBoxIt(html, settings.form.title.regift, {height: 570, width: 600}, self.reGift, true, true);
				F.singleValidation();
			});
			$(window).trigger('anaLog', '[eCcard]  Open ReGift');
		},

		reGift: function(){
			var rId = F.getParam('Id'),
				subject = $('#subject').val(),
				message = $('#message').val(),
				rName = $('#name').val(),
				rEmail = $('#email').val(),
				cEmail = $('#your_email').val(),
				rValue = false,
				dataToSend = {
					referenceId: rId,
					recipientName: rName,
					recipientEmail: rEmail,
					currentRecipientEmail: cEmail,
					message: message
				};

			if( F.groupValidation($('#lightbox')) ){

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/RegiftCard",
					data: JSON.stringify( dataToSend ),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						$(window).trigger('anaLog', '[eCcard]  Send ReGift');
						if(data.d.Success){
							rValue = true;
							return true;
						}else{
							alert(data.d.Error.Message);
							$(window).trigger('anaLog', '[eCcard]  Error sending ReGift');
							return false;
						}
					},
					error: function( e ){
						console.log( e );
						$(window).trigger('anaLog', '[eCcard]  Error sending ReGift');
						alert('Error: >', e);
						return false;
					}
				});
			}

			return rValue;
		}
	},

	defaultSettings = {
		card: {
			amount: 0,
			// animation: true,

			animation: {
				active: true,
				autoRun: true,
				enclosureAsCard: false,
				type: 1
			},
			autoRun: true,
			barcode: 0,
			eCard: 0,
			frontURL: '',
			imgUrl: '',
			message: '',
			orientation: 'bottom',
			photo: false,
			pin: 0,
			previewType: 0,
			reference: 0,
			replay: false,
			senderEmail: '',
			senderName: '',
			recipientName: ''
		},
		merchant: {
			barcode: true,
			barcodeType: 'code128',
			chainId: 0,
			language: 'en',
			merchantId: 0,
			name: '',
			note: '',
			passbook: true,
			supportEmail: 'support@buyatab.com',
			url: '',
			year: 2014
		},
		options: {
			buyNew: true,
			buyNewUrl: 'https://www.merchant.com',
			reGift: true,
			reload: true,
			reloadUrl: 'https://www.merchant.com',
			thank : true
		},
		status:{
			success: true,
			error:{
				errorCode: 0,
				exceptionDetails: '',
				message: 'Success'
			}
		},
		files:{
			frontOut: "https://images.buyatab.com/gcp/view/cards/default/ecard/animation1/front-out.png",
			frontIn: "https://images.buyatab.com/gcp/view/cards/default/ecard/animation1/front-in.png",
			backIn: "https://images.buyatab.com/gcp/view/cards/default/ecard/animation1/back-in.png",
			backOut: "https://images.buyatab.com/gcp/view/cards/default/ecard/animation1/back-out.png"
		}
	},

	settings = $.extend(true, {}, defaultSettings),
	

	eCard = {
		init: function( elem ){
			var self = this,
				html = '';

			self.elem = $(elem);
			self.template = window.ecard.template;

			eCard.debug = false;

			$.extend(true, settings, window.ecard.settings, language);

			// make sure animation type > 0
			settings.card.animation.type = settings.card.animation.type ? settings.card.animation.type : 1;
			settings.merchant.server += "/gcp/view/cards/";
			

			// info formatting for url parameters	- mstrnal 11/14
			var cardNumber = settings.card.ecard;
			settings.card.unformattednumber = cardNumber.replace(/\s/g, "");
			settings.card.formattedImageUrl = settings.card.imgUrl.replace("https://", "");


			if(settings.status.success){

				if(settings.card.animation.active){
					settings.card.animation.active = (Modernizr.cssanimations && Modernizr.csstransforms && Modernizr.csstransforms3d /*&& Modernizr.csstransformspreserve3d*/ && Modernizr.csstransitions);
				}

				$('body').hide();
				self.bodyClass();

				html += (self.cardType());
				html += '<div id="card_body">';
				html += (self.barcodeHtml());
				html += (self.numbers());
				html += (self.instructions());
				html += (self.actions());
				html += (self.options());
				html += (self.template._note);
				html += '</div>';

				html = $(Handlebars.compile( html )( settings ));

				//console.log(settings);

				var header = $(Handlebars.compile( self.template._header )( settings )),
					footer = $(Handlebars.compile( self.template._footer )( settings )),
					//check for browser capability
					cssAnimation = (Modernizr.cssanimations && Modernizr.csstransforms && Modernizr.csstransforms3d /*&& Modernizr.csstransformspreserve3d*/ && Modernizr.csstransitions);

					if(!cssAnimation){
						$(window).trigger('anaLog', '[eCcard]  cssAnimation Inactive [Modernizr]');
					}

				if(settings.card.autoRun && settings.card.animation.active && cssAnimation){
					$(window).trigger('anaLog', '[eCcard]  cssAnimation Active');
					var cardBody = $(html[1]),
						replay = '';

					// Get card_body independently of template layout
					$.each(html, function(index, val){
						if($(html[index]).attr('id') == 'card_body'){
							cardBody = $(html[index]);
						}
					});

					if(settings.card.replay){
						$('<a href="javascript:window.location.href=window.location.href" class="replay center">' + settings.card.replay + '</a>');
					}

					self.bodyBg = $('body').css('background-color');

					cardBody.addClass('hide-me').prepend(replay);
					header.addClass('hide-me');
					footer.addClass('hide-me');

					$('body').css('background-color', '#ffffff');
					setTimeout(function(){
						cardBody.addClass('ecard-transition');
						header.addClass('ecard-transition');
						footer.addClass('ecard-transition');
						$('body').addClass('ecard-transition');
					}, 500);
				}

				// append general body elements
				self.elem.append( html );
				// prepend compiled header
				self.elem.parents('#wrapper').prepend( header );
				// append compiled footer
				self.elem.parents('#wrapper').append( footer );

				// hide card untill the images are ready
				$('#card').hide();
				$('.in-bottom').hide();

				//only execute once the background images are loaded
				$('#card').waitForImages(function() {
					$('#card').show();
					setTimeout(function() { $('.in-bottom').show(); }, 2000);

					self.callback();
				});
			}else{
				self.elem.hide();
				alert('Error ' + settings.status.error.errorCode + ': ' + settings.status.error.exceptionDetails);
			}
		},

		//add classes to the body element according to the card type
		bodyClass: function(){
			var self = this,
				classes = '';

				classes += ' previewstyle-' + settings.card.previewType;
				if(settings.card.animation.active) classes += ' animation';
				if(settings.card.autoRun) classes += ' autorun';
				if(settings.card.photo) classes += ' photo';
				if(settings.merchant.barcode) classes += ' barcode barcodetype-' + settings.merchant.barcodeType;

				$('body').addClass(classes);
		},

		// load the card template according to the card type (animated)
		cardType: function(){
			var self = this;

			// check settings and browser support for css 3 transforms/transitions
			if(settings.card.animation.active){
				return self.template._card._animated;
			}

			return self.template._card._regular;
		},

		// handle action buttons
		actions: function(){
			var self = this,
				actionsHtml = $('<div/>').html(self.template._actions);
				
			if(!F.isiPhone() || settings.merchant.passbook === false){
				actionsHtml.find('#action-passbook').remove();
			}

			return actionsHtml.html();
		},

		// handle active instructions
		instructions: function(){
			var self = this,
				instructionsHtml = $('<div/>').html(self.template._instructions);

			// Custom actions depending on device for clickable instructions options	
			if(!F.isiPhone()){
				if(F.isMobile()){
					instructionsHtml.find('.instructions-passbook').remove();
				} else {
					instructionsHtml.find('#instructions-passbook').on('click', function(event) {
						event.preventDefault();
						alert(language.instructions.alert.passbook);
					});
				}
			}

			if(F.isMobile()){
				instructionsHtml.find('.action-print').remove();
			}

			return instructionsHtml.html();
		},

		// handle option buttons
		options: function(){
			var self = this,
				opt = settings.options;

			if (opt.reload || opt.buyNew || opt.reGift || opt.thank) {
				return self.template._options;
			}
			return '';
		},

		// get barcode html if enabled
		barcodeHtml: function(){
			var self = this;
			if(settings.merchant.barcode){
				return self.template._barcode;
			}
			return '';
		},

		// Handle numbers
		numbers: function(){
			var self = this,
				numbersHtml = $('<div/>').html(self.template._numbers);

			if(!settings.card.pin){
				numbersHtml.find('.pin').remove();
			}
			return numbersHtml.html();
		},

		// execute those functions after appending html
		callback: function(){
			//The body was previously hidden
			$('body').show();
			this.openCard();
			this.bookmark();
			this.setDownloadAppUrl();
			this.addToApp();

			$('#co-thank').eThank();
			$('#co-regift').reGift();
			$('#co-animation').on('click', function(event) {
				event.preventDefault();
				parent.location.hash = '';
				document.location.href = $(location).attr('href').replace(/&animation=true/gi, '') + '&animation=true';
			});
			this.generateBarcode();
			this.updateBalance();
		},

		// open card functionality for card with animation
		openCard: function(){
			var self = this;

			if(settings.card.animation.active){
				$(document).on('click', '.card', function(event) {
					event.preventDefault();
					if($(this).hasClass('clickable')){
						$(this).toggleClass('open');
						$('.in-bottom').toggleClass('index3');
						$(window).trigger('anaLog', '[eCcard]  Open card animation');
					}
				});
				
				$(document).on('click', '.card-wrapper figure', function(event) {
					event.preventDefault();
					event.stopPropagation();

					//analytics
					$(window).trigger('anaLog', '[eCcard]  Expand card');

					$('.card').toggleClass('clickable');

					$('.card .front').toggleClass('index1').toggleClass('index2');

					$(this).parents('.card-wrapper').toggleClass('small').toggleClass('large');
					$(this).parents('.card-wrapper').find('img, figure').toggleClass('small').toggleClass('large');
				});

				//keep resizing message untill it fits
				while($('.message').height() + 150 > $('.card .inside').height()){
					$(window).trigger('anaLog', '[eCcard]  Resize message');
					self.resizeText();
				}

				self.messagePosition();
				self.autoRunAnimation();
			}else{
				self.runAnimation();
			}
		},

		// generate barcode
		generateBarcode: function(){
			var self = this,
				// check for the canvas element on template
				templateCanvas = $('#barcode').length,
				barcodeType = settings.merchant.barcodeType || 'pdf417';

			if(settings.merchant.barcode && templateCanvas){
				if(!F.isiPhone()){
					$('#barcode_instructions').hide();
				}

				$('#bar-wrap').on('click',	function(event) {event.preventDefault(); $(this).toggleClass('full-view'); });

				$(window).on('loadBarcode', function(event) {
					// Create a barcode writer instance
					var bw = new BWIPJS();

					// Create the bitmap interface and pass to the emulator
					bw.bitmap(new Bitmap());

					// Set the scaling factor
					if(F.isiPhone()){
						bw.scale(4, 3);
					}else{
						if(barcodeType == 'pdf417'){
							bw.scale(2, 2);
						}else{
							bw.scale(2, 0.5);
						}
					}

					// Create a dictionary object and set the options
					var opts = {};
					opts.parsefnc    = bw.value(false);
					opts.includetext = bw.value(false);
					opts.alttext     = bw.value('');

					// Push the barcode text and options onto the operand stack
					bw.push(settings.card.barcode.replace(/\s+/g, ''));
					bw.push(opts);

					try {
						bw.call(barcodeType);
						bw.bitmap().show('barcode', 'N');
						// bw.bitmap().show($('#barcode')[0], 'N');
					} catch(e) {
						console.log(e);
						var s = '';
						if (e.fileName)
							s += e.fileName + ' ';
						if (e.lineNumber)
							s += '[line ' + e.lineNumber + '] ';
						console.log(s + (s ? ': ' : '') + e.message);
					}
				});
			}
		},

		//update balance
		updateBalance: function(){
			var card = ecard.settings.card,
				valueLabel = $('.amount'),
				initialValue = valueLabel.html(),
				cardNumber = card.ecard.replace(/\s+/gi, ''),
				pin = card.pin || 0;

			if($.isNumeric(cardNumber) && settings.card.beenViewed){
				var data = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetBalance xmlns="http://services.buyatab.com"><cardNumber>' + cardNumber + '</cardNumber><pin>' + pin + '</pin></GetBalance></soap:Body></soap:Envelope>';
				
				valueLabel.html('...');

				$.ajax({
					type: "POST",
					dataType: "xml",
					data: data,
					cache: false,
					timeout: 5000,
					processData: false,
					contentType: "text/xml; charset=\"utf-8\"",
					url: '/WebServices/CheckBalanceService.asmx?op=GetBalance',
					success: function (data) {
						var card = $(data).find('cardNumber').text(),
						errorCode = $(data).find('errorCode').text(),
						message = $(data).find('message').text(),
						balance = $(data).find('balance').text();

						console.log(errorCode);
						if (errorCode === 0 || errorCode == '0') {
							valueLabel.html('$' + (balance / 100).toFixed(2));
						} else {
							$('.ecard-number').addClass('cb-error')
								.html(message);
							valueLabel.html(initialValue);
						}
					},
					error: function (e) {
						console.log(e);
						valueLabel.html(initialValue);
					}
				});
			}
		},

		// bokmark functionality (for supporting browsers)
		bookmark: function(){
			$('#action-bookmark').click(function(e){
				$(window).trigger('anaLog', '[eCcard]  Bookmark click');
			// e.preventDefault();
			var bookmarkUrl = this.href,
				bookmarkTitle = this.title;

				if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
					alert('This function is not available in Google Chrome. Click the star symbol at the end of the address-bar or hit Ctrl-D (Command+D for Macs) to create a bookmark.');
				}else if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // For Mozilla Firefox Bookmark
					// nada!
				} else if( window.external || document.all) { // For IE Favorite
					window.external.AddFavorite( bookmarkUrl, bookmarkTitle);
				} else if(window.opera) { // For Opera Browsers
					$('a.bookmark').attr('href',bookmarkUrl);
					$('a.bookmark').attr('title',bookmarkTitle);
					$('a.bookmark').attr('rel','sidebar');
				} else { // for other browsers which does not support
					alert('Your browser does not support this bookmark action. Please use the web browser menu to add the bookmark.');
					return false;
				}
			});
		},

		// launches app for supported chains
		setDownloadAppUrl: function(){
			var downloadLink = $('#action-downloadapp');

			if(downloadLink !== null){
				var link = window.language.options.link.download;
				
				if(F.isiPhone() !== null){
					downloadLink.attr({
						href: link.apple,
						target: 'itunes_store'
					});
					
				} else if(F.isAndroid() !== null){
					downloadLink.attr('href', link.android);
				}
			}
		},

		addToApp: function(){
			var launchLink = $('#action-launchapp');

			if(launchLink !== null){
				
				if(!F.isiPhone() && !F.isAndroid() ){
					launchLink.on('click', function(event) {
						event.preventDefault();
						alert(language.instructions.alert.timmyme);
					});
				}
			}
		},

		// addapt text to the card
		resizeText: function (){
			var fontsize = $('.message').css('font-size');
			$('.message').css('fontSize', parseFloat(fontsize) - 1);
		},

		// fix message position on the card
		messagePosition: function (){
			var message = $('.message'),
				messageHeight = message.height(),
				wrapHeight = message.parent().height();

			message.css('margin-top', (wrapHeight - messageHeight) / 2);
		},

		// execute animation if parameter enabled
		autoRunAnimation: function(){
			var self = this;

			if(settings.card.autoRun){

				setTimeout(function(){
					self.runAnimation();
				}, 2000);
			}
		},

		runAnimation: function(){
			var self = this;

			$('.card.clickable').addClass('open');
			$('body').css({'background-color': self.bodyBg});
			$('.in-bottom').toggleClass('index3');
			$('.hide-me').css('opacity', '1').removeClass('hide-me');

			setTimeout(function(){
				$('html').css({'background-color': self.bodyBg});
			}, 2000);
		}
	};

	function augment(withFn) {
		var name, fn;
		for (name in eCard) {
			fn = eCard[name];
			if (typeof fn === 'function') {
				eCard[name] = (function(name, fn) {
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
		if(eCard.debug){
			console.log(name + ' [line :' + (new Error()).lineNumber + ']');
		}
	});

	$.fn.eThank = function() {
		return this.each(function() {
			var lbThank = Object.create( ThankEmail );

			lbThank.init( this );

			$.data( this, 'eThank', lbThank );
		});
	};

	$.fn.reGift = function() {
		return this.each(function() {
			var lbReGift = Object.create( ReGift );

			lbReGift.init( this );

			$.data( this, 'ReGift', lbReGift );
		});
	};

	$.fn.eCard = function() {
		return this.each(function() {
			var template = Object.create( eCard );

			template.init( this );

			$.data( this, 'eCard', template );
		});
	};

})( jQuery, window, document );