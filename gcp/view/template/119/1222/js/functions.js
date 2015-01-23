(function(){
	var nextStep = 'details';

	//use the img title as the page title
	$('h2#card-text').html($('div.choose-card').attr('title'));

	//select the parent div when selecting a radio
	$('input[name=sOpt]').on('click', function(a, b, c){
		$('.shipping-options .shipping-option').removeClass('so-selected');
		$(this).parent('.shipping-option').addClass('so-selected');
	});

	//hide delivery options when a new address is selected
	$(document).on('change', 'select#existing-address', function(){
		if( $(this).val() == -1 ){
			$('div.plastic-right').css('visibility', 'visible');
		}else{
			$('div.plastic-right').css('visibility', 'hidden');
		}
	});

	//remove checkout button inactivity
	$(document).on('click', 'a.button.checkout', function(){
		$('a.button.dt-inactive').removeClass('dt-inactive');

	});

	window.AddMoreCards = function() {
		bp.giftcards.Buyatab.setStep('customize');
		bp.giftcards.Buyatab.gotoSelector();
	}

	//called from buyatab plugin
	window.addIni = function(){

		if (typeof bp != 'undefined') {
			bp.giftcards.Buyatab.initialize({ step: 'customize' });
	    }else{
	    	console.log('Function not ready. Trying again')
	        setTimeout(window.addIni, 100);
	    }
	}

	//set Buttons to change step
	$(document).on('click', '.button', function(){
		nextStep = $(this).data('step');
		$('#bp-steps').val(nextStep);
		bp.giftcards.Buyatab.setStep(nextStep);
	});

	// set BP option changing step
	$(document).on('stepped', function(){
		console.log('Stepped: ' + nextStep);
	})

})();