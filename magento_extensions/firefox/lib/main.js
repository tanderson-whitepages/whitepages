var self = require("sdk/self");
require("sdk/tabs").on("ready", runScript);
function runScript(tab){
	tab.attach({
		contentScriptOptions: {"wppImgURL": self.data.url("favicon.ico")},
		contentScriptFile:	self.data.url("whitepagesLinks.js")
	});
}