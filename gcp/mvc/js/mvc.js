// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {
	var Template = {

		// Starts the plugin
		init: function( options, elem ) {
			var self = this;
			self.options = $.extend( true, $.fn.bTemplate.options, options );

			self.config = {
				title: 'MVC Test',
				value:{
					type: 'text',
					label: 'Insert you data',
					placeholder : '$$$',
					detail: 'Any value between $10 - $1000',
					id: 'card_value',
					name: 'card_value',
					classes: 'required ammount number'
				},
				name:{
					type: 'text',
					label: 'Name',
					placeholder : 'Your name',
					detail: 'Your name',
					id: 'your_name',
					name: 'your_name',
					classes: 'required name'
				},
				email:{
					type: 'text',
					label: 'Email',
					placeholder : 'you@email.com',
					detail: 'Your email',
					id: 'your_email',
					name: 'your_email',
					classes: 'required email'
				},
				phone:{
					type: 'text',
					label: 'Phone',
					placeholder : '1 (000) 000-0000',
					detail: 'Your phone',
					id: 'card_phone',
					name: 'card_phone',
					classes: 'required ammount number'
				},
				send:{
					label: 'Send',
					action: 'send'
				}
			};

			var template = Handlebars.compile(MVCTemplate);

			$.each(Partials, function( partial, html ){
				Handlebars.registerPartial(partial, html);
			});

			myTemp = template(self.config);
			$(elem).append(myTemp);
			self.actions();
		},

		actions: function(){
			var myButton = $('.send'),
				response = $('.response');

			myButton.on('click', function(){
				// response.html('this');
				$.ajax({
					type: "POST",
					url: "services/BuyatabWS.asmx/FileExists",
					data: "",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					timeout: 5000,
					success: function(data){
						response.html('good');
						console.log(data);
					},
					fail: function(data){
						response.html('bad');
						console.log(data);
					}
				});
			});
		}
	};

	$.fn.bTemplate = function( options ) {
		return this.each(function() {
			var template = Object.create( Template );

			template.init( options, this );

			$.data( this, 'bTemplate', template );
		});
	};

	$.fn.bTemplate.options = {
		iniFile: 'ini.json',
		templateFile: 'template.handlebars',
		languageFile: 'en.json'
	};

})( jQuery, window, document );