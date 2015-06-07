// ==UserScript==
// @name         Whitepages Pro Reverse Phone
// @namespace    http://pro.whitepages.com/
// @version      1.0
// @description  Implement deep links to Whitepages Pro Web for phone numbers found on pages.
// @author       Trevor Anderson <tanderson@whitepages.com>
// @grant        none
// ==/UserScript==

//we can't just insert links for phone numbers found anywhere within the page content,
//because then we could end up sticking an anchor tag within another HTML tag.
//So what we do is identify all text nodes in the HTML, and look for phone #s only within there.
//the function below finds text nodes within a parent node, and inserts deep links as needed.
function insertPhoneLinks(node){
	//if we have a script node, skip it
	if(node.tagName == "SCRIPT" || node.tagName == "STYLE")
		return;
		
	var children = node.childNodes;
	for(var i = 0; i < children.length; i++){
	
		//if we have a text node, then replace any phone #s with reverse phone links.
		if(children[i].nodeType == 3){
			//if the next node is followed by a node with class name = 'wpp_rp', then we've already built a link and should skip.
			if(i < children.length-1){
				if(children[i+1].className == "wpp_rp")
					continue;
			}			
			//we can't just insert html tags into a text node, so we have to replace the text node with
			//a new span node that contains our phone link.
			var phonePattern = /((?:^|\D))((?:\+1)?\(?\d{3}\)?\s?[\-\.]?\d{3}[\-\.]?\d{4})(?=$|[^\d^\w])/g
			var newContent = children[i].nodeValue.replace(phonePattern, function(match, p1, p2){ return p1+p2+"<a class=\"wpp_rp\" target=\"_blank\" href=\"https://pro.lookup.whitepages.com/phones?number="+p2.replace(/\D/g,"")+"\"><img src=\""+self.options.wppImgURL+"\" height=\"16\" width=\"16\"></a>"; } );
			
			//if the pattern replacement above did something, then we need to set this new content to actually create the link.
			if(newContent != children[i].nodeValue){
				var newSpan = document.createElement("span");
				newSpan.innerHTML = newContent;
				children[i].parentNode.replaceChild(newSpan,children[i]);
			}
			
		//if this node is not text, but it does have children, then recursively process them.
		}else{
			var newChildren = children[i].childNodes;
			if(newChildren.length > 0)
				insertPhoneLinks(children[i]);
		}
	}
}
//we start at the top level, the document body. This way we can make sure to get all possible phone links.
insertPhoneLinks(document.body);
//there may be additional data loaded via AJAX, so try again in 2 seconds
setTimeout(function(){insertPhoneLinks(document.body);},2000);
//sites like Google may bring up additional results after a search that does not require reloading the page.
//so try again in the case of any keyboard press or mouse click on the page.
document.addEventListener("keydown",function(){setTimeout(function(){insertPhoneLinks(document.body);},2000);});
document.addEventListener("click",function(){insertPhoneLinks(document.body);});
