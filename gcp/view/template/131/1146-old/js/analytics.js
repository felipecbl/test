(function() {

	$(window).on('showPage scriptLoaded', function(event, data) {

		switch (data) {
			case 0:
				// Initial Page
				s.prop2 = "en";
				s.hier1 = "fs,giftcard,select card";
				s.channel = "giftcard";
				s.pageName = "fs:giftcard:select card";
				s.events = "event31";
				s.eVar30 = "instant";
			break;
			case 1:
				//Purchaser's Information
				s.prop2 = "en";
				s.hier1 = "fs,giftcard,purchaser info";
				s.channel = "giftcard";
				s.pageName = "fs:giftcard:purchaser info";
				s.events = "event32";
			break;
			case 2:
				//Payment Details
				s.prop2 = "en";
				s.hier1 = "fs,giftcard,payment details";
				s.channel = "giftcard";
				s.pageName = "fs:giftcard:payment details";
			break;
			case 3:
				//Order Summary
				s.prop2 = "en";
				s.hier1 = "fs,giftcard,checkout";
				s.channel = "giftcard";
				s.pageName = "fs:giftcard:checkout";
				s.events = "event33";
				break;
			default: //Unespected Result

		}

		if (typeof(s_local_onPage) == 'function') {
			s_local_onPage();
		}
		var s_code = s.t();
		if (s_code) document.write(s_code);
	});

if (navigator.appVersion.indexOf('MSIE') >= 0) document.write(unescape('%3C') + '\!-' + '-');
})();