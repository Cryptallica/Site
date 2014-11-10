/**************Crypt-donate main**************/
function CryptDonator(idOrObject, customize) {
	//Check find or create window
	this.window;
	if(typeof(idOrObject) === "string") {
		this.window = document.getElementById(idOrObject);
	} else if(typeof(idOrObject) === "object") {
		this.window = idOrObject;
	} else {
		console.log("Invalid id or object for first param");
		return false;
	}
	
	if(!this.window) {
		console.log("Failed to find id or use object");
		return false;
	}
	
	//UI data
	this.currentCoin = false;
	this.viewport = false;
	
	this.init();
}

CryptDonator.prototype = {
	init: function() {
		var crypt = this;
		this.getLocation();
		this.loadStylesheet();
		this.loadLibs();
		this.loadHTML();
		addEvent("load", window, function(){crypt.loadConfig();});	
		addEvent("resize", window, function(){crypt.changeSize();});
		crypt.changeSize();
	},
	
	getLocation: function() {
		//Script location
		var scripts = document.getElementsByTagName("script");
		for(var i=0;i < scripts.length;i++) {
			var scriptLocation = scripts[i].src.split("donator.js");
			if(scriptLocation.length === 2) {
				this.serverLocation = scriptLocation[0]; 
			}
		}
		if(!this.serverLocation) {console.log("Script location not found");}
	},
	
	loadStylesheet: function() {
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.href = this.serverLocation + "_css/crypt-donate.css";
		document.head.appendChild(stylesheet);	
	},
	
	loadLibs: function() {
		var script = document.createElement("script");
		script.src = this.serverLocation + "lib/vanillaqr.js";
		document.head.appendChild(script);	
	},
	
	loadHTML: function() {
		var doc = document;
		var crypt = this;
		
		//create wrapper
		crypt.wrapper = doc.createElement("div");	
		crypt.wrapper.className = "cryptdonate-wrapper";
		
		//Create coin navigator
		crypt.nav = doc.createElement("div");
		crypt.nav.className = "cryptdonate-nav";
		//Create header
		crypt.header = doc.createElement("h2");
		crypt.header.className = "cryptdonate-header";
		crypt.header.innerHTML = "Donate";
		crypt.headerCoin = doc.createElement("span");
		crypt.headerCoin.className = "cryptdonate-headercoin";
		//Create icons div
		crypt.iconsWrap = doc.createElement("span");
		crypt.iconsWrap.className = "cryptdonate-iconswrap";
		addEvent("click", crypt.iconsWrap, function(e) {
			crypt.changeQr(e);
		});
		//append header +  to navigator
		crypt.header.appendChild(crypt.headerCoin);
		crypt.nav.appendChild(crypt.header);
		crypt.nav.appendChild(crypt.iconsWrap);
		
		//Create QR show
		crypt.qrArea = doc.createElement("div");
		crypt.qrArea.className = "cryptdonate-qrArea";
		//Create canvas
		crypt.qrCanvas = doc.createElement("div");
		crypt.qrCanvas.className = "cryptdonate-qrCanvas";
		//Create address
		crypt.qrAddress = doc.createElement("a");
		crypt.qrAddress.className = "cryptdonate-address";
		//AppendQrData
		crypt.qrArea.appendChild(crypt.qrCanvas);
		crypt.qrArea.appendChild(crypt.qrAddress);
		
		//Append All Data to wrapper
		crypt.wrapper.appendChild(crypt.nav);
		crypt.wrapper.appendChild(crypt.qrArea);
		
		//Append all to window
		crypt.window.appendChild(crypt.wrapper);
	},
	
	loadConfig: function() {
		var crypt = this;
		crypt.coin = [];
		
		function extractConfig() {
		    for(var coin in crypt.config) {
                var coinArray = crypt.config[coin];
                coinArray["coinname"] = coin;
                crypt.coin.push(coinArray);
            }
            
            if(crypt.coin.length === 0) {return false;}
            crypt.loadCoins();
            DONATOR_CONFIG = crypt.config;
		}

		//get config.json found in this file root
		ajaxJson(crypt.serverLocation + "config.json", function(responseText) {
			crypt.config = JSON.parse(responseText);
			extractConfig();
		}); 
	},
	
	loadCoins: function() {
		var doc = document;
		var crypt = this;
		var coinArray = [];
		
		var l = crypt.coin.length;
		for(var i = 0; i < l; i++) {
			var coin = crypt.coin[i];
			
			//Create Icons
			var coinDiv = coin["coinDiv"] = doc.createElement("a");	
			coinDiv.setAttribute("data", coin["coinname"]);
			coinDiv.className = "cryptdonate-coindiv";
			
			//Create icon Img
			var coinImage = doc.createElement("img");
			coinImage.src = crypt.serverLocation + "_icons/" + coin["coinname"] + ".png";
			
			//Create Icon Text
			var iconText = doc.createElement("h3");
			iconText.innerHTML = coin["coinname"].capitalize();
			
			//Append Icons
			coinDiv.appendChild(coinImage);
			coinDiv.appendChild(iconText);
			crypt.iconsWrap.appendChild(coinDiv);
						
			//Create Qr wrap
			coin["qrElement"] = doc.createElement("div");
			coin["qrAni"] = new animateHTML(coin["qrElement"], {
				classOn: "sizeUp",
				classOff: "sizeDown"
			});
			
			//Create QR
			coin["address"] = coin["address"] || "";
			var qrUrl = coin["coinname"] + ":" + coin["address"];
			this.qrData = new VanillaQR(coin["qrElement"], qrUrl, {png: true});
			this.qrCanvas.appendChild(this.qrData.qrd);
		}
		
		crypt.changeQr(crypt.coin[0]["coinname"]);
	},
	
	changeQr: function(e) {
		//Get string or coinname
		var crypt = this;
		if(typeof(e) === "string") {var coinName = e;}
		else {
			var thisTarget = e.target;
			if(thisTarget.tagName === "H3" || 
			   thisTarget.tagName === "IMG") {
				thisTarget = thisTarget.parentNode;
			}	
			
			var coinName = thisTarget.getAttribute("data");
		}
		
		//Don't change if currently set.
		if(crypt.currentCoin) {
			if(crypt.currentCoin["coinname"] === coinName) {return;}
			//Hide Old Qr
			setTimeout(function() {
				crypt.currentCoin["coinDiv"].className = "cryptdonate-coindiv";
				crypt.currentCoin["qrAni"].hide();
			}, 50);
		}		
		
		var coin = this.config[coinName];
		this.qrAddress.innerHTML = coin["address"];
		this.qrAddress.href = coin["coinname"] + ":" + coin["address"];
		
		setTimeout(function() {
			coin["qrAni"].show();
			coin["coinDiv"].className = coin["coinDiv"].className + " selected";
			crypt.currentCoin = coin;
			crypt.headerCoin.innerHTML = " " + coin["coinname"].capitalize();
		}, 500);	
	},
	
	changeSize: function() {
		var crypt = this;
		var wz = window.innerWidth;
		//Mobile layout
		if(wz < 570 && crypt.viewport !== "mobile") {
			crypt.wrapper.className = "cryptdonate-wrapper cryptmobile";
			crypt.viewport = "mobile";
			crypt.touchShow();
		} 
		//Desktop layout
		else if(wz > 570 && this.viewport !== "desktop") {
			crypt.wrapper.className = "cryptdonate-wrapper cryptdesktop";
			crypt.viewport = "desktop";
			crypt.header.onclick = null;
			crypt.nav.style.height = null;
		}
	},
	
	touchShow: function() {
		var crypt = this;
		crypt.nav.style.height = "1.5em";
		crypt.header.onclick = function() {
			if(crypt.iconsWrap.style.display === "block") {
				crypt.iconsWrap.style.display = "none";
			} else {
				crypt.iconsWrap.style.display = "block";
			}
		};
	}
};


