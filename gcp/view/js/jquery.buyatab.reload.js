// Utility (for old browsers)
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function($, window, document, undefined) {

	var Template = {

		// Starts the plugin
		init: function(options, elem) {
			$(document).trigger('functionIt', 'init');
			var self = this;

			self.elem = elem;
			self.$elem = $(elem);

			// Overwrite options if passed from the page
			self.options = $.extend(true, $.fn.bReload.options, options);

			// Get MerchantId either string or object
			self.MerchantId = (typeof options === 'string' || typeof options === 'number') ? options : options.MerchantId;

			self.Id = (typeof options === 'string') ? options : options.Id;
			self.type = options.type || $.fn.bReload.options.type;
			self.requestURL = $.fn.bReload.options.requestURL;
			self.CSSFile = $.fn.bReload.options.CSSFile;
			self.iniFile = $.fn.bReload.options.iniFile;
			self.templateFile = $.fn.bReload.options.templateFile;
			self.mobileTemplate = $.fn.bReload.options.mobileTemplate;

			self.stepWidth = 592; //This is the width of the page with no cart embed
			self.currentPage = 0;
			self.ccp = false;
			self.direction = 'right';
			self.steps = {}; //Set the seps acording to the number of pages

			// Define default path
			self.defaultPath = '/gcp/view/template/default/';
			

			self.url = "services/BuyatabWS.asmx/GetCards";

			/**
			 * Move page on hashchange event
			 */
			$(window).on('hashchange', function(event) {
				var page = document.location.hash.substring(1);

				if (self.justHashed !== page) {
					self.showPage([page]);
				}
			});

			self.generateIt();
		},

		// Calls the necessary functions to build the page
		generateIt: function() {
			$(document).trigger('functionIt', 'generateIt');
			var self = this;

			/* Execute all the ajax calls and wait for answer*/
			$.when(self.getStyle(), self.getOptions(), self.getIni())
				.then(function(rStyle, rOpt, iniOpt) {

				self.settings = rOpt[0].d;

				console.log(self.settings.Merchant.ChainId);

				//Merge ini options with self object 
				$.extend(true, self, iniOpt[0].options);

				if (self.settings.Merchant.Language == 'fr') {
					self.underFile = 'fr-card.handlebars';
				}

				self.IsMobile = self.settings.Merchant.IsMobile;
				self.MaxCards = self.settings.Merchant.MaxCards || 30;

				self.today = self.settings.ServerTime.slice(0, 10);
				self.day = self.settings.ServerTime.slice(0, 10).split('/')[0];
				self.month = self.settings.ServerTime.slice(0, 10).split('/')[1];
				self.year = self.settings.ServerTime.slice(0, 10).split('/')[2];

				self.formatedDate = self.year + '-' + self.month + '-' + self.day;
				self.iFormatedDate = self.day + '-' + self.month + '-' + self.year;

				// define custom paths
				self.languageFile = 'data/language/' + self.settings.Merchant.Language + '.json';
				self.customPath = '/gcp/view/template/' + self.settings.Merchant.ChainId + '/' + self.MerchantId + '/';

				$(document).trigger('functionIt', self.settings);
				$(document).trigger('functionIt', 'generaIt');

				if (self.settings.Status.Success) {
					$.when(self.getTemplate()).then(function(rTemplt) {
						$.when(self.appendStyle(rStyle), self.getLanguage(), self.customLanguage()).then(function(appStyle, rLang, cLang) {

							$.extend(true, rLang[0], cLang[0]);

							self.Language = rLang[0];
							self.cTemplate = Handlebars.compile(rTemplt)(self.Language);

							document.title = self.Language.title + self.settings.Merchant.Name;

							$.when(self.addMainClasses()).then(function() {
								$.when(
									self.defineConsole(),
									self.generateSummary(),
									self.getCC(),
									self.getContact(),
									self.getCountry(),
									self.getState(),
									self.getValues(),
									self.numbersOnly(),
									self.optizeIt(),
									self.phoneOnly(),
									self.preventTab(),
									self.setExpDatePicker(),
									self.singleValidation(),
									self.manipulateButtons(),
									self.showPage(0),
									self.showSubpage(0)).then(function() {
									$.when(self.appendTemplate()).done(function() {
										self.$elem.fadeIn();
										self.addSeal();
										$('input#cc_number').on('paste', function() {
											self.ccp = true;
										});
									});
								});
							});
						});
					});
				} else {
					alert('Error loading web service. Please contact support');
				}
			});
		},

		// Access the GCP API
		getOptions: function() {
			$(document).trigger('functionIt', 'getOptions');
			var self = this,
				dataToSend = {};

			dataToSend.MerchantId = self.MerchantId;

			return $.ajax({
				type: "POST",
				url: self.url,
				data: "{gcr:" + JSON.stringify(dataToSend) + "}",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		},

		// Generates cart
		generateCheckout: function() {
			$(document).trigger('functionIt', 'generateCheckout');
			var self = this,
				preDate = $('input#cc_expiration').val(),
				eDate = (self.IsMobile) ? self.convertDate(preDate) : preDate,
				checkoutData = {
					crq: {
						Cart: {
							CartCards: []
						},
						Payment: {
							CCType: $('input#cc_type').val(),
							CCNum: $('input#cc_number').val(),
							NameOnCard: $('input#cc_name').val(),
							ExpDate: eDate,
							CVD: $('input#cc_cvd').val(),

							Address1: $('input#cc_address').val(),
							Address2: $('input#cc_address2').val(),
							City: $('input#cc_city').val(),
							Country: $('select#cc_country').val(),
							RegionId: ($('#cc_state').is('select')) ? $('#cc_state').val() : -1,
							Region: ($('#cc_state').find(":selected").text() !== '') ? $('#cc_state').find(":selected").text() : $('#cc_state').val(),
							PostalZip: $('input#cc_zip').val(),

							Telephone: $('input#cc_phone').val(),
							Email: $('input#cc_email').val(),
							AddCharge: "0",
							AddChargeType: "0"
						},
						RA: {
							CP: self.ccp,
							UA: window.navigator.userAgent
						},
						Language: self.settings.Merchant.Language
					}
				};

			checkoutData.crq.Cart.CartCards = self.cart;

			return checkoutData;
		},

		// checkout
		checkout: function() {
			$(document).trigger('functionIt', 'checkout');
			var self = this,
				preDate = $('input#cc_expiration').val(),
				eDate = (self.IsMobile) ? self.convertDate(preDate) : preDate,
				myData = {
					merchantId: self.MerchantId,
					encryptedProductReferenceId: self.encriptedId,
					amount: $('input#card_value').val(),
					billingInfo: {
						CardType: $('input#cc_type').val(),
						CardNumber: $('input#cc_number').val(),
						NameOnCard: $('input#cc_name').val(),
						ExpiryMonth: eDate.split('/')[0],
						ExpiryYear: eDate.split('/')[1],
						CVD: $('input#cc_cvd').val(),

						Address1: $('input#cc_address').val(),
						Address2: $('input#cc_address2').val(),
						City: $('input#cc_city').val(),
						Country: $('select#cc_country').val(),
						RegionId: ($('#cc_state').is('select')) ? $('#cc_state').val() : -1,
						Region: ($('#cc_state').find(" :selected").text() !== '') ? $('#cc_state').find(" :selected").text() : $('#cc_state').val(),
						PostalZip: $('input#cc_zip').val(),

						Phone: $('input#cc_phone').val(),
						Email: $('input#cc_email').val()
					},
					raFields: {
						UserAgent: window.navigator.userAgent,
						CP: self.ccp
					},
					languageAbbreviation: self.settings.Merchant.Language
				},
				jLoader = $('<span />', {
					html: self.Language.dialogs.processing
				}).addClass('ajax-loader'),
				pButon = $('a.purchase'),
				gError = pButon.parent().find('.group-error');

			pButon.addClass('dt-inactive');
			gError.html(jLoader);

			$.ajax({
				type: "POST",
				url: 'services/BuyatabWS.asmx/Reload',
				data: JSON.stringify(myData),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data) {
					// console.log(data);
					//is success of eror 404 (hold)
					if (data.d.Status.Success || data.d.Status.CodeNumber == 300) {
						window.location.href = "receipt.html?on=" + data.d.EncryptedOrderNumber + '&analytics=true';
					} else {
						//pButon.removeClass('dt-inactive');
						if(data.d.Status.InnerStatus ){
							gError.addClass('error-in').html( self.Language.dialogs.checkout_error + ' Issue #: ' + data.d.Status.InnerStatus.Code);
						} else {
							gError.addClass('error-in').html( self.Language.dialogs.checkout_error + ' Issue #: ' + data.d.Status.Code);
						}
						
					}
				},
				error: function(e) {
					// console.log(e);
					//pButon.removeClass('dt-inactive');
					gError.addClass('error-in').html(e.statusText);
				}
			});
		},

		// Get Card
		getCard: function() {
			$(document).trigger('functionIt', 'getCard');
			var self = this,
				dataToSend = {
					merchantId: self.MerchantId,
					cardNumber: $('input#gcard_number').val(),
					cardPIN: $('input#pin_number').val() || 0
				};

			self.cardNumber = dataToSend.cardNumber;

			return $.ajax({
				type: "POST",
				url: 'services/BuyatabWS.asmx/CheckExternalGiftCardBalance',
				data: JSON.stringify(dataToSend),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});
		},

		// Load CSS file ( hasCustomized )
		getStyle: function() {
			$(document).trigger('functionIt', 'getStyle');
			var self = this;
			return self.checkFile(self.CSSFile, 'text/css');
		},

		// Load options from ini.json
		getIni: function() {
			$(document).trigger('functionIt', 'getIni');
			var self = this;
			return $.ajax({
				url: self.checkFile(self.iniFile), //fileExists
				dataType: "json"
			});
		},

		// Load the template file ( hasCustomized )
		getTemplate: function() {
			$(document).trigger('functionIt', 'getTemplate');
			var self = this,
				file = (self.IsMobile) ? self.mobileTemplate : self.templateFile;
			return $.ajax({
				url: self.checkFile(file, 'script'),
				dataType: "html"
			});
		},

		// Apend CSSFile to the head
		appendStyle: function(CSSFile) {
			$(document).trigger('functionIt', 'appendStyle');
			var self = this,
				deferred = $.Deferred();

			if (CSSFile != $('#default-style').attr('href')) {
				$.ajax({
					url: CSSFile,
					async: false, //don't load the page until css is cached!
					timeout: 5000
				}).done(function() {
					$('#default-style').attr('href', CSSFile);
					self.waitLoad([CSSFile], function() {
						deferred.resolve();
					});
				});
				return deferred.promise();
			}
		},

		// Load the language file
		getLanguage: function() {
			$(document).trigger('functionIt', 'getLanguage');
			var self = this;
			return $.ajax({
				url: self.defaultPath + self.languageFile,
				dataType: "json"
			});
		},

		// Load the custom language file ( hasCustomized )
		customLanguage: function() {
			$(document).trigger('functionIt', 'customLanguage');
			var self = this;

			return $.ajax({
				url: self.checkFile(self.languageFile, 'json'), //fileExists
				dataType: "json"
			});
		},

		// Append template to the element
		appendTemplate: function() {
			$(document).trigger('functionIt', 'appendTemplate');
			var self = this;
			self.$elem.append(self.cTemplate);
		},

		// Adds classes to the main element for css purpose
		addMainClasses: function() {
			$(document).trigger('functionIt', 'addMainClasses');
			var self = this,
				sTheme = 'theme-' + self.settings.Style.PresetId,
				sSize = 'size-' + self.settings.Style.Size,
				sMob = self.IsMobile ? 'ui-mobile' : '',
				sFont = self.settings.Style.FontFamily + '-font',
				sPreview = 'previewstyle-' + self.settings.Merchant.PreviewType,
				sLang = 'lang-' + self.settings.Merchant.Language;

			self.$elem.attr('class', '').addClass('reload ' + sTheme + ' ' + sSize + ' ' + sMob + ' ' + sFont + ' ' + sPreview + ' ' + sLang);
		},

		// Protect window.console method calls
		defineConsole: function() {
			$(document).trigger('functionIt', 'defineConsole');

			if (!window.console) {
				window.console = {};
			}
			// union of Chrome, FF, IE, and Safari console methods
			var m = [
					"log", "info", "warn", "error", "debug", "trace", "dir", "group",
					"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
					"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
			];
			// define undefined methods as noops to prevent errors
			for (var i = 0; i < m.length; i++) {
				if (!window.console[m[i]]) {
					window.console[m[i]] = function() {};
				}
			}
		},

		// generates the summary page before receipt
		generateSummary: function() {
			$(document).trigger('functionIt', 'generateSummary');
			var self = this,
				myTemplt = $(self.cTemplate),
				cPage = myTemplt.find('div#confirmation-window-bg'),
				lPage = myTemplt.find('li#purchaser-info'),
				origNav = lPage.find('div.pages-nav'),
				newNav = cPage.find('div.pages-nav'),
				backBt = origNav.find('a.back-to-purchaser-info'),
				contBt = newNav.find('a.go-to-summary');

			if (self.settings.Merchant.confirmationPage) {
				cPage.prependTo(self.elem);
				origNav.appendTo(cPage.find('div#confirmation-window'));
				newNav.appendTo(lPage);

				contBt.on('click', function() {
					if (self.groupValidation($('li#cc-info, li#billing-info, li#purchaser-info'), contBt)) {
						cPage.fadeToggle();
						self.summaryIt();
						$('html, body').animate({
							scrollTop: 0
						}, "fast");
					}
				});

				backBt.on('click', function() {
					cPage.fadeToggle();
				});
			}
			self.cTemplate = myTemplt;
		},

		// get Credit Card number and display the flag
		getCC: function() {
			$(document).trigger('functionIt', 'getCC');
			var self = this,
				myTemplt = self.cTemplate,
				ccInput = myTemplt.find('input#cc_number'),
				ccResult = '';

			ccInput.validateCreditCard(function(result) {
				if (!(result.card_type !== null)) {
					$('ul#cc-type-selector li').removeClass('off');
					ccInput.removeClass('valid');
					return;
				}

				//Change the result for DB => Syed's fault!
				switch (result.card_type.name) {
					case 'visa':
						ccResult = 'Visa';
						break;
					case 'mastercard':
						ccResult = 'MasterCard';
						break;
					case 'amex':
						ccResult = 'Amex';
						break;
					default:
						ccResult = 'Visa';

				}

				$('input#cc_type').val(ccResult);
				$('ul#cc-type-selector li').addClass('off');
				$('ul#cc-type-selector .' + result.card_type.name).removeClass('off');

				if (result.length_valid && result.luhn_valid) {
					return ccInput.addClass('valid');
				} else {
					return ccInput.removeClass('valid');
				}
			})
				.on('keydown keyup blur', function() {
				$(this).val($(this).val().replace(/[^0-9+ ]/g, ''));
			});
			self.cTemplate = myTemplt;
		},

		// Gets the contact number from setting and update footer
		getContact: function() {
			$(document).trigger('functionIt', 'getContact');
			var self = this,
				myTemplt = self.cTemplate,
				numberSpan = myTemplt.find('footer span#contact-number');

			numberSpan.html('<a href="tel:' + self.settings.Merchant.ContactNumber + '">' + self.settings.Merchant.ContactNumber + '</a>');
			self.cTemplate = myTemplt;
		},

		// Get countries from the API and populate select
		getCountry: function() {
			$(document).trigger('functionIt', 'getCountry');
			var self = this,
				myTemplt = self.cTemplate,
				cSelect = myTemplt.find('select#cc_country, select#plastic_country'),
				html = '';

			$.ajax({
				url: 'services/BuyatabWS.asmx/GetCountries',
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			}).done(function(data) {
				var list = data.d;

				$.each(list, function(i, e) {
					//Canada as default
					if (e.Id == 2) {
						html = html + '<option selected="selected" value="' + e.Id + '">' + e.Name + '</option>';
					} else {
						html = html + '<option value="' + e.Id + '">' + e.Name + '</option>';
					}
				});
				cSelect.html(html).trigger('change');
			});
		},

		// Change states acording to country
		getState: function() {
			$(document).trigger('functionIt', 'getState');
			var self = this,
				myTemplt = $(self.cTemplate),
				country = myTemplt.find('select#cc_country'),
				states = myTemplt.find('select#cc_state'),
				zip = myTemplt.find('input#cc_zip'),
				sParents = states.parent(),
				html = '';

			country.on('change', function(e, f) {
				var myData = parseInt(country.val(), 10);

				//change the zip/postal code validation => CA x US
				switch (myData) {
					case 1: //US
						zip.addClass('zipus');
						zip.removeClass('zipca');
						break;
					case 2: //Canada
						zip.removeClass('zipus');
						zip.addClass('zipca');
						break;
					default:
						zip.removeClass('zipus');
						zip.removeClass('zipca');
				}

				$.ajax({
					url: 'services/BuyatabWS.asmx/GetRegionsByCountry',
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: "{country_id:" + JSON.stringify(myData) + ", language:" + JSON.stringify(self.settings.Merchant.Language) + "}"
				}).done(function(data) {
					var regions = data.d;
					if (regions) {
						if (regions.length == 1) {
							//not null but with a region code

							if ($('input#cc_state').length === 0) {
								$('<input />', {
									type: 'text',
									'data-region': regions[0].Id
								}).attr('id', 'cc_state').addClass('required')
									.prependTo(sParents);
								states.remove();
								$('select#cc_state').remove();
							} else {
								$('input#cc_state').attr('data-region', regions[0].Id);
							}
						} else {
							// it has a nice list of regions

							//if the select was removed, create a brand new one!
							if ($('select#cc_state').length === 0) {
								$('<select  />', {}).attr('id', 'cc_state').addClass('required')
									.prependTo(sParents);
								$('input#cc_state').remove();
							}

							$(regions).each(function(i, data) {
								html = html + '<option value="' + data.Id + '">' + data.Name + '</option>';
							});

							states.html(html);
							$('select#cc_state').html(html);
							html = '';
						}
					} else {
						if ($('input#cc_state').length === 0) {
							$('<input />', {
								type: 'text',
								'data-region': 84
							}).attr('id', 'cc_state').addClass('required')
								.prependTo(sParents);
							states.remove();
							$('select#cc_state').remove();
						} else {
							$('input#cc_state').attr('data-region', 84);
						}
					}
				})
					.fail(function(e) {
					console.log(e); //fail? Use a text input!

					if ($('input#cc_state').length === 0) {
						$('<input />', {
							type: 'text',
							'data-region': 84
						}).attr('id', 'cc_state').addClass('required')
							.prependTo(sParents);
						states.remove();
						$('select#cc_state').remove();
					} else {
						$('input#cc_state').attr('data-region', 84);
					}
				});
			});
		},

		// Manages the card values and create the buttons based on the range parsed from API
		getValues: function() {
			$(document).trigger('functionIt', 'getValues');
			var self = this,
				myTemplt = $(self.cTemplate),
				values = self.settings.Amount.Range.split(','),
				vSize = values.length,
				iAmount = self.settings.Amount.InitialAmount,
				minValue = self.settings.Amount.MinVal,
				lang = self.settings.Merchant.Language,
				maxValue = self.settings.Amount.MaxVal,
				vCont = myTemplt.find('input#card_value')
					.val(iAmount)
					.on('blur', function() {
					if ($(this).val() < minValue) {
						$(this).val(minValue);
						previewVal.html(self.getMoney($(this).val()));
						$(this).parents('div.field')
							.find('div.field-error')
							.html(self.Language.errors.value + self.getMoney(minValue));
					}

					if ($(this).val() > maxValue) {
						$(this).val(maxValue);
						previewVal.html(self.getMoney($(this).val()));
						$(this).parents('div.field')
							.find('div.field-error')
							.html(self.Language.errors.maxvalue + self.getMoney(maxValue));
					}
				})
					.on('blur change', function() {
					if (lang !== 'fr') {
						// $(this).val( self.numberWithCommas( $(this).val() ) ) 
					}
				}),
				previewVal = $(self.elem).find('span#pw-value')
					.html(self.getMoney(iAmount)),
				vWrap = myTemplt.find('div.values-wrap'),
				html = '',
				vType = self.valueType;

			vCont.on('keyup', function() {
				previewVal.html(self.getMoney($(this).val()));

			});
			if (vSize <= 5 && self.settings.Amount.Open && vType == 'buttons') {
				var dollar = (self.showDollar) ? '$' : '';
				$(values).each(function(i, e) {
					$('<a></a>', {
						html: (lang == 'fr') ? self.numberWithCommas(e) + dollar : dollar + self.numberWithCommas(e), //if french... Call Chine!
						href: 'javascript:void(0)'
					}).addClass('half-button')
						.on('click', function(event) {
						event.preventDefault();
						$(vCont).val((lang == 'fr') ? e : self.numberWithCommas(e));
						previewVal.html(self.getMoney(e));

						//remove validation error
						$(vCont).parents('div.field')
							.removeClass('validation-error')
							.find('div.field-error')
							.html('');
					})
						.appendTo(vWrap);
				});

				var valueTxt = self.IsMobile ? self.Language.customize.detail.value_mobile : self.Language.customize.detail.value;
				vCont.parent()
					.find('div.field-detail')
					.html(valueTxt +
					self.getMoney(minValue) + " - " + self.getMoney(maxValue));
			} else {
				// Generate a selector
				var selector = $('<select />', {
					id: 'card_value'
				}).addClass('required ammount number')
					.attr('name', 'card_value')
					.prependTo(vCont.parent()),
					output = [];

				$(values).each(function(i, e) {
					var eText = self.getMoney(e); //(lang == 'fr') ? e + '$' :'$' + e;

					// if (i === 0){
					// previewVal.html( e );							
					// }

					if (e == self.settings.Amount.InitialAmount) {
						output.push('<option selected="selected" value="' + e + '">' + eText + '</option>');
					} else {
						output.push('<option value="' + e + '">' + eText + '</option>');
					}
				});

				selector.html(output.join(''))
					.on('change', function() {
					previewVal.html(self.getMoney($(this).val()));
				});

				vCont.parent().find('div.field-detail')
					.html(self.Language.customize.detail.value2);

				vCont.parent().find('span').remove();
				vCont.remove();
			}
		},

		// Prevent user to type leters.Good for number class on inputs
		numbersOnly: function() {
			$(document).trigger('functionIt', 'numbersOnly');
			var self = this,
				myTemplt = self.cTemplate,
				nFields = myTemplt.find('input.number');

			nFields.each(function() {
				$(this).on('keyup', function() {
					$(this).val($(this).val().replace(/[^0-9]/g, ''));
				});
			});
		},

		// Prevent user to type anything but phone chars. Good for phone class on inputs
		phoneOnly: function() {
			$(document).trigger('functionIt', 'phoneOnly');
			var self = this,
				myTemplt = self.cTemplate,
				nFields = myTemplt.find('input.phone');

			nFields.each(function() {
				$(this).on('keyup', function() {
					this.value = this.value.replace(/[^0-9+ \.\(\)\x-]/g, '');
				});
			});
		},

		// Append a span (optional) to the optional (class) fields labels
		optizeIt: function() {
			$(document).trigger('functionIt', 'optizeIt');
			var self = this,
				myTemplt = $(self.cTemplate),
				optional = myTemplt.find('.optional');

			$(optional).each(function() {
				$(this).parents('.field').find('label').append((self.settings.Merchant.Language == 'fr') ? '<span>(facultatif)</span>' : '<span>(optional)</span>');
			});
		},

		// Prevent tabulation for .no-tab and outside the .tab-group
		preventTab: function() {
			$(document).trigger('functionIt', 'preventTab');
			var self = this,
				myTemplt = self.cTemplate,
				noTabs = myTemplt.find('.no-tab'),
				all = myTemplt.find('a, input, textarea, button, select');

			all.attr("tabindex", "-1");

			all.on('focus', function(event) {
				var myParent = $(this).parents('.tab-group');
				all.attr("tabindex", "-1");
				myParent.find('a, input, textarea, button, select')
					.attr("tabindex", "1");
			});

			noTabs.keydown(function(objEvent) {
				if (objEvent.keyCode == 9) { //tab pressed
					objEvent.preventDefault(); // stops its action
				}
			});
		},

		// Set Expiration Data Picker for Credit Card
		setExpDatePicker: function() {
			$(document).trigger('functionIt', 'setExpDatePicker');
			var self = this,
				myTemplt = self.cTemplate,
				expField = myTemplt.find('input#cc_expiration'),
				lang = self.settings.Merchant.Language,
				todayED = self.year + '-' + self.month;
			if (!self.IsMobile) {
				var showing = false,
					keepFocus = false,

					// split months in to ul
					monthsHTML = function() {
						var html = '',
							months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

						$.each(months, function(i, e) {
							var active = '';
							if (i === 0) {
								html = html + '<ul>';
								active = ' ewm-active';
							} else {
								active = '';
							}
							if (i == 6) {
								html = html + '</ul><ul>';
							}
							if (i == 12) {
								html = html + '</ul>';
							}
							html = html + '<li class="ew-month-single' + active + '" data-month="' +
								((i < 9) ? ('0' + (i + 1)) : (i + 1)) + '">' +
								e + '</li>';
						});
						return html;
					},

					month = (lang == 'fr') ? 'Mois' : 'Month',
					year = (lang == 'fr') ? 'Année' : 'Year',

					theMonth = '01',
					theYear = (new Date()).getFullYear() + 1,

					years = function() {
						var currentYear = (new Date()).getFullYear(),
							active = '';

						myYears = [];
						for (var i = 0; i < 25; i++) {
							if (i == 1) {
								active = ' ewm-active';
							} else {
								active = '';
							}
							myYears.push('<li class="ew-year-single' + active + '">' + currentYear + '</li>');
							currentYear++;
						}
						return myYears.join('');
					},

					//the widget
					expWidget = $('<div />', {}).attr('id', 'exp-widget')
						.css('display', 'none')
						.on('click focus', function(event) {
						event.stopPropagation();
					})
						.appendTo(expField.parent()),

					ewLeft = $('<div />').addClass('ew-left').appendTo(expWidget),
					ewMonth = $('<div />').addClass('ew-month').html(month).appendTo(ewLeft),
					ewMonths = $('<div />').addClass('ew-months').html(monthsHTML()).appendTo(ewLeft),

					ewRight = $('<div />').addClass('ew-right').appendTo(expWidget),
					ewYear = $('<div />').addClass('ew-year').html(year).appendTo(ewRight),
					arrowUp = $('<button />').addClass('ew-arrow ew-arrow-up').appendTo(ewRight),
					ewYearsWrap = $('<div />').addClass('ew-years-wrap').appendTo(ewRight),
					arrowDown = $('<button />').addClass('ew-arrow ew-arrow-down').appendTo(ewRight),
					ewYears = $('<ul />').addClass('ew-years').html(years()).appendTo(ewYearsWrap),

					//The ok buton
					okButton = $('<a />', {
						href: 'javascript:void(0)',
						html: 'Ok',
						tabindex: -1
					}).addClass('ew-ok half-button')
						.on('click', function(e) {
						e.preventDefault();
						expField.val(theMonth + '/' + theYear);
						expWidget.fadeOut('fast');
						expField.trigger('blur');
					})
						.appendTo(expWidget);

				//The arrow Up
				arrowDown.on('click', function(event) {
					event.stopPropagation();
					var ulMargn = parseInt(ewYears.css('margin-top'), 10),
						ulLine = parseInt(ewYears.css('line-height'), 10) + 2;

					keepFocus = true;
					showing = true;

					if (ulMargn > ulLine * 21 * -1) {
						ulMargn = ulMargn - ulLine;
						ewYears.css('margin-top', ulMargn);
					}
				});

				//The arrow Down
				arrowUp.on('click', function(event) {
					event.stopPropagation();
					var ulMargn = parseInt(ewYears.css('margin-top'), 10),
						ulLine = parseInt(ewYears.css('line-height'), 10) + 2;

					keepFocus = true;
					showing = true;

					if (ulMargn < 0) {
						ulMargn = ulMargn + ulLine;
						ewYears.css('margin-top', ulMargn);
					}
				});

				//The years table
				$.each(ewYears.find('li'), function(i, e) {
					$(e).on('click', function(event) {
						ewYears.find('li').removeClass('ewm-active');
						$(this).addClass('ewm-active');
						theYear = $(this).html();
						keepFocus = true;
						showing = true;
						expField.val(theMonth + '/' + theYear);
						expField.trigger('blur');
					});
				});

				//The months table
				$.each(ewMonths.find('li'), function(i, e) {
					$(e).on('click', function(event) {
						var d = $(this).data('month');
						ewMonths.find('li').removeClass('ewm-active');
						$(this).addClass('ewm-active');
						theMonth = ((d < 10) ? ('0' + d) : d);
						keepFocus = true;
						showing = true;
						expField.val(theMonth + '/' + theYear);
						expField.trigger('blur');
					});
				});

				//Show widget when focus on field
				expField.on('click focus', function(event) {
					event.stopPropagation();
					showIt();
				})
					.on('blur', function(event) {
					window.setTimeout(hideIt, 200);
				})
					.on('keydown', function(e) {
					//prevent user to type. Keep it?
					if (e.keyCode == 9) { //tab pressed
						$('input#cc_cvd').focus();
						// return e.keyCode = 9;
					}
					e.preventDefault();

				})
					.val(theMonth + '/' + theYear);

				$('html').on('click', function(e) {
					keepFocus = false;
					window.setTimeout(hideIt, 200);
				});

				$(document).keyup(function(e) {
					if (e.keyCode == 27) { // esc
						keepFocus = false;
						window.setTimeout(hideIt, 200);

					}
				});

				myTemplt.find('li#checkout input').on('focus', function(e) {
					if (e.currentTarget.id != 'cc_expiration') {
						window.setTimeout(hideIt, 200);
						keepFocus = false;
					}
				});

				function hideIt() {
					if (showing && !keepFocus) {
						expWidget.fadeOut('fast');
						expField.trigger('blur');
						showing = false;
					}
				}

				function showIt() {
					expWidget.fadeIn('fast');
					showing = true;

					var $doc = $(document),
						$win = $(window),
						$this = expWidget,
						offset = expField.offset(),
						dTop = offset.top - $doc.scrollTop(),
						dBottom = $win.height() - dTop - $this.height();

					if (dBottom < 0) {
						$this.addClass('down-false');
					} else {
						$this.removeClass('down-false');
					}
				}

			} else {
				expField.val(todayED);
				/*.on('change', function(){
					var eDate = $(this).val(),
						eYear = eDate.split('-')[0],
						eMonth = eDate.split('-')[1];

					if( (eYear < self.year) || ((eYear = self.year) && (eMonth < self.month)) ){
						expField.val( todayED );

						expField.parents('.field').addClass('validation-error')
								.find('.field-error').html(self.Language.errors.past_date);
					}else{
						expField.parents('.field').removeClass('validation-error')
								.find('.field-error').html('');
					}
				});*/
			}
			self.cTemplate = myTemplt;
		},

		// Set validation class and error message
		fieldValidation: function(field, status, type, errorCode) {
			$(document).trigger('functionIt', 'fieldValidation');
			var myParent = $(field).parents('div.field, div.half-field'),
				lang = this.Language.errors,
				errorType = '',
				tempRet = true;

			if (status) {
				myParent.find('div.field-error').fadeOut(1200, 'swing', function() {

					myParent.removeClass('validation-error')
						.removeClass('validation-warning')
						.find('div.field-error')
						.html('')
						.show();
				});

				tempRet = true;

			} else {
				if (type == 'error') {
					errorType = 'validation-error';
					tempRet = false;
				} else {
					errorType = 'validation-warning';
					tempRet = true;
				}

				myParent.addClass(errorType)
					.find('div.field-error')
					.html(lang[errorCode]);
			}
			return tempRet;
		},

		// Execute validation onBlur
		singleValidation: function() {
			$(document).trigger('functionIt', 'singleValidation');
			//Note: previous version exclusively excluded the gift card field = > input[type=text]:not(#gcard_number)
			var self = this,
				fields = $('input[type=text].required, input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox].required, textarea, select');

			fields.live('change, blur, focusout', function() {

				if ($(this).attr('type') === 'checkbox') {

					if ($(this).is(':checked')) {
						$(this).parents('div.terms-field').removeClass('validation-error')
							.find('div.field-error')
							.html('');
					} else {
						$(this).parents('div.terms-field')
							.addClass('validation-error')
							.find('div.field-error')
							.html(self.Language.errors.check);
					}
				} else {
					var fData = $(this).val();
					if ($(this).attr('type') === 'month') {
						fData = self.convertDate(fData);
					}
					var valObj = [{
							Classes: $(this).attr('class'),
							Data: fData
						}
					],

						myField = $(this);

					$.ajax({
						type: "POST",
						url: "services/BuyatabWS.asmx/Validate",
						data: "{validation_group:" + JSON.stringify(valObj) + "}",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function(data) {
							var d = data.d[0];
							// console.log(data.d[0])

							self.fieldValidation(myField,
								d.Success,
								d.Error.ExceptionDetails,
								d.Error.ErrorCode);
							if (!d.Success) {
								$(window).trigger('anaLog', 'singleValidation: ' + myField.attr('id'));
							}
						},
						error: function(e) {
							console.log(e.statusText + ': ' + e.responseText);
						}
					});
				}

			});
		},

		// Execute validation for a group of fields
		groupValidation: function(groupsArray, triggeredBy) {
			$(document).trigger('functionIt', 'groupValidation');
			var self = this,
				valObj = [],
				errors = 0;

			if (!self.debugMode) { //turn validation off on debug mode
					//Note: previous version exclusively excluded the gift card field = > input[type=text]:not(#gcard_number)
				var fields = $(groupsArray).find('input[type=text].required, input[type=date], input[type=month], input[type=tel], input[type=email], input[type=checkbox], input[type=radio], textarea, select');
				$(fields).each(function() {
					var myObj = {};

					if ($(this).attr('type') === 'checkbox') {

						if ($(this).is(':checked')) {
							$(this).parents('div.terms-field').removeClass('validation-error')
								.find('div.field-error')
								.html('');
						} else {
							$(this).parents('div.terms-field')
								.addClass('validation-error')
								.find('div.field-error')
								.html(self.Language.errors.check);
							errors++;
						}
					}

					if ($(this).attr('type') == 'radio') {
						var gName = $(this).attr('name');
						if ($("input:radio[name='" + gName + "']").is(":checked")) {
							$(this).parents('div.field').removeClass('validation-error')
								.find('div.field-error')
								.html('');
						} else {
							$(this).parents('div.field')
								.addClass('validation-error')
								.find('div.field-error')
								.html($(this).attr('alt'));
							errors++;
						}
					} else {
						var fData = $(this).val();
						if ($(this).attr('type') === 'month') {
							fData = self.convertDate(fData);
						}
						myObj.Classes = $(this).attr('class');
						myObj.Data = fData;

						if (!$(this).hasClass('dont-validate')) {
							valObj.push(myObj);
						}
					}

				});
				// console.log(fields)

				$.ajax({
					type: "POST",
					url: "services/BuyatabWS.asmx/Validate",
					data: "{validation_group:" + JSON.stringify(valObj) + "}",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function(data) {
						var d = data.d;
						$.each(d, function(i, element) {
							if (!self.fieldValidation(fields[i],
								element.Success,
								element.Error.ExceptionDetails,
								element.Error.ErrorCode)) {
								errors++;
								$(window).trigger('anaLog', 'groupValidation');
							}
						});
					},
					error: function(e) {
						console.log(e.statusText + ': ' + e.responseText);
					}
				});
			}

			var gError = $(triggeredBy).parents('div.pages-nav').find('div.group-error');

			if (errors > 0) {
				gError.addClass('error-in').html(self.Language.errors.group);
				setTimeout(function() {
					gError.fadeOut('slow', 'swing', function() {
						gError.html('').removeClass('error-in');
						gError.show();
					});
				}, 5200);
			} else {
				gError.removeClass('error-in').html('');
			}

			return (errors > 0) ? false : true;
		},

		// Hides al the pages and then show a specific one
		showPage: function(pageNumber) {
			$(document).trigger('functionIt', 'showPage');
			var self = this,
				myTemplt = $(self.cTemplate),
				lPage = myTemplt.find('#pages > li');

			lPage.hide();
			$(lPage[pageNumber]).show();
			self.currentPage = pageNumber;
			document.location.hash = pageNumber;

			$(window).trigger('showPage', pageNumber);
		},

		// Hides al the subpages and then show a specific one
		showSubpage: function(pageNumber) {
			$(document).trigger('functionIt', 'showSubpage');
			var self = this,
				myTemplt = $(self.cTemplate),
				lPage = $(myTemplt.find('#pages > li')[self.currentPage]).find('ul.fields > li');

			lPage.hide();

			//show with effect
			if (self.direction == 'right') {
				//slide to right
				$(lPage[pageNumber]).show(1, function() {
					$(lPage[pageNumber]).css({
						'right': self.stepWidth * -2
					}).animate({
						'right': 0
					});
				});
			} else {
				// slide to left
				$(lPage[pageNumber]).show(1, function() {
					$(lPage[pageNumber]).css({
						'right': self.stepWidth * 2
					}).animate({
						'right': 0
					});
				});
			}

			//fadeIn
			// $(lPage[pageNumber]).fadeIn('fast');

			//clear error
			$(lPage[pageNumber]).find('div.field').removeClass('validation-error validation-warning');

			//Focus/Select first input of the page
			$(lPage[pageNumber]).find('input[type=text]').first().focus().select();
		},

		// Add the VeriSign Seal to the template
		addSeal: function() {
			$(document).trigger('functionIt', 'addSeal');

			var self = this,
				seal = $('img#verisign').remove().live('click', function() {
					vrsn_splash();
				})
					.live("contextmenu", function(e) {
					return false;
				}),

				seal1 = $('img#verisign1').hide();

			if (self.settings.Merchant.confirmationPage) {
				seal.clone().appendTo('li#cc-info div.pages-nav, li#billing-info div.pages-nav, li#purchaser-info div.pages-nav');
			} else {
				seal.clone().appendTo('li#cc-info div.pages-nav, li#billing-info div.pages-nav');
			}
		},

		// Manipulates buttons
		manipulateButtons: function() {
			$(document).trigger('functionIt', 'manipulateButtons');
			var self = this;

			$('a.button').live('click', function(event) {
				if ($(this).hasClass('back-button')) {
					self.direction = 'left';
				} else {
					self.direction = 'right';
				}
			});

			//page 0, 0
			var toDetail = $('li#get-gcard a.checkcard').live('click', function() {

				$(this).addClass('loading');

				var dad = $('input#gcard_number').parents('div.field'),
					eField = dad.find('div.field-error'),
					jLoader = $('<span />', {
						html: self.Language.dialogs.processing
					}).addClass('ajax-loader'),
					thisButton = $(this),
					gError = thisButton.parents('.pages-nav').find('.group-error');

				if (self.groupValidation($('li#get-gcard'), $('li#get-gcard a.checkcard')) && !$(this).hasClass('dt-inactive')) {

					thisButton.addClass('dt-inactive');
					gError.html(jLoader);

					$.when(self.getCard()).then(function(gCard) {
						var myCard = gCard.d;
						gError.html('');
						thisButton.removeClass('dt-inactive loading');

						if (myCard.Status.Success) {
							self.encriptedId = myCard.EncryptedProductReferenceId; //EncriptedOrderNumber

							$('label#gcard-number div').html('#' + self.cardNumber);
							$('p#gcard-balance span').html(self.getMoney(myCard.Balance.Amount));

							dad.removeClass('validation-error');
							eField.html('');

							self.showPage(0);
							self.showSubpage(1);
						} else {
							dad.addClass('validation-error');
							eField.html(self.Language.errors[myCard.Status.Code]);
						}
					});
				}
			}),

				//page 0, 1
				toCheckcard = $('li#reload-details a.back-button').live('click', function() {
					self.showPage(0);
					self.showSubpage(0);
				}),
				toCheckout = $('li#reload-details a.checkout').live('click', function() {
					if (self.groupValidation($('li#reload-details'), $('li#reload-details a.checkout'))) {
						self.showPage(1);
						self.showSubpage(0);
					}
				}),

				//page 1,0
				backToDetails = $('li#cc-info a.back-button').live('click', function() {
					self.showPage(0);
					self.showSubpage(1);
				}),
				toCheckout2 = $('li#cc-info a.continue-button').live('click', function() {
					if (self.groupValidation($('li#cc-info'), $('li#cc-info a.continue-button'))) {
						self.showPage(1);
						self.showSubpage(1);
					}
				}),

				//page 1,1
				backToCheckout2 = $('li#billing-info a.back-button').live('click', function() {
					self.showPage(1);
					self.showSubpage(0);
				}),
				toCheckout3 = $('li#billing-info a.continue-button').live('click', function() {
					if (self.groupValidation($('li#billing-info'), $('li#billing-info a.continue-button'))) {
						self.showPage(1);
						self.showSubpage(2);
					}
				}),

				//page 1,2
				backToCheckout3 = $('li#purchaser-info a.back-button').live('click', function() {
					self.showPage(1);
					self.showSubpage(1);
				}),

				//Summary
				purchase = $('a.purchase').live('click', function() {
					var thisButton = $(this);

					if( !thisButton.hasClass('dt-inactive') ){
						self.checkout();
					}
				});
		},

		// Fills the summary page with the cart information
		summaryIt: function() {
			$(document).trigger('functionIt', 'summaryIt');
			var self = this,
				cData = self.generateCheckout();

			String.prototype.replaceAt = function(index, character) {
				return this.substr(0, index) + character + this.substr(index + character.length);
			};

			var myNumber = '' + cData.crq.Payment.CCNum + '';
			for (var i = 6; i < 12; i++) {
				myNumber = myNumber.replaceAt(i, '*');
			}

			//Card Information
			var order = parseInt($('input#card_value').val(), 10);

			$('div.cw-order span').html(self.getMoney(self.numberWithCommas(order.toFixed(2))));
			$('div.cw-discount span').html('$0.00').parent().hide(); //hc
			$('div.cw-total span').html(self.getMoney(self.numberWithCommas(order.toFixed(2))));

			//Card Information
			$('div.cw-type span').html(cData.crq.Payment.CCType);
			$('div.cw-number span').html(myNumber);
			$('div.cw-date span').html(cData.crq.Payment.ExpDate);

			//Card Billing Address
			$('div.cw-email span').html(cData.crq.Payment.Email);
			$('div.cw-phone span').html(cData.crq.Payment.Telephone);
			$('div.cw-address span').html(cData.crq.Payment.Address1);
			$('div.cw-city span').html(cData.crq.Payment.City);
			$('div.cw-state span').html(cData.crq.Payment.Region);
			$('div.cw-country span').html($('#cc_country option:selected').text());
			$('div.cw-zip span').html(cData.crq.Payment.PostalZip);
		},

		// get value converted to language (french)
		getMoney: function(value) {
			$(document).trigger('functionIt', 'getMoney');
			var self = this,
				lang = self.settings.Merchant.Language;
			return (lang == 'fr') ? value + ' ' + self.moneySign : self.moneySign + '' + self.numberWithCommas(value);
		},

		// Convert IOS date
		convertDate: function(date) {
			$(document).trigger('functionIt', 'convertDate');
			var dates = date.split('-');
			return dates[1] + '/' + dates[0];
		},

		// format number using "," after 1000 => 1,000
		numberWithCommas: function(x) {
			$(document).trigger('functionIt', 'numberWithCommas');
			var self = this;
			if (self.settings.Merchant.Language == 'fr') {
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			}
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		// Load files and wait until they're fully loaded
		waitLoad: function(files, callback) {
			$(document).trigger('functionIt', 'waitLoad');
			var filesToLoad = 0,
				file,
				obj,
				newStylesheetIndex = document.styleSheets.length - 1;

			for (var index in files) {
				filesToLoad++;

				file = files[index];

				if (getFileType(file) == 'css') {
					appendStylesheet(file);
					newStylesheetIndex++;
					if (!window.opera && navigator.userAgent.indexOf("MSIE") == -1) callCallbackForStylesheet(newStylesheetIndex);
				}

				if (getFileType(file) == 'js') {
					appendScriptAndCallCallback(file);
				}
			}

			function getFileType(file) {
				file = file.toLowerCase();

				var jsIndex = file.indexOf('js'),
					cssIndex = file.indexOf('css');

				if (jsIndex == -1 && cssIndex == -1)
					return false;

				if (jsIndex > cssIndex)
					return 'js';
				else
					return 'css';
			}

			function appendStylesheet(url) {
				var oLink = document.createElement("link");
				oLink.href = url;
				oLink.rel = "stylesheet";
				oLink.type = "text/css";
				oLink.onload = decrementAndCallGlobalCallback;
				oLink.onreadystatechange = function() {
					if (this.readyState == 'loaded' || this.readyState == 'complete') decrementAndCallGlobalCallback();
				};
				document.getElementsByTagName("head")[0].appendChild(oLink);
			}

			function callCallbackForStylesheet(index) {

				try {
					if (document.styleSheets[index].cssRules) {
						decrementAndCallGlobalCallback();
					} else {
						if (document.styleSheets[index].rules && document.styleSheets[index].rules.length) {
							decrementAndCallGlobalCallback();
						} else {
							setTimeout(function() {
								callCallbackForStylesheet(index);
							}, 250);
						}
					}
				} catch (e) {
					setTimeout(function() {
						callCallbackForStylesheet(index);
					}, 250);
				}
			}

			function appendScriptAndCallCallback(url) {
				var oScript = document.createElement('script');
				oScript.type = 'text/javascript';
				oScript.src = url;
				oScript.onload = decrementAndCallGlobalCallback;
				document.getElementsByTagName("head")[0].appendChild(oScript);
			}

			function decrementAndCallGlobalCallback() {
				filesToLoad--;

				if (filesToLoad === 0)
					callback();
			}
		},

		// Check if file exist using serverFile
		checkFile: function(file) {
			$(document).trigger('functionIt', 'checkFile');
			var self = this,
				customFile = self.customPath + file,
				defaultFile = self.defaultPath + file,
				myFile = '';

			self.serverFile(customFile).done(function(response) {
				// console.log(response.d)
				myFile = (response.d) ? customFile : defaultFile;
				// console.log(myFile)
				// return myFile;
			});
			return myFile;
		},

		// Check if file exists using server
		serverFile: function(file) {
			$(document).trigger('functionIt', 'serverFile');

			return $.ajax({
				type: "POST",
				url: "services/BuyatabWS.asmx/FileExists",
				data: "{filename:'/" + file + "'}",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				timeout: 5000
			});
		}
	};

	$.fn.bReload = function(options) {
		return this.each(function() {
			var template = Object.create(Template);

			template.init(options, this);

			$.data(this, 'bReload', template);
		});
	};

	$.fn.bReload.options = {
		iniFile: 'data/ini.json',
		CSSFile: 'css/style.css',
		templateFile: 'template/reload.handlebars',
		mobileTemplate: 'template/mobile.handlebars',
		requestURL: "services/BuyatabWS.asmx/Recharge"
	};

})(jQuery, window, document);