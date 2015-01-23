(function() {

window.App = {
	Models: {},
	Collections: {},
	Views: {}
};

window.uTemplate = function(id) {
	return _.template( $('#' + id).html() );
};

 _.templateSettings = {
    evaluate    	: /\{\{=(.*?)\}\}/g,
    escape 			: /\{\{-(.*?)\}\}/g,
	interpolate     : /\{\{\{(.*?)\}\}\}/g
 };

App.Models.Card = Backbone.Model.extend({
	defaults: {
		StyleID: "1",
		Amount: 50,
		Quantity: 1,
		CardImg: "images/card.png",
		Message: "Hi there, you are really awesome!",
		MerchantId: 123,
		Delivery: {
			DeliveryDate: "1/1/2013",
			DeliveryType: "Email",
			Person: [
				{
					Type: "Recipient",
					Name: "",
					Email: "",
					FB: ""
				},
				{
					Type: "Sender",
					Name: "", 
					Email: "",
					FB: ""
				}
			]
		}
	}
});

App.Collections.Cart = Backbone.Collection.extend({
	model: App.Models.Card
});

App.Views.Cart = Backbone.View.extend({
	// tagName: 'ul',

	initialize: function() {
		this.collection.on('change', this.render, this);
		this.collection.on('add', this.addOne, this);
	},

	render: function() {
		// this.collection.each(this.addOne, this);

		console.log(this.collection.toJSON());
		return this;
	},

	addOne: function(card) {
		var cardView = new App.Views.Card({ model: card });

		this.$el.append(cardView.render().el);
	}
});

App.Views.Card = Backbone.View.extend({
	tagName: 'li',

	template: uTemplate('cardTemplate'),

	initialize: function() {
		this.model.on('change', this.render, this);
		this.model.on('destroy', this.remove, this);
	},

	events: {
		'click .edit': 'editCard',
		'click img': 'editCard2',
		'click .delete': 'destroy'
	},

	editCard: function(e) {
		this.model.set( App.submit() );
		this.render();
	},

	editCard2: function(e) {
		App.prepareEditing(this);
	},

	destroy: function() {
		var deleteCard = confirm('Do you really want to delete this card?');
		if (deleteCard){
			this.model.destroy();
			// console.log(this.model.toJSON());
		}
	},

	remove: function() {
		this.$el.remove();
	},

	render: function() {
		var uTemplate = this.template( this.model.toJSON() );

		this.$el.html(uTemplate);
		// console.log(this.model.toJSON());
		return this;
	}
});

App.Views.AddCard = Backbone.View.extend({
	el: '#buyatabContent',

	events: {
		'click a.add-to-cart': 'submit'
	},

	submit: function(e) {
		e.preventDefault();

		var card = new App.Models.Card( App.submit() );
		this.collection.add(card);
		App.resetFields();
	}
});

App.submit = function(){
		var card = new App.Models.Card(),
			tempObj = card.toJSON();

		tempObj.StyleID = $('input#card_design').val();
		tempObj.Amount = $('input#card_value').val().replace(/ \$/g, '');
		tempObj.Quantity = $('input#card_quantity').val();
		tempObj.CardImg = $('input#card_src').val().replace('medium', 'small')
		tempObj.Message = $('textarea').val();
		tempObj.MerchantId = window.getId();
		tempObj.Delivery.DeliveryType = $('input#delivery_type').val();
		tempObj.Delivery.DeliveryDate = $('li#delivery-info li.validate input#email_delivery_date').val();
		tempObj.Delivery.Person[0].Name =  $('li#delivery-info li.validate input[name$="recipient_name"]').val();
		tempObj.Delivery.Person[0].Email = $('li#delivery-info li.validate input[name$="recipient_email"]').val();
		tempObj.Delivery.Person[0].FB = ""; //unfinished
		tempObj.Delivery.Person[1].Name =  $('li#delivery-info li.validate input[name$="from_name"]').val();
		tempObj.Delivery.Person[1].Email = $('li#delivery-info li.validate input[name$="from_email"]').val();
		tempObj.Delivery.Person[1].FB = ""; //unfinished
		return tempObj;
}
App.prepareEditing = function( view ){
	var myCard = view.model.attributes,
		deliveryType = myCard.Delivery.DeliveryType

	console.log(myCard)

	$('input#card_design').val(myCard.StyleID);
	$('input#card_value').val(myCard.Amount);
	$('input#card_quantity').val(myCard.Quantity);
	$('input#card_src').val(myCard.CardImg.replace('small', 'medium'))
	$('textarea').val(myCard.Message);

	$('input#delivery_type').val(deliveryType);

	if(deliveryType == 'email'){
		$(window).trigger('externalMove', 'email')
	}
	console.log( $('input#delivery_type').val() )
	$('li#delivery-info li.validate input#email_delivery_date').val(myCard.Delivery.DeliveryDate);
	$('li#delivery-info li.validate input[name$="recipient_name"]').val(myCard.Delivery.Person[0].Name);
	$('li#delivery-info li.validate input[name$="recipient_email"]').val(myCard.Delivery.Person[0].Email);
	$('li#delivery-info li.validate input[name$="from_name"]').val(myCard.Delivery.Person[1].Name);
}

App.resetFields = function(){
	$('input, textarea').val('');
}

var CartCollection = new App.Collections.Cart();

var addCardView = new App.Views.AddCard({ collection: CartCollection });

var cartView = new App.Views.Cart({ collection: CartCollection });

$('ul#cards').html(cartView.render().el);

// console.log( CartCollection.toJSON() )

})();