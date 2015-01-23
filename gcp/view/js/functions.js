(function() {

	if (window.location.protocol != "https:"){
        // window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
	}

    // Remove any preview hashtag
    location.hash = '';

	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	};

	// Adds the doesExist() method to jQuery library
	jQuery.fn.doesExist = function(){
		return jQuery(this).length > 0;
	};

    //Buyatab plugin
    if (getParam( 'b2b' ) != 'true') {
		window.tbuyatab = $('#buyatabContent').bTemplate({ MerchantId:getParam( 'id' ) });
    }

    // buyatab analytics plugin gets accounts from the buyalitycs array:
    window.buyalytics = window.buyalytics || [];
    window.buyalytics.push({id: 'UA-10681922-1', name: 'buyatab', type: 'ga'});
    
    $('body').buyalytics();

})();