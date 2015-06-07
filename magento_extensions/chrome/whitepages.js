//Once we've validated we're on the right page (see below), the first thing we need to do is wait until required elements are loaded.
//We'll wait in periods of 500ms, but will only wait up to 10 seconds to prevent any infinite loop from occurring.
function getContactText(numTries){
    numTries++;
    //all the stuff we're looking for is within div tags having the class 'entry-edit'
    var divs = document.getElementsByClassName("entry-edit");
    var contactText = "";
    for(var i = 0; i < divs.length; i++){
        contactText += divs[i].innerHTML;   
    }
    //if sourceText doesn't contain a billing address, it doesn't have what we need yet.
    if(contactText.indexOf(">Billing Address<") >= 0){
        return contactText;
    }else if(numTries >= 20){
        return null;
    }else{
        return setInterval(getContactText(numTries),500);  
    }
}

var currURL = document.url || window.location.href || this.href;
if(currURL.indexOf("/sales_order/view/order_id/") >= 0 && document.title.indexOf("Orders / Sales / Magento Admin") >= 0){
	var contactText = getContactText(0);

	if(contactText !== null){
		   
		/*** COLLECT THE CONTACT INFORMATION FROM THE PAGE ***/

		var custEmail = '';
		var custIP = '';
		var billingName = '';
		var billingStreet = '';
		var billingStreet2 = '';
		var billingCity = '';
		var billingState = '';
		var billingZip = '';
		var billingPhone = '';
		var shippingName = '';
		var shippingStreet = '';
		var shippingStreet2 = '';
		var shippingCity = '';
		var shippingState = '';
		var shippingZip = '';
		var shippingPhone = '';

		//emails should follow the 'Email' label, with some other tags in between.
		var emailPattern = /<label>Email<\/label>(?:\s*<[^>]+>)+(\w+[^<]*\@[\w\.\-]+\.[a-z]{2,4})</;
		var emailResults = emailPattern.exec(contactText);
		if(emailResults){
			if(emailResults.length > 1)
				custEmail = emailResults[1];
		}
		
		var ipPattern = /<label>Placed from IP<\/label>(?:\s*<[^>]+>)+(\d+\.\d+\.\d+\.\d+)/;
		var ipResults = ipPattern.exec(contactText);
		if(ipResults){
			if(ipResults.length > 1)
				custIP = ipResults[1];
		}
		
		/*** PULL BILLING DATA ***/
		//after the 'Billing Address' h4 tag are some tags, then an 'edit' link, some more tags, and then is the billing info blob, contained in an '<address></address>' block
		var billingInfoPattern = />Billing Address<\/h4>(?:\s*<[^>]+>)+\s*Edit(?:\s*<[^>]+>)+\s*<address>((?:[^<]+<[^>]+>)*[^<]+)<\/address>/;
		//billing info is arranged on a number of lines, that are always in the same order. If a particular piece of data is missing, the line is blank.
		var billingInfo = [];
		var billingInfoResults = billingInfoPattern.exec(contactText);
		if(billingInfoResults){
			if(billingInfoResults.length > 1){
				billingInfo = billingInfoResults[1].replace(/<[^<]+>/g,"").split(/\n/);

				billingName = billingInfo[0];
				billingStreet = billingInfo[2];
				billingStreet2 = billingInfo[3];
				var billingCityStateZip = billingInfo[6].split(", ");
				if(billingCityStateZip.length > 2){
					billingCity = billingCityStateZip[0];
					billingState = billingCityStateZip[1];
					billingZip = billingCityStateZip[2];
				}
				//phone is always on the 8th line and prefixed with "T: "
				billingPhone = billingInfo[8].substring(3);
			}
		}
		/*** PULL SHIPPING DATA ***/
		//after the 'Shipping Address' h4 tag are some tags, then an 'edit' link, some more tags, and then is the shipping info blob, contained in an '<address></address>' block
		var shippingInfoPattern = />Shipping Address<\/h4>(?:\s*<[^>]+>)+\s*Edit(?:\s*<[^>]+>)+\s*<address>((?:[^<]+<[^>]+>)*[^<]+)<\/address>/;
		//shipping info is arranged on a number of lines, that are always in the same order. If a particular piece of data is missing, the line is blank.
		var shippingInfo = [];
		var shippingInfoResults = shippingInfoPattern.exec(contactText);
		if(shippingInfoResults){
			if(shippingInfoResults.length > 1){
				shippingInfo = shippingInfoResults[1].replace(/<[^<]+>/g,"").split(/\n/);
		
				shippingName = shippingInfo[0];
				shippingStreet = shippingInfo[2];
				shippingStreet2 = shippingInfo[3];
				var shippingCityStateZip = shippingInfo[6].split(", ");
				if(shippingCityStateZip.length > 2){
					shippingCity = shippingCityStateZip[0];
					shippingState = shippingCityStateZip[1];
					shippingZip = shippingCityStateZip[2];
				}
				//phone is always on the 8th line and prefixed with "T: "
				shippingPhone = shippingInfo[8].substring(3);
			}
		}
		
		/*** BUILD ID CHECK WEB URL ***/

		var WPPURL = "https://pro.lookup.whitepages.com/identity_checks?";
		if(custEmail !== '')
			WPPURL += "email_address="+encodeURIComponent(custEmail)+"&";
		if(custIP !== '')
			WPPURL += "ip_address="+encodeURIComponent(custIP)+"&";
		if(billingName !== '')
			WPPURL += "billing_name="+encodeURIComponent(billingName)+"&";
		if(billingStreet !== '')
			WPPURL += "billing_address_street_line_1="+encodeURIComponent(billingStreet)+"&";
		if(billingStreet2 !== '')
			WPPURL += "billing_address_street_line_2="+encodeURIComponent(billingStreet2)+"&";
		if(billingCity !== '')
			WPPURL += "billing_address_city="+encodeURIComponent(billingCity)+"&";
		if(billingState !== '')
			WPPURL += "billing_address_state="+encodeURIComponent(billingState)+"&";
		if(billingZip !== '')
			WPPURL += "billing_address_postal_code="+encodeURIComponent(billingZip)+"&";
		if(billingPhone !== '')
			WPPURL += "billing_phone="+encodeURIComponent(billingPhone)+"&";
		if(shippingName !== '')
			WPPURL += "shipping_name="+encodeURIComponent(shippingName)+"&";
		if(shippingStreet !== '')
			WPPURL += "shipping_address_street_line_1="+encodeURIComponent(shippingStreet)+"&";
		if(shippingStreet2 !== '')
			WPPURL += "shipping_address_street_line_2="+encodeURIComponent(shippingStreet2)+"&";
		if(shippingCity !== '')
			WPPURL += "shipping_address_city="+encodeURIComponent(shippingCity)+"&";
		if(shippingState !== '')
			WPPURL += "shipping_address_state="+encodeURIComponent(shippingState)+"&";
		if(shippingZip !== '')
			WPPURL += "shipping_address_postal_code="+encodeURIComponent(shippingZip)+"&";
		if(shippingPhone !== '')
			WPPURL += "shipping_phone="+encodeURIComponent(shippingPhone)+"&";

		//cut the trailing '&'
		WPPURL = WPPURL.substring(0,WPPURL.length-1);
	   
		
		//build button 
		var span = document.createElement("span");
		span.innerHTML = "<button id=\"wpp_idcheck_button\" title=\"Verify with Whitepages Pro\" class=\"scalable\" type=\"button\" onclick=\"window.open('"+WPPURL+"','_blank')\">Verify with Whitepages Pro</button>";
		//get button list
		var buttonList = document.getElementsByClassName("form-buttons")[0];
		
		buttonList.appendChild(span);
	}
}