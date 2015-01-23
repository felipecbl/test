
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

	var Confirm = {
		init: function( options, elem ) {
			var self = this;

			$.ajaxSetup({ cache: false });
			document.title = 'Order Confirmation'; //It could be something from DB (i.e. Merchant Name)

			// Get orderNumber either string or object
			self.orderNumber = ( typeof options === 'string' || typeof options === 'number' ) ? options : options.orderNumber;

			// Get requestURL either string or object
			self.requestURL = ( typeof options === 'string' || typeof options === 'number' ) ? options : options.requestURL;

			// Get MerchantId either string or object
			self.MerchantId = ( typeof options === 'string' || typeof options === 'number' ) ? options : options.MerchantId;

			self.templateFile = $.fn.bConfirm.options.templateFile;

			self.elem = elem;
			self.$elem = $( elem );
			self.defaultPath = 'view/template/default/';
			//self.customPath = 'view/template/' + self.MerchantId + '/template/';

			Handlebars.registerHelper('if_multi', function( condition , options ){
				if(condition > 1){
					return options.fn(this);
				} else {
					return options.inverse(this);
				}
				
			});

			Handlebars.registerHelper('if_eq', function(a, b, opts) {
				if(a == b) // Or === depending on your needs
					return opts.fn(this);
				else
					return opts.inverse(this);
			});

			function getCurrency( lang, value, symbol ){
				symbol = symbol || '$';
				
				if(lang == 'fr'){
					return value + '<span class="fr-currency">' + symbol + '</span>';
				}else{
					return '<span>' + symbol + '</span>' + value;
				}
			}

			self.generateIt();
		},

		//Analytics
		analytics: function( options ){
			var self = this,
				sAnalytics = self.settings.Analytics;

			if( sAnalytics.Enabled && getParam('analytics') == 'true'){

				self.$elem.buyalytics({
					Id: sAnalytics.Id,
					type: sAnalytics.Type,
					mobile: self.settings.IsMobile,
					address: self.settings.AddressLine2,

					receipt: true,
					cards: self.settings.Cards,
					language: self.settings.Language
				});
			}
		},

		/**
		 * Call all the necessary functions to get data and then compiles the template
		 */
		generateIt: function(){
			var self = this;

			//if data is already provided, no need to preform web service call
			if(window.orderConfirm){
				self.compileTemplate(window.orderConfirm); 
			} 
			else {
				$.when( self.getOptions() ).then( function (rOptions) {
					self.compileTemplate(rOptions.d); 
				});
			}
				
		},

		/**
		 * Compiles handlebars template with given data
		 */
		compileTemplate: function (rOptions){
			var self = this;
			self.settings = rOptions;
			
			// self.MerchantId = self.settings.MerchantId;
			self.customPath = 'view/template/' + self.settings.ChainId + '/' + self.settings.MerchantId + '/';

			if(self.settings.Language == 'fr'){
				self.templateFile = 'template/confirm-fr.handlebars';
				self.$elem.addClass('lang-fr');
			}else{
				self.$elem.addClass('lang-en');
			}
			if( navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/) ){
				$('head').prepend('<meta name="format-detection" content="telephone=yes">');
				$('head').prepend('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
			}

			$.when( self.getTemplate() )
			.then( function( rTemplt ) {
				self.addScript();

				template = Handlebars.compile( rTemplt )(self.settings);
				self.$elem.html( template );
			});
			
		},

		/**
		 * Check if file exist using serverFile
		 */
		checkFile: function( file ){
			var self = this,
				myFile = '';

			self.serverFile( file ).done(function(response){
				myFile = response.d;
			});

			return myFile;
		},

		/**
		 * Check if file exists using server
		 */
		serverFile: function( file ){
			var self = this,
			dataToSend = {
				filenames: [file],
				chainId: self.settings.ChainId,
				merchantId: self.settings.MerchantId
			};

			return $.ajax({
				type: "POST",
				url: "/gcp/services/BuyatabWS.asmx/GetFilePath",
				data: JSON.stringify(dataToSend),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false
			});
		},

		/**
		* Call API Asynchronously
		*/
		getOptions: function(){
			var self = this,
				dataToSend = {};

			dataToSend.on = self.orderNumber;

			return $.ajax({
				type: "POST",
                url: "services/BuyatabWS.asmx/GetReceipt",
                data: JSON.stringify(dataToSend),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
			});
		},

		/**
		* Call API Asynchronously
		*/
		getTemplate: function(){
			var self = this;
			return $.ajax({
				url: self.checkFile( self.templateFile, 'script' ), //fileExists
				dataType: "html"
			});
		},

		//Load files and wait until they're fully loaded
		waitLoad: function(files, callback) {
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

		//load additional script from inifile
		addScript: function(){
			var self = this,
				html = '';

			if(self.settings.Analytics !== null){
				if(self.settings.Analytics.Files && self.settings.Analytics.Files.length > 0){
					if( self.settings.Analytics.Files[0] !== ''){

						// console.log(self.settings.Analytics.Files[0]);
						for(var i = 0; i < self.settings.Analytics.Files.length; i++){
							if(self.settings.Analytics.Files[i].indexOf('/') == -1){
								self.settings.Analytics.Files[i] = self.customPath + 'js/' + self.settings.Analytics.Files[i];
							}
						}

						self.waitLoad( self.settings.Analytics.Files, function(){
							self.analytics();
						} );
					}else{
						self.analytics();
					}
				}
			}
		}
	};

	$.fn.bConfirm = function( options ) {
		return this.each(function() {
			var confirm = Object.create( Confirm );

			confirm.init( options, this );

			$.data( this, 'bConfirm', confirm );
		});
	};

	$.fn.bConfirm.options = {
		CSSFile: 'css/style.css',
		templateFile: 'template/confirm.handlebars',
		requestURL: "services/BuyatabWS.asmx/GetReceipt"
	};

})( jQuery, window, document );