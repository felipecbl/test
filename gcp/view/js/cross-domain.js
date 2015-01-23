$(function(){
    var gcpHeight,

    iframe = $( 'iframe#buyatab-iframe' );
    $.receiveMessage(function(e){

        var h = Number( e.data.replace( /.*gcpHeight=(\d+)(?:&|$)/, '$1' ) );

        if ( !isNaN( h ) && h > 0 && h !== gcpHeight ) {
            // Height has changed, update the iframe.
            iframe.animate({
                height: gcpHeight = h
            })
        }

    // An optional origin URL (Ignored where window.postMessage is unsupported).
    }/*, 'https://buyatab.com'*/ );

    $(window.parent).scroll(function(){
        var parentScroll = {top: $(window).scrollTop()}
        $.postMessage( parentScroll, $(iframe).attr('src') , iframe.get(0).contentWindow );
        // $.postMessage( parentScroll, 'http://plastic.buyatab.com/gcp/' , iframe.get(0).contentWindow );
    });
});