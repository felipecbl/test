window.receipt = function( options ){
	var address = options.address.replace(/\s+/g, '').split(','),
		city = address[0],
		state = address[1],
		country = address[2];

	$.each(options.cards, function( i, e ){
		if(e.DeliveryType == 'plastic'){
        	_gaq.push(['_addTrans', e.Id, 'Buyatab', e.Amount + e.ShippingAmount, '0.00', e.Amount, city, state, country]);
		}else{
        	_gaq.push(['_addTrans', e.Id, 'Buyatab', e.Amount, '0.00', '', city, state, country]);
		}
	});
};