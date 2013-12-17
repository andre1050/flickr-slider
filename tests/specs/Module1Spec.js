/** Filename: Module1Spec.js
    Abstract: Test Specification for Module
**/

describe("Testing Module 1", function() {
	var Module1 = App.Module1;
    it('Should output the module name', function() {
    	console.log(Module1.moduleName);
     	expect(Module1.moduleName).toBeDefined();
    });
    it('should output the module name and dependencies', function() {
    	console.log(Module1.outputModuleName());
     	expect(Module1.outputModuleName()).toBeDefined();
    });
});