//for global vars

//******************
var dialogsTag = null; //dialogs tag
var biggestOffset = null;
var aUsers = new Map();
var pageFlag = true;
var currentPageOffset = 0;
var userFlag = true;
var messageFlag = true;
var messageOffset = 0;
var userOffset = 0;
var messagesBiggestOffset = 0;
var dialogsContent = [];
var finalNames = [];
//******************

//******DOC TEMPLATE***********


var openT = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.0//EN" "http://www.wapforum.org/DTD/xhtml-mobile10.dtd"><html xmlns="http://www.w3.org/1999/xhtml" class="page page_js_no page_withVolumeLine"><head><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /><meta http-equiv="content-type" content="text/html; charset=utf-8" /><meta name="format-detection" content="telephone=no" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="MobileOptimized" content="176" /><meta name="HandheldFriendly" content="True" /><base id="base"><meta name="robots" content="noindex,nofollow" /><title>Диалоги</title><link rel="shortcut icon" href="https://m.vk.com/images/faviconnew.ico?5"></link><link type="text/css" rel="stylesheet" href="https://m.vk.com/css/s_cfmxw.css?381"></link><link type="text/css" rel="stylesheet" media="only screen" href="https://m.vk.com/css/s_yzgt.css?222"></link><script type="text/javascript" src="/js/s_c.js?352"></script><link rel="canonical" href="https://vk.com/im?sel=c39"></link><link rel="alternate" href="android-app://com.vkontakte.android/vkontakte/m.vk.com/im?sel=c39" /></head><body id="vk" class="page__body _hover _hfixed vk_stickers_hints_support_yes _lm opera_mini_no vk_al_yes" onresize="onBodyResize(true);" style="width: 50%; margin: 0 auto">';
var closeT = '</body></html>';


//******************************



// create xhr
var xhr = new XMLHttpRequest();
//open mail page
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
     if(xhr.status == 200) {
	//console.log(xhr);
	console.log('Dialogs page loaded');
	dialogsTag = xhr.responseXML.getElementById('dialogs');
	//console.log(dialogsTag);
	var lastLink = dialogsTag.getElementsByClassName('pagination')[0].getElementsByTagName('a')[3].href;
	biggestOffset = parseInt(lastLink.slice(lastLink.indexOf('=')+1));
	console.log('There are '+(biggestOffset/20+1)+' pages in your dialogs');

	console.log('Begin collecting dialogs');
	collectDialogs();

     }
  }
};

try{

xhr.open('GET','mail');
xhr.responseType = 'document';
xhr.send();

} catch(e){

console.log(e);

}

//some functions

function collectDialogs(){
	var dialogsXHR = new XMLHttpRequest();

	dialogsXHR.onreadystatechange = function(){
		if(dialogsXHR.readyState == 4){
			if(dialogsXHR.status == 200){
				var dPage = dialogsXHR.responseXML.getElementById('dialogs');
				var allDDirty = dPage.getElementsByTagName('a');

				//clear allDDirty
				var allD = [];
				for(i=0;i<allDDirty.length;i++){
					if(allDDirty[i].className.indexOf('peer') > -1){
						allD.push(allDDirty[i]);
					}
				}

				//console.log(allD)
				for(i=0;i<allD.length;i++){
					var name =
					allD[i]
					.getElementsByClassName('di_cont')[0]
					.getElementsByClassName('di_head')[0]
					.getElementsByClassName('mi_author')[0]
					.innerHTML; //get name

					if(!allD[i].getElementsByClassName('di_chat_name')[0] == false){ //get names if polydialog
						name =
						allD[i]
						.getElementsByClassName('di_cont')[0]
						.getElementsByClassName('di_head')[0]
						.getElementsByClassName('mi_author')[0]
						.getElementsByClassName('mi_author')[0]
						.innerHTML //if polydialog
					}

					var uid = parseInt(allD[i].className.slice(allD[i].className.indexOf('peer')+4)); //get uid

					aUsers.set(name, uid);	//name, uid
					//console.log(name+' '+uid.toString());
				}

				if(currentPageOffset < biggestOffset){
					currentPageOffset += 20;
					nextPage();
				} else {
					pageFlag = false;
					console.log('All dialogs collected');
					collectMessages();
				}
			}
		}
	}

	try {

		function nextPage(){
			console.log('Page '+(currentPageOffset/20+1)+' readed');
			dialogsXHR.open('GET','mail?offset='+currentPageOffset);
			dialogsXHR.responseType = 'document';
			dialogsXHR.send();
		}

		if(pageFlag){
			nextPage();
		}

	} catch(e) {
		console.log(e);
	}

}

