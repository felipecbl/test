/**
*	eThank jQuery plugin
*	Author: Felipe Castelo Branco
*	Date: June 10th 2014
*	Last Update: June 10th 2014
*	Version: 1.0
*
*/

// Utility (for old browsers)
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {

		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {

	var F = {

		// check if string is url
		validURL: function(str) {
			var pattern = new RegExp('html|htm$','i');
			if(!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		},

		//Show content in a lightbox
		lightBoxIt: function( content, title, dimensions, callback, okButton, cancelButton ){
			$(document).trigger('functionIt', 'lightBoxIt');

			dimensions = dimensions || {height: 420, width: 600};
			callback = callback || null;
			okButton = okButton || (callback)? true : false;
			cancelButton = cancelButton || (callback)? true : false;

			var lbWindow = $('<div id="lightbox" />').css({
					position: 'relative',
					height: dimensions.height - 130,
					width: dimensions.width - 30
				}),

				button_ok = (okButton) ? 'Ok' : null,
				button_cancel = (cancelButton) ? 'Cancel' : null,
				dialog_buttons = {};

			// check if content is URL
			if(F.validURL(content)){
				lbWindow.load(content);
			}else{
				lbWindow.html(content);
			}

			if(okButton){
				dialog_buttons[button_ok] = function(){
					var thisButton = $(this);

					if(callback !== null){

						if(callback()){
							console.log('ok');
							thisButton.dialog('close');
							thisButton.dialog('destroy').remove();

						}
					}
				};
			}

			if(cancelButton){
				dialog_buttons[button_cancel] = function(){
					$( this ).dialog( "close" );
					$( this ).dialog('destroy').remove();
				};
			}

			$( '<div class="dialog-wrap"></div>' )
			.html(lbWindow)
			.dialog({
				// position: [self.$elem.width() / 2 - (this.width / 2), 200],
				title: title,
				resizable: false,
				modal: true,
				minHeight: dimensions.height,
				maxHeight: dimensions.height,
				minWidth: dimensions.width,
				maxWidth: dimensions.width,
				buttons: dialog_buttons
			});
		},

		//get specific parameter from url
		getParam: function( param ){
			return decodeURI( ( RegExp( param + '=' + '(.+?)(&|$)').exec(location.search) || [,null] )[1] );
		},

		/*/ Validation  **********************************************
		**************************************************************
		**************************************************************
		**************************************************************
		**************************************************************
		*/
		singleValidation: function(){
			var self = this;
				fields = $('*[data-validation="true"]');

			fields.on('blur', function(event){
				var myField = $(this),

					valObj = [{
						Classes: myField.data('validation-type'),
						Data: myField.val()
					}];

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function( data ){
						var d = data.d[0];

						self.fieldValidation( myField, d.Success, d.Error.ExceptionDetails, d.Error.Message);

						if( !d.Success ){
							// $(window).trigger('anaLog', 'singleValidation: ' + myField.attr('id'));
						}
					},
					error: function( e ){
						console.log(e.statusText + ': ' + e.responseText);
					}
				});
			});
		},

		// Set validation class and error message
		fieldValidation: function(field, status, type, errorMessage) {
			var myParent = $(field).parents('div.field, div.half-field'),
				errorType = '',
				tempRet = true;

			if( status ){
				myParent.find('.error-message').fadeOut(1200, 'swing', function(){

					myParent.removeClass('validation-error')
							.removeClass('validation-warning')
						.find('.error-message')
							.html('')
							.show();
				});

				tempRet = true;

			}else{
				if( type == 'error' ){
					errorType = 'validation-error';
					tempRet = false;
				}else{
					errorType = 'validation-warning';
					tempRet = true;
				}

				myParent.addClass(errorType)
					.find('.error-message')
					// .html(lang[errorCode]);
					.html(errorMessage);
			}
			return tempRet;
		},

		groupValidation: function( group ){
			var self = this,
				fields = $(group).find('*[data-validation="true"]'),
				errors = 0;


			$.each(fields, function(index, val) {
				var myField = $(val),

					valObj = [{
						Classes: myField.data('validation-type'),
						Data: myField.val()
					}];

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						var d = data.d[0];

						self.fieldValidation( myField, d.Success, d.Error.ExceptionDetails, d.Error.Message);

						if( !d.Success ){
							errors++;
						}
					},

					error: function( e ){
						console.log(e.statusText + ': ' + e.responseText);
						errors++;
					}
				});

			});
				return (errors > 0) ? false : true;
		}

	},

	ThankEmail = {

		// Starts the plugin
		init: function( options, elem ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );

			self.options = options;


			self.$elem.on('click', function(event) {
				event.preventDefault();
				// console.log($.fn.eThank.options._template._form);
				F.lightBoxIt(_template._form, 'Thank you email', null, self.sendEmail, true, true);
			F.singleValidation();
			});
		},

		sendEmail: function( email ){
			var rId = F.getParam('Id'),
				subject = $('#subject').val(),
				message = $('#message').val(),
				dataToSend = {
					encryptedReferenceId: rId,
					subject: subject,
					message: message
				};

			if( F.groupValidation($('#lightbox')) ){

				$.ajax({
					type: "POST",
					url: "/gcp/services/BuyatabWS.asmx/SendThanksEmail",
					data: JSON.stringify( dataToSend ),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function( data ){
						if(data.d){
							return true;
						}

						alert('Error: Sorry, the email could not be sent');
						return false;
					},
					error: function( e ){
						console.log( e );
						alert('Error: >', e);
						return false;
					}
				});
			}
		}
	};

	$.fn.eThank = function( options ) {
		return this.each(function() {
			var template = Object.create( ThankEmail );

			template.init( options, this );

			$.data( this, 'eThank', template );
		});
	};

	var _template = {
			_form:[
			'<div class="form-wrapper">',
				'<p>Send back a thank you email to the person that gave you the eGift card.</p>',
				'<div class="field">',
					'<div class="field-left">',
						'<label id="subject_label" for="subject">Subject</label>',
					'</div>',
					'<div class="field-right">',
						'<input id="subject" data-validation="true" class="input-title" type="text" placeholder="Subject" data-validation-type="required name" data-validation="true" value="Thank you" name="subject">',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',
				'<div class="field">',
					'<div class="field-left">',
						'<label id="message_label" for="message">Message</label>',
					'</div>',
					'<div class="field-right">',
						'<textarea  rows="10" data-validation="true" cols="30" id="message" class="input-title" type="text" placeholder="Message" data-validation-type="required name" data-validation="true" value="Thank you" name="message"></textarea>',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',
			'</div>'
			].join('\n')
		};

})( jQuery, window, document );