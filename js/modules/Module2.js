/** Filename: Module2.js
    Abstract: JavaScript Module
**/

App.Module2 = (function ($, _, Module1) {

	// Private variable
	var moduleName = "Module 2";

	// Private function
	var outputModuleName = function () {
		return "The name of this module is " + moduleName + " and its dependency is " + Module1.moduleName;
	}

	// Expose public variables and functions to be accessible outside of the module
    return {
        moduleName: moduleName,
        outputModuleName: function () {
        	return outputModuleName();
        }
    };
    
}(jQuery, _, App.Module1));