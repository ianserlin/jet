$script.ready('bundle', function() {

// PROTOTYPE

var Jet = function(config){
	this.config = config;
};

// EVENT HANDLERS

Jet.prototype.onApplicationDefinitionLoaded = function(definition) {
	this.loadViews(definition.views);
	this.loadTemplates(definition.templates);
	this.loadStyles(definition.styles);
};

Jet.prototype.onViewsLoaded = function(views){
	console.log('TODO: process views', views);
};

Jet.prototype.onTemplatesLoaded = function(templates){
	$(templates).appendTo('body');
};

Jet.prototype.onStylesLoaded = function(styles){
	$([
		'<style type="text/css">'
		, styles
		, '</style>'
	].join('')).appendTo('head');
};

Jet.prototype.loadViews = function(url){
	this.load(url, this.onViewsLoaded);
};

Jet.prototype.loadTemplates = function(url){
	this.load(url, this.onTemplatesLoaded);
};

Jet.prototype.loadStyles = function(url){
	this.load(url, this.onStylesLoaded);
};

// LOAD API

Jet.prototype.onLoadError = function() {
	console.log('TODO: LOAD ERROR'); // can receive 2 or 3 arguments
};

Jet.prototype.load = function(url, callback, dataType){
	$.ajax({
		url: url
		, type: 'GET'
		, dataType: 'jsonp'
		, error: function(jqXHR, status, error){
			self.onLoadError.apply(self, [null, status, error]);
		}
		, success: function(data, status){
			if(status != 'success'){
				self.onLoadError.apply(self, [data, status]);
			}else{
				callback.apply(self, [data, status]);
			}
		}
	});
	var self = this;
};

// BACKGROUND PROCESSES

Jet.prototype.checkForUpdates = function(){
	if(typeof window.applicationCache != 'undefined'){
		window.applicationCache.update();
		window.addEventListener('load', function(e) {
			window.applicationCache.addEventListener('updateready', function(e) {
				if(window.applicationCache.status == window.applicationCache.UPDATEREADY){
					// Browser downloaded a new app cache.
					// Swap it in and reload the page to get the new hotness.
					window.applicationCache.swapCache();
					window.location.reload();
				} else {
					// Manifest didn't change. Nothing new on the server.
				}
			}, false);
		}, false);
	}
};

// INITIALIZATION

Jet.prototype.launch = function(){
	// this.checkForUpdates();
	this.load(this.config.applicationUrl, this.onApplicationDefinitionLoaded);
	return this;
}

var app = new Jet(CONFIG).launch();

});