/**************Utils**************/
function trim(text) {return text.replace(/^\s+|\s+$/g, '');}

function ajaxJson(page, callback) {
	page = page || "";
	
	var request = new XMLHttpRequest();
	request.open("GET", page, true);	
	request.setRequestHeader("Content-Type", "application/json");
	//request.responseType = "text";
	request.onreadystatechange = function() {
		if(request.readyState === 4 && request.status===200) {
			var responseText = trim(this.response);
			callback(responseText);
		}
	};
	request.send(null);
}

function addEvent(evnt, elem, func, bubble) {
	if (elem.addEventListener) {
		elem.addEventListener(evnt,func,bubble);
	} else if (elem.attachEvent) { 
			elem.attachEvent("on"+evnt, func);
	} 
	else { elem[evnt] = func;}
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function addEvent(evnt, elem, func, bubble) {
	if (elem.addEventListener) {
		elem.addEventListener(evnt,func,bubble);
	} else if (elem.attachEvent) { 
			elem.attachEvent("on"+evnt, func);
	} 
	else { elem[evnt] = func;}
}

//Animator
function animateHTML(animator, customize) {
	if(typeof(animator) === "string") {this.animator = document.getElementById(animator);}
	else if(typeof(animator) === "object") {
		this.animator = animator;
	} else {
		console.log("Not object or string for animator.");
		return false;	
	}
	
	customize = customize || {};
	
	//Animation Data
	this.classOn = customize.classOn || "";
	this.classOff = customize.classOff || "";
	this.aniTime = customize.animationTime || 750;
	this.showDefault = customize.showDefault || false;
	//Wrapper Data
	this.isOn = false;
		
	this.init();
}

animateHTML.prototype = {
	init: function() {
		if(!this.showDefault) {this.clear();}	
		else {
			this.isOn = true;
			this.animator.className = this.classOn;	
			this.animator.style.display = "block";
		}
	},
	
	show: function() {
		if(this.isOn) {return true;}
		
		this.animator.style.display = "block";
		this.animator.style.opacity = "0";
		
		var thisOm = this;
		setTimeout(function() {
			thisOm.animator.className = thisOm.classOn;
			thisOm.animator.style.opacity = "1";
		}, 100);
		this.isOn = true;
	},
	
	on: function() {
		this.animator.className = this.classOn;
		this.animator.style.display = "block";
		this.animator.style.opacity = "1";
		this.isOn = true;
	},
	
	hide: function() {
		if(!this.isOn) {return true;}
		
		this.animator.className = this.classOff;
		this.animator.style.opacity = "0";
		
		var thisOm = this;
		setTimeout(function() {
			thisOm.animator.style.display = "none";
		}, thisOm.aniTime);
		this.isOn = false;
	},
	
	clear: function() {
		this.animator.style.display = "none";
		this.animator.className = this.classOff;
		this.isOn = false;
	},
	
	toggle: function() {
		if(this.isOn) {
			this.hide();
		} else {
			this.show();
		}
	}
};