function collectMessages(){
	console.log('Begin collecting messages');
	var messagesXHR = new XMLHttpRequest();
	var messagesPagesXHR = new XMLHttpRequest();
	var namesArr = [];

	for(var key of aUsers.keys()){ //get all names
		namesArr.push(key);
	}

	messagesXHR.onreadystatechange = function(){
		if(messagesXHR.readyState == 4){
			if(messagesXHR.status == 200){

				var temp = messagesXHR.responseXML.getElementsByClassName('pg_link')[3];

				if(!temp == false){
					messagesBiggestOffset = parseInt(temp.href.slice(temp.href.indexOf('offset')+7));
				} else {
					messagesBiggestOffset = 0;
				}

				console.log('This dialog contains '+(messagesBiggestOffset/20+1)+' pages');

				nextMessagePage();
			}
		}
	}

	messagesPagesXHR.onreadystatechange = function(){
		if(messagesPagesXHR.readyState == 4){
			if(messagesPagesXHR.status == 200){
				var mPage = messagesPagesXHR.responseXML.getElementById('messages'+aUsers.get(namesArr[userOffset])); //div block

				try{
					mPage
					.getElementsByClassName('di_activity')[0]
					.parentElement
					.removeChild(mPage.getElementsByClassName('di_activity')[0]);

				} catch(e) {

				}

				try{
					mPage
					.getElementsByClassName('pagination')[0]
					.parentElement
					.removeChild(mPage.getElementsByClassName('pagination')[0]);
				} catch(e) {

				}

				//console.log(mPage);
				try{

				dialogsContent[userOffset] += mPage.innerHTML;

				} catch(e){

				}



				if(messageOffset < messagesBiggestOffset && userOffset < namesArr.length){
					messageOffset += 20;
					nextMessagePage();
				} else
					if(messageOffset == messagesBiggestOffset && userOffset < namesArr.length-1){
						messageOffset = 0;
						dialogsContent[userOffset] += closeT;

						//editing links
							dialogsContent[userOffset].replace("href=\"/",'href="https://m.vk.com/');
						//******************

						userOffset++;

            var blob = new Blob([dialogsContent[userOffset-1]],{type: 'text/html;charset=utf-8'});
        		saveAs(blob, (userOffset-1)+'_'+namesArr[userOffset-1]);
            /**********************/
						nextUser();
						//console.log('nextUser');
					} else {
						//console.log('endwork');
						dialogsContent[userOffset] += closeT;

						//editing links
							dialogsContent[userOffset].replace("href=\"/",'href="https://m.vk.com/');
						//******************

            var blob = new Blob([dialogsContent[userOffset]],{type: 'text/html;charset=utf-8'});
        		saveAs(blob, (userOffset)+'_'+namesArr[userOffset]);



						userFlag = false;
						console.log('All messages are read!');
						finalNames = namesArr;
						//saveAll();
					}

			}
		}
	}

	try {

		function nextUser(){

			console.log((userOffset+1)+'/'+(namesArr.length).toString()+': '+namesArr[userOffset]); //stat


			//dialogsContent.push('');

			//addind template
			dialogsContent.push(openT);

			messagesXHR.open('GET','mail?act=show&peer='+aUsers.get(namesArr[userOffset]));
			messagesXHR.responseType = 'document';
			messagesXHR.send();

		}

		function nextMessagePage(){
			console.log('Page: '+(messageOffset/20+1)+'/'+(messagesBiggestOffset/20+1));
			messagesPagesXHR.open('GET','mail?act=show&peer='+aUsers.get(namesArr[userOffset])+'&offset='+messageOffset);
			messagesPagesXHR.responseType = 'document';
			messagesPagesXHR.send();
		}

	} catch(e) {
		console.log(e);
	}

	if(userFlag){
		nextUser();
	}
}

function saveAll(){
	for(i=0;i<dialogsContent.length;i++){
		var blob = new Blob([dialogsContent[i]],{type: 'text/html;charset=utf-8'});
		saveAs(blob, i+'_'+finalNames[i]);
	}
}


function saveCurr(){
  var blob = new Blob([dialogsContent[userOffset]],{type: 'text/html;charset=utf-8'});
  saveAs(blob, userOffset+'_'+finalNames[i]);
}




/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}
