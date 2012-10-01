$script.ready('bundle', function() {

// PROTOTYPE

var Jet = function(config){
	this.config = config;
	this.templates = {};
};

// CORE APPLICATION METHODS

Jet.prototype.template = function(templateID){
	if(_.isUndefined(this.templates[templateID])){
		this.templates[templateID] = Handlebars.compile($('#'+templateID).text());
	}
	return this.templates[templateID];
};

Jet.prototype.injectView = function(viewID){
	var definition = this.viewDefinition[viewID];
	// find and compile template
	var template = this.template(definition.template);
	console.log(template({}));
	// load its data

};

Jet.prototype.processViews = function(views){
	console.log('processing views', views);
};

// EVENT HANDLERS

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
	var self = this;
	// this.checkForUpdates();
	async.waterfall([
		function(callback){
			self.load(self.config.applicationUrl, function(definition){
				self.definition = definition;
				callback(null, definition);
			});
		}
		, function(definition, callback){
			async.auto({
				styles: function(callback){
					self.load(definition.styles, function(styles){
						self.styleDefinition = styles;
						$([
							'<style type="text/css">'
							, styles
							, '</style>'
						].join('')).appendTo('head');
						callback(null, styles);
					});
				}
				, templates: function(callback){
					self.load(definition.templates, function(templates){
						self.templateDefintion = templates;
						$(templates).appendTo('body');
						callback(null, templates);
					});
				}
				, views: ['templates', function(callback){
					self.load(definition.views, function(views){
						self.viewDefinition = views;
						self.processViews(views);
						callback(null, views);
					});
				}]
			}, callback);
		}
	], function(err, results){
		console.log('boot complete', err, results);
	});
	return this;
};

var app = new Jet(CONFIG).launch();
window.app = app;
});