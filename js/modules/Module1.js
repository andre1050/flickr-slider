/** Filename: Module1.js
    Abstract: AMD-compatible module for Require.js
**/

define(["jquery", "use!underscore"], function ($, _) {

	// Private variable
	var moduleName = "Module 1";

	// Private function
	var outputModuleName = function () {
		return "The name of this module is " + moduleName + " and it has no dependencies";
	}

	// Expose public variables and functions to be accessible outside of the module
    return {
        moduleName: moduleName,
        outputModuleName: function () {
        	return outputModuleName();
        }
    };
    
});