	
// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ){
	window.getParam = function( param ){
		return decodeURI( (RegExp( param + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
	};

	var ThreeDS = {
		init: function(options, elem){
			var self = this;

			$(window).trigger('anaLog', '[3DS]');

			self.elem = elem;
			self.$elem = $( elem );

			self.generateIt();
		},

		//return specific parameter from url
		getParam: function( param ){

			return decodeURI( ( RegExp( param + '=' + '(.+?)(&|$)').exec(location.search) || [,null] )[1] );
		},

		/**
		* Call all the necessary functions and execute when it returns all the results
		*/
		generateIt: function(){
			var self = this,
				data = {
					src: '3DSOrderPreview.aspx?id=' + self.getParam('id')
				};

			if( navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/) ){
				$('head').prepend('<meta name="format-detection" content="telephone=yes">');
				$('head').prepend('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
			}

			hbTemplate = Handlebars.compile( window.treeds.template )(data);

			// console.log(hbTemplate);
			self.$elem.html( hbTemplate );
			document.write("<script type='text/javascript' src=../view/js/parent.js><\/script>");
		}
	};

	$.fn.b3ds = function( options ) {
		return this.each(function() {
			var treeDS = Object.create( ThreeDS );

			treeDS.init( options, this );

			$.data( this, 'b3ds', treeDS );
		});
	};

})( jQuery, window, document );