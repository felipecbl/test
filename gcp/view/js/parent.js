// Return an array of elements based on the attribute value
document.getElementsByAttribute = Element.prototype.getElementsByAttribute = function(attr, val, partial, tagName) {

	partial = partial || false;
	tagName = tagName || '*';

	var nodeList = this.getElementsByTagName(tagName),
	nodeArray = [];

	for (var i = 0, elem; elem = nodeList[i]; i++) {
		switch (typeof val) {
			case "undefined":
				if (typeof elem.getAttribute(attr) != "undefined"){
					nodeArray.push(elem);
				}
			break;
			default:
				if(partial){
					if (elem.getAttribute(attr).indexOf(val) != -1) {
						nodeArray.push(elem);
					}

				}else{
					if (elem.getAttribute(attr) == val){
						nodeArray.push(elem);
					}
				}
			break;
		}
	}

	return nodeArray;
};

// Create IE + others compatible event handler
var bTarget = 'https://www.buyatab.com', //protocol://www.domain.com
// var bTarget = 'http://dev.vm', //protocol://www.domain.com
	bDomain = bTarget.replace(/(https?:?(\/\/)?)?(www\.)?/i, '').replace(/\/$/i, ''),//strips target to domain.com
	eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
	eventer = window[eventMethod],
	messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message',
	myFrame = document.getElementById('buyatab-frame') || document.getElementsByAttribute('src', bDomain, true, 'iframe')[0],
	offsetScroll = window.iframeScrollOffset || 0; //must be declared on the merchant page.

if(myFrame){
	//Scroll to the top everytime iframe loads
	myFrame.onload = function(){
		//Scroll the page to the specific height
		// myFrame.scrollIntoView( true );
		scrollTo(0, offsetScroll);
		// console.log('Scrolling to : ' + offsetScroll);
	};
}

window.btbMessages = [];

// Listen to message from child window
eventer(messageEvent, function(e) {
	// console.log(e.data);
	// console.log(typeof e.data);
	// var myFrame = document.getElementById('buyatab-frame') || document.getElementsByAttribute('src', bDomain, true, 'iframe')[0];

	try{
		var postOrigin = (e.origin).replace(/(https?:?(\/\/)?)?(www\.)?/i, '').replace(/\/$/i, '');

		//prevent getting message from other domains
		if ( postOrigin !== bDomain ) {
			// console.log(postOrigin);
			return;
		}

		if(typeof e.data == 'object'){
			if(e.data.type == 'resize'){
				// console.log(e.data.value);
				// document.getElementById('buyatab-frame').style.height = e.data.value + 'px';
				myFrame.style.height = e.data.value + 'px';
			}
			if(e.data.type == 'scroll'){
				// scrollTo(0, 0);
				//to the top of the iframe
				offsetScroll = offsetScroll || myFrame ? myFrame.offsetTop : 0;
				scrollTo(0, offsetScroll);
			}
		}else{
			if(e.data === 0){
				// scrollTo(0, 0);
				scrollTo(0, offsetScroll);
			}else{
				if(e.data > 500){
					// document.getElementById('buyatab-frame').style.height = ( parseInt(e.data, 10) ) + 'px';
					myFrame.style.height = ( parseInt(e.data, 10) ) + 'px';
				}
			}
		}
	}
	catch(error){
		console.log(error);
	}

	window.btbMessages.push(e);

},false);

window.onscroll = function (oEvent) {

	var doc = document.documentElement,
		body = document.body,
		iElement = document.getElementById('buyatab-frame') || document.getElementsByAttribute('src', bDomain, true, 'iframe')[0],
		top = (doc && doc.scrollTop  || body && body.scrollTop  || 0),
		iTop = 0;

	try{
		// get the iframe position	
		do {
			iTop += iElement.offsetTop || 0;
			iElement = iElement.offsetParent;
		}
		while(iElement);

		// console.log('offsetScroll: ', offsetScroll);
		if(offsetScroll === 0){
			top = (top - iTop > 0)? top - iTop : 0;
		}else{
			top = top - offsetScroll;
		}
		
		top = (top < 0) ? 0 : top;

		// console.log('postMessage top: ', top);
		var	message = {type:'scroll', value: top},
			myProtocol = /*document.location.protocol ||*/ 'https://';

		myFrame.contentWindow.postMessage(top, bTarget);
		myFrame.contentWindow.postMessage(message, bTarget);
	}
	catch(error){
		console.log(error);
	}
};

window.adaptiveLink = function(defaultLink, mobileLink){

	var path = "https://www.buyatab.com/gcp?id=",
		isMobile = (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

	if(isMobile){
		// console.log(path, mobileLink);
		return path + mobileLink;
	}

	// console.log(path, defaultLink);
	return path + defaultLink;
};


