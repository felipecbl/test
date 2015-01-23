// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

//indexOf for old browsers
if (!Array.prototype.indexOf){

	Array.prototype.indexOf = function(elt /*, from*/){
		var len = this.length >>> 0,
			from = Number(arguments[1]) || 0;

		from = (from < 0) ? Math.ceil(from) : Math.floor(from);

		if (from < 0)
			from += len;

		for (; from < len; from++){
			if (from in this && this[from] === elt)
				return from;
		}
		return -1;
	};
}

(function( $, window, document, undefined ){

	var Analytics = {
		init: function( /*options, elem*/ ) {
			var self = this;

			self.accounts = [];
			self.mainAccount = 'buyatab';
			self.anyGA = 0;
			self.calledGA = false;

			window._gaq = window._gaq || [];
			window.buyalytics = window.buyalytics || [];

			window.buyalytics.push = function() {
				for( var i = 0, l = arguments.length; i < l; i++ ) {
					this[this.length] = arguments[i];
					$(this).trigger('push', arguments[i]);
				}
				return this.length;
			};

			self.gaSetAccount();

			$(window.buyalytics).on('push', function(event, data) {
				self.gaSetAccount();
			});
		},

		//return specific parameter from url
		getParam: function( param ){

			return decodeURI( ( RegExp( param + '=' + '(.+?)(&|$)').exec(location.search) || [,null] )[1] );
		},

		// Call GA
		callGA: function(){
			var self = this;

			if (self.anyGA && !self.calledGA){
				self.calledGA = true;
				self.googleAnalytics();
			}
		},

		//set account(s) for GA
		gaSetAccount: function(){
			var self = this,
				bltcs = window.buyalytics;

			try	{
				$.each(bltcs, function(index, val) {
					var bId = val.id;

					if(val.type == 'ga' && self.accounts.indexOf(bId) == -1){
						var thisName = (val.name == self.mainAccount) ? '' : val.name + '.';

						// inc analytics
						self.anyGA =+ 1;
						self.accounts.push(bId);

						// window._gaq.push([thisName + '_setAccount', bId], [thisName + '_setDomainName', 'buyatab.com'], [thisName + '_setAllowLinker', true], [thisName + '_trackPageview']);
						// ga([thisName + '_setAccount', bId], [thisName + '_setDomainName', 'buyatab.com'], [thisName + '_setAllowLinker', true], [thisName + '_trackPageview']);

						if(index === 0){
							ga('create', bId, 'buyatab.com');
						// 	ga('require', 'linkid');
						// 	ga('require', 'displayfeatures');
						// 	ga('require', 'ecommerce');
						// 	ga('require', 'ec');
						}else{
							ga('create', bId, 'buyatab.com', {'name': thisName});
						}

						ga(thisName + 'require', 'linkid');
						ga(thisName + 'require', 'displayfeatures');
						ga(thisName + 'require', 'ecommerce');
						ga(thisName + 'require', 'ec');
						ga(thisName + 'send', 'pageview');

						console.info('Adding account: ' + bId);
					}

					self.callGA();

				});
			}catch(e){
				console.log('Analytics exception:');
				console.log(e);
			}
		},

		//Google Analytics
		googleAnalytics: function(){
			var self = this;

			if(self.receipt){
				if( $.isFunction(window.receipt) ){
					window.receipt( self.options );
				}
			}
			self.getEvents();
		},

		multipleGA: function(){
			var self = this,
				args = arguments;

			$.each(window.buyalytics, function(index, val) {
				var thisName = (val.name == 'buyatab')? '' : val.name + '.';

				args[0] = thisName + args[0];

				// window._gaq.push(thisArg);

				//apply set array as arguments
				ga.apply(null, args);
			});
		},

		//Omniture Analytics
		omniture: function(){
			var self = this;

			s_account = self.Id;
			if(self.receipt){
				if( $.isFunction(window.receipt) ){
					window.receipt( self.options );
				}
			}else{
				if( $.isFunction(window.regular) ){
					window.regular( self.options );
				}
			}

			if (typeof(s_local_onPage) == 'function') {
				s_local_onPage();
			}
			var s_code = s.t();
			if (s_code) document.write(s_code);
		},

		//Get Analytics events
		getEvents: function(){
			var self = this;

			//Prevent (some) analytics push on internal machines
			if (self.getParam('view') !== 'int') {

				//General events
				$(window).on('anaLog', function( event, data ){
					// self.multipleGA( ['_trackEvent', 'General events', data]);
					self.multipleGA('send', 'event', 'General events', data);
				});

				//Add card to cart
				$(window).on('addToCart', function( event, data ){
					self.multipleGA('ec:addProduct', {
						'id': data.StyleId,
						'name': data.CardImg.replace(/^.*[\\\/]/, ''),
						'category': data.DesignType,
						'brand': data.MerchantId,
						'variant': data.Orientation,
						'price': data.Amount,
						'quantity': data.Quantity
					});
					self.multipleGA('ec:setAction', 'add');
					self.multipleGA('send', 'event', 'UX', 'click', 'add to cart');     // Send data using an event.
				});

				//Remove card from cart
				$(window).on('removeFromCart', function( event, data ){
					self.multipleGA('ec:addProduct', {
						'id': data.StyleId,
						'name': data.CardImg.replace(/^.*[\\\/]/, ''),
						'category': data.DesignType,
						'brand': data.MerchantId,
						'variant': data.Orientation,
						'price': data.Amount,
						'quantity': data.Quantity
					});
					self.multipleGA('ec:setAction', 'remove');
					self.multipleGA('send', 'event', 'UX', 'click', 'remove from cart');     // Send data using an event.
				});

				//Buttons
				//Change design
				$(document).on('click', '.choose-card, .change_design_bt', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Change design']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Change design');
				});

				//Preview design
				$(document).on('click', '.preview_bt', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Preview design']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Preview design');
				});

				//Next button
				$(document).on('click', '.continue-button, .add-to-cart', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Next page']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Next page');
				});

				//Checkout
				$(document).on('click', '.checkout', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Checkout page']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Checkout page');
				});

				//Back button
				$(document).on('click', '.back-button', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Next page']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Next page');
				});

				//New card
				$(document).on('click', '.new-card', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] New card']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] New card');
				});

				//Delete card
				$(document).on('click', '.delete', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Delete card']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Delete card');
				});

				//Edit card
				$(document).on('click', '.edit', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Edit card']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Edit card');
				});

				//Buble click
				$(document).on('click', '.status-page.clickable', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Notification buble']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Notification buble');
				});

				//Values click
				$(document).on('click', '.values-wrap a', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Sugested values']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Sugested values');
				});

				//Check delivery options
				$(document).on('click', '#custom-type li', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Delivery options']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Custom type options');
				});

				//Check delivery options
				$(document).on('click', '#delivery-type li', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Delivery options']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Delivery options');
				});

				//Phone click
				$(document).on('click', '#contact-number a', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Customer support phone']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Customer support phone');
				});

				//CC flag
				$(document).on('click', '#cc-type-selector li', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Credit card flag']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Credit card flag');
				});

				//Verisign click
				$(document).on('click', '#verisign', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Verisign seal']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Verisign seal');
				});

				//CVD click
				$(document).on('click', '#cvd-a', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] Whats CVD']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] Whats CVD');
				});

				//terms-a click
				$(document).on('click', '#terms-a', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[GCP] See terms and conditions']);
					self.multipleGA('send', 'event' , 'Click', '[GCP] See terms and conditions');
				});

				//eCard
				//Card number
				$(document).on('click', '.tab', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Card number']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Card number');
				});

				//Option number
				$(document).on('click', '.option.number', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Option number']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Option number');
				});

				//Print button
				$(document).on('click', '.action-print', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Print button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Print button');
				});

				//Passbook button
				$(document).on('click', '.action-passbook', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Passbook button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Passbook button');
				});

				//Bookmark button
				$(document).on('click', '.action-bookmark', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Bookmark button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Bookmark button');
				});

				//Option buttons
				$(document).on('click', '#co-buynew', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Buy new button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Buy new button');
				});

				$(document).on('click', '#co-reload', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Reload button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Reload button');
				});

				$(document).on('click', '#co-regift', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Regift button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Regift button');
				});

				$(document).on('click', '#co-thank', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Thank button']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Thank button');
				});

				//Click on note
				$(document).on('click', '#note', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Note']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Note');
				});

				//Click on terms
				$(document).on('click', '.terms', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Terms (phone/email)']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Terms (phone/email)');
				});

				//Click on reference
				$(document).on('click', '.reference', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Reference']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Reference');
				});

				//Click on logo
				$(document).on('click', '.logo', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Logo']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Logo');
				});

				//Click on amount
				$(document).on('click', '.amount', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Amount']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Amount');
				});

				//Zoom barcode
				$(document).on('click', '#bar-wrap', function(){
					// self.multipleGA(['_trackEvent', 'Click', '[eCard] Barcode']);
					self.multipleGA('send', 'event' , 'Click', '[eCard] Barcode');
				});

				// $(window).on('analyticsDetails', function(event, data) {
				$(window).on('orderConfirm', function(event, data) {
					var total = 0,
						shipping = 0,
						country,
						address,
						transactionID = data.Merchant.Name + ' (' + decodeURIComponent(data.OrderNumber) + ')';

					try {
						// $.each(data.Cards, function(index, val) {
						// 	total += val.Amount * val.Quantity;
						// 	shipping += val.ShippingAmount;
						// });

						// address = data.AddressLine2.replace(/\s+/gi, '').split(',');

						// self.multipleGA(['_addTrans',
						// 	transactionID,				// transaction ID - required
						// 	data.MerchantName,			// affiliation or store name
						// 	total,						// total - required
						// 	data.AddCharge,				// tax
						// 	shipping,					// shipping
						// 	address[0],					// city
						// 	address[1],					// state or province
						// 	address[2]					// country
						// ]);
						// self.multipleGA(['_trackTrans']);

						// $.each(data.Cards, function(index, val) {
						// 	var sku = data.MerchantName + ' - ' + (val.CardImagename).match(/(?=\w+\.\w{3,4}$).+/, '');
						// 	self.multipleGA(['_addItem',
						// 		transactionID,				// transaction ID - required
						// 		val.Id,						// SKU/code - required
						// 		sku,						// product name
						// 		val.DeliveryType,			// category or variation
						// 		val.Amount,					// unit price - required
						// 		val.Quantity				// quantity - required
						// 	]);
						// 	self.multipleGA(['_trackTrans']);
						// });

						self.multipleGA('ecommerce:addTransaction', {
							'id': transactionID,						// Transaction ID. Required.
							'affiliation': data.Merchant.Name,			// Affiliation or store name.
							'revenue': data.OrderSummary.OrderTotal,	// Grand Total.
							'shipping': data.OrderSummary.ShippingCost,	// Shipping.
							'tax': data.OrderSummary.AdditionalCost		// Tax.
						});

						self.multipleGA('ecommerce:send');
						// self.multipleGA(['_trackTrans']);

						$.each(data.Items, function(index, val) {
							var cardName = data.Merchant.Name + ' -> ' + (val.CardImg).match(/(?=\w+\.\w{3,4}$).+/, '');

							self.multipleGA('ecommerce:addItem', {
								'id': transactionID,					// Transaction ID. Required.
								'name': cardName,						// Product name. Required.
								'sku': val.ReferenceId,					// SKU/code.
								'category': val.Shipment.DeliveryType,	// Category or variation.
								'price': val.Amount,					// Unit price.
								'quantity': 1							// Quantity.
							});

							self.multipleGA('ecommerce:send');
						});

					} catch (err) {
						console.log(err);
					}
				});
			}
		}
	};

	$.fn.buyalytics = function( options ) {
		return this.each(function() {
			var analytics = Object.create( Analytics );

			analytics.init( options, this );

			$.data( this, 'buyalytics', analytics );
		});
	};

	$.fn.buyalytics.options = {
		requestURL: "services/BuyatabWS.asmx/Analytics",
		type: 'ga' //Google Analytics
	};

})( jQuery, window, document );
