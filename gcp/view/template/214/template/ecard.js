window.ecard.template = {
	_header:[
		// '<header class="no-printing">',
		// 	'<div class="user-nav">',
		// 		'<div class="container">',
		// 			'<ul id="tool-bar">',
		// 				'<li><a href="{{{merchant.supportEmail}}" id="tb-support">{{{support.label}}}</a></li>',
		// 				'{{#if options.buyNew}}',
		// 					'<li><a href="{{{options.BuyNewUrl}}}" id="tb-buy">{{{options.label.buy_new}}}</a></li>',
		// 				'{{/if}}',
		// 				'{{#if options.reload}}',
		// 				'<li><a href="{{{options.ReloadUrl}}}" id="tb-buy">{{{options.label.reload}}}</a></li>',
		// 				'{{/if}}',
		// 			'</ul>',
		// 		'</div>',
		// 	'</div>',
		// '</header>'
	].join('\n'),

	_footer:[
		'<footer>',
			'<div class="container">',
				'<div class="support center">{{{support.description}}} Customer Support: <a href="tel:{{{merchant.supportPhone}}}">{{{merchant.supportPhone}}}</a> Reference number: {{{card.reference}}}</div>',
				'<div class="logos">',
					'<a href="https://www.buyatab.com" class="logo buyatab"></a>',
				'</div>',
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
		
		_regular2:[
			'<div id="card"{{#if card.photo}} class="photo {{card.orientation}} "{{/if}}>test</div>'
		].join('\n'),
		
		_regular:[
			'<div id="card"{{#if card.photo}} class="photo {{card.orientation}} "{{/if}}>',
				'<div class="card-wrapper">',
					'<figure class="large">',
						'<img data-adaptive-background="1" cross-origin="anonymous" class="card-image large" src="{{{card.imgUrl}}}">',
						'{{#if card.photo}}',
							'<img class="banner large {{{card.orientation}}}" src="{{{merchant.server}}}{{{merchant.chainId}}}/photo/big-{{{card.orientation}}}.png">',
						'{{/if}}',
					'</figure>',
				'</div>',
				'<div class="amount center">${{{card.amount}}}</div>',
				// '<div class="amount center">{{{curr merchant.language card.amount }}}</div>',
				'<div class="message">{{{card.message}}}</div>',
			'</div>'
		].join('\n')
	},

	_instructions:[
		'<div class="how-use no-printing">',
			'<h2>{{{instructions.title_txt}}}</h2>',
			'<ul>',
				'<li>',
					'<div class="option number">1</div>',
					'<div class="title-descripton">',
						'<h3>{{{instructions.title.mobile}}}</h3>',
						'<span>{{{instructions.description.mobile}}}</span>',
					'</div>',
				'</li>',
				// '<li>',
				// 	'<div class="option number">2</div>',
				// 	'<div class="title-descripton">',
				// 		'<h3>{{{instructions.title.passbook}}}</h3>',
				// 		'<span>{{{instructions.description.passbook}}}</span>',
				// 	'</div>',
				// '</li>',
				'<li>',
					'<div class="option number">2</div>',
					'<div class="title-descripton">',
						'<h3>{{{instructions.title.print}}}</h3>',
						'<span>{{{instructions.description.print}}}</span>',
					'</div>',
				'</li>',
			'</ul>',
		'</div>'
	].join('\n'),

	_actions:[
		'<div class="actions no-printing">',
			'<a class="button" id="action-bookmark" title="{{{actions.description.bookmark}}}" href="#" rel="sidebar">{{{actions.label.bookmark}}}</a>',
			'<a class="button" id="action-passbook" title="{{{actions.description.passbook}}}" href="{{{merchant.passbookUrl}}}" rel="sidebar">{{{actions.label.passbook}}}</a>',
			'<a class="button" id="action-print" title="{{{actions.description.print}}}" href="Javascript:window.print()">{{{actions.label.print}}}</a>',
		'</div>'
	].join('\n'),

	_note:[
		'{{#if merchant.note}}',
			'<div id="note">{{{merchant.note}}}</div>',
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
				'<div class="card-number">{{{card.ecard}}}</div>',
			'{{/unless}}',
			'<div class="pin"><span>PIN: </span>{{{card.pin}}}</div>',
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