/*

	- process for showing a view
		0. check if the view is already in the page if it's not an item renderer
		1a. if not, find and compile the template
		1b. if it is, grab the current view in the page
		2. collect all the data associated with the page
		3. render the page
		4. transition the page onto the screen
*/


$script.ready('bundle', function() {

// PROTOTYPE

var Jet = function(config){
	this.config 		= config;
	this.templates 		= {};
	this.views 			= {};
	this.data 			= {
		chrome: null
	};
	this.elementCounter = 0;
	this.displayList	= [];

	this.body			= $('body');
};

// CORE VIEW METHODS

Jet.prototype.setupView = function(viewID){
	var spec 			= this.viewDefinition[viewID];
	// check if view is already in page
	// var view = this.body.find('')
	// it's not in the page, get the template
	var template 		= this.templates[spec.template]
		, data 			= this.gatherData(spec)
		, view 			= $(template(data));
	this.views[viewID] 	= view;
	this.body.append(view);
	// TODO: animate on screen
	// wire up all the actions
	for(var key in spec.actions){
		view.on('touchstart click', '.'+key, spec.actions[key], function(e){
			console.log('click on', $(e.currentTarget), e.data);
		});
	}

	// CREATE AND BIND THE DATA, update the chrome with the appropriate data from the view spec
	// this.watch(this.data, 'chrome', function(propertyName, oldValue, newValue, jet){
	// 	self.chrome = self.templates[chrome](self.data.chrome);
	// 	self.body.find('.chrome').replaceWith(self.chrome);
	// });
	this.displayList.push(viewID);
	return view;
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

Jet.prototype.gatherData = function(viewSpec){
	return {};
};

// CORE ACTION METHODS

Jet.prototype.initializeActions = function(){
	var self = this;
	$('body').on('touchstart click', '.trigger', function(){
		self.onTrigger.apply(self, arguments);
	});
};

// Jet.prototype.watch = function(target, prop, handler){
// 	if( target.__lookupGetter__(prop) != null ){
// 		return true;
// 	}
// 	var oldval = target[prop], newval = oldval,
// 	self = this,
// 	getter = function () {
// 		return newval;
// 	},
// 	setter = function (val) {
// 		if( self.$.isArray(val) ){
// 			val = self._extendArray(val, handler, self);
// 		}
// 		oldval = newval;
// 		newval = val;
// 		handler.call(target, prop, oldval, val, self);
// 	};
// 	if (delete target[prop]) { // can't watch constants
// 		if (Object.defineProperty) { // ECMAScript 5
// 			Object.defineProperty(target, prop, {
// 				get: getter,
// 				set: setter,
// 				enumerable: false,
// 				configurable: true
// 			});
// 		} else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
// 			Object.prototype.__defineGetter__.call(target, prop, getter);
// 			Object.prototype.__defineSetter__.call(target, prop, setter);
// 		}
// 	}
// 	return this;
// };

// Jet.prototype.unwatch = function(target, prop){
// 	var val = target[prop];
// 	delete target[prop]; // remove accessors
// 	target[prop] = val;
// 	return this;
// };

// Allows operations performed on an array instance to trigger bindings
// Jet.prototype._extendArray = function(arr, callback, motive){
// 	if (arr.__wasExtended === true) return;

// 	function generateOverloadedFunction(target, methodName, self){
// 		return function(){
// 			var oldValue = Array.prototype.concat.apply(target);
// 			var newValue = Array.prototype[methodName].apply(target, arguments);
// 			target.updated(oldValue, motive);
// 			return newValue;
// 		};
// 	} 
// 	arr.updated = function(oldValue, self){
// 		callback.call(this, 'items', oldValue, this, motive);
// 	};
// 	arr.concat 	= generateOverloadedFunction(arr, 'concat', motive);
// 	arr.join	= generateOverloadedFunction(arr, 'join', motive);
// 	arr.pop 	= generateOverloadedFunction(arr, 'pop', motive);
// 	arr.push 	= generateOverloadedFunction(arr, 'push', motive);
// 	arr.reverse = generateOverloadedFunction(arr, 'reverse', motive);
// 	arr.shift 	= generateOverloadedFunction(arr, 'shift', motive);
// 	arr.slice 	= generateOverloadedFunction(arr, 'slice', motive);
// 	arr.sort 	= generateOverloadedFunction(arr, 'sort', motive);
// 	arr.splice 	= generateOverloadedFunction(arr, 'splice', motive);
// 	arr.unshift = generateOverloadedFunction(arr, 'unshift', motive);
// 	arr.__wasExtended = true;
// 	return arr;
// }

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
			$('head').append('<link rel="stylesheet" type="text/css" href="'+definition.styles+'"/>');
			async.auto({
				templates: function(callback){
					self.load(definition.templates, function(templates){
						self.templateDefintion = templates;
						$(templates).appendTo('body');
						self.body.find('[type="text/x-handlebars"]').each(function(index, element){
							var $element = $(element);
							self.templates[$element.attr('id')] = Handlebars.compile($element.text());
						});
						callback(null, templates);
					});
				}
				, data: function(callback){
					self.load(definition.data, function(data){
						self.dataDefinition = data;
						callback(null, data);
					});
				}
				, views: ['templates', 'data', function(callback){
					self.load(definition.views, function(views){
						self.viewDefinition = views;
						self.initializeViews();
						self.initializeActions();
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