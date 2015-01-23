	
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

			$(window).trigger('anaLog', '[CONFIRMATION]');

			self.elem = elem;
			self.$elem = $( elem );

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

		/**
		* Run buyalytics plugin
		*/
		analytics: function(){
			$(document).trigger('functionIt', 'analytics');
			var self = this,
				sAnalytics = self.settings.Analytics;

			if(sAnalytics){

				window.buyalytics = window.buyalytics || [];

				// buyalitics array ahs a push event prototype.
				window.buyalytics.push({id: sAnalytics.Id, name: self.settings.MerchantName.replace(/[\s]+/gi, ''), type: sAnalytics.Type});
			}
		},
		
		/**
		* Call all the necessary functions and execute when it returns all the results
		*/
		generateIt: function(){
			var self = this;

			self.settings = window.orderConfirm;

			self.analytics();

			self.MerchantId = self.settings.MerchantId;
			self.customPath = 'view/template/' + self.MerchantId + '/template/';

			if(window.orderConfirm.Language == 'fr'){
				// self.templateFile = 'confirm-fr.handlebars';***
				self.$elem.addClass('lang-fr');
			}else{
				self.$elem.addClass('lang-en');
			}
			if( navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/) ){
				$('head').prepend('<meta name="format-detection" content="telephone=yes">');
				$('head').prepend('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
			}

			hbTemplate = Handlebars.compile( template )(window.orderConfirm);
			self.$elem.html( hbTemplate );

			$(window).trigger('orderConfirm', window.orderConfirm);
		}
	};

	$.fn.bConfirmation = function( options ) {
		return this.each(function() {
			var confirm = Object.create( Confirm );

			confirm.init( options, this );

			$.data( this, 'bConfirmation', confirm );
		});
	};

})( jQuery, window, document );