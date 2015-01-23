(function(){
    // window.buyalytics.push({id: 'UA-27807194-1', name: 'timhortonsca', type: 'ga'}); //Production
    // window.buyalytics.push({id: 'UA-27807194-3', name: 'timhortonsca', type: 'ga'}); //Staging

	$(window).on('analyticsDetails', function(event, data) {
		try{
			$.get('http://buyatab.com/timhortons/successfulpurchase', function(data) {});
		}catch(error){
			console.log(error);
		}
	});
})();