var uglifyParser 	= require('uglify-js').parser
	, uglifier 		= require('uglify-js').uglify;

module.exports = function(input){
	var ast 			= uglifyParser.parse(input); // parse code and get the initial AST
	ast 				= uglifier.ast_mangle(ast); // get a new AST with mangled names
	ast 				= uglifier.ast_squeeze(ast); // get an AST with compression optimizations
	var output	 		= uglifier.gen_code(ast); // compressed code here
	return output;
};