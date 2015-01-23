
// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ){
	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	}

	var Receipt = {
		init: function( options, elem ) {
			var self = this;

			$.ajaxSetup({ cache: false })
			document.title = 'Transaction Receipt'; //It could be something from DB (i.e. Merchant Name)

			// Get orderNumber either string or object
			self.orderNumber = ( typeof options === 'string' || typeof options === 'number' )
				? options
				: options.orderNumber;

			// Get requestURL either string or object
			self.requestURL = ( typeof options === 'string' || typeof options === 'number' )
				? options
				: options.requestURL;

			// Get MerchantId either string or object
			self.MerchantId = ( typeof options === 'string' || typeof options === 'number' )
				? options
				: options.MerchantId

			self.templateFile = $.fn.bReceipt.options.templateFile;

			self.elem = elem;
			self.$elem = $( elem );
			self.defaultPath = 'view/template/default/template/';
			self.customPath = 'template/';

			Handlebars.registerHelper('ifCond', function(v1, v2, options) {
				if(v1 === v2) {
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('extended', function( lang, Card ){
				var ext = (Card.Quantity * Card.Amount).toFixed(2)
			    return getCurrency(lang, ext);
			});

			Handlebars.registerHelper('sub', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub + (this.Amount * this.Quantity);
					});
					sub = sub.toFixed(2);

					return getCurrency(obj.Language, sub);
			});

			Handlebars.registerHelper('enclosure', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub + (this.EnclosureCost * this.Quantity);
					});
					sub = sub.toFixed(2);

					return getCurrency(obj.Language, sub);
			});

			Handlebars.registerHelper('shipping', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub + (this.ShippingAmount)
					});
					sub = sub.toFixed(2);

					return getCurrency(obj.Language, sub);
			});

			Handlebars.registerHelper('total', function( obj ){
				var cards = obj.Cards,
					sub = 0;

					$.each(cards, function(){
						sub = sub +
							(this.Amount * this.Quantity) +
							this.ShippingAmount +
							(this.EnclosureCost * this.Quantity);
					});
					sub = (sub - obj.DiscountAmount + obj.AddCharge ).toFixed(2);

					return getCurrency(obj.Language, sub);
			});

			Handlebars.registerHelper('curr', function( lang, value ){
			    return getCurrency(lang, value.toFixed(2));
			});

			Handlebars.registerHelper('curr_zero', function( lang){
				var zero = 0.00;
				return getCurrency(lang, zero.toFixed(2));
			});			

			function getCurrency( lang, value ){
				if(lang == 'fr'){
				    return value + ' $';
				}else{
					return '$ ' + value;
				}
			}

			self.generateIt();
		},

		/**
		 * Check if user is coming from purchase and execute analytics
		 */
		analytics: function(){
			var self = this,
				execute = getParam('analytics') || false;


			if(execute && s !== undefined){
				var settings = self.settings,
					oNumber = settings.orderNumber,
					cards = settings.Cards,
					products = [];

				$.each(cards, function( i, e ){
					products.push( ';IGCUSD ' + e.Amount + ';;;event35=1|event36=' + e.Amount.toFixed(2) );
				});
				products = products.join(',');
				s.prop2 = 'en';
				s.prop11 = 'visitor';
				s.hier1 = 'fs,giftcard,instant,confirmation';
				s.channel = 'giftcard';
				s.pageName = 'fs:giftcard:instant:confirmation';
				s.events = "event34:" + oNumber + ",event35:" + oNumber + ",event36:" + oNumber;
				s.eVar30 =  '';
				s.eVar50 = 'giftcard:' + oNumber;
				s.products = products;
				s.currencyCode = 'USD';

				if (typeof(s_local_onPage) == 'function') {
					s_local_onPage();
				}
				var s_code = s.t();
				if (s_code) document.write(s_code);
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

				if(self.settings.Language == 'fr'){
					self.templateFile = 'receipt-fr.handlebars';
					self.$elem.addClass('lang-fr');
				}else{
					self.$elem.addClass('lang-en');
				}

				$.when( self.getTemplate() )
				.then( function( rTemplt ) {

					template = Handlebars.compile( rTemplt )(self.settings);
					self.$elem.html( template );
					self.analytics();

				});
			});
		},

		/**
		 * Check if file exist usin serverFile
		 */
		checkFile: function( file ){
			var self = this,
				customFile = self.customPath + file,
				defaultFile = self.defaultPath + file,
				myFile = '';

			self.serverFile( customFile ).done(function(response){
				myFile = (response.d) ? customFile : defaultFile;
			})
			return myFile;
		},

		/**
		 * Check if file exists using server
		 */
		serverFile: function( file ){
			return $.ajax({
				type: "POST",
                url: "../../../../services/BuyatabWS.asmx/FileExists",
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
                url: "../../../../services/BuyatabWS.asmx/GetReceipt",
                data: JSON.stringify(dataToSend),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
			})
		},

		/**
		* Call API Asynchronously
		*/
		getTemplate: function(){
			var self = this
			return $.ajax({
				url: self.customPath + self.templateFile, //fileExists
				dataType: "html"
			});
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
		templateFile: 'receipt.handlebars',
		requestURL: "services/BuyatabWS.asmx/GetReceipt"
	};

})( jQuery, window, document );