// async - 3: launch, setupView, gatherData

$script.ready('bundle', function() {

;(function($){

    $.getScript = function(url, success, error){
        var script = document.createElement("script"),
            $script = $(script);
        script.src = url;

        $("head").append(script);
        $script.bind("load", success);
        $script.bind("error", error);
    };

})(Zepto);

// PROTOTYPE

var Jet = function(config){
	this.config 		= config;
	this.templates 		= {};
	this.views 			= {};
	this.data 			= {
		chrome: {}
	};
	this.elementCounter = 0;
	this.displayList	= [];

	this.body			= $('body');
};

// CORE VIEW METHODS

Jet.prototype.setupView = function(viewID, callback){
	var self 		= this
		, spec 		= this.viewDefinition[viewID]
		, template 	= this.templates[spec.template];
	// check if view is already in page
	// var view = this.body.find('')
	// it's not in the page, get the template
	this.gatherData(spec, function(data){
		console.log('gather data returned', arguments);
		var view 			= $(template(data));
		self.views[viewID] 	= view;
		self.body.append(view);
		// TODO: animate on screen
		self.data.chrome = spec.chrome;
		if(self.chrome) self.chrome.replaceWith(self.templates.chrome(self.data.chrome));

		// CREATE AND BIND THE DATA, update the chrome with the appropriate data from the view spec
		// this.watch(this.data, 'chrome', function(propertyName, oldValue, newValue, jet){
		// 	self.chrome = self.templates[chrome](self.data.chrome);
		// 	self.body.find('.chrome').replaceWith(self.chrome);
		// });
		self.displayList.unshift(viewID);
		if(callback){callback(view)};
	});
};

Jet.prototype.teardownView = function(viewID){
	var view = this.views[viewID];
	view.off('touchstart click');
	// TODO: animate off screen
	view.remove();
	delete this.views[viewID];
	var index = this.displayList.indexOf(viewID);
	if(index != -1){
		this.displayList.splice(index,1);
	}
};

Jet.prototype.createElementId = function(){
	return 'jet'+this.elementCounter++;
};

Jet.prototype.initializeViews = function(){
	this.chrome = this.setupView('chrome');
	this.setupView('index');
};

Jet.prototype.generateRedrawFunction = function(viewID) {
	var self = this;
	return function(propertyName, oldValue, newValue, jet){
		var existingView = self.body.find(viewID);
		if(existingView.length == 1){
			$(existingView).remove();
		}
		self.body.append(this.views[viewID].view);
		self.data[viewID]
	}
};

// CORE DATA METHODS

Jet.prototype.gatherData = function(viewSpec, callback){
	console.log(viewSpec.data);
	if(typeof viewSpec.data == 'undefined'){ return callback({}) }
	var self = this
		, data = {}
		, waiting = 0
		, toLoad = []
		, i;
	for(i = 0; i < viewSpec.data.length; i++){
		if(typeof this.data[viewSpec.data[i]] != 'undefined'){
			data[viewSpec.data[i]] = this.data[viewSpec.data[i]];
		}else{
			waiting++;
			toLoad.push(viewSpec.data[i]);
		}
	}
	for(i = 0; i < toLoad.length; i++){
		this.load(this.dataDefinition[toLoad[i]].document_root + 'p', 
			(function(id){ 
				return function(documents){
					data[id] = documents;
					if(--waiting < 1){ callback(data) }
				};
			})(toLoad[i]));
	}
};

// CORE ACTION METHODS

Jet.prototype.initializeActions = function(){
	var self = this;
	$('body').on('touchstart click', '[data-trigger]', function(){
		self.onTrigger.apply(self, arguments);
	});
};

// EVENT HANDLERS

Jet.prototype.onTrigger = function(e){
	var definition 		= app.viewDefinition
		, displayList	= app.displayList
		, length		= this.displayList.length
		, trigger 		= $(e.currentTarget).data('trigger')
		, action;
	for(var i = 0; i < length; i++){
		action = definition[displayList[i]].actions[trigger];
		// TODO: perform the action
		if(action){ break; }
	}
	console.log('clicked', action);
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
	var self = this;
	// this.checkForUpdates();
	self.load(self.config.applicationUrl, function(definition){
		self.definition 	= definition;
		self.viewDefinition = definition.views;
		self.dataDefinition	= {};
		for(var i = 0; i < definition.proxies.length; i++){
			// turn it into a hash
			self.dataDefinition[definition.proxies[i].id] = definition.proxies[i];
		}
		$('head').append('<link rel="stylesheet" type="text/css" href="'+definition.styles+'"/>');
		$.getScript(definition.templates, function(){
			self.templates = Handlebars.templates;
			self.initializeActions();
			self.initializeViews();	
		});
	});
	return this;
};

var app = new Jet(CONFIG).launch();
window.app = app;
});