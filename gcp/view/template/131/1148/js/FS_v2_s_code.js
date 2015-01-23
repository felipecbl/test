/* SiteCatalyst code version: H.22.1.
 * Copyright 1996-2011 Adobe, Inc. All Rights Reserved
 * More info available at http://www.omniture.com 
 *
 * Four Seasons Omniture, provided by http://www.roilabs.com

 * This file is currently a separate global instance for subdomains
 * such as MAG and PP.  Eventually this should be merged with the 
 * global CQ5 s_code.js
*/


/************************** CONFIG SECTION **************************/
var s_account = (typeof(s_account)!='undefined')?s_account:'fshdev';

var s=s_gi(s_account);

// PLEASE UPDATE WITH EACH CHANGE TO THIS .JS FILE - yyyy.mm.dd
s.lastUpdateGlobal = 'glo_s:2013.10.07'; // Updater: ACR.josh


// Optimizely SiteCatalyst Integration
window.optimizely = window.optimizely || [];
window.optimizely.push("activateSiteCatalyst");

/* You may add or alter any code config here. */
s.charSet="UTF-8";
s.currencyCode = (typeof s.currencyCode != 'undefined') ? s.currencyCode : "USD";

/* Link Tracking Config */
s.trackDownloadLinks=true;
s.trackExternalLinks=true;
s.trackInlineStats=true;
s.linkDownloadFileTypes="exe,zip,wav,mp3,mov,mpg,avi,wmv,pdf,doc,docx,xls,xlsx,ppt,pptx";
s.linkInternalFilters="javascript:,buyatab.com,fourseasons.com,fourseasons.cn,revistafourseasons.com.br,fourseasonsmagazine.com,travelnotesfourseasons.ru,travelnotesfourseasons.com,fourseasonstravelnotes.ru,fourseasonstravelnotes.com,maticesfourseasons.com,paceuat.com";
s.linkLeaveQueryString=false;

// Dynamic accounts (global default):
s.dynamicAccountSelection = true;
s.dynamicAccountList = "fshdev=dev1.fourseasons.com;fshdev2=dev2.fourseasons.com;fshstage1=stage1.fourseasons.com";

// List of campaign URL parameters, in weighted order
s.campaignParams = ['ep_mid', 'sm_id', 'source', 'roie', '_s_ref', 'src', 'bnr', 'emp', 'fb_ref'];

s.events = (s.events) ? s.events : '';

/**** Time Parting config ****/
// Grab the year, depending on the browser
s.currentDate = new Date();
s.TPappVers = parseInt(navigator.appVersion, 10);
s.TPappName = navigator.appName;
if((s.TPappVers == '2' || s.TPappVers == '3') && (s.TPappName == 'Netscape' || s.TPappName == 'Microsoft Internet Explorer')) {
	s.TPyear = s.currentDate.getYear();
	if (s.TPyear >= 100 && s.TPyear <= 1999) {
		s.TPcurrentYear=s.TPyear + 1900;
	} else {
		s.TPcurrentYear=s.TPyear;
	}
} else {
	s.TPcurrentYear = s.currentDate.getFullYear();
}
s.dstStart="1/1/" + s.TPcurrentYear;
s.dstEnd="1/1/" + s.TPcurrentYear;
s.currentYear=s.TPcurrentYear;
/**** End Time Parting config ****/

/* Local s_code.js config overrride */
if(typeof s_local_config == 'function') {
  s_local_config();
}

/********** s_doPlugins *******************************************************/
// This gets executed every s.t(l) call
s.usePlugins=true;
function s_doPlugins(s) {
    if (!s.linkTrackVars) s.linkTrackVars = "prop70,prop71,prop72,prop73,prop74,eVar74,pageName,eVar2,eVar3,eVar7,eVar10,eVar11,eVar12,eVar14,prop20,eVar20,eVar28,eVar32,eVar33,prop49,prop50";
    if (!s.linkTrackEvents) s.linkTrackEvents="None";
    

    // Check for new design vs old
    if(typeof CQ_Analytics == 'object')
    {
        // Do whatever Dave says to do.
    }

  s.tnt = s.trackTNT();
	    
	// Run site-specific defaults, if applicable
	if(typeof s_local_doPlugins == 'function') {
		s_local_doPlugins();
	}
	

  /* flag residence */ 
/* might need this, if fs doesn't add
  if (s.channel && s.inList('fsh-fsres',s_account,',') ) {
    s.channel=s.channel+'|Res';
	}
*/

	// Grab the domain
	if (!s.server) s.server = "www.fourseasons.com";
    
    // Grab the RSID
    s.prop49 = s.un;
	
	// Grab the previous page
    // bandaid for gc tracking
    if ( location.host.indexOf("buyatab.com")==-1 ) {

    	s.prevPage=s.getPreviousValue(s.pageName,'s_fsh_c7'); // legacy cookie name
    	if(s.prevPage) { 
    		s.prop7 = s.prevPage;
    	}

    }	

	// Grab the entry page (set as first value attrib in interface)
	s.eVar4 = s.pageName;
	
	// New vs Returning users:
  if (!s.prop14) {
    // bandaid for gc tracking
    if ( location.host.indexOf("buyatab.com")==-1 ) {
	    s.prop14 = s.getNewReturning().toLowerCase();
    }
	}
	// Page Consumption
	s.eVar15 = '+1';
	
	// Internal Search
	if(typeof s.prop17 != 'undefined' && s.prop17 != '') {
		
		// Lowercase this bad boy
		s.prop17 = s.prop17.toLowerCase();
		
		// Set an event showing we had a search
		s.events = s.apl(s.events, 'event15',',', 2);
	
		// search count
		s.eVar18 = '+1';
		
		// Finally, grab the Referrer
		s.prop19 = s.prevPage;
		
	}
	
	// Set time parting
	s.visEvent=s.getVisitStart("s_fsh_visit"); // legacy cookie name
	s_hour=s.getTimeParting('h','-4').replace(/^0/,'');
	s_day=s.getTimeParting('d','-4');
	s_timepart=s_day+"|"+s_hour;
	s.eVar20 = s.prop20 = s_timepart.toLowerCase();
	
	// Grab campaign variables
	if (!s.campaign) s.campaign = unescape(s.getCampaignValue());
	
	// Grab internal campaign
	if (!s.eVar31) s.eVar31 = s.getQueryParam('_s_icmp');
	if(s.eVar31!='') {
		s.eVar32 = s.prevPage;
	}
	s.eVar54 = s.eVar31;	

	// Now let's play some jenga & stack 'em
    // bandaid for gc tracking
    if ( location.host.indexOf("buyatab.com")==-1 ) {

    	s.eVar34=s.crossVisitParticipation(s.campaign,'v34','365','10','^','',0);
    	s.eVar33=s.crossVisitParticipation(s.eVar31,'v33','365','10','^','',0);

    }	

	// PPC
	if ( unescape(s.getQueryParam('KW_ID')).toLowerCase().indexOf('|pcrid')>-1 )
	  s.eVar36 = unescape(s.getQueryParam('KW_ID'));
			
	// Shoutlet integration 
    if (!s.eVar52) s.eVar52 = s.getQueryParam('shout_id'); 

 // Genesis integration
   if (!s.eVar61) s.eVar61 = s.getQueryParam('ep_rid'); 
	
	/* eCommerce */
	
	// Occupancy Count
	s.prop37 = ((typeof s.prop38 != 'undefined')?parseInt(s.prop38):0) + ((typeof s.prop39 != 'undefined')?parseInt(s.prop39):0);
	
	// Time to arrival
	if(typeof s.prop26 != 'undefined' && s.prop26.match(/\d{4}\-\d{2}\-\d{2}/)) {
		var prop26Date = s.prop26.split('-');	
		var prop29date = Math.floor(((new Date(prop26Date[0], prop26Date[1]-1, prop26Date[2], 0, 0, 0, 0)) - s.currentDate) / 86400000) + 1;
		s.prop29 = String((prop29date > 0) ? prop29date : 0);
	} 	
	// Product info
	if(s.inList('prodView', s.events, ',', ':')) {
		s.events = s.apl(s.events,'event3',',',2);
	}

	
    // Product Pathing
    if(typeof s.products != 'undefined')
		{
        var productsArray = [s.products];
        var productSKUs = [];
        if(s.products.indexOf(',')!==false)
        {
            productsArray = s.products.split(',');
        }
        for(var i=0,l=productsArray.length;i<l;i++)
        {
            var productSplit = s.products.split(';');
            if(productSplit.length > 0 && typeof productSplit[1] != 'undefined')
                productSKUs.push(productSplit[1]);
        }
        s.prop3 = productSKUs.join('|');
    }
	
	// TTC
    // bandaid for gc tracking
    if ( location.host.indexOf("buyatab.com")==-1 ) {

    	if(s.getCookie('ttc')==null) {
    		s.setCookie('ttc', (new Date()).getTime(), 365);
    	}
    	if(s.inList('purchase', s.events, ',', ':')) {		
        // in case of multiple bookings, only pop once
        if (!s.ttc_true) {
          s.ttc = (s.getCookie('ttc')!=null) ? s.getCookie('ttc') : (new Date()).getTime();
    // TODO?: change to shcek if r:[timetamp]
    		  s.eVar5 = (s.ttc=='repeat') ? s.ttc : s.getTimeToConvert(s.ttc,(new Date()).getTime());
    // TODO?: change to save repeat as r:[timestamp]
    		  s.setCookie('ttc', 'repeat', 365);
    		  s.ttc_true = 1;
        }
    	}

    }

	// Event pops based off of eVars/props
	// Form
	if(typeof s.eVar6 != 'undefined' && s.eVar6 != '') {
		s.events = s.apl(s.events, 'event1',',', 2);
	}
	// Site Tool
	if(typeof s.prop9 != 'undefined' && s.prop9 != '') {
		s.events = s.apl(s.events, 'event12',',', 2);
	}
	// Download (manual)?
	if(typeof s.prop13 != 'undefined' && s.prop13 != '') {
		s.events = s.apl(s.events, 'event13',',', 2);
	}
	// Video
	if(typeof s.prop16 != 'undefined' && s.prop16 != '') {
		s.events = s.apl(s.events, 'event14',',', 2);
	}
	// Login
    // bandaid for gc tracking
    if ( location.host.indexOf("buyatab.com")==-1 ) {

    	s.prevProp12 = s.getPreviousValue(s.prop12,'s_fsh_gpv_p12'); // legacy cookie name
    	if(typeof s.prop12 != 'undefined' && s.prop12 != '' && s.prevProp12 == 'no value') {
    		s.events = s.apl(s.events, 'event16',',', 2);
    	}

    }
		
	// Shared/Saved asset
	if(typeof s.eVar19 != 'undefined' && s.eVar19 != '') {
    s.eVar19 = (s.pageName + '|' + s.eVar19).toLowerCase();
		s.events = s.apl(s.events, 'event17',',', 2);
	}

	
/* pp name */
  if (!s.prop28) {
    if ( s.server=='preferredpartners.fourseasons.com' ) {
      if ( s.c_r('s_c28') ) {
        s.prop28 = s.c_r('s_c28');
      }	else {
  		  s.prop28 = '';
      }
    }
  }

/* member type */
  if (!s.prop11) {
    if ( s.server=='preferredpartners.fourseasons.com' ) {
      if ( s.prop28.toLowerCase().indexOf('@fourseasons.com')>-1 ) {
        s.prop11 = 'pp - internal';
      } else {
        s.prop11 = 'preferred partner';
      }
    }
  }
		
	// On page props to eVars
  if (s.channel) s.channel = s.channel.toLowerCase();
	if (s.prop2)       s.eVar2 = s.prop2;
	if (s.prop7)       s.eVar7 = s.prop7;
	if (s.prop9)       s.eVar9 = s.prop9;
	if (s.pageName)   s.eVar10 = s.pageName;
	if (s.prop11)     s.eVar11 = s.prop11;
	if (s.prop12)     s.eVar12 = s.prop12;
	if (s.prop14)     s.eVar14 = s.prop14;
	if (s.prop16)     s.eVar16 = s.prop16;
	if (s.prop17)     s.eVar17 = s.prop17;
	if (s.prop22)     s.eVar22 = s.prop22;
	if (s.prop23)     s.eVar23 = s.prop23;
	if (s.prop26)     s.eVar26 = s.prop26;
	if (s.prop27)     s.eVar27 = s.prop27;
	if (s.prop28)     s.eVar28 = s.prop28;
	if (s.prop29)     s.eVar29 = s.prop29;
	if (s.campaign)   s.eVar35 = s.campaign;
	if (s.prop37)     s.eVar37 = s.prop37;
	if (s.prop38)     s.eVar38 = s.prop38;
	if (s.prop39)     s.eVar39 = s.prop39;
	if (s.purchaseID) s.eVar50 = s.purchaseID;
  if (!s.eVar3) {
	  if (s.channel) {
		  s.eVar3 = s.channel;
    }
	}
	
	// JS Version
  s.lastUpdateLocal = s.lastUpdateLocal || 'no value';
  s.lastUpdateGlobal = s.lastUpdateGlobal || 'no value';
	s.prop50 = s.lastUpdateLocal + '|' + s.lastUpdateGlobal;
	
	/* Auto download link tracking */
	s.url=s.downloadLinkHandler();
	if(s.url){
	
		// Check local file for any 
		if (typeof(s_checkLocalDownloadHandler) == 'function') {
			s.url = s_checkLocalDownloadHandler(s.url);
		}
		s.eVar13 = s.prop13 = s.url.replace(/(f|ht)tps?:\/\//,'');
    s.linkTrackVars = s.apl(s.linkTrackVars,'prop13',',',2);
    s.linkTrackVars = s.apl(s.linkTrackVars,'eVar13',',',2);
    s.linkTrackVars = s.apl(s.linkTrackVars,'events',',',2);
    s.linkTrackEvents = s.apl(s.linkTrackEvents,'event13',',',2);				
		s.events = s.apl(s.events,"event13",",",2);
	} // end auto-download link handling
	
  /* Auto Exit Link tracking */
  s.exit_url=s.exitLinkHandler();
  if(s.exit_url){
    s.linkTrackEvents = s.apl(s.linkTrackEvents,'event27',',',2);				
    s.linkTrackVars = s.apl(s.linkTrackVars,'eVar47',',',2);
    s.linkTrackVars = s.apl(s.linkTrackVars,'events',',',2);
    s.events = s.apl(s.events,"event27",",",2);
    s.eVar47 = s.exit_url;
  }

    // check avail counter eVar
    if(s.inList('event3', s.events, ',', ':')) {
      s.eVar40 = "+1";
	}	

/* internal domain tracking */
  s.eVar51 = s.trackInternalDomain();

	
	
	
/* QA: full URL */
  s.prop70 = location.href||'no url';
/* QA: domain */
  s.prop71 = location.hostname||'no domain';
/* QA: Referring URL */
  s.prop72 = document.referrer||'no referrer';
/* QA: remove old v74 cookie */
 if (s.c_r('v74')) s.c_w('v74','');


} // end s_doPlugins
s.doPlugins=s_doPlugins;

/**
  s_gntpv is a wrapper function to Get New Time Parting Values
	        basically just refreshes the values so that subsequent
					calls that utilize this will have current values instead
					of what was on original page view  
 **/
function s_gntpv () { 
	s.visEvent=s.getVisitStart("s_fsh_visit"); // legacy cookie name
	s_hour=s.getTimeParting('h','+0').replace(/^0/,'');
	s_day=s.getTimeParting('d','+0');
	s_timepart=s_day+"|"+s_hour;
	return s_timepart.toLowerCase();
} // s_gntpv


/** Legacy wrapper functions **/
// These are wrapper functions from previous implementations and serve for 
// backwards compatability in case something fell through the cracks! 
// They have been rewritten internally to pass info to s_track()
function s_trackMultiple(params) {
  s_track(params);
} // end s_trackMultiple

// Download Link Wrapper
function s_downloadLinkTracker(that,filename) {
  s_track([{'eVar13':filename,'prop13':filename,'events':'event13'}],'tl_d',filename);	
} // end s_downloadLinkTracker

// Exit Link Wrapper
function s_exitLinkTracker(that,filename) {
  s_track([{'eVar47':filename,'events':'event27'}],'tl_e',filename);	
} // end s_exitLinkTracker


// Shared/Save asset tracker
function s_shareSaveTracker(that,filename) {
  s_track([{'eVar19':filename,'events':'event17'}],'tl_d',filename);
} // end s_shareSaveTracker

// Upsell wrapper
/**
 s_trackUpsell is a wrapper function for tracking upsell offers

 @param action     string should be 'view' for upsell offer viewed, 'success' if upsell accepted
 @param upsellType string the product sku(s) of the package(s)/room(s) offered (pipe delimited for multiple)
 **/
function s_trackUpsell(action, upsellType) {
  if (typeof(arguments[0])=='undefined') return '';
  if (typeof(arguments[1])=='undefined') var upsellType = 'no value';
  var e = v24 = '';
  action = action.toLowerCase();
	switch(action) {
		case 'view': e = 'event19';	v24 = upsellType;	break;
		case 'success': e = 'event20'; break;
    default: e = false;
	} // end switch action
	if (e) s_track([{'events':e,'eVar24':v24}],'tl_o','Upsell '+action);
} // end s_trackUpsell
/**** end legacy wrapper functions ****/

/************************** PLUGINS SECTION *************************/
/* You may insert any plugins you wish to use here.                 */

s.trackInternalDomain = function(r,c) {
    var s = window.s_fsh||window.s;

    var r = r||(document.referrer.split('/')[2] || '').toLowerCase();
	  var c = c||(document.domain || '').toLowerCase();

    s.internal_domain = {
      'refDomain' : r,
      'curDomain' : c,
      'regex' : '',
      'server' : s.server||'',
      'lIF' : '',
		  'alias' : false,
			'aliases' : {
		    'www.fourseasons.com' : ['www.fourseasons.com','preview.fourseasons.com','www.1.fourseasons.com','secure.fourseasons.com','secure.1.fourseasons.com']
      },
      'returnValue' : ''
		};

    // if there is a referring domain and referring domain is not current domain...
    if ( (s.internal_domain.refDomain!='') && (s.internal_domain.curDomain!=s.internal_domain.refDomain) ) {
      // get list of domains from linkInternalFilters
      s.internal_domain.lIF = (s.linkInternalFilters||'').replace(/javascript:,?/i,'').split(',');
        // for each domain on linkInternalFilters...
        for (var x=0;x<s.internal_domain.lIF.length;x++) {
            // make sure it's not an empty string...
            if (s.internal_domain.lIF[x]=='') continue;
            // make regex based off current domain from lIF (end-of-string matching: same behavior as lIF)
            s.internal_domain.regex = new RegExp(s.internal_domain.lIF[x].replace(/\./g,'\\.')+"$","i");
            // if referring domain matches lIF
            if ( s.internal_domain.refDomain.match(s.internal_domain.regex) ) {
              // if there is a list of aliases for the domain (based on s.server value)
              if (typeof s.internal_domain.aliases[s.internal_domain.server]!='undefined') {
                // for each domain alias...
								var l = s.internal_domain.aliases[s.internal_domain.server].length;
           	    for (var i=0;i<l;i++) {
                  // if the referring domain is an alias, flag it
						      if ( s.internal_domain.aliases[s.internal_domain.server][i]==s.internal_domain.refDomain ) {				  
                    s.internal_domain.alias = true;
                    break;
								  } // end if	
                } // end for i
              } // end if server
              // make returning value the referring url if no alias
              if (s.internal_domain.alias == false) {
					      s.internal_domain.returnValue = document.referrer.replace(/\?.*$/,'');
					    }
            } // end if match
        } // end for lIF
	  } // end if cur!=ref
    // return value
    return s.internal_domain.returnValue;   
} // end trackInternalDomain

/*
** Plugin: gntpv - get new time parting value
** ROIL: JD 02.07.11
**
** Dependencies: s.getTimeParting
*/
s.gntpv = function () { 
    s_hour=s.getTimeParting('h','-5').replace(/^0/,'');
    s_day=s.getTimeParting('d','-5');
    s_timepart=s_day+"|"+s_hour;
    return s_timepart.toLowerCase();
} // s_gntpv

/*
** Plugin: track - general tracking callback function
** ROIL: JD 02.07.11
**
** Dependencies: s.gntpv
*/
// legacy
function s_track(params, tt, ld) {
  var params=params||{};var tt=tt||'';var ld=ld||'';
  if(typeof(s)=='object'&&typeof(s.track)=='function') s.track(params, tt, ld);
}
s.track = function (params,tt,ld) {
  for(var i=0,l=params.length;i<l;i++) {
    if(params.hasOwnProperty(i)) {
      if (arguments[1]&&arguments[1].match(/^tl_/)) {
	      var t_ltv = s.linkTrackVars;
	      var t_lte = s.linkTrackEvents;
	      s.eVar20 = s.prop20 = s.gntpv();
        if (typeof(arguments[2]) == 'undefined' || arguments[2] == '') var ld = 'no value';
        for(var j in params[i]) {
          if(params[i].hasOwnProperty(j)) {
            s.linkTrackVars = s.apl(s.linkTrackVars,j,',',2); 
            if (j=='events') {
              var k = params[i][j].split(',');
              for (var c = 0; c<k.length; c++) {
                 s.linkTrackEvents = s.apl(s.linkTrackEvents,k[c],',',2);
                 s[j] = s.apl(s[j],k[c],',',2);  
              }
            } else {
              s[j] = params[i][j];
            }
          } // end if
        } // end for j
        var lt = arguments[1].split('_')[1] || 'o';
				if (!s.inList(lt,'e,d,o', ',')) lt = 'o';
        s.tl(true,lt,ld);
	      s.linkTrackVars = t_ltv;
	      s.linkTrackEvents = t_lte;
      } else {		
        var named = ['campaign','channel','charSet','cookieDomainPeriods','currencyCode','events','pageName','pageType','pageURL','products','purchaseID','referrer','server','state','TnT','transactionID','visitorID','zip'];
        for(var n=0,l=named.length;n<l;n++) {
          if(typeof s[named[n]] != 'undefined') delete s[named[n]];
        }
        for(n=1;n<=100;n++) {
          if(typeof s['hier'+n] != 'undefined') delete s['hier'+n];
          if(typeof s['eVar'+n] != 'undefined') delete s['eVar'+n];
          if(typeof s['prop'+n] != 'undefined') delete s['prop'+n];
        }
        s.events = ''; 
	      s.eVar20 = s.prop20 = s.gntpv();
        for(var j in params[i]) {
          if(params[i].hasOwnProperty(j)) {
            s[j] = params[i][j];
          } // end if
        } // end for j
        s.t();
      } // end else 
    } // end if params
  } // end for i
} // end s.track

/*
** Misc. Cookie plugins
** ROIL: PCL 02.15.11
*/
s.getCookie=new Function("n",""
+"n='s_'+n;var i,x,y,cc=document.cookie.split(';');for(i=0,l=cc.l"
+"ength;i<l;i++){x=cc[i].substr(0,cc[i].indexOf('='));y=cc[i].substr("
+"cc[i].indexOf('=')+1);x=x.replace(/^\\s+|\\s+$/g,'');if(x==n){retur"
+"n unescape(y)}}return null");
s.setCookie=new Function("n","v","d",""
+"n='s_'+n;var a=new Date();a.setDate(a.getDate()+d);var b=escape"
+"(v)+((d==null)?'':'; expires='+a.toUTCString());document.cookie=n+'"
+"='+b");
s.delCookie=new Function("n",""
+"this.setCookie(n,'',-99999)");

/*
** Plugin: getTimeToConvert
** ROIL: JD 2011.04.19
** rounds up minutes to next hour after 1 hr mark
** rounds up hours to next day after 1 day mark 

   arg1: start timestamp 
	 arg2: end timestamp
   return [days]:[hours]:[minutes]
*/
s.getTimeToConvert=new Function("s","e",""
+"var t=new Date();t.setTime(e-s);td=t.getTime();var d=Math.floor(td/"
+"86400000);td-=d*86400000;var h=Math.floor(td/3600000);td-=h*3600000"
+";var m=Math.ceil(td/60000);if(h>0){if(m>0){h++;m=0;}}if(d>0){if((h>"
+"0)||(m>0)){d++;h=0;m=0;}}return d+':'+h+':'+m;");
 
/*
** Plugin: getCampaignValue
** ROIL: PCL 02.07.11 (update namespace)
**
** Dependencies: s.getQueryParam(), s.campaignParams
*/
s.getCampaignValue=new Function(""
+"var s=this;var cp=s.campaignParams;for(var p=0,l=cp.length;p<l;p++)"
+"{var v=s.getQueryParam(cp[p]);if(v)return v;}return '';");

/* * TNT Integration Plugin v1.0 */ 
s.trackTNT =new Function("v","p","b","" 
+"var s=this,n='s_tnt',p=p?p:n,v=v?v:n,r='',pm=false,b=b?b:true;if(s." 
+"getQueryParam){pm=s.getQueryParam(p);}if(pm){r+=(pm+',');}if(s.wd[v" 
+"]!=undefined){r+=s.wd[v];}if(b){s.wd[v]='';}return r;");

/* * Plugin: getQueryParam 2.4 */
s.getQueryParam=new Function("p","d","u","h","" 
+"var s=this,v='',i,j,t;d=d?d:'';u=u?u:(s.pageURL?s.pageURL:s.wd.loca" 
+"tion);if(u=='f')u=s.gtfs().location;while(p){i=p.indexOf(',');i=i<0" 
+"?p.length:i;t=s.p_gpv(p.substring(0,i),u+'',h);if(t){t=t.indexOf('#" 
+"')>-1?t.substring(0,t.indexOf('#')):t;}if(t)v+=v?d+t:t;p=p.substrin" 
+"g(i==p.length?i:i+1)}return v"); 
s.p_gpv=new Function("k","u","h","" 
+"var s=this,v='',q;j=h==1?'#':'?';i=u.indexOf(j);if(k&&i>-1){q=u.sub" 
+"string(i+1);v=s.pt(q,'&','p_gvf',k)}return v"); 
s.p_gvf=new Function("t","k","" 
+"if(t){var s=this,i=t.indexOf('='),p=i<0?t:t.substring(0,i),v=i<0?'T" 
+"rue':t.substring(i+1);if(p.toLowerCase()==k.toLowerCase())return s." 
+"epa(v)}return''");

/*
 * Plugin: getValOnce 0.2 - get a value once per session or number of days
 */
s.getValOnce=new Function("v","c","e",""
+"var s=this,k=s.c_r(c),a=new Date;e=e?e:0;if(v){a.setTime(a.getTime("
+")+e*86400000);s.c_w(c,v,e?a:0);}return v==k?'':v");

/*
 * Plugin: getPreviousValue_v1.0 - return previous value of designated
 *   variable (requires split utility)
 */
s.getPreviousValue=new Function("v","c","el",""
+"var s=this,t=new Date,i,j,r='';t.setTime(t.getTime()+1800000);if(el"
+"){if(s.events){i=s.split(el,',');j=s.split(s.events,',');for(x in i"
+"){for(y in j){if(i[x]==j[y]){if(s.c_r(c)) r=s.c_r(c);v?s.c_w(c,v,t)"
+":s.c_w(c,'no value',t);return r}}}}}else{if(s.c_r(c)) r=s.c_r(c);v?"
+"s.c_w(c,v,t):s.c_w(c,'no value',t);return r}");

/*
 * Plugin: getNewRepeat 1.2 - Returns whether user is new or repeat 
 *  ROIL: changed to new vs returning to match industry standards.
 */
s.getNewReturning=new Function("d","cn",""
+"var s=this,e=new Date(),cval,sval,ct=e.getTime();d=d?d:30;cn=cn?cn:"
+"'s_nr';e.setTime(ct+d*24*60*60*1000);cval=s.c_r(cn);if(cval.length="
+"=0){s.c_w(cn,ct+'-New',e);return'New';}sval=s.split(cval,'-');if(ct"
+"-sval[0]<30*60*1000&&sval[1]=='New'){s.c_w(cn,ct+'-New',e);return'N"
+"ew';}else{s.c_w(cn,ct+'-Returning',e);return'Returning';}");

/*
* Get Visit Start
*/
s.getVisitStart=new Function("c",""
+"var s=this,v=1,t=new Date;t.setTime(t.getTime()+1800000);if(s.c_r(c"
+")){v=0}if(!s.c_w(c,1,t)){s.c_w(c,1,0)}if(!s.c_r(c)){v=0}return v;");

/*
 * Plugin: getTimeParting 2.0 - Set timeparting values based on time zone
 */
s.getTimeParting=new Function("t","z",""
+"var s=this,cy;dc=new Date('1/1/2000');"
+"if(dc.getDay()!=6||dc.getMonth()!=0){return'Data Not Available'}"
+"else{;z=parseFloat(z);var dsts=new Date(s.dstStart);"
+"var dste=new Date(s.dstEnd);fl=dste;cd=new Date();if(cd>dsts&&cd<fl)"
+"{z=z+1}else{z=z};utc=cd.getTime()+(cd.getTimezoneOffset()*60000);"
+"tz=new Date(utc + (3600000*z));thisy=tz.getFullYear();"
+"var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday',"
+"'Saturday'];if(thisy!=s.currentYear){return'Data Not Available'}else{;"
+"thish=tz.getHours();thismin=tz.getMinutes();thisd=tz.getDay();"
+"var dow=days[thisd];var ap='AM';var dt='Weekday';var mint='00';"
+"if(thismin>30){mint='30'}if(thish>=12){ap='PM';thish=thish-12};"
+"if (thish==0){thish=12};if(thisd==6||thisd==0){dt='Weekend'};"
+"var timestring=thish+':'+mint+ap;if(t=='h'){return timestring}"
+"if(t=='d'){return dow};if(t=='w'){return dt}}};");

/*
 * Plugin: linkHandler 0.5 - identify and report custom links
 *    requires p_gh
 */
s.linkHandler = new Function("p", "t", ""
+ "var s=this,h=s.p_gh(),i,l;t=t?t:'o';if(!h||(s.linkType&&(h||s.linkN"
+ "ame)))return '';i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h."
+ "substring(0,i);l=s.pt(p,'|','p_gn',h.toLowerCase());if(l){s.linkNam"
+ "e=l=='[['?'':l;s.linkType=t;return h;}return '';");
s.p_gn = new Function("t", "h", ""
+ "var i=t?t.indexOf('~'):-1,n,x;if(t&&h){n=i<0?'':t.substring(0,i);x="
+ "t.substring(i+1);if(h.indexOf(x.toLowerCase())>-1)return n?n:'[[';}"
+ "return 0;");

/*
 * Plugin: downloadLinkHandler 0.5 - identify and report download links
 *    requires p_gh
 */
s.downloadLinkHandler=new Function("p",""
+"var s=this,h=s.p_gh(),n='linkDownloadFileTypes',i,t;if(!h||(s.linkT"
+"ype&&(h||s.linkName)))return '';i=h.indexOf('?');t=s[n];s[n]=p?p:t;"
+"if(s.lt(h)=='d')s.linkType='d';else h='';s[n]=t;return h;");

/*
* Plugin: exitLinkHandler 0.5 - identify and report exit links
*/
s.exitLinkHandler=new Function("p",""
+"var s=this,h=s.p_gh(),n='linkInternalFilters',i,t;if(!h||(s.linkTyp"
+"e&&(h||s.linkName)))return '';i=h.indexOf('?');t=s[n];s[n]=p?p:t;h="
+"s.linkLeaveQueryString||i<0?h:h.substring(0,i);if(s.lt(h)=='e')s.li"
+"nkType='e';else h='';s[n]=t;return h;");

/*
 * Utility Function: p_gh
 */
s.p_gh = new Function(""
+ "var s=this;if(!s.eo&&!s.lnk)return '';var o=s.eo?s.eo:s.lnk,y=s.ot("
+ "o),n=s.oid(o),x=o.s_oidt;if(s.eo&&o==s.eo){while(o&&!n&&y!='BODY'){"
+ "o=o.parentElement?o.parentElement:o.parentNode;if(!o)return '';y=s."
+ "ot(o);n=s.oid(o);x=o.s_oidt}}return o.href?o.href:'';");

/*
 * Plugin Utility: apl v1.1
 */
s.apl=new Function("l","v","d","u",""
+"var s=this,m=0;if(!l)l='';if(u){var i,n,a=s.split(l,d);for(i=0;i<a."
+"length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas"
+"e()));}}if(!m)l=l?l+d+v:v;return l");

/*
 * Utility: escp 0.1 - ensures decodeURI will be used to decode URL parameters if it exists
 */
s.escp=new Function("x",""
+"var s=this;if(typeof(decodeURI)=='function'&&x)return decodeURI(s.r"
+"ep(''+x,'+',' '));else return unescape(s.rep(''+x,'+',' '));");

/*
 * Utility Function: split v1.5 (JS 1.0 compatible)
 */
s.split=new Function("l","d",""
+"var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
+"++]=l.substring(0,i);l=l.substring(i+d.length);}return a");

/*
 * Utility: inList v1.0 - find out if a value is in a list
 * MODIFIED BY: Acronym 2012.11.09 
 * Now Accepts optional 4th arg for sub-delimiter to account for serialized events
 */
s.inList= function(v,l,D,d) {
  var s=this,ar=Array(),i=0,D=(D)?D:',',d=(d)?String(d):'';
  if((typeof(l)!='undefined')&&((typeof(l)=='string')||(l instanceof String))){
    if(s.split) {
      ar=s.split(l,D);
    } else if(l.split) {
      ar=l.split(D);
    } else { 
      return -1;
    }
  } else if ((typeof(l)!='undefined')&&((typeof(l)=='array')||(l instanceof Array))) {
    ar=l;
  }	else {
    return false;
  }
  while(i<ar.length){
    if(v==((d&&((typeof(ar[i])=='string')||(ar[i] instanceof String)))?ar[i].split(d)[0]:ar[i]))
      return true;i++
  }
  return false;
}

/*
 * Plugin Utility: Replace v1.0
 */
s.repl=new Function("x","o","n",""
+"var i=x.indexOf(o),l=n.length;while(x&&i>=0){x=x.substring(0,i)+n+x."
+"substring(i+o.length);i=x.indexOf(o,i+l)}return x");

/*
 * s.join: 1.0 - s.join(v,p)
 *
 *  v - Array (may also be array of array)
 *  p - formatting parameters (front, back, delim, wrap)
 *
 */
s.join = new Function("v","p",""
+"var s = this;var f,b,d,w;if(p){f=p.front?p.front:'';b=p.back?p.back"
+":'';d=p.delim?p.delim:'';w=p.wrap?p.wrap:'';}var str='';for(var x=0"
+";x<v.length;x++){if(typeof(v[x])=='object' )str+=s.join( v[x],p);el"
+"se str+=w+v[x]+w;if(x<v.length-1)str+=d;}return f+str+b;");

/*
 *	Plug-in: crossVisitParticipation v1.7 - stacks values from
 *	specified variable in cookie and returns value
 */
s.crossVisitParticipation=new Function("v","cn","ex","ct","dl","ev","dv",""
+"var s=this,ce;if(typeof(dv)==='undefined')dv=0;if(s.events&&ev){var"
+" ay=s.split(ev,',');var ea=s.split(s.events,',');for(var u=0;u<ay.l"
+"ength;u++){for(var x=0;x<ea.length;x++){if(ay[u]==ea[x]){ce=1;}}}}i"
+"f(!v||v==''){if(ce){s.c_w(cn,'');return'';}else return'';}v=escape("
+"v);var arry=new Array(),a=new Array(),c=s.c_r(cn),g=0,h=new Array()"
+";if(c&&c!=''){arry=s.split(c,'],[');for(q=0;q<arry.length;q++){z=ar"
+"ry[q];z=s.repl(z,'[','');z=s.repl(z,']','');z=s.repl(z,\"'\",'');arry"
+"[q]=s.split(z,',')}}var e=new Date();e.setFullYear(e.getFullYear()+"
+"5);if(dv==0&&arry.length>0&&arry[arry.length-1][0]==v)arry[arry.len"
+"gth-1]=[v,new Date().getTime()];else arry[arry.length]=[v,new Date("
+").getTime()];var start=arry.length-ct<0?0:arry.length-ct;var td=new"
+" Date();for(var x=start;x<arry.length;x++){var diff=Math.round((td."
+"getTime()-arry[x][1])/86400000);if(diff<ex){h[g]=unescape(arry[x][0"
+"]);a[g]=[arry[x][0],arry[x][1]];g++;}}var data=s.join(a,{delim:',',"
+"front:'[',back:']',wrap:\"'\"});s.c_w(cn,data,e);var r=s.join(h,{deli"
+"m:dl});if(ce)s.c_w(cn,'');return r;");



/* WARNING: Changing any of the below variables will cause drastic
changes to how your visitor data is collected.  Changes should only be
made when instructed to do so by your account manager.*/
s.visitorNamespace="fourseasonshotels"
s.trackingServer="fourseasonshotels.112.2o7.net"

/************* DO NOT ALTER ANYTHING BELOW THIS LINE ! **************/
var s_code='',s_objectID;function s_gi(un,pg,ss){var c="s._c='s_c';s.wd=window;if(!s.wd.s_c_in){s.wd.s_c_il=new Array;s.wd.s_c_in=0;}s._il=s.wd.s_c_il;s._in=s.wd.s_c_in;s._il[s._in]=s;s.wd.s_c_in++;s"
+".an=s_an;s.cls=function(x,c){var i,y='';if(!c)c=this.an;for(i=0;i<x.length;i++){n=x.substring(i,i+1);if(c.indexOf(n)>=0)y+=n}return y};s.fl=function(x,l){return x?(''+x).substring(0,l):x};s.co=func"
+"tion(o){if(!o)return o;var n=new Object,x;for(x in o)if(x.indexOf('select')<0&&x.indexOf('filter')<0)n[x]=o[x];return n};s.num=function(x){x=''+x;for(var p=0;p<x.length;p++)if(('0123456789').indexO"
+"f(x.substring(p,p+1))<0)return 0;return 1};s.rep=s_rep;s.sp=s_sp;s.jn=s_jn;s.ape=function(x){var s=this,h='0123456789ABCDEF',i,c=s.charSet,n,l,e,y='';c=c?c.toUpperCase():'';if(x){x=''+x;if(s.em==3)"
+"return encodeURIComponent(x);else if(c=='AUTO'&&('').charCodeAt){for(i=0;i<x.length;i++){c=x.substring(i,i+1);n=x.charCodeAt(i);if(n>127){l=0;e='';while(n||l<4){e=h.substring(n%16,n%16+1)+e;n=(n-n%"
+"16)/16;l++}y+='%u'+e}else if(c=='+')y+='%2B';else y+=escape(c)}return y}else{x=s.rep(escape(''+x),'+','%2B');if(c&&s.em==1&&x.indexOf('%u')<0&&x.indexOf('%U')<0){i=x.indexOf('%');while(i>=0){i++;if"
+"(h.substring(8).indexOf(x.substring(i,i+1).toUpperCase())>=0)return x.substring(0,i)+'u00'+x.substring(i);i=x.indexOf('%',i)}}}}return x};s.epa=function(x){var s=this;if(x){x=''+x;return s.em==3?de"
+"codeURIComponent(x):unescape(s.rep(x,'+',' '))}return x};s.pt=function(x,d,f,a){var s=this,t=x,z=0,y,r;while(t){y=t.indexOf(d);y=y<0?t.length:y;t=t.substring(0,y);r=s[f](t,a);if(r)return r;z+=y+d.l"
+"ength;t=x.substring(z,x.length);t=z<x.length?t:''}return ''};s.isf=function(t,a){var c=a.indexOf(':');if(c>=0)a=a.substring(0,c);if(t.substring(0,2)=='s_')t=t.substring(2);return (t!=''&&t==a)};s.f"
+"sf=function(t,a){var s=this;if(s.pt(a,',','isf',t))s.fsg+=(s.fsg!=''?',':'')+t;return 0};s.fs=function(x,f){var s=this;s.fsg='';s.pt(x,',','fsf',f);return s.fsg};s.si=function(){var s=this,i,k,v,c="
+"s_gi+'var s=s_gi(\"'+s.oun+'\");s.sa(\"'+s.un+'\");';for(i=0;i<s.va_g.length;i++){k=s.va_g[i];v=s[k];if(v!=undefined){if(typeof(v)=='string')c+='s.'+k+'=\"'+s_fe(v)+'\";';else c+='s.'+k+'='+v+';'}}"
+"c+=\"s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';\";return c};s.c_d='';s.c_gdf=function(t,a){var s=this;if(!s.num(t))return 1;return 0};s.c_gd=function(){var"
+" s=this,d=s.wd.location.hostname,n=s.fpCookieDomainPeriods,p;if(!n)n=s.cookieDomainPeriods;if(d&&!s.c_d){n=n?parseInt(n):2;n=n>2?n:2;p=d.lastIndexOf('.');if(p>=0){while(p>=0&&n>1){p=d.lastIndexOf('"
+".',p-1);n--}s.c_d=p>0&&s.pt(d,'.','c_gdf',0)?d.substring(p):d}}return s.c_d};s.c_r=function(k){var s=this;k=s.ape(k);var c=' '+s.d.cookie,i=c.indexOf(' '+k+'='),e=i<0?i:c.indexOf(';',i),v=i<0?'':s."
+"epa(c.substring(i+2+k.length,e<0?c.length:e));return v!='[[B]]'?v:''};s.c_w=function(k,v,e){var s=this,d=s.c_gd(),l=s.cookieLifetime,t;v=''+v;l=l?(''+l).toUpperCase():'';if(e&&l!='SESSION'&&l!='NON"
+"E'){t=(v!=''?parseInt(l?l:0):-60);if(t){e=new Date;e.setTime(e.getTime()+(t*1000))}}if(k&&l!='NONE'){s.d.cookie=k+'='+s.ape(v!=''?v:'[[B]]')+'; path=/;'+(e&&l!='SESSION'?' expires='+e.toGMTString()"
+"+';':'')+(d?' domain='+d+';':'');return s.c_r(k)==v}return 0};s.eh=function(o,e,r,f){var s=this,b='s_'+e+'_'+s._in,n=-1,l,i,x;if(!s.ehl)s.ehl=new Array;l=s.ehl;for(i=0;i<l.length&&n<0;i++){if(l[i]."
+"o==o&&l[i].e==e)n=i}if(n<0){n=i;l[n]=new Object}x=l[n];x.o=o;x.e=e;f=r?x.b:f;if(r||f){x.b=r?0:o[e];x.o[e]=f}if(x.b){x.o[b]=x.b;return b}return 0};s.cet=function(f,a,t,o,b){var s=this,r,tcf;if(s.apv"
+">=5&&(!s.isopera||s.apv>=7)){tcf=new Function('s','f','a','t','var e,r;try{r=s[f](a)}catch(e){r=s[t](e)}return r');r=tcf(s,f,a,t)}else{if(s.ismac&&s.u.indexOf('MSIE 4')>=0)r=s[b](a);else{s.eh(s.wd,"
+"'onerror',0,o);r=s[f](a);s.eh(s.wd,'onerror',1)}}return r};s.gtfset=function(e){var s=this;return s.tfs};s.gtfsoe=new Function('e','var s=s_c_il['+s._in+'],c;s.eh(window,\"onerror\",1);s.etfs=1;c=s"
+".t();if(c)s.d.write(c);s.etfs=0;return true');s.gtfsfb=function(a){return window};s.gtfsf=function(w){var s=this,p=w.parent,l=w.location;s.tfs=w;if(p&&p.location!=l&&p.location.host==l.host){s.tfs="
+"p;return s.gtfsf(s.tfs)}return s.tfs};s.gtfs=function(){var s=this;if(!s.tfs){s.tfs=s.wd;if(!s.etfs)s.tfs=s.cet('gtfsf',s.tfs,'gtfset',s.gtfsoe,'gtfsfb')}return s.tfs};s.mrq=function(u){var s=this,"
+"l=s.rl[u],n,r;s.rl[u]=0;if(l)for(n=0;n<l.length;n++){r=l[n];s.mr(0,0,r.r,0,r.t,r.u)}};s.br=function(id,rs){var s=this;if(s.disableBufferedRequests||!s.c_w('s_br',rs))s.brl=rs};s.flushBufferedReques"
+"ts=function(){this.fbr(0)};s.fbr=function(id){var s=this,br=s.c_r('s_br');if(!br)br=s.brl;if(br){if(!s.disableBufferedRequests)s.c_w('s_br','');s.mr(0,0,br)}s.brl=0};s.mr=function(sess,q,rs,id,ta,u"
+"){var s=this,dc=s.dc,t1=s.trackingServer,t2=s.trackingServerSecure,tb=s.trackingServerBase,p='.sc',ns=s.visitorNamespace,un=s.cls(u?u:(ns?ns:s.fun)),r=new Object,l,imn='s_i_'+(un),im,b,e;if(!rs){if"
+"(t1){if(t2&&s.ssl)t1=t2}else{if(!tb)tb='2o7.net';if(dc)dc=(''+dc).toLowerCase();else dc='d1';if(tb=='2o7.net'){if(dc=='d1')dc='112';else if(dc=='d2')dc='122';p=''}t1=un+'.'+dc+'.'+p+tb}rs='http'+(s"
+".ssl?'s':'')+'://'+t1+'/b/ss/'+s.un+'/'+(s.mobile?'5.1':'1')+'/H.22.1/'+sess+'?AQB=1&ndh=1'+(q?q:'')+'&AQE=1';if(s.isie&&!s.ismac)rs=s.fl(rs,2047);if(id){s.br(id,rs);return}}if(s.d.images&&s.apv>=3"
+"&&(!s.isopera||s.apv>=7)&&(s.ns6<0||s.apv>=6.1)){if(!s.rc)s.rc=new Object;if(!s.rc[un]){s.rc[un]=1;if(!s.rl)s.rl=new Object;s.rl[un]=new Array;setTimeout('if(window.s_c_il)window.s_c_il['+s._in+']."
+"mrq(\"'+un+'\")',750)}else{l=s.rl[un];if(l){r.t=ta;r.u=un;r.r=rs;l[l.length]=r;return ''}imn+='_'+s.rc[un];s.rc[un]++}im=s.wd[imn];if(!im)im=s.wd[imn]=new Image;im.s_l=0;im.onload=new Function('e',"
+"'this.s_l=1;var wd=window,s;if(wd.s_c_il){s=wd.s_c_il['+s._in+'];s.mrq(\"'+un+'\");s.nrs--;if(!s.nrs)s.m_m(\"rr\")}');if(!s.nrs){s.nrs=1;s.m_m('rs')}else s.nrs++;im.src=rs;if((!ta||ta=='_self'||ta="
+"='_top'||(s.wd.name&&ta==s.wd.name))&&rs.indexOf('&pe=')>=0){b=e=new Date;while(!im.s_l&&e.getTime()-b.getTime()<500)e=new Date}return ''}return '<im'+'g sr'+'c=\"'+rs+'\" width=1 height=1 border=0"
+" alt=\"\">'};s.gg=function(v){var s=this;if(!s.wd['s_'+v])s.wd['s_'+v]='';return s.wd['s_'+v]};s.glf=function(t,a){if(t.substring(0,2)=='s_')t=t.substring(2);var s=this,v=s.gg(t);if(v)s[t]=v};s.gl="
+"function(v){var s=this;if(s.pg)s.pt(v,',','glf',0)};s.rf=function(x){var s=this,y,i,j,h,l,a,b='',c='',t;if(x){y=''+x;i=y.indexOf('?');if(i>0){a=y.substring(i+1);y=y.substring(0,i);h=y.toLowerCase()"
+";i=0;if(h.substring(0,7)=='http://')i+=7;else if(h.substring(0,8)=='https://')i+=8;h=h.substring(i);i=h.indexOf(\"/\");if(i>0){h=h.substring(0,i);if(h.indexOf('google')>=0){a=s.sp(a,'&');if(a.lengt"
+"h>1){l=',q,ie,start,search_key,word,kw,cd,';for(j=0;j<a.length;j++){t=a[j];i=t.indexOf('=');if(i>0&&l.indexOf(','+t.substring(0,i)+',')>=0)b+=(b?'&':'')+t;else c+=(c?'&':'')+t}if(b&&c){y+='?'+b+'&'"
+"+c;if(''+x!=y)x=y}}}}}}return x};s.hav=function(){var s=this,qs='',fv=s.linkTrackVars,fe=s.linkTrackEvents,mn,i;if(s.pe){mn=s.pe.substring(0,1).toUpperCase()+s.pe.substring(1);if(s[mn]){fv=s[mn].tr"
+"ackVars;fe=s[mn].trackEvents}}fv=fv?fv+','+s.vl_l+','+s.vl_l2:'';for(i=0;i<s.va_t.length;i++){var k=s.va_t[i],v=s[k],b=k.substring(0,4),x=k.substring(4),n=parseInt(x),q=k;if(v&&k!='linkName'&&k!='l"
+"inkType'){if(s.pe||s.lnk||s.eo){if(fv&&(','+fv+',').indexOf(','+k+',')<0)v='';if(k=='events'&&fe)v=s.fs(v,fe)}if(v){if(k=='dynamicVariablePrefix')q='D';else if(k=='visitorID')q='vid';else if(k=='pa"
+"geURL'){q='g';v=s.fl(v,255)}else if(k=='referrer'){q='r';v=s.fl(s.rf(v),255)}else if(k=='vmk'||k=='visitorMigrationKey')q='vmt';else if(k=='visitorMigrationServer'){q='vmf';if(s.ssl&&s.visitorMigra"
+"tionServerSecure)v=''}else if(k=='visitorMigrationServerSecure'){q='vmf';if(!s.ssl&&s.visitorMigrationServer)v=''}else if(k=='charSet'){q='ce';if(v.toUpperCase()=='AUTO')v='ISO8859-1';else if(s.em="
+"=2||s.em==3)v='UTF-8'}else if(k=='visitorNamespace')q='ns';else if(k=='cookieDomainPeriods')q='cdp';else if(k=='cookieLifetime')q='cl';else if(k=='variableProvider')q='vvp';else if(k=='currencyCode"
+"')q='cc';else if(k=='channel')q='ch';else if(k=='transactionID')q='xact';else if(k=='campaign')q='v0';else if(k=='resolution')q='s';else if(k=='colorDepth')q='c';else if(k=='javascriptVersion')q='j"
+"';else if(k=='javaEnabled')q='v';else if(k=='cookiesEnabled')q='k';else if(k=='browserWidth')q='bw';else if(k=='browserHeight')q='bh';else if(k=='connectionType')q='ct';else if(k=='homepage')q='hp'"
+";else if(k=='plugins')q='p';else if(s.num(x)){if(b=='prop')q='c'+n;else if(b=='eVar')q='v'+n;else if(b=='list')q='l'+n;else if(b=='hier'){q='h'+n;v=s.fl(v,255)}}if(v)qs+='&'+q+'='+(k.substring(0,3)"
+"!='pev'?s.ape(v):v)}}}return qs};s.ltdf=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';var qi=h.indexOf('?');h=qi>=0?h.substring(0,qi):h;if(t&&h.substring(h.length-(t.length+1))=='.'+t"
+")return 1;return 0};s.ltef=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';if(t&&h.indexOf(t)>=0)return 1;return 0};s.lt=function(h){var s=this,lft=s.linkDownloadFileTypes,lef=s.linkExt"
+"ernalFilters,lif=s.linkInternalFilters;lif=lif?lif:s.wd.location.hostname;h=h.toLowerCase();if(s.trackDownloadLinks&&lft&&s.pt(lft,',','ltdf',h))return 'd';if(s.trackExternalLinks&&h.substring(0,1)"
+"!='#'&&(lef||lif)&&(!lef||s.pt(lef,',','ltef',h))&&(!lif||!s.pt(lif,',','ltef',h)))return 'e';return ''};s.lc=new Function('e','var s=s_c_il['+s._in+'],b=s.eh(this,\"onclick\");s.lnk=s.co(this);s.t"
+"();s.lnk=0;if(b)return this[b](e);return true');s.bc=new Function('e','var s=s_c_il['+s._in+'],f,tcf;if(s.d&&s.d.all&&s.d.all.cppXYctnr)return;s.eo=e.srcElement?e.srcElement:e.target;tcf=new Functi"
+"on(\"s\",\"var e;try{if(s.eo&&(s.eo.tagName||s.eo.parentElement||s.eo.parentNode))s.t()}catch(e){}\");tcf(s);s.eo=0');s.oh=function(o){var s=this,l=s.wd.location,h=o.href?o.href:'',i,j,k,p;i=h.inde"
+"xOf(':');j=h.indexOf('?');k=h.indexOf('/');if(h&&(i<0||(j>=0&&i>j)||(k>=0&&i>k))){p=o.protocol&&o.protocol.length>1?o.protocol:(l.protocol?l.protocol:'');i=l.pathname.lastIndexOf('/');h=(p?p+'//':'"
+"')+(o.host?o.host:(l.host?l.host:''))+(h.substring(0,1)!='/'?l.pathname.substring(0,i<0?0:i)+'/':'')+h}return h};s.ot=function(o){var t=o.tagName;t=t&&t.toUpperCase?t.toUpperCase():'';if(t=='SHAPE'"
+")t='';if(t){if((t=='INPUT'||t=='BUTTON')&&o.type&&o.type.toUpperCase)t=o.type.toUpperCase();else if(!t&&o.href)t='A';}return t};s.oid=function(o){var s=this,t=s.ot(o),p,c,n='',x=0;if(t&&!o.s_oid){p"
+"=o.protocol;c=o.onclick;if(o.href&&(t=='A'||t=='AREA')&&(!c||!p||p.toLowerCase().indexOf('javascript')<0))n=s.oh(o);else if(c){n=s.rep(s.rep(s.rep(s.rep(''+c,\"\\r\",''),\"\\n\",''),\"\\t\",''),' '"
+",'');x=2}else if(t=='INPUT'||t=='SUBMIT'){if(o.value)n=o.value;else if(o.innerText)n=o.innerText;else if(o.textContent)n=o.textContent;x=3}else if(o.src&&t=='IMAGE')n=o.src;if(n){o.s_oid=s.fl(n,100"
+");o.s_oidt=x}}return o.s_oid};s.rqf=function(t,un){var s=this,e=t.indexOf('='),u=e>=0?t.substring(0,e):'',q=e>=0?s.epa(t.substring(e+1)):'';if(u&&q&&(','+u+',').indexOf(','+un+',')>=0){if(u!=s.un&&"
+"s.un.indexOf(',')>=0)q='&u='+u+q+'&u=0';return q}return ''};s.rq=function(un){if(!un)un=this.un;var s=this,c=un.indexOf(','),v=s.c_r('s_sq'),q='';if(c<0)return s.pt(v,'&','rqf',un);return s.pt(un,'"
+",','rq',0)};s.sqp=function(t,a){var s=this,e=t.indexOf('='),q=e<0?'':s.epa(t.substring(e+1));s.sqq[q]='';if(e>=0)s.pt(t.substring(0,e),',','sqs',q);return 0};s.sqs=function(un,q){var s=this;s.squ[u"
+"n]=q;return 0};s.sq=function(q){var s=this,k='s_sq',v=s.c_r(k),x,c=0;s.sqq=new Object;s.squ=new Object;s.sqq[q]='';s.pt(v,'&','sqp',0);s.pt(s.un,',','sqs',q);v='';for(x in s.squ)if(x&&(!Object||!Ob"
+"ject.prototype||!Object.prototype[x]))s.sqq[s.squ[x]]+=(s.sqq[s.squ[x]]?',':'')+x;for(x in s.sqq)if(x&&(!Object||!Object.prototype||!Object.prototype[x])&&s.sqq[x]&&(x==q||c<2)){v+=(v?'&':'')+s.sqq"
+"[x]+'='+s.ape(x);c++}return s.c_w(k,v,0)};s.wdl=new Function('e','var s=s_c_il['+s._in+'],r=true,b=s.eh(s.wd,\"onload\"),i,o,oc;if(b)r=this[b](e);for(i=0;i<s.d.links.length;i++){o=s.d.links[i];oc=o"
+".onclick?\"\"+o.onclick:\"\";if((oc.indexOf(\"s_gs(\")<0||oc.indexOf(\".s_oc(\")>=0)&&oc.indexOf(\".tl(\")<0)s.eh(o,\"onclick\",0,s.lc);}return r');s.wds=function(){var s=this;if(s.apv>3&&(!s.isie|"
+"|!s.ismac||s.apv>=5)){if(s.b&&s.b.attachEvent)s.b.attachEvent('onclick',s.bc);else if(s.b&&s.b.addEventListener)s.b.addEventListener('click',s.bc,false);else s.eh(s.wd,'onload',0,s.wdl)}};s.vs=func"
+"tion(x){var s=this,v=s.visitorSampling,g=s.visitorSamplingGroup,k='s_vsn_'+s.un+(g?'_'+g:''),n=s.c_r(k),e=new Date,y=e.getYear();e.setYear(y+10+(y<1900?1900:0));if(v){v*=100;if(!n){if(!s.c_w(k,x,e)"
+")return 0;n=x}if(n%10000>v)return 0}return 1};s.dyasmf=function(t,m){if(t&&m&&m.indexOf(t)>=0)return 1;return 0};s.dyasf=function(t,m){var s=this,i=t?t.indexOf('='):-1,n,x;if(i>=0&&m){var n=t.subst"
+"ring(0,i),x=t.substring(i+1);if(s.pt(x,',','dyasmf',m))return n}return 0};s.uns=function(){var s=this,x=s.dynamicAccountSelection,l=s.dynamicAccountList,m=s.dynamicAccountMatch,n,i;s.un=s.un.toLowe"
+"rCase();if(x&&l){if(!m)m=s.wd.location.host;if(!m.toLowerCase)m=''+m;l=l.toLowerCase();m=m.toLowerCase();n=s.pt(l,';','dyasf',m);if(n)s.un=n}i=s.un.indexOf(',');s.fun=i<0?s.un:s.un.substring(0,i)};"
+"s.sa=function(un){var s=this;s.un=un;if(!s.oun)s.oun=un;else if((','+s.oun+',').indexOf(','+un+',')<0)s.oun+=','+un;s.uns()};s.m_i=function(n,a){var s=this,m,f=n.substring(0,1),r,l,i;if(!s.m_l)s.m_"
+"l=new Object;if(!s.m_nl)s.m_nl=new Array;m=s.m_l[n];if(!a&&m&&m._e&&!m._i)s.m_a(n);if(!m){m=new Object,m._c='s_m';m._in=s.wd.s_c_in;m._il=s._il;m._il[m._in]=m;s.wd.s_c_in++;m.s=s;m._n=n;m._l=new Ar"
+"ray('_c','_in','_il','_i','_e','_d','_dl','s','n','_r','_g','_g1','_t','_t1','_x','_x1','_rs','_rr','_l');s.m_l[n]=m;s.m_nl[s.m_nl.length]=n}else if(m._r&&!m._m){r=m._r;r._m=m;l=m._l;for(i=0;i<l.le"
+"ngth;i++)if(m[l[i]])r[l[i]]=m[l[i]];r._il[r._in]=r;m=s.m_l[n]=r}if(f==f.toUpperCase())s[n]=m;return m};s.m_a=new Function('n','g','e','if(!g)g=\"m_\"+n;var s=s_c_il['+s._in+'],c=s[g+\"_c\"],m,x,f=0"
+";if(!c)c=s.wd[\"s_\"+g+\"_c\"];if(c&&s_d)s[g]=new Function(\"s\",s_ft(s_d(c)));x=s[g];if(!x)x=s.wd[\\'s_\\'+g];if(!x)x=s.wd[g];m=s.m_i(n,1);if(x&&(!m._i||g!=\"m_\"+n)){m._i=f=1;if((\"\"+x).indexOf("
+"\"function\")>=0)x(s);else s.m_m(\"x\",n,x,e)}m=s.m_i(n,1);if(m._dl)m._dl=m._d=0;s.dlt();return f');s.m_m=function(t,n,d,e){t='_'+t;var s=this,i,x,m,f='_'+t,r=0,u;if(s.m_l&&s.m_nl)for(i=0;i<s.m_nl."
+"length;i++){x=s.m_nl[i];if(!n||x==n){m=s.m_i(x);u=m[t];if(u){if((''+u).indexOf('function')>=0){if(d&&e)u=m[t](d,e);else if(d)u=m[t](d);else u=m[t]()}}if(u)r=1;u=m[t+1];if(u&&!m[f]){if((''+u).indexO"
+"f('function')>=0){if(d&&e)u=m[t+1](d,e);else if(d)u=m[t+1](d);else u=m[t+1]()}}m[f]=1;if(u)r=1}}return r};s.m_ll=function(){var s=this,g=s.m_dl,i,o;if(g)for(i=0;i<g.length;i++){o=g[i];if(o)s.loadMo"
+"dule(o.n,o.u,o.d,o.l,o.e,1);g[i]=0}};s.loadModule=function(n,u,d,l,e,ln){var s=this,m=0,i,g,o=0,f1,f2,c=s.h?s.h:s.b,b,tcf;if(n){i=n.indexOf(':');if(i>=0){g=n.substring(i+1);n=n.substring(0,i)}else "
+"g=\"m_\"+n;m=s.m_i(n)}if((l||(n&&!s.m_a(n,g)))&&u&&s.d&&c&&s.d.createElement){if(d){m._d=1;m._dl=1}if(ln){if(s.ssl)u=s.rep(u,'http:','https:');i='s_s:'+s._in+':'+n+':'+g;b='var s=s_c_il['+s._in+'],"
+"o=s.d.getElementById(\"'+i+'\");if(s&&o){if(!o.l&&s.wd.'+g+'){o.l=1;if(o.i)clearTimeout(o.i);o.i=0;s.m_a(\"'+n+'\",\"'+g+'\"'+(e?',\"'+e+'\"':'')+')}';f2=b+'o.c++;if(!s.maxDelay)s.maxDelay=250;if(!"
+"o.l&&o.c<(s.maxDelay*2)/100)o.i=setTimeout(o.f2,100)}';f1=new Function('e',b+'}');tcf=new Function('s','c','i','u','f1','f2','var e,o=0;try{o=s.d.createElement(\"script\");if(o){o.type=\"text/javas"
+"cript\";'+(n?'o.id=i;o.defer=true;o.onload=o.onreadystatechange=f1;o.f2=f2;o.l=0;':'')+'o.src=u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return o');o=tcf(s,c,i,u,f1,"
+"f2)}else{o=new Object;o.n=n+':'+g;o.u=u;o.d=d;o.l=l;o.e=e;g=s.m_dl;if(!g)g=s.m_dl=new Array;i=0;while(i<g.length&&g[i])i++;g[i]=o}}else if(n){m=s.m_i(n);m._e=1}return m};s.vo1=function(t,a){if(a[t]"
+"||a['!'+t])this[t]=a[t]};s.vo2=function(t,a){if(!a[t]){a[t]=this[t];if(!a[t])a['!'+t]=1}};s.dlt=new Function('var s=s_c_il['+s._in+'],d=new Date,i,vo,f=0;if(s.dll)for(i=0;i<s.dll.length;i++){vo=s.d"
+"ll[i];if(vo){if(!s.m_m(\"d\")||d.getTime()-vo._t>=s.maxDelay){s.dll[i]=0;s.t(vo)}else f=1}}if(s.dli)clearTimeout(s.dli);s.dli=0;if(f){if(!s.dli)s.dli=setTimeout(s.dlt,s.maxDelay)}else s.dll=0');s.d"
+"l=function(vo){var s=this,d=new Date;if(!vo)vo=new Object;s.pt(s.vl_g,',','vo2',vo);vo._t=d.getTime();if(!s.dll)s.dll=new Array;s.dll[s.dll.length]=vo;if(!s.maxDelay)s.maxDelay=250;s.dlt()};s.t=fun"
+"ction(vo,id){var s=this,trk=1,tm=new Date,sed=Math&&Math.random?Math.floor(Math.random()*10000000000000):tm.getTime(),sess='s'+Math.floor(tm.getTime()/10800000)%10+sed,y=tm.getYear(),vt=tm.getDate("
+")+'/'+tm.getMonth()+'/'+(y<1900?y+1900:y)+' '+tm.getHours()+':'+tm.getMinutes()+':'+tm.getSeconds()+' '+tm.getDay()+' '+tm.getTimezoneOffset(),tcf,tfs=s.gtfs(),ta=-1,q='',qs='',code='',vb=new Objec"
+"t;s.gl(s.vl_g);s.uns();s.m_ll();if(!s.td){var tl=tfs.location,a,o,i,x='',c='',v='',p='',bw='',bh='',j='1.0',k=s.c_w('s_cc','true',0)?'Y':'N',hp='',ct='',pn=0,ps;if(String&&String.prototype){j='1.1'"
+";if(j.match){j='1.2';if(tm.setUTCDate){j='1.3';if(s.isie&&s.ismac&&s.apv>=5)j='1.4';if(pn.toPrecision){j='1.5';a=new Array;if(a.forEach){j='1.6';i=0;o=new Object;tcf=new Function('o','var e,i=0;try"
+"{i=new Iterator(o)}catch(e){}return i');i=tcf(o);if(i&&i.next)j='1.7'}}}}}if(s.apv>=4)x=screen.width+'x'+screen.height;if(s.isns||s.isopera){if(s.apv>=3){v=s.n.javaEnabled()?'Y':'N';if(s.apv>=4){c="
+"screen.pixelDepth;bw=s.wd.innerWidth;bh=s.wd.innerHeight}}s.pl=s.n.plugins}else if(s.isie){if(s.apv>=4){v=s.n.javaEnabled()?'Y':'N';c=screen.colorDepth;if(s.apv>=5){bw=s.d.documentElement.offsetWid"
+"th;bh=s.d.documentElement.offsetHeight;if(!s.ismac&&s.b){tcf=new Function('s','tl','var e,hp=0;try{s.b.addBehavior(\"#default#homePage\");hp=s.b.isHomePage(tl)?\"Y\":\"N\"}catch(e){}return hp');hp="
+"tcf(s,tl);tcf=new Function('s','var e,ct=0;try{s.b.addBehavior(\"#default#clientCaps\");ct=s.b.connectionType}catch(e){}return ct');ct=tcf(s)}}}else r=''}if(s.pl)while(pn<s.pl.length&&pn<30){ps=s.f"
+"l(s.pl[pn].name,100)+';';if(p.indexOf(ps)<0)p+=ps;pn++}s.resolution=x;s.colorDepth=c;s.javascriptVersion=j;s.javaEnabled=v;s.cookiesEnabled=k;s.browserWidth=bw;s.browserHeight=bh;s.connectionType=c"
+"t;s.homepage=hp;s.plugins=p;s.td=1}if(vo){s.pt(s.vl_g,',','vo2',vb);s.pt(s.vl_g,',','vo1',vo)}if((vo&&vo._t)||!s.m_m('d')){if(s.usePlugins)s.doPlugins(s);var l=s.wd.location,r=tfs.document.referrer"
+";if(!s.pageURL)s.pageURL=l.href?l.href:l;if(!s.referrer&&!s._1_referrer){s.referrer=r;s._1_referrer=1}s.m_m('g');if(s.lnk||s.eo){var o=s.eo?s.eo:s.lnk;if(!o)return '';var p=s.pageName,w=1,t=s.ot(o)"
+",n=s.oid(o),x=o.s_oidt,h,l,i,oc;if(s.eo&&o==s.eo){while(o&&!n&&t!='BODY'){o=o.parentElement?o.parentElement:o.parentNode;if(!o)return '';t=s.ot(o);n=s.oid(o);x=o.s_oidt}oc=o.onclick?''+o.onclick:''"
+";if((oc.indexOf(\"s_gs(\")>=0&&oc.indexOf(\".s_oc(\")<0)||oc.indexOf(\".tl(\")>=0)return ''}if(n)ta=o.target;h=s.oh(o);i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h.substring(0,i);l=s.linkName"
+";t=s.linkType?s.linkType.toLowerCase():s.lt(h);if(t&&(h||l))q+='&pe=lnk_'+(t=='d'||t=='e'?s.ape(t):'o')+(h?'&pev1='+s.ape(h):'')+(l?'&pev2='+s.ape(l):'');else trk=0;if(s.trackInlineStats){if(!p){p="
+"s.pageURL;w=0}t=s.ot(o);i=o.sourceIndex;if(s.gg('objectID')){n=s.gg('objectID');x=1;i=1}if(p&&n&&t)qs='&pid='+s.ape(s.fl(p,255))+(w?'&pidt='+w:'')+'&oid='+s.ape(s.fl(n,100))+(x?'&oidt='+x:'')+'&ot="
+"'+s.ape(t)+(i?'&oi='+i:'')}}if(!trk&&!qs)return '';s.sampled=s.vs(sed);if(trk){if(s.sampled)code=s.mr(sess,(vt?'&t='+s.ape(vt):'')+s.hav()+q+(qs?qs:s.rq()),0,id,ta);qs='';s.m_m('t');if(s.p_r)s.p_r("
+");s.referrer=''}s.sq(qs);}else{s.dl(vo);}if(vo)s.pt(s.vl_g,',','vo1',vb);s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';if(s.pg)s.wd.s_lnk=s.wd.s_eo=s.wd.s_link"
+"Name=s.wd.s_linkType='';if(!id&&!s.tc){s.tc=1;s.flushBufferedRequests()}return code};s.tl=function(o,t,n,vo){var s=this;s.lnk=s.co(o);s.linkType=t;s.linkName=n;s.t(vo)};if(pg){s.wd.s_co=function(o)"
+"{var s=s_gi(\"_\",1,1);return s.co(o)};s.wd.s_gs=function(un){var s=s_gi(un,1,1);return s.t()};s.wd.s_dc=function(un){var s=s_gi(un,1);return s.t()}}s.ssl=(s.wd.location.protocol.toLowerCase().inde"
+"xOf('https')>=0);s.d=document;s.b=s.d.body;if(s.d.getElementsByTagName){s.h=s.d.getElementsByTagName('HEAD');if(s.h)s.h=s.h[0]}s.n=navigator;s.u=s.n.userAgent;s.ns6=s.u.indexOf('Netscape6/');var ap"
+"n=s.n.appName,v=s.n.appVersion,ie=v.indexOf('MSIE '),o=s.u.indexOf('Opera '),i;if(v.indexOf('Opera')>=0||o>0)apn='Opera';s.isie=(apn=='Microsoft Internet Explorer');s.isns=(apn=='Netscape');s.isope"
+"ra=(apn=='Opera');s.ismac=(s.u.indexOf('Mac')>=0);if(o>0)s.apv=parseFloat(s.u.substring(o+6));else if(ie>0){s.apv=parseInt(i=v.substring(ie+5));if(s.apv>3)s.apv=parseFloat(i)}else if(s.ns6>0)s.apv="
+"parseFloat(s.u.substring(s.ns6+10));else s.apv=parseFloat(v);s.em=0;if(s.em.toPrecision)s.em=3;else if(String.fromCharCode){i=escape(String.fromCharCode(256)).toUpperCase();s.em=(i=='%C4%80'?2:(i=="
+"'%U0100'?1:0))}s.sa(un);s.vl_l='dynamicVariablePrefix,visitorID,vmk,visitorMigrationKey,visitorMigrationServer,visitorMigrationServerSecure,ppu,charSet,visitorNamespace,cookieDomainPeriods,cookieLi"
+"fetime,pageName,pageURL,referrer,currencyCode';s.va_l=s.sp(s.vl_l,',');s.vl_t=s.vl_l+',variableProvider,channel,server,pageType,transactionID,purchaseID,campaign,state,zip,events,products,linkName,"
+"linkType';for(var n=1;n<76;n++)s.vl_t+=',prop'+n+',eVar'+n+',hier'+n+',list'+n;s.vl_l2=',tnt,pe,pev1,pev2,pev3,resolution,colorDepth,javascriptVersion,javaEnabled,cookiesEnabled,browserWidth,browse"
+"rHeight,connectionType,homepage,plugins';s.vl_t+=s.vl_l2;s.va_t=s.sp(s.vl_t,',');s.vl_g=s.vl_t+',trackingServer,trackingServerSecure,trackingServerBase,fpCookieDomainPeriods,disableBufferedRequests"
+",mobile,visitorSampling,visitorSamplingGroup,dynamicAccountSelection,dynamicAccountList,dynamicAccountMatch,trackDownloadLinks,trackExternalLinks,trackInlineStats,linkLeaveQueryString,linkDownloadF"
+"ileTypes,linkExternalFilters,linkInternalFilters,linkTrackVars,linkTrackEvents,linkNames,lnk,eo,_1_referrer';s.va_g=s.sp(s.vl_g,',');s.pg=pg;s.gl(s.vl_g);if(!ss)s.wds()",
w=window,l=w.s_c_il,n=navigator,u=n.userAgent,v=n.appVersion,e=v.indexOf('MSIE '),m=u.indexOf('Netscape6/'),a,i,s;if(un){un=un.toLowerCase();if(l)for(i=0;i<l.length;i++){s=l[i];if(!s._c||s._c=='s_c'){if(s.oun==un)return s;else if(s.fs&&s.sa&&s.fs(s.oun,un)){s.sa(un);return s}}}}w.s_an='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
w.s_sp=new Function("x","d","var a=new Array,i=0,j;if(x){if(x.split)a=x.split(d);else if(!d)for(i=0;i<x.length;i++)a[a.length]=x.substring(i,i+1);else while(i>=0){j=x.indexOf(d,i);a[a.length]=x.subst"
+"ring(i,j<0?x.length:j);i=j;if(i>=0)i+=d.length}}return a");
w.s_jn=new Function("a","d","var x='',i,j=a.length;if(a&&j>0){x=a[0];if(j>1){if(a.join)x=a.join(d);else for(i=1;i<j;i++)x+=d+a[i]}}return x");
w.s_rep=new Function("x","o","n","return s_jn(s_sp(x,o),n)");
w.s_d=new Function("x","var t='`^@$#',l=s_an,l2=new Object,x2,d,b=0,k,i=x.lastIndexOf('~~'),j,v,w;if(i>0){d=x.substring(0,i);x=x.substring(i+2);l=s_sp(l,'');for(i=0;i<62;i++)l2[l[i]]=i;t=s_sp(t,'');d"
+"=s_sp(d,'~');i=0;while(i<5){v=0;if(x.indexOf(t[i])>=0) {x2=s_sp(x,t[i]);for(j=1;j<x2.length;j++){k=x2[j].substring(0,1);w=t[i]+k;if(k!=' '){v=1;w=d[b+l2[k]]}x2[j]=w+x2[j].substring(1)}}if(v)x=s_jn("
+"x2,'');else{w=t[i]+' ';if(x.indexOf(w)>=0)x=s_rep(x,w,t[i]);i++;b+=62}}}return x");
w.s_fe=new Function("c","return s_rep(s_rep(s_rep(c,'\\\\','\\\\\\\\'),'\"','\\\\\"'),\"\\n\",\"\\\\n\")");
w.s_fa=new Function("f","var s=f.indexOf('(')+1,e=f.indexOf(')'),a='',c;while(s>=0&&s<e){c=f.substring(s,s+1);if(c==',')a+='\",\"';else if((\"\\n\\r\\t \").indexOf(c)<0)a+=c;s++}return a?'\"'+a+'\"':"
+"a");
w.s_ft=new Function("c","c+='';var s,e,o,a,d,q,f,h,x;s=c.indexOf('=function(');while(s>=0){s++;d=1;q='';x=0;f=c.substring(s);a=s_fa(f);e=o=c.indexOf('{',s);e++;while(d>0){h=c.substring(e,e+1);if(q){i"
+"f(h==q&&!x)q='';if(h=='\\\\')x=x?0:1;else x=0}else{if(h=='\"'||h==\"'\")q=h;if(h=='{')d++;if(h=='}')d--}if(d>0)e++}c=c.substring(0,s)+'new Function('+(a?a+',':'')+'\"'+s_fe(c.substring(o+1,e))+'\")"
+"'+c.substring(e+1);s=c.indexOf('=function(')}return c;");
c=s_d(c);if(e>0){a=parseInt(i=v.substring(e+5));if(a>3)a=parseFloat(i)}else if(m>0)a=parseFloat(u.substring(m+10));else a=parseFloat(v);if(a>=5&&v.indexOf('Opera')<0&&u.indexOf('Opera')<0){w.s_c=new Function("un","pg","ss","var s=this;"+c);return new s_c(un,pg,ss)}else s=new Function("un","pg","ss","var s=new Object;"+s_ft(c)+";return s");return s(un,pg,ss)}