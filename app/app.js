$(function(){

var Jet = function(config){
	this.config = config;
};

Jet.prototype.onApplicationDefinitionLoaded = function(definition) {
	console.log('definition loaded', definition);
};

Jet.prototype.loadDefinition = function(url, callback){
	$.ajax({
		url: url
		, type: 'GET'
		, dataType: 'jsonp'
		, error: function(jqXHR, status, error){
			self.onLoadError.apply(self, arguments);
		}
		, success: function(data, status){
			if(status != 'success'){
				self.onLoadError.apply(self, arguments);
			}else{
				callback.apply(self, arguments);
			}
		}
	});
	var self = this;
};

Jet.prototype.onLoadError = function() {
	alert('TODO: LOAD ERROR'); // can receive 2 or 3 arguments
};

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

Jet.prototype.launch = function(){
	this.checkForUpdates();
	this.getJSON(this.config.applicationUrl, this.onApplicationDefinitionLoaded);
	return this;
}

var app = new Jet(CONFIG).launch();

});