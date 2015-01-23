
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

	function get_hostname(url) {
		var m = url.match(/^http[s]?:\/\/[^/]+/);
		return m ? m[0] : null;
	}

	var Receipt = {
		init: function( options, elem ) {
			var self = this;
			// console.log('this');

			$.ajaxSetup({ cache: false });
			// document.title = 'Transaction Receipt';

			//set current domain (for cpanel use)
			self.loadingFrom = window.location.protocol  + '//' + document.domain;
			self.currentURL = ($('#buyatab_plugin').length > 0) ? get_hostname( $('#buyatab_plugin').attr('src') ) : self.loadingFrom;

			self.chainId = getParam('cid') || options.chainId;

			// Get orderNumber either string or object
			self.orderNumber = ( typeof options === 'string' || typeof options === 'number' ) ? options : options.orderNumber;

			// Get requestURL either string or object
			self.requestURL = self.currentURL + '/' + ( typeof options === 'string' || typeof options === 'number' ) ? '' : options.requestURL;

			// Get MerchantId either string or object
			self.MerchantId = ( typeof options === 'string' || typeof options === 'number' ) ? '' : options.MerchantId;

			self.templateFile = $.fn.bReceipt.options.templateFile;

			self.elem = elem;
			self.$elem = $( elem );
			self.defaultPath = self.currentURL + '/gcp/view/template/default/';
			self.customPath = self.currentURL + '/gcp/view/template/' + self.MerchantId + '/';

			Handlebars.registerHelper('ifCond', function(v1, v2, options) {
				if(v1 === v2) {
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('unlessCond', function(v1, v2, options) {
				if(v1 !== v2) {
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('extended', function( lang, Card, symbol ){
				var ext = (Card.Quantity * Card.Amount).toFixed(2);
				return getCurrency(lang, ext, symbol);
			});

			Handlebars.registerHelper('sub', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub + (this.Amount * this.Quantity);
					});
					sub = sub.toFixed(2);

					return getCurrency(obj.Language, sub, obj.CurrencySign);
			});

			Handlebars.registerHelper('shipping', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub + (this.ShippingAmount);
					});
					sub = sub.toFixed(2);

					return getCurrency(obj.Language, sub, obj.CurrencySign);
			});

			Handlebars.registerHelper('total', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub +
								(this.Amount * this.Quantity) +
								this.ShippingAmount;
					});
					sub = (sub - obj.DiscountAmount + obj.AddCharge ).toFixed(2);

					return getCurrency(obj.Language, sub, obj.CurrencySign);
			});

			Handlebars.registerHelper('curr', function( lang, value, symbol ){
				return getCurrency(lang, value.toFixed(2), symbol);
			});

			Handlebars.registerHelper('curr_zero', function( lang, symbol ){
				var zero = 0.00;
				return getCurrency(lang, zero.toFixed(2), symbol);
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
				    return value + symbol; 
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
		 * Call all the necessary functions and execute when it returns all the results
		 */
		generateIt: function(){
			var self = this;

			$.when( self.getOptions() ).then(function ( rOptions ){
				// console.log(rOptions.d.Language)
				self.settings = rOptions.d;

				self.MerchantId = self.settings.MerchantId;
				self.customPath = 'view/template/' + self.MerchantId + '/';

				if(rOptions.d.Language == 'fr'){
					self.templateFile = 'template/receipt-fr.handlebars';
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

					template = Handlebars.compile( rTemplt )(rOptions.d);
					self.$elem.html( template ).addClass('receipt');
				});
			});
		},

		/**
		 * Check if file exist using serverFile
		 */
		checkFile: function( file ){
			var self = this,
				customFile = self.customPath + file,
				defaultFile = self.defaultPath + file,
				myFile = '';

			self.serverFile( customFile ).done(function(response){
				myFile = (response.d) ? customFile : defaultFile;
			});
			return myFile;
		},

		/**
		 * Check if file exists using server
		 */
		serverFile: function( file ){
			var self = this;

			return $.ajax({
				type: "POST",
                url: self.currentURL + "/gcp/services/BuyatabWS.asmx/FileExists",
                data: "{filename:'/" + file + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
				async: false,
				timeout: 5000
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
                url: self.currentURL + "/gcp/services/BuyatabWS.asmx/GetReceipt",
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

	$.fn.bReceipt = function( options ) {
		return this.each(function() {
			var receipt = Object.create( Receipt );

			receipt.init( options, this );

			$.data( this, 'bReceipt', receipt );
		});
	};

	$.fn.bReceipt.options = {
		CSSFile: 'css/receipt.css',
		templateFile: 'template/receipt.handlebars',
		requestURL: "/gcp/services/BuyatabWS.asmx/GetReceipt"
	};

})( jQuery, window, document );