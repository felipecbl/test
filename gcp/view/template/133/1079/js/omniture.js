window.regular = function( options ){

	s.prop16	= options.language || 'en';
	s.pageName	= (options.mobile) ? "MOBCPLX:BUY_A_TAB:" : "CPLX:BUY_A_TAB:";

	s.channel	= "BUY_A_TAB";
	s.eVar13	= "BUY_A_TAB";
	s.prop2		= "BUY_A_TAB:";
	s.prop3		= "BUY_A_TAB:";
	s.prop4		= "BUY_A_TAB:";
	s.prop5		= "BUY_A_TAB:";
	s.eVar5		= "Gift Cards";
	s.eVar6		= "";
};

window.receipt = function( options ){
	var products = [];

	$.each(options.cards, function( i, e ){
		products.push( 'E-GiftCard - ' + e.Id + '; 1;' + e.Amount );
	});
	products = products.join(',');

	s.prop16	= options.language || 'en';
	s.pageName	= (options.mobile) ? "MOBCPLX:BUY_A_TAB:" : "CPLX:BUY_A_TAB:";

	s.channel	= "BUY_A_TAB";
	s.eVar13	= "BUY_A_TAB";
	s.prop2		= "BUY_A_TAB:";
	s.prop3		= "BUY_A_TAB:";
	s.prop4		= "BUY_A_TAB:";
	s.prop5		= "BUY_A_TAB:";
	s.eVar5		= "Gift Cards";
	s.eVar6		= "";
	s.products	= products;
};