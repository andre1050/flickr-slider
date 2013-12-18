/** Filename: Module1Spec.js
    Abstract: Test Specification for Module
**/

describe("Testing Flickr Module", function() {

	// Assign module reference to local variable for brevity
	var Flickr = App.Flickr;

    it('Should output the module name', function() {
    	console.log(Flickr.moduleName);
     	expect(Flickr.moduleName).toBeDefined();
    });
    
});