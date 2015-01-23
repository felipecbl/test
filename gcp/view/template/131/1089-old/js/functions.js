(function() {

	if (window.location.protocol != "https:"){
	    // window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
	}

	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	}

    //Analitics
    var loc = window.location.href;
    if( (window.location.protocol == 'http:' || window.location.protocol == 'http:') && 
    	loc.indexOf('www') != -1){

    	var gaJsHost = (document.location.protocol == 'https:') ? 'https://ssl.' : 'http://www.';

    document.write(unescape('<script src="' + gaJsHost + 'google-analytics.com/ga.js" type="text/javascript"></script>'));

    try {
    	var pageTracker = _gat._getTracker('UA-10681922-1');
    	pageTracker._trackPageview();
    } catch(err) {}
}

})();