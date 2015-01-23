
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

	var Confirm = {
		init: function( options, elem ) {
			var self = this;

			$.ajaxSetup({ cache: false })
			document.title = 'Order Confirmation'; //It could be something from DB (i.e. Merchant Name)

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
			self.defaultPath = 'view/template/default/template';
			self.customPath = 'template/';

			Handlebars.registerHelper('ifCond', function(v1, v2, options) {
				if(v1 === v2) {
					return options.fn(this);
				}
				return options.inverse(this);
			});

			Handlebars.registerHelper('if_multi', function( condition , options ){
				if(condition > 1){
					return options.fn(this);
				} else {
					return options.inverse(this);
				}
				
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
		 * Call all the necessary functions and execute when it returns all the results
		 */
		 generateIt: function(){
		 	var self = this;

		 	$.when( self.getOptions() ).then(function ( rOptions ){
		 		// console.log(rOptions.d.Language)

		 		if(rOptions.d.Language == 'fr'){
		 			self.templateFile = 'confirm-fr.handlebars';
		 			self.$elem.addClass('lang-fr');
		 		}else{
		 			self.$elem.addClass('lang-en');
		 		}

		 		$.when( self.getTemplate() )
		 		.then( function( rTemplt ) {

		 			template = Handlebars.compile( rTemplt )(rOptions.d);
		 			self.$elem.html( template );

		 		})
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
			var confirm = Object.create( Confirm );
			
			confirm.init( options, this );

			$.data( this, 'bReceipt', confirm );
		});
	};

	$.fn.bReceipt.options = {
		CSSFile: 'css/receipt.css',
		templateFile: 'confirm.handlebars',
		requestURL: "services/BuyatabWS.asmx/GetReceipt"
	};

})( jQuery, window, document );