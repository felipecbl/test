window.ecard.template = {
	_header:[
		'<header class="no-printing"> <div class="container"><a class="logo" href="http://www.spafinder.ca/" target="_blank"></a><a class="link" href="http://www.spafinder.ca/" target="_blank">spafinder.ca</a></div></header>'
	].join('\n'),

	_footer:[
		'<footer>',
			'<div class="container">',
				'<p><b>PARTNER REDEMPTION INSTRUCTIONS: eGift Cards MUST be redeemed BEFORE providing a service. </br>eGift Cards MUST be redeemed BEFORE providing a service.</b> To redeem Spafinder Wellness 365 eGift Cards, you must call our redemption line at 877-803-0684 or log in to your Spafinder Wellness Partner account with your login and password and follow the instructions. Any unused balance may be issued to the customer in your own gift certificates or store credit except as otherwise required by applicable law. </p>',
				'<p><b>INSTRUCTIONS DE RÉDEMPTION POUR LES PARTENAIRES: Les cartes cadeaux doivent être rachetées AVANT de fournir un service.</b> Les cartes cadeaux doivent être rachetées avant de fournir un service. Pour échanger les cartes cadeaux Spafinder Wellness 365, vous devez appeler notre ligne de rachat au 877-803-0684 ou se connecter à votre compte Spafinder Wellness Partner avec votre nom d’utilisateur et mot de passe et suivez les instructions. Tout solde non utilisé peut être délivré au client dans votre propre certificats-cadeaux ou crédit de magasin, sauf si autrement requis par la loi applicable.</p>',
				// '<div class="support">{{{support.description}}} Customer Support: <a href="tel:{{{merchant.supportPhone}}}">{{{merchant.supportPhone}}}</a> Reference number: {{{card.reference}}}</div>',
				// '<div class="logos">',
				// 	'<a href="https://www.buyatab.com" class="logo buyatab"></a>',
				// '</div>',
			'</div>',
		'</footer>'
	].join('\n'),

	_card:{
		_animated:[
			'{{#ifCond card.animation.type 3}}',
				'<div id="card"{{#if card.photo}} class="photo {{card.orientation}} "{{/if}}>',
					'<div class="card clickable animation{{card.animation.type}} {{#if card.animation.cardAsEnclosure}} card-as-enclosure {{/if}}">',
						'<div class="tile front index2">',
							'<div class="tile outside" style="background: url({{#if card.animation.cardAsEnclosure}} {{{card.imgUrl}}} {{else}}{{{files.frontOut}}}{{/if}}) no-repeat left top;"></div>',
							'<img class="printing-only" src="{{#if card.animation.cardAsEnclosure}} {{{card.imgUrl}}} {{else}}{{{files.frontOut}}}{{/if}}" style="display: none;" />',
							'<div class="tile inside" style="background: url({{{files.frontIn}}}) no-repeat left top;">',

								'<div class="message-wrapper">',
									'<div class="message">',
										// '<div class="to-from-group">',
										// 	'<div class="to-from center">To: {{{card.recipientName}}}</div>',
										// 	'<div class="to-from center">From: {{{card.senderName}}}</div>',
										// '</div>',
										'{{{card.message}}}',
									'</div>',
								'</div>',

								'<div class="card-wrapper">',
									'<figure class="small">',
										'<img class="card-image small" src="{{{merchant.server}}}{{{merchant.chainId}}}/ecard/card.png">',
										'{{#if card.photo}}',
											'<img class="banner small {{{card.orientation}}}" src="{{{merchant.server}}}{{{merchant.chainId}}}/photo/big-{{{card.orientation}}}.png">',
										'{{/if}}',
									'</figure>',
								'</div>',
								'<div class="amount center">${{{card.amount}}}</div>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'{{else}}',
				'<div id="card"{{#if card.photo}} class="photo {{card.orientation}} "{{/if}}>',
					'<div class="card clickable animation{{card.animation.type}} {{#if card.animation.cardAsEnclosure}} card-as-enclosure {{/if}}">',
						'<div class="tile front index2">',
							'<div class="tile outside" style="background: url({{#if card.animation.cardAsEnclosure}} {{{card.imgUrl}}} {{else}}{{{files.frontOut}}}{{/if}}) no-repeat left top;"></div>',
							'<div class="tile inside" style="background: url({{{files.frontIn}}}) no-repeat left top;">',
								'<p class="message">{{{card.message}}}</p>',
							'</div>',
						'</div>',
						'<div class="tile in-bottom" style="background: url({{{files.backIn}}}) no-repeat left top;">',
							'<div class="card-wrapper small">',
								'<figure class="small">',
									'<img class="card-image small" cross-origin="anonymous" src="{{{card.imgUrl}}}">',
									'{{#if card.photo}}',
										'<img class="banner small {{{card.orientation}}}" src="{{{merchant.server}}}{{{merchant.chainId}}}/photo/big-{{{card.orientation}}}.png">',
									'{{/if}}',
								'</figure>',
							'</div>',
							'<div class="amount center">${{{card.amount}}}</div>',
						'</div>',
					'</div>',
				'</div>',
			'{{/ifCond}}'

		].join('\n'),
		
		_regular:[
			'<div class="card-header"></div>',
			'<div id="card"{{#if card.photo}} class="photo {{card.orientation}} "{{/if}}>',
				'<div class="card-wrapper">',
					'<figure class="large">',
						'<img data-adaptive-background="1" cross-origin="anonymous" class="card-image large" src="{{{card.imgUrl}}}">',
					'</figure>',
					'<div class="recipient-message">',
						// '<span><b>To: </b>{{{card.recipientName}}}</span></br></br>',
						// '<span><b>From: </b>{{{card.senderName}}}</span></br></br>',
						'<span>Amount/Montant</br><sup>$</sup><b>{{{card.amount}}}/{{{card.amount}}}</b><sup>$</sup></span>',
						// '<span><b>Mesage: </b>{{{card.message}}}</span>',
					'</div>',
				'</div>',
			'</div>'
		].join('\n')
	},

	_instructions:[
		'<div class="how-use no-printing">',
			'<h2>Please present this eGift Card before your service.</h2>',
			'<p>Find locations at <a href="http://www.spafinder.ca/readytospa" target="_blanc">spafinder.ca/readytospa</a> or 1.800.255.7727</p>',
			'<h2>S’il vous plaît présentez votre carte cadeau électronique avant votre service.</h2>',
			'<p>Trouvez les lieux à <a href="http://www.spafinder.ca/readytospa" target="_blanc">spafinder.ca/readytospa</a> ou 1.800.255.7727</p>',
		'</div>'
	].join('\n'),

	_actions:[
		// '<div class="actions no-printing">',
		// 	'<a class="button" id="action-bookmark" title="{{{actions.description.bookmark}}}" href="#" rel="sidebar">{{{actions.label.bookmark}}}</a>',
		// 	'<a class="button" id="action-passbook" title="{{{actions.description.passbook}}}" href="{{{merchant.passbookUrl}}}" rel="sidebar">{{{actions.label.passbook}}}</a>',
		// 	'<a class="button" id="action-print" title="{{{actions.description.print}}}" href="Javascript:window.print()">{{{actions.label.print}}}</a>',
		// '</div>'
	].join('\n'),

	_note:[
		'{{#if merchant.note}}',
			// '<div id="note"><p>WaySpa gift certificates are the perfect reward to help anyone relax.  With the WaySpa gift certificate you can choose the treatment that is right for you. Unwind from the stresses of everyday life with your choice of experiences.  With thousands of spas and products to choose from, WaySpa.com is the Smart Way To The Spa.</p></div>',
			// '<div id="note">{{{merchant.note}}}</div>',
			'<div id="note">Present gift card before service. Single use only. Cards never expire. Additional terms and conditions can be found at http://www.spafinder.ca/about/terms_giftcertificates.jsp</div>',
			'<div id="note">Présentez la carte cadeau avant le service. Usage unique seulement. Les cartes n’expirent jamais. Termes et conditions supplémentaires peuvent être trouvés à http://www.spafinder.ca/about/terms_giftcertificates.jsp</div>',
		'{{/if}}'
	].join('\n'),

	_options:[
		'<div class="card-options no-printing">',
			'<h2>{{{options.title}}}</h2>',
			'<ul>',
				'{{#if options.reload}}',
					'<li id="co-reload"> <a title="{{{options.description.reload}}}" href="{{{options.reloadUrl}}}" target="_blank"><span class="fa-stack fa-lg"><i class="fa fa-repeat"></i><span>{{{options.label.reload}}}</span></span></a> </li>',
				'{{/if}}',
				'{{#if options.buyNew}}',
					'<li id="co-buynew"> <a title="{{{options.description.buy_new}}}" href="{{{options.buyNewUrl}}}" target="_blank"><span class="fa-stack fa-lg"><i class="fa fa-credit-card"></i><span>{{{options.label.buy_new}}}</span></span></a> </li>',
				'{{/if}}',
				'{{#if options.reGift}}',
					'<li id="co-regift"> <a title="{{{options.description.regift}}}" href="#"><span class="fa-stack fa-lg"><i class="fa fa-gift"></i><span>{{{options.label.regift}}}</span></span></a> </li>',
				'{{/if}}',
				'{{#if options.thank}}',
					'<li  id="co-thank"> <a title="{{{options.description.thank}}}" href="#"><span class="fa-stack fa-lg"><i class="fa fa-thumbs-up"></i><span>{{{options.label.thank}}}</span></span></a> </li>',
				'{{/if}}',
				'{{#if card.animation.link}}',
					'<li  id="co-animation"> <a title="{{{options.description.animation}}}" href="#"><span class="fa-stack fa-lg"><i class="fa fa-play"></i><span>{{{options.label.animation}}}</span></span></a> </li>',
				'{{/if}}',
			'</ul>',
		'</div>'
	].join('\n'),


	_barcode:['<div id="bar-wrap"><canvas id="barcode" width=1 height=1 style="border:1px solid #fff;visibility:hidden"></canvas><div class="barcode-number">{{{card.barcode}}}</div><div id="barcode_instructions">{{{card.barcode_zoom}}}</div></div>'].join('\n'),
	// _barcode:['<div id="bar-wrap"><canvas id="barcode" height="80" width="460" style="display: inline;"></canvas><div id="barcode_instructions">{{{card.barcode_zoom}}}</div></div>'].join('\n'),

	_numbers:[
		'<div id="card-numbers">',
			'{{#unless merchant.barcode}}',
				'<div class="card-number"><span>Gift Certificate ID: </span>{{{card.ecard}}}</div>',
			'{{/unless}}',
			'<div class="pin"><span>Security Code (PIN): </span>{{{card.pin}}}</div>',
		'</div>'
	].join('\n'),

	_lightbox:{
		_thank:[
			'<div class="form-wrapper">',
				'<p>{{{form.description.thank}}}</p>',
				'<div class="field">',
					'<div class="field-left">',
						'<label id="subject_label" for="subject">{{{form.label.subject}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<input id="subject" data-validation="true" class="input-title" type="text" placeholder="{{{form.placeholder.subject}}}" data-validation-type="required name" data-validation="true" value="" name="subject">',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',
				'<div class="field">',
					'<div class="field-left">',
						'<label id="message_label" for="message">{{{form.label.message}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<textarea  rows="10" data-validation="true" cols="30" id="message" class="input-title" type="text" placeholder="{{{form.placeholder.message}}}" data-validation-type="required" data-validation="true" name="message"></textarea>',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',
			'</div>'
		].join('\n'),

		_regift:[
			'<div class="form-wrapper">',
				'<p>{{{form.description.regift}}}</p>',

				'<div class="field">',
					'<div class="field-left">',
						'<label id="name_label" for="name">{{{form.label.name}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<input id="name" data-validation="true" class="input-title" type="text" placeholder="{{{form.placeholder.name}}}" data-validation-type="required name" data-validation="true" name="subject">',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',

				'<div class="field">',
					'<div class="field-left">',
						'<label id="email_label" for="email">{{{form.label.email}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<input id="email" data-validation="true" class="input-title" type="text" placeholder="{{{form.placeholder.email}}}" data-validation-type="required email" data-validation="true" name="subject">',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',

				'<div class="field">',
					'<div class="field-left">',
						'<label id="your_email_label" for="your_email">{{{form.label.your_email}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<input id="your_email" data-validation="true" class="input-title" type="text" placeholder="{{{form.placeholder.your_email}}}" data-validation-type="required email" data-validation="true" name="subject">',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',

				'<div class="field">',
					'<div class="field-left">',
						'<label id="message_label" for="message">{{{form.label.message}}}</label>',
					'</div>',
					'<div class="field-right">',
						'<textarea  rows="10" data-validation="true" cols="30" id="message" class="input-title" type="text" placeholder="{{{form.placeholder.message}}}" data-validation-type="required" data-validation="true" name="message"></textarea>',
						'<span class="error-message"></span>',
					'</div>',
				'</div>',
			'</div>'
		].join('\n')
	}
};