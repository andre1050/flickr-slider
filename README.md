flickr-slider
=============

Simple JavaScript app to search the Flickr API for a set of keywords and show the results as a interactive gallery.

Update May 2016: this was built as an assignement for a job back in 2013. I was instructed not to use any frameworks, so I didn't. The code is mostly vanilla JavaScript with some jQuery to access and manipulate the DOM. I used the JavaScript module pattern to encapsulate all the logic inside `\js\modules\Flickr.js` and expose a init method which is called on `\js\App.js`. Today I would have built it slightly differently, but I would still have used modules, because modules are great. If no limitation had been put back then, I would have used Angular.