var globalScope = 'this is global scope';
var globalScopeObject = {
	prop: 'dot accessor in outer block scope'
};
var globalFunction = function() {
		return 'global function call';
	};

var wrapped = function(){
	var outerBlockScope = 'this is outer block scope';
	var outerBlockScopeObject = {
		prop: 'dot accessor in outer block scope'
	};
	var outerBlockFunction = function() {
		return 'outer block function call';
	};
	return function(name){
		var innerBlockScope = 'this is inner block scope';
		var innerBlockScopeObject = {
			prop: 'dot accessor in inner block scope'
		};
		var innerBlockFunction = function() {
			return 'inner block function call';
		};
		try{
			return eval(name);
		}catch(e){
			if(typeof console != 'undefined'){
				console.log(e);
			}
			return null;
		};
	};
};

var test = wrapped();

console.log(test('globalScope'));
console.log(test('outerBlockScope'));
console.log(test('innerBlockScope'));
console.log(test('globalScopeObject.prop'));
console.log(test('outerBlockScopeObject.prop'));
console.log(test('innerBlockScopeObject.prop'));
console.log(test('globalFunction()'));
console.log(test('outerBlockFunction()'));
console.log(test('innerBlockFunction()'));