// ==UserScript==
// @name         Whitepages Pro Identity Check - Cybersource
// @namespace    http://pro.whitepages.com/
// @version      1.0
// @description  Implement Deep Links to Whitepages Pro Web Identity Check within Cybersource Decision Manager.
// @author       Trevor Anderson <tanderson@whitepages.com>
// @grant        none
// ==/UserScript==

var currURL = document.url || window.location.href || this.href;
//make sure we are on a Decision Manager screen, on the initial load that contains the contact data (there is a subsequent load identified by the hash at the end of the URL that we don't want).
if((currURL.indexOf('DecisionManagerCaseManagementSearchExecute.do') >= 0 || currURL.indexOf('CaseManagementDetailsLoad') >= 0) && (currURL.indexOf('DecisionManagerCaseManagementSearchExecute.do#') == -1) && (currURL.indexOf('CaseManagementDetailsLoad.do#') == -1))
{
    var wpIP, wpEmail, wpBillName, wpBillStreet, wpBillStreet2, wpBillCity, wpBillState, wpBillZip, wpBillPhone, wpShipName, wpShipStreet, wpShipStreet2, wpShipCity, wpShipState, wpShipZip, wpShipPhone;
    var wpErrors = [];

    //find the order info table and iterate over its rows to find the transaction contact data
    var orderInfoTable = document.getElementById('orderInfoDataTbl');

    //if we failed to find this table, then there has been a site change
    if(!orderInfoTable)
        wpErrors.push('Failed to find the order info table due to website change. The Whitepages script will need to be updated.');
    else
    {
        var orderInfoRows = orderInfoTable.rows;

        for(var i = 0; i < orderInfoRows.length; i++)
        {
            var cols = orderInfoRows[i].cells;
            //if this row contains no data, skip it
            if(cols.length < 2)
                continue;
            //the first column should contain text describing the field on this row
            switch(cols[0].innerHTML)
            {
                case 'IP Address:':
                    //the second column contains links to search the IP in addition to the IP itself, so use RegEx to find the IP.
                    var pattern = /\d+\.\d+\.\d+\.\d+/;
                    wpIP = pattern.exec(cols[1].innerHTML);
                    break;
                case 'Email Address:':
                    //the second column contains an anchor tag whose text is the email.
                    wpEmail = cols[1].childNodes[0].text;
                    break;
            }
        }
        //now identify the billing and shipping data.
        if(document.getElementById("billingName"))
            wpBillName = document.getElementById("billingName").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("billingAddress1"))
            wpBillStreet = document.getElementById("billingAddress1").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("billingAddress2"))
            wpBillStreet2 = document.getElementById("billingAddress2").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("billingCity"))
            wpBillCity = document.getElementById("billingCity").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("billingState"))
            wpBillState = document.getElementById("billingState").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("billingZip"))
            wpBillZip = document.getElementById("billingZip").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("phoneLink"))
            wpBillPhone = document.getElementById("phoneLink").text.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        else{
            var pattern = /\d+/;
            var nodes = document.getElementById("billingHead").childNodes;
            var lastNode = nodes[nodes.length-1];
            wpBillPhone = pattern.exec(lastNode.nodeValue);
        }
        if(document.getElementById("shippingName"))
            wpShipName = document.getElementById("shippingName").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shippingAddress1"))
            wpShipStreet = document.getElementById("shippingAddress1").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shippingAddress2"))
            wpShipStreet2 = document.getElementById("shippingAddress2").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shippingCity"))
            wpShipCity = document.getElementById("shippingCity").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shippingState"))
            wpShipState = document.getElementById("shippingState").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shippingZip"))
            wpShipZip = document.getElementById("shippingZip").innerHTML.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        if(document.getElementById("shipPhoneLink"))
            wpShipPhone = document.getElementById("shipPhoneLink").text.trim().replace("&nbsp;"," ").replace(/\s+/g," ");
        else{
            var pattern = /\d{10}\d*/;
            var nodes = document.getElementById("shippingHead");
            var lastNode = nodes.childNodes[nodes.childNodes.length-1];
            wpShipPhone = pattern.exec(lastNode.nodeValue);
        }
    }
    //now we have all the input data, so we can build the Pro Web Identity Check URLs
    billURL = 'https://pro.lookup.whitepages.com/identity_checks?'
    billURL += 'name='+encodeURIComponent(wpBillName)+'&';
    if(wpBillPhone !== null)
        billURL += 'phone='+encodeURIComponent(wpBillPhone)+'&';
    billURL += 'address_street_line_1='+encodeURIComponent(wpBillStreet)+'&';
    if(document.getElementById("billingAddress2"))
            billURL += 'address_street_line_2='+encodeURIComponent(wpBillStreet2)+'&';
    billURL += 'address_city='+encodeURIComponent(wpBillCity)+'&';
    billURL += 'address_state_code='+encodeURIComponent(wpBillState)+'&';
    billURL += 'address_postal_code='+encodeURIComponent(wpBillZip)+'&';
    billURL += 'email_address='+encodeURIComponent(wpEmail)+'&';
    billURL += 'ip_address='+encodeURIComponent(wpIP)+'&';
	billURL += 'utm_source=userscript&utm_medium=extension&utm_campaign=cybersource';
    
    shipURL = 'https://pro.lookup.whitepages.com/identity_checks?'
    shipURL += 'name='+encodeURIComponent(wpShipName)+'&';
    if(wpShipPhone !== null)
        shipURL += 'phone='+encodeURIComponent(wpShipPhone)+'&';
    if(wpShipStreet !== null){
        shipURL += 'address_street_line_1='+encodeURIComponent(wpShipStreet)+'&';
        if(document.getElementById("shippingAddress2"))
                shipURL += 'address_street_line_2='+encodeURIComponent(wpShipStreet2)+'&';
        shipURL += 'address_city='+encodeURIComponent(wpShipCity)+'&';
        shipURL += 'address_state_code='+encodeURIComponent(wpShipState)+'&';
        shipURL += 'address_postal_code='+encodeURIComponent(wpShipZip)+'&';
    }
    shipURL += 'email_address='+encodeURIComponent(wpEmail)+'&';
    shipURL += 'ip_address='+encodeURIComponent(wpIP)+'&';
	billURL += 'utm_source=userscript&utm_medium=extension&utm_campaign=cybersource';
    
    //edit the phone links to go to Pro Web instead of whitepages.com
    if(document.getElementById("phoneLink"))
        document.getElementById("phoneLink").href = 'https://pro.lookup.whitepages.com/phones?number='+encodeURIComponent(wpBillPhone);
    if(document.getElementById("shipPhoneLink"))
        document.getElementById("shipPhoneLink").href = 'https://pro.lookup.whitepages.com/phones?number='+encodeURIComponent(wpShipPhone);
    
    //now insert links for these Identity Check URLs into billing and shipping sections
    
    var a = document.createElement("a");
	var linkText = document.createTextNode("Verify with Whitepages");
	a.href = billURL;
	a.target = "_blank";
	a.appendChild(linkText);
	a.style.font = "bold 14px calibri";
	a.style.color = "#F37320";
	document.getElementById('billingHead').appendChild(a);
    
    var a = document.createElement("a");
	var linkText = document.createTextNode("Verify with Whitepages");
	a.href = shipURL;
	a.target = "_blank";
	a.appendChild(linkText);
	a.style.font = "bold 14px calibri";
	a.style.color = "#F37320";
	document.getElementById('shippingHead').appendChild(a);
	
}