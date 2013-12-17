/** Filename: Module2Spec.js
    Abstract: Test Specification for Module
**/

describe("Testing Module 2", function() {
	var Module2 = App.Module2;
    it('Should output the module name', function() {
    	console.log(Module2.moduleName);
     	expect(Module2.moduleName).toBeDefined();
    });
    it('should output the module name and dependencies', function() {
    	console.log(Module2.outputModuleName());
     	expect(Module2.outputModuleName()).toBeDefined();
    });
});