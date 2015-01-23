(function() {

	if (window.location.protocol != "https:"){
        // window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
	}

    // Remove any preview hashtag
    location.hash = '';

	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	};

    //Buyatab plugin
	window.tbuyatab = $('#buyatabContent').bReload( { MerchantId: getParam( 'id' ) } );

})();