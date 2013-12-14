/** Filename: Module1Spec.js
    Abstract: AMD-compatible module for Require.js
**/

define(["Module1"], function (Module1) {

	describe("Testing Module 1", function() {
	    it('Should output the module name', function() {
	    	//console.log(Module1.moduleName);
	     	expect(Module1.moduleName).toBeDefined();
	    });
	    it('should output the module name and dependencies', function() {
	    	console.log(Module1.outputModuleName());
	     	expect(Module1.outputModuleName()).toBeDefined();
	    });
	});
  
	return {
		name: "Module1Spec"
	}
    
});