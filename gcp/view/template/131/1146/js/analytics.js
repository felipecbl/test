/*

Merhant Id: 1146 Four Seasons eCard Desktop

Distintion must be understood between 1146 and the eCard Analytics 1148.
Four the 'Customize' case the value for s_fsh.eVar30 should be "regular" for plastic and "Instant" for eCard.

*/
(function () {

    $(window).on('hashchange load scriptLoaded', function () {
        var page = document.location.hash.substring(1) || 'customize';

        switch (page) {
            case 'customize':
            //2. Customize Card
            s.prop2 = "en";
            s.hier1 = "fs,giftcard,customize card";
            s.channel = "giftcard";
            s.pageName = "fs:giftcard:customize card";
            s.events = "event31";
            s.eVar30 = "instant";
            break;
            case 'checkoutpage':
            //5. Payment Details
            s.prop2 = "en";
            s.hier1 = "fs,giftcard,payment details";
            s.channel = "giftcard";
            s.pageName = "fs:giftcard:payment details";
            s.events = "event32";
            break;
            default: //Unexpected Result
            //Initial Page
            s.prop2 = "en";
        }

        if (typeof (s_local_onPage) == 'function') {
            s_local_onPage();
        }

        s.t();

    });


$(window).on('analyticsDetails', function (event, data) {
    var productsString = '';

    $.each(data.crq.Cart.CartCards, function (index, val) {
        var coma = (index == data.crq.Cart.CartCards.length) ? '' : ',',
            on = data.OrderNumber.substring(0, 20);

        productsString += ';GC' + val.Amount + ';;;event35=' + val.Quantity + '|event36=' + (val.Amount * val.Quantity) + coma;
    });

    s.prop2 = data.crq.Language;
    s.hier1 = 'fs,giftcard,confirmation';
    s.channel = 'giftcard';
    s.pageName = 'fs:giftcard:confirmation';
    s.events = 'event34:' + data.OrderNumber + ',event35:' + data.OrderNumber + ',event36:' + data.OrderNumber;
    s.products = productsString;
    s.currencyCode = 'USD';
    s.eVar50 = 'giftcard:' + data.OrderNumber;

    if (typeof (s_local_onPage) == 'function') {
        s_local_onPage();
    }

    s.t();

});

if (navigator.appVersion.indexOf('MSIE') >= 0) document.write(unescape('%3C') + '\!-' + '-');
})();