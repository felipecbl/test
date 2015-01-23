
// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ){

	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	};

	var Register = {
		en:{
			theForm : {
				'First Name:': 'fname',
				'Last Name:': 'lname',
				'Email:': 'email'
			},
			title : 'Register eGift Card',
			button: 'Register',
			footer: 'We require this information to register your gift card in our system. Your email address will never be shared with any 3rd parties.'
		},
		fr:{
			theForm : {
				'Prénom:': 'fname',
				'Nom:': 'lname',
				'E-mail:': 'email'
			},
			title : 'Enregistrer votre CyberCarte',
			button: 'Enregistrer',
			footer: 'Ces informations sont requises afin d’enregistrer votre CyberCarte dans notre système. Vos informations ne seront en aucun cas communiquées à un tiers ou toute autre partie'
		},

		// where all starts
		init: function( options, elem ){
			var self = this;

			self.lang = getParam('lang');
			if(self.lang == 'null'){
				self.lang = 'en';
			}

			self.elem = elem;
			self.merchantId = options.merchantId;
			self.productId = options.productId;

			// Define paths
			self.defaultPath = '/gcp/view/template/default/';
			self.customPath = '/gcp/view/template/' + self.merchantId + '/';

			self.createIt();
		},

		// Check if file exist using serverFile
		checkFile: function(file) {
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

		// Apend CSSFile to the head
		appendStyle: function( CSSFile ){
			$(document).trigger('functionIt', 'appendStyle');
			var self = this,
				deferred = $.Deferred();

			if( CSSFile != $('#default-style').attr('href') ){
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

		//create page
		createIt: function(){
			var self = this;

			$.when(self.checkFile('css/style.css', 'text/css')).then(function(cssFile){
				$.when( self.appendStyle(cssFile) ).then(function(){
					$(self.elem).html(self.generateForm());
					self.validate();
					self.registerCard();
				});
			});
		},

		// Generate html from object
		generateForm: function(){
			var self = this;
				html = '<div id="wrapper"><h1>' + this[self.lang].title + '</h1><div class="panel"><div id="delivery-content"><div class="notes"></div>';
				
			$.map( this[self.lang].theForm, function( val, i ) {
				html = html + '<div class="field"> <div class="field-left"> <div> <label for="' + val + '">' + i + '</label> </div> </div> <div class="field-right"> <div class="input-holder"> <input type="text" id="' + val + '" /> </div><div class="field-error"></div> </div> </div>';
			});

			html = html + '</div><div class="pages-nav"> <div class="group-error"></div> <a href="javascript:void(0)" class="button continue-button register-card"> <span>' + this[self.lang].button + '</span> </a> </div></div><footer><span>' + this[self.lang].footer + '</span></footer></div>';

			return html;
		},

		//validate fields
		validate: function(){
			var self = this;
				fields = $('input');

			$.each(fields, function(){
				$(this).on('blur', function(){
					var errorTxt = '';

					if($(this).val() === ''){
						errorTxt = 'Required field';
					}else{
						errorTxt = '';
					}
					if($(this).attr('id') == 'email'){

						var valObj = [{
							Classes: 'email',
							Data: $(this).val()
						}],
							eField = $(this);

						$.when(self.getValidation(valObj)).then(function(rValidation){
							var eVal = rValidation.d[0];

							if(eVal.Success){
								errorTxt = '';
								
							}else{
								errorTxt = eVal.Error.Message;
								self.displayError($(this), errorTxt);

							}
						});
					}

					self.displayError($(this), errorTxt);
				});
			});
		},

		//display error
		displayError: function( field, text ){
			var self = this,
				fParent = field.parents('.field'),
				fError = fParent.find('.field-error');
			if(text === ''){
				fParent.removeClass('validation-error');

			}else{
				fParent.addClass('validation-error');
			}
				fError.html(text);
		},

		getValidation: function( valObj ){
			return $.ajax({
				type: "POST",
				url: "services/BuyatabWS.asmx/Validate",
				data: "{validation_group:" + JSON.stringify(valObj) + "}",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false
			});
		},

	//register
	registerCard: function(){
		// RegisterECard(string id, string firstName, string lastName, string email)
		var self = this,
			go = $('.register-card').on('click', function(){
				var sendingObj = {
					'id': self.productId,
					'firstName': $('#fname').val(),
					'lastName': $('#lname').val(),
					'email': $('#email').val()
				},
				rButton = $(this),
				eField = $('div.pages-nav div.group-error').html('');

				if(!rButton.hasClass('loading')){
					rButton.addClass('loading');
					$.when( self.registerCall(JSON.stringify(sendingObj)) ).then(function(rResponse){
						// console.log(rResponse);
						response = rResponse.d;
						if(response.Success){

							window.location.href = response.Error.ExceptionDetails;
							// console.log(response.Error.ExceptionDetails);
						}else{
							rButton.removeClass('loading');
							eField.html(response.Error.Message);
						}
					});
				}
			});
		},

		registerCall: function(dataToSend){
			return $.ajax({
				type: "POST",
				url: "services/BuyatabWS.asmx/RegisterECard",
				data: dataToSend,
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		}
	};

	$.fn.bRegister = function( options ) {
		return this.each(function() {
			var register = Object.create( Register );

			register.init(options, this);

			$.data( this, 'bRegister', register );
		});
	};


})( jQuery, window, document );