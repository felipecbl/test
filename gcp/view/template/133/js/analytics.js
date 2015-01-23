(function() {
	$(window).on('analyticsDetails', function(event, data) {
		var total = 0;

		$.each(data.crq.Cart.CartCards, function(index, val) {
			total += parseInt(val.Amount, 10) * parseInt(val.Quantity, 10);
		});

		var google_conversion_id = 962357433;
		var google_conversion_language = "en";
		var google_conversion_format = "3";
		var google_conversion_color = "ffffff";
		var google_conversion_label = "3F3vCOmA6FcQudHxygM";
		var google_conversion_value = total;
		var google_conversion_currency = "CAD";
		var google_remarketing_only = false;
	});
})();