//Gets the height of the first elemento on the body and post a cross domain message

(function(){
	function sendCrossDomain(message){
		window.parent.postMessage(message, '*');
	}

	$(window).on('resize ready', function(){
		// get the page height > outerHeight + padding(t/b)
		var elem = $('body > div:only-of-type'),
			pageHeight = elem.outerHeight() +
				parseInt(elem.css('padding-top').replace("px", ""), 10) +
				parseInt(elem.css('padding-bottom').replace("px", ""), 10) +
				parseInt(elem.css('margin-top').replace("px", ""), 10) +
				parseInt(elem.css('margin-bottom').replace("px", ""), 10) ; //

				// console.log(elem);
				// console.log(pageHeight);

		if (pageHeight) {
			sendCrossDomain({ type: 'resize', value: pageHeight });
		}
	});
})();