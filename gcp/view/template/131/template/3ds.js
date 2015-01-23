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
	'<header class="cf">',
        '<div class="wrap">',
            '<a id="fsLogo" title="Four Seasons" href="http://www.fourseasons.com/"></a>',
        '</div>',
	'</header>',
	'<div class="parsys iparsys iparTop">',
        '<div class="custom-html section">',
            '<div style="width:0px; height:0px; "></div>',
        '</div>',
        '<div class="parbase fs5-1-header-for-global-pages section">',
            '<div class="mod-banner">',
                '<div class="wrap">',
                    '<div class="left">',
                        '<p class="title tk tk1">Four Seasons Hotels and Resorts </p>',
                        '<h1 class="header tk tk2">Gift Cards </h1>',
                    '</div>',
                    '<p class="right tk tk1"></p>',
                '</div>',
            '</div>',
        '</div>',
        '<div class="section">',
            '<div class="new"></div>',
        '</div>',
        '<div class="iparys_inherited">',
            '<div class="parsys iparsys iparTop"></div>',
        '</div>',
	'</div>',
	'<div class="content">',
		'<div class="wrap wrap-bg">',
			'<iframe id="buyatab-frame" src="{{{src}}}" width="100%" frameborder="0" scrolling="no" scrolling="no"></iframe>',
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