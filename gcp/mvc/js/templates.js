Partials = {};

template = [
	"<h1> {{title}} </h1>",
	"{{> field value}}",
	"{{> field name}}",
	"{{> field email}}",
	"{{> field phone}}"
].join("\n");

MVCTemplate = [
	"<h1> {{title}} </h1>",
	"{{> textField value}}",
	"{{> nav send}}",
	"{{> response response}}"
].join("\n");

Partials.field = [

	"<div class='field'>",
		"<div class='field-left'>",
			"<div>",
				"<label for='{{{id}}}'> {{{label}}} </label>",
			"</div>",
			"<div class='field-error'></div>",
		"</div>",
		"<div class='field-right'>",
			"<div class='input-holder'>",
				"<input type='{{{type}}}' name='{{{id}}}' id='{{{id}}}' class='{{{classes}}}' placeholder='{{{placeholder}}}'/>",
			"<div class='field-detail'> {{{detail}}} </div>",
			"</div>",
			"<div class='values-wrap'>",
			"</div>",
		"</div>",
	"</div>"
].join("\n");

Partials.textField = [

	'<div class="field">',
		'<label for="{{{id}}}"> {{{label}}} </label>',
		'<div class="input-wrapp">',
			'<input name="{{{id}}}" id="{{{id}}}" type="text" />',
		'</div>',
		'<div><span class="field-error"></span></div>',
	'</div>'
].join("\n");

Partials.nav = [
		'<nav><a href="#" class="button {{{action}}} ">{{{label}}}</a></nav>'
].join("\n");

Partials.response = [
		'<div class="response"></div>'
].join("\n");

