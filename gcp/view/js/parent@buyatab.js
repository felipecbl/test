// window.onload = function(){

	// Create IE + others compatible event handler
	var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent',
	eventer = window[eventMethod],
	messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message',
	myFrame = document.getElementById('buyatab_frame'),
	offsetScroll = window.iframeScrollOffset || 0; //must be declared on the merchant page.

	if(myFrame){
		//Scroll to the top everytime iframe loads
		myFrame.onload = function(){
			//Scroll the page to the specific height
			scrollTo(0, offsetScroll);
		};
	}

	window.btbMessages = [];

	// Listen to message from child window
	eventer(messageEvent, function(e) {
		// console.log(e.data);
		// console.log(typeof e.data);
		var myFrame = document.getElementById('buyatab_frame');
		try{

			if(typeof e.data == 'object'){
				if(e.data.type == 'resize'){
					// console.log(e.data.value);
					// document.getElementById('buyatab_frame').style.height = e.data.value + 'px';
					myFrame.style.height = e.data.value + 'px';
				}
				if(e.data.type == 'scroll'){
					// scrollTo(0, 0);
					scrollTo(0, offsetScroll);
				}
			}else{
				if(e.data === 0){
					// scrollTo(0, 0);
					scrollTo(0, offsetScroll);
				}else{
					if(e.data > 500){
						// document.getElementById('buyatab_frame').style.height = ( parseInt(e.data, 10) ) + 'px';
						myFrame.style.height = ( parseInt(e.data, 10) ) + 'px';
					}
				}
			}
		}
		catch(error){
			// console.log(error);
		}

		window.btbMessages.push(e);

	},false);

	window.onscroll = function (oEvent) {

		var doc = document.documentElement,
			body = document.body,
			iElement = document.getElementById('buyatab_frame'),
			top = (doc && doc.scrollTop  || body && body.scrollTop  || 0),
			iTop = 0;

		try{
			// get the iframe position	
			do {
				iTop += iElement.offsetTop || 0;
				iElement = iElement.offsetParent;
			}
			while(iElement);

			top = (top - iTop > 0)? top - iTop : 0;

			var	message = {type:'scroll', value: top};
				myFrame.contentWindow.postMessage(top, 'https://www.buyatab.com');
				myFrame.contentWindow.postMessage(message, 'https://www.buyatab.com');
		}
		catch(error){
			// console.log(error);
		}
	};

	window.adaptiveLink = function(defaultLink, mobileLink){

		var path = "https://www.buyatab.com/gcp?id=",
			isMobile = (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

		if(isMobile){
			console.log(path, mobileLink);
			return path + mobileLink;
		}

		console.log(path, defaultLink);
		return path + defaultLink;
	};
// };

