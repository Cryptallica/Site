/**************WilsonBlock Div Carousel**************/
var WILSON_THEMES = [];

function WilsonBlock(windowId, classOn, classOff) {
	"use strict";
	//Check classes 
    this.classOn  = classOn  || "opacityOn";
    this.classOff = classOff || "opacityOff";  
	
	//Script location
	var scripts = document.getElementsByTagName("script");
	for(var i=0;i < scripts.length;i++) {
		var scriptLocation = scripts[i].src.split("wilsonblock.js");
		if(scriptLocation.length === 2) {
			this.serverLocation = scriptLocation[0]; 
		}
	};
	
	//Find all slides. Labeled as div tags
	this.window = document.getElementById(windowId);	
	this.currentSlide = false;	
	
	this.imgs = this.window.getElementsByTagName("img");
	this.imgsHTML = document.createElement("div");
	for(var t = 0; 0 < this.imgs.length; t++) {
		var thisImg = this.imgs[this.imgs.length -1];
		thisImg.setAttribute("data", t);
		this.imgsHTML.appendChild(thisImg);
	}

	//Initialize the wilson
	this.init();
}

//Set up the slides and Buttons
WilsonBlock.prototype = {
	init: function() {
		this.layoutCreate();
		this.previewSetup();
		this.navSetup();
		//this.clearSlides();
		this.setTheme("wilsonbones");
		this.setSlide(0);
		return this;
	},
	
	layoutCreate: function() {
		//Create main previewer
		this.previewer = document.createElement("div");
		this.window.innerHTML = null;
		this.previewer.innerHTML = this.imgsHTML.innerHTML;
		this.window.appendChild(this.previewer);
		
		this.navigation = document.createElement("div");
		this.navigation.innerHTML = this.imgsHTML.innerHTML;
		this.window.appendChild(this.navigation);
	},
	
	previewSetup:function() {
		var wilson = this;
		for(var i = 0; i < this.previewer.childNodes.length;i++) {
			var thisImg = this.previewer.childNodes[i];
			thisImg.style.display = "none";
			thisImg.animator = new animateHTML(thisImg, {
				
				classOn: wilson.classOn,
				classOff: wilson.classOff
			});
			thisImg.animat
		}	
	},
	
	navSetup: function() {
		var wilson = this;
		addEvent("click", this.navigation, function(e) {
			if(e.target.tagName !== "IMG") {return false;}
			var index = e.target.getAttribute("data");
			wilson.setSlide(index);		
		});	
	},
	
	setSlide: function(indexNumber) {
		if(this.currentIndex === parseInt(indexNumber)) {return true;}

		if(this.currentSlide) {
			this.currentSlide.animator.hide();
		}

		//Set new slide and show it
		this.currentSlide = this.previewer.childNodes[indexNumber];	
		this.currentSlide.animator.show();
		this.currentIndex = parseInt(indexNumber);
		
		this.previewer.scrollTop = 0;	
	}
}

/**************Set Theme**************/
WilsonBlock.prototype.setTheme = function(theme) {
	//Check if theme is loaded
	if(!in_array(theme, WILSON_THEMES)) {
		cssUrl = this.serverLocation + "_themes/" + theme + ".css";		
		//Load and Append Css
		if(typeof(cssUrl) !== "undefined") {
			var wilsonCSS = document.createElement("link");
			wilsonCSS.href = cssUrl;
			wilsonCSS.rel = "stylesheet";
			document.head.appendChild(wilsonCSS);
		}
		
		WILSON_THEMES.push(theme);
	}
	
	this.window.className = theme;
	this.previewer.className = theme + "-previewer";
	this.navigation.className = theme + "-navigator";
}


/**************Utils and Animation**************/
function in_array(needle, haystack, argStrict) {
	var key = '',
	strict = !! argStrict;
	if (strict) {
		for(key in haystack) {if (haystack[key] === needle) {return true;}}
	} else {
		for(key in haystack) {if (haystack[key] == needle) {return true;}}
	}
	return false;
}

function addEvent(evnt, elem, func) {
	if (elem.addEventListener) {
		elem.addEventListener(evnt,func,false);
	} else if (elem.attachEvent) { 
			elem.attachEvent("on"+evnt, func);
	} 
	else { elem[evnt] = func;}
}

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
		if(this.isOn) {this.hide();} 
		else {this.show();}
	}
}