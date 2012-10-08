var jsCompressor	= require('./jscompressor')
	, mkdirp		= require('mkdirp')
	, fs			= require('fs')
	, rimraf		= require('rimraf')
	, async			= require('async')
	, child_process	= require('child_process');

var Jet = function(){

};

Jet.prototype.package = function(clientOutputDirectory, serverOutputDirectory, appName, appServerUrl){
	this.clientSource			= __dirname + '/../app';
	this.serverSource 			= __dirname + '/../resources';
	this.clientDestination		= clientOutputDirectory;
	this.serverDestination	 	= serverOutputDirectory;
	this.appName				= appName;
	this.appServerUrl			= appServerUrl;
	// this.packageClient();
	this.packageServer();
};

Jet.prototype.packageServer = function() {
	var self = this;
	this.compileTemplates();
	// rimraf(this.serverDestination, function(err){
	// 	mkdirp(self.serverDestination, function(err){
	// 		if(err){ console.error(err); return; }
	// 	});
	// });
};

Jet.prototype.compileTemplates = function(){
	child_process.exec('cd ' + __dirname + '../resources; handlebars templates -m -f templates.js');
};

Jet.prototype.packageClient = function() {
	var self = this;
	rimraf(this.clientDestination, function(err){
		mkdirp(this.clientDestination, function(err){
			if(err){ console.error(err); return; }
			self.packageClientConfig();
			self.packageClientStylesheets();
			self.packageClientImages();
			self.packageClientHTML();
		});
	});
};

Jet.prototype.packageClientConfig = function() {
	var source = this.clientSource + '/config'
		, destination = this.clientDestination + '/config';
	this.copyFolderContents(source, destination);
};

Jet.prototype.packageClientStylesheets = function() {
	var source = this.clientSource + '/stylesheets'
		, destination = this.clientDestination + '/stylesheets';
	this.copyFolderContents(source, destination);
};

Jet.prototype.packageClientImages = function() {
	var source = this.clientSource + '/images'
		, destination = this.clientDestination + '/images';
	this.copyFolderContents(source, destination);
};

Jet.prototype.packageClientHTML = function(){
	var source = this.clientSource + '/index.html'
		, destination = this.clientDestination + '/index.html';
	this.copy(source, destination);
};

Jet.prototype.copy = function(source, destination) {
	try{
		var reader = fs.createReadStream(source);
		var writer = fs.createWriteStream(destination);
		reader.pipe(writer);
	}catch(e){
		console.log('Error copying', source, destination, e);
	}
};

Jet.prototype.copyFolderContents = function(source, destination){
	var self = this;
	mkdirp(destination, function(err){
		fs.readdir(source, function(err, files){
			async.forEach(files, function(file){
				self.copy(source+'/'+file, destination+'/'+file);
			});
		});
	});
};

module.exports = Jet;