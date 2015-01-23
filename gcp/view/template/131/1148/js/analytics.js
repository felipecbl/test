/*

Merhant Id: 1148 - Four Seasons Mobile eCard

Distintion must be understood between 1913 and the eCard Analytics 1148.
Four the 'Customize' case the value for s_fsh.eVar30 should be "regular" for plastic and "Instant" for eCard.

*/
(function () {

	$(window).on('hashchange load scriptLoaded', function(){
		var page = document.location.hash.substring(1) || 'customize';

		switch (page) {
			case 'customize':
			//2. Customize Card
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,customize card";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:customize card";
			s_fsh.events = "event31";
			s_fsh.eVar30 = "instant";
			break;
			case 'delivery':
			//3. Delivery Options
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,delivery options";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:delivery options";
			s_fsh.events = "";
			break;
			case 'editcart':
			//4. Your Cart
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,shopping cart";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:shopping cart";
			s_fsh.events = "";
			break;
			case 'checkoutpage':
			//5. Payment Details
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,payment details";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:payment details";
			s_fsh.events = "event32";
			break;
			case 'billing':
			//6. Billing Information
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,billing info";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:billing info";
			s_fsh.events = "";
			break;
			case 'purchaser':
			//7. Purchaser Information
			s_fsh.prop2 = "en";
			s_fsh.hier1 = "fsmob,giftcard,purchaser info";
			s_fsh.channel = "giftcard";
			s_fsh.pageName = "fsmob:giftcard:purchaser info";
			s_fsh.events = "event33";
			break;
			//case 'summary':
			//s_fsh.prop2 = "en";
			//s_fsh.hier1 = "fsmob,giftcard,order summary";
			//s_fsh.channel = "giftcard";
			//s_fsh.pageName = "fsmob:giftcard:order summary";
			default: //Unexpected Result
			//Initial Page
			s_fsh.prop2 = "en";
		}

		$('.go-to-summary').on('click', function (event) {
		    s_fsh.prop2 = "en";
		    s_fsh.hier1 = "fsmob,giftcard,order summary";
		    s_fsh.channel = "giftcard";
		    s_fsh.pageName = "fsmob:giftcard:order summary";

		});

		if (typeof(s_local_onPage) == 'function') {
			s_local_onPage();
		}

		
		
		s_fsh.t();

	});

$(window).on('analyticsDetails', function(event, data) {
    var productsString = '';

    

	$.each(data.crq.Cart.CartCards, function (index, val) {
	    var coma = (index == data.crq.Cart.CartCards.length) ? '' : ',',
            on = data.OrderNumber.substring(0, 20);

		productsString += ';GC' + val.Amount + ';;;event35=' + val.Quantity + '|event36=' + (val.Amount * val.Quantity) + coma;
	});

	s_fsh.prop2 = data.crq.Language;
	s_fsh.hier1 = 'fsmob,giftcard,confirmation';
	s_fsh.channel = 'giftcard';
	s_fsh.pageName = 'fsmob:giftcard:confirmation';
	s_fsh.events = 'event34:' + ',event35:' + ',event36:';
    s_fsh.events = 'event34:' + data.OrderNumber + ',event35:' + data.OrderNumber + ',event36:' + data.OrderNumber;
	s_fsh.products = productsString;
	s_fsh.currencyCode = 'USD';
	s_fsh.eVar50 = 'giftcard:' + data.OrderNumber;

	if (typeof(s_local_onPage) == 'function') {
		s_local_onPage();
	}
	
	s_fsh.t();

});

if (navigator.appVersion.indexOf('MSIE') >= 0) document.write(unescape('%3C') + '\!-' + '-');
})();