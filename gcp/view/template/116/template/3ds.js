// window.treeds.template = {
	// 	_header: [
	// 		'<header>default header</header>'
	// 	].join('\n'),
	// 	_body: [
	// 		'<iframe id="buyatab-iframe"></iframe>'
	// 	].join('\n'),
	// 	_footer: [
	// 		'<footer>default footer</footer>'
	// 	].join('\n')
	// };

window.treeds = {};
window.treeds.template = [
	'<header>',
        '<div class="wrap">',
            '<a id="logo" title="Keg Steakhouse" href="https://kegsteakhouse.com/"></a>',
        '</div>',
	'</header>',
	'<div class="content">',
		'<div class="wrap wrap-bg">',
			'<iframe id="buyatab-frame" src="{{{src}}}" width="100%" frameborder="0" scrolling="no"></iframe>',
		'</div>',
	'</div>',
	'<footer>',
		'<div class="wrap">',
			'<div class="support center"> Customer Support: 1-888-267-0447</br> Buyatab Online Inc. All Rights Reserved </div>',
			'<div class="logos">',
				'<a class="logo buyatab" href="https://www.buyatab.com"></a>',
			'</div>',
		'</div>',
	'</footer>'
].join('\n');