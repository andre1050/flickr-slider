/** Filename: Module2Spec.js
    Abstract: Test spec file for Module2.js
**/

define(["Module2"], function (Module2) {

	describe("Testing Module 2", function() {
	    it('Should output the module name', function() {
	    	//console.log(Module2.moduleName);
	     	expect(Module2.moduleName).toBeDefined();
	    });
	    it('should output the module name and dependencies', function() {
	    	console.log(Module2.outputModuleName());
	     	expect(Module2.outputModuleName()).toBeDefined();
	    });
	});
  
	return {
		name: "Module2Spec"
	}
    
});