;
window.bp = window.bp || {};
bp.giftcards = bp.giftcards || {};

var proxy; // Porthole.WindowProxy instance

(function (_, w) {
	
	/******************************************************************************/
	
	_.Buyatab = new function () {
		return {
			// public properties
			initialized			: null,	// was the class initialized?
			options				: null,	// bp.giftcards.BuyatabOptions instance
			heightMonitorId		: null,	// interval ID for monitoring iframe height
			heightRelayId		: null,	// interval ID for relaying iframe height
			heightUpdatedAt		: null, // when was the height updated last
			height				: null,	// last known height of iframe
			
			// public methods
			initialize: function ($options) {
				this.log('Buyatab.initialize', $options);
				
				// abort!
				if (this.initialized){
					this.log('Buyatab already initialized', $options);
					return this;
				}
				this.initialized = true;
				
				this.log('Buyatab.initialize successful');
				
				// store options
				this.options = new _.BuyatabOptions($options || {});
				
				// listen for window load..
				w.onload = $.proxy(this.onWindowLoad, this);
				
				// exeunt.
				return this;
			},
			watchHeight: function () {
				this.log('Buyatab.watchHeight');
				this.unwatchHeight();
				this.heightMonitorId = setInterval($.proxy(this.onHeightMonitor, this), this.options.monitorHeightFreq);
			},
			unwatchHeight: function () {
				this.log('Buyatab.unwatchHeight');
				clearInterval(this.heightMonitorId);
				this.heightMonitorId = null;
			},
			updateCart: function ($qty) {
				this.log('Buyatab.updateCart', $qty);
				proxy.post({
					method	: 'updateCart',
					value	: parseInt($qty)
				});
			},
			gotoSelector: function () {
				this.log('Buyatab.gotoSelector');
				proxy.post({
					method	: 'selectCard',
					value	: null
				});
			},
			
			// ought-to-be private methods
			// private methods
			log: function () {
				try {
					if (console) {
						console.log( Array.prototype.slice.call(arguments) );
					}
				} catch ($x) {
					
				}
			},
			getHeight: function () {
				var d = document;
    			return Math.max(
			        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
			        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
			        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
			    );
			},
			getStep: function( step ){
				var self = this;

					if(step != 'checkout'){
						proxy.post({
							method	: 'setStep',
							value: [step, 0].join('|')
						});
					}else{
						proxy.post({
							method	: 'setStep',
							value: ['checkout', 3].join('|')
						});
					}
			},
			setStep: function(step) {
				// this.options.step = step;
				this.getStep(step);
			},
			onWindowLoad: function () {
				this.log('Buyatab.onWindowLoad');
				
			    // create a proxy window to transceive messages from the parent frame
			    proxy = new Porthole.WindowProxy(
					this.options.proxyUrl
				);

				// Register an event handler to receive messages;
			    proxy.addEventListener($.proxy(this.onProxyMessage, this));
	
				// if a step/substep exists, send it now
				if (this.options.step) {
					var o = this;
					setTimeout(function () {
						var ppv = {
							step	: o.options.step,
							substep	: o.options.substep || null
						};
					
						o.log('Buyatab.onWindowLoad: proxy.posting step: ['+ppv.step+', '+ppv.substep+']');
						proxy.post({
							method	: 'setStep',
							value: [ppv.step, ppv.substep || 0].join('|')
						});
					}, 100);
				}
				
				// start the height monitor, if applicable
				if (this.options.monitorHeight) {
					setTimeout($.proxy(this.watchHeight, this), 100);
					// setTimeout(this.getStep, 100);

				}
			},
			onProxyMessage: function ($e) {
			   // $e.origin: Protocol and domain origin of the message
			   // $e.data: Message itself
			   // $e.source: Window proxy object, useful to post a response
				this.log('Buyatab.onProxyMessage: '+$e.data.method);
			
				switch ($e.data.method) {
					// should we trigger the `viewcart` event?
					case 'viewCart':
						$('html').trigger('viewcart');
						break;
						
					// is this a confirmation of a `setSize` event?
					case 'receipt':
						if ($e.data.value == 'setSize') {
							this.log('Buyatab.onProxyMessage: cancelling the relay interval');
							clearInterval(this.heightRelayId);
						}
						break;
				}
			},
			onHeightMonitor: function () {
				// determine what element we are measuring, then measure it..
				// var el = $('html').hasClass('ua-ie') ? 'body' : 'html';
				// var h = parseInt( $(el).outerHeight(true) );
				var h = this.getHeight();
			
				// when was the height last updated?
				this.heightUpdatedAt = this.heightUpdatedAt || 0;
				var now = (new Date()).getTime();
				var interval = (now - this.heightUpdatedAt);
			
				// has something changed?
				// if (h && (h != this.height || interval > 1000)) {
				if (h && h != this.height) {
					// yep. store it.
					this.height = h;
					this.heightUpdatedAt = now;
					
					// clear the existing relay interval, and set a new one
					clearInterval(this.heightRelayId);
					this.heightRelayId = setInterval($.proxy(this.onHeightRelay, this), 1000);
				
					this.log('Buyatab.onHeightMonitor: height has changed to '+this.height+'; starting new relay interval');
				}
			},
			onHeightRelay: function () {
				// abort!
				if ( ! proxy) return;
				if ( ! proxy.post) return;
				
				this.log('Buyatab.onHeightRelay: proxy.posting height');
				
				// .. and relay it
				proxy.post({
					method	: 'setSize',
					value	: this.height
				});
			}
		};
	}();
	
	/*******************************************************************************
	BuyatabOptions class

	Represents options used to configure the Buyatab class. Check the definition
	for default	values; these can be overridden by passing in an object whose property
	names match some/all of the class' properties.

	When Buyatab is passed an `options` object parameter, it will create a
	BuyatabOptions instance using the object; otherwise, it will use a non-
	customized instance itself.
	*******************************************************************************/
	
	_.BuyatabOptions = function ($options) {
		this.lang				= 'en';
		this.proxyUrl			= 'https://www.bostonpizza.com/service/porthole-proxy.php';
		this.monitorHeight		= true;
		this.monitorHeightFreq	= 100;
		this.step				= 'customize';
		this.substep			= null;
	
		// overwrite default options
		if ($options) {
			for (var p in $options) {
				if (this.hasOwnProperty(p)) {
					this[p] = $options[p];
				}
			}
		}	
	}
	
	/******************************************************************************/

	//initialize it
	if(window.getParam('id') == '1205' || //electronic en
	   window.getParam('id') == '1221' || //electronic fr
	   window.getParam('id') == '1222' || //plastic fr
	   window.getParam('id') == '1212'){  //plastic en
		bp.giftcards.Buyatab.initialize({ step: 'customize' });	
	}

})(bp.giftcards, window);