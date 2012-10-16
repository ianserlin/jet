// async - 3: launch, setupView, gatherData

$script.ready('bundle', function() {

// ACTION REGISTRY
var Actions = {
	pageTransition: function(jet, action, options){
		jet.setupView(action.destination, options, function(){
			console.log('view set up via actions registry: ' + action.destination, options)
		});
	}
};

// PROTOTYPE

var Jet = function(config){
	this.config 		= config;
	this.templates 		= {};
	this.views 			= {};
	this.data 			= {
		chrome: {}
	};
	this.displayList	= [];

	this.body			= $('body');
};

// CORE VIEW METHODS

Jet.prototype.setupView = function(viewID, options, callback){
	if(typeof options == 'function'){ 
		callback = options; 
		options = null; 
	}

	var self 		= this
		, spec 		= this.viewDefinition[viewID]
		, template 	= this.templates[spec.template]
		, renderFn 	= function(data){
			console.log('gather data returned', data);
			// TODO: animate on screen
			var view = $(template(data));
			view.on('click touchstart', '[data-trigger]', function(e){
				self.onTrigger.apply(self,[e,spec]);
			});
			self.body.append(view);
			if(spec.chrome){
				self.renderChrome(spec.chrome);
			}
			self.views[viewID] = view;
			self.displayList.unshift(viewID);
			if(callback){callback(view)};
		};
	// check if view is already in page
	// var view = this.body.find('')
	// it's not in the page, get the template
	if(options && options.data){
		renderFn(options.data);
	}else{
		this.gatherData(spec, renderFn);
	}
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

Jet.prototype.renderChrome = function(spec){
	this.data.chrome = spec || {};
	var chrome = $(this.templates.chrome(this.data.chrome));
	chrome.addClass('chrome');
	if(this.chrome){
		this.chrome.replaceWith(chrome);
	}else{
		this.body.append(chrome);
	}
	this.chrome = chrome
};

Jet.prototype.initializeViews = function(){
	var self = this;
	this.renderChrome();
	this.body.on('click touchstart', '.chrome [data-trigger]', function(){
		self.onChromeTrigger.apply(self, arguments);
	});
	this.setupView('index');
};

// CORE DATA METHODS

Jet.prototype.gatherData = function(viewSpec, callback){
	var self = this;
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
					self.data[id] = data[id] = documents;
					if(--waiting < 1){ callback(data) }
				};
			})(toLoad[i]));
	}
};

// CORE ACTION METHODS

Jet.prototype.onTrigger = function(e, spec){
	var triggerName = $(e.currentTarget).data('trigger')
		, trigger 	= spec.actions[triggerName]
		, fn 		= Actions[trigger.action.type];

	var itemId = $(e.currentTarget).data('item-id')
		, collectionId = $(e.currentTarget).data('collection-id')
		, data;
	if(collectionId){
		data = this.data[collectionId];
		if(itemId && data){
			for(var i = 0; i < data.length; i++){
				if(data[i].id == itemId){
					data = data[i];
					break;
				}
			}
		}
	}
	// TODO: before actions
	fn(this, trigger.action, {data: data});
	// TODO: after actions
};

Jet.prototype.onChromeTrigger = function(e){
	var definition 		= this.viewDefinition
		, displayList	= this.displayList
		, length		= this.displayList.length
		, trigger 		= $(e.currentTarget).data('trigger')
		, action, view, viewID, spec;
	for(var i = 0; i < length; i++){
		spec = definition[displayList[i]];
		if(spec.chrome && spec.chrome.actions && spec.chrome.actions[trigger]){
			view = spec;
			viewID = displayList[i];			
			action = spec.chrome.actions[trigger];
			// TODO: perform the action
			break;
		}
	}
	console.log('clicked chrome', action, view, viewID);
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
		$script(definition.templates, function(){
  			self.templates = Handlebars.templates;
			self.initializeViews();	
		});
	});
	return this;
};

var app = new Jet(CONFIG).launch();
window.app = app;
});