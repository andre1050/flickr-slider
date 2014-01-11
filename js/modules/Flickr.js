/** Filename: Module1.js
    Abstract: JavaScript Module
**/

App.Flickr = (function ($, _) {
	"use strict";


	// DOM ELEMENTS
	// Keep a unique reference to every DOM element that we need to control from our app.
	var uiElements = {
		container: $(".js-module-flickr"),
		form: {
			container: $(".js-search-form"),
			searchString: $(".js-search-string")
		},
		slider: {
			container: $(".js-photo-slider"),
			mainPhoto: $(".js-main-photo"),
			prevButton: $(".js-nav-prev"),
			nextButton: $(".js-nav-next")
		},
		caption: {
			container: $(".js-slider-caption"),
			authorName: $(".js-author-name")
		},
		browser: {
			container: $(".js-photo-browser"),
			thumbs: $(".js-browser-thumbs"),
			pagination: $(".js-browser-pages")
		},
		templates: {
			thumbnail: $("#templatePhotoThumb").html(),
			page: $("#templatePageLink").html()
		}
	};


	// FORM MANAGER
	// Handle the form submission and control input validation.
	var formManager = {
		// Default search string
		currentString: "beach, carribean",
		// Capture submit event to handle input valition and get photos through the API.
		bindEvents: function () {
			uiElements.form.container.submit(function () {
				var searchString = uiElements.form.searchString.val();
				searchString = searchString.trim();
				// Basic form validation: accept input if it's not empty.
				if (searchString.length > 0) {
					formManager.currentString = searchString;
					formManager.resetForm();
					photoManager.getPhotos();
				} else {
					// TODO: show form validation message.
					console.error("Cannot submit an empty search form");
				}
				// Prevent default behaviour
				return false;
			});
		},
		// Reset form upon submission
		resetForm: function () {
			uiElements.form.container.trigger("reset");
		}
	};


	// SLIDER MANAGER
	// Manage the main slider and the previous/next buttons.
	var sliderManager = {
		currentIndex: 0,
		navPrev: function () {
			if (sliderManager.currentIndex > 0) {
				var newIndex = sliderManager.currentIndex - 1;
				sliderManager.updateIndex(newIndex);
			}
		},
		navNext: function () {
			if (sliderManager.currentIndex < photoManager.photosArray.length - 1) {
				var newIndex = sliderManager.currentIndex + 1;
				sliderManager.updateIndex(newIndex);
			}
		},
		updateIndex: function (index) {

			sliderManager.currentIndex = index || 0;

			// Update highlighted class in the UI
			var thumbnails = uiElements.browser.thumbs.children();
			thumbnails.removeClass("is-current");
			thumbnails.filter("[data-index='" + sliderManager.currentIndex + "']").addClass("is-current");

			// Update main photo source
			var imgSrc = photoManager.photosArray[sliderManager.currentIndex].sizes.large;
			uiElements.slider.mainPhoto.attr("src", imgSrc);

			// Update author name
			sliderManager.updateAuthorName();
		},
		updateAuthorName: function () {
			var container = uiElements.caption.authorName;
			container.html(photoManager.photosArray[sliderManager.currentIndex].author);
		},
		bindNavEvents: function () {
			uiElements.slider.prevButton.click(sliderManager.navPrev);
			uiElements.slider.nextButton.click(sliderManager.navNext);
		}
	};


	// BROWSER MANAGER
	// All methods relative to the clickable photo thumbnails go here.
	var browserManager = {
		buildWall: function () {

			// As a personal preference, we want Underscore to use Mustache's template synthax.
			_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

			var container = uiElements.browser.thumbs;
			var template = uiElements.templates.thumbnail;
			var photosArray = photoManager.photosArray;
			
			var data, output = "";
			// For each photo, parse the template to produce a usable list item.
			for (var index = 0, total = photosArray.length; index < total; index++) {
				data = { index: index, path: photosArray[index].sizes.thumb };
				output += _.template(template, data);
			}

			// Inject parsed templates in the DOM and append click callbacks.
			container.html(output);
			browserManager.bindWallEvents();
		},
		bindWallEvents: function () {

			var thumbnails = uiElements.browser.thumbs.children();
			thumbnails.click(function () {
				var index = $(this).attr("data-index");
				sliderManager.updateIndex(Number(index));
			});

		}
	};


	// PHOTO MANAGER
	// Manage the photos loaded through the API.
	var photoManager = {
		// Array to keep all the photos after they're parsed.
		photosArray: [],
		// Main method that starts the request to the API and asynchronously collects all data for all pictures.
		getPhotos: function () {

			// Query the Flickr API for photos that match the search criteria;
			// To get the full data for one photo, we need to make 3 calls, which
			// are all handled by the WebService method.
			webService.methods.searchPhotos(function (photos) {
				photoManager.photosArray = photos;

				// Build list of clickable photo thumbnails.
				browserManager.buildWall();

				// Set the first photo from the array the one on the main slider.
				sliderManager.updateIndex();

				// Bind slider navigation events (Previous/Next)
				sliderManager.bindNavEvents();

			});

		},

	}


	// WEB SERVICE
	// All methods related to the collection and parsing of data through the Flickr API will be kept here
	// along with a list of global parameters (used for all requests) and local parameters (used for an individual request only).
	var webService = {
		baseUrl: "http://api.flickr.com/services/rest/?",
		globalParams: {
			api_key: "399df825dce9f5c78319836b6e53d3a9",
			format: "json",
			nojsoncallback: 1
		},
		methods: {
			searchPhotos: function (callback) {
				var methodParams = {
					method: "flickr.photos.search",
					text: encodeURIComponent(formManager.currentString),
					per_page: 15
				};

				// STEP 1 - SEARCH PICTURES
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {

					var photoArray = results.photos.photo;
					var photoCount = photoArray.length;
					var parsedPhotos = [];
					var parseCounter = 0;

					for (var i = 0; i < photoCount; i++) {
						var photoId = photoArray[i].id;
						// STEP 2 - GET PHOTO INFO
						webService.methods.getPhotoInfo(photoId, function (author, photoId) {
							// STEP 3 - GET PHOTO SIZES
							webService.methods.getPhotoSizes(photoId, function (thumb, large, photoId) {
								parseCounter++; 
								parsedPhotos.push( { id: photoId, author: author, sizes: {thumb: thumb, large: large}} );
								if (parseCounter === photoCount) {
									// ALL REQUESTS COMPLETE - TRIGGER CALLBACK
									callback(parsedPhotos);
								}
							});
						});
					}
				});
			},
			getPhotoInfo: function (photoId, callback) {
				var methodParams = {
					method: "flickr.photos.getInfo",
					photo_id: photoId
				};
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {
					var author = results.photo.owner.username;
					callback(author, photoId);
				});
			},
			getPhotoSizes: function (photoId, callback) {
				var methodParams = {
					method: "flickr.photos.getSizes",
					photo_id: photoId
				};
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {
					// The number of sizes is variable and not directly identifiable through a key;
					// For simplicity, we'll use the first size for the thumbnail, and the last for the main picture. 
					var thumb = results.sizes.size.shift().source;
					var large = results.sizes.size.pop().source;
					callback(thumb, large, photoId);
				});
			}
		},
		helpers: {
			composeUrl: function (methodParams) {
				// Compose and return a full URL for the request by merging the endpoint URL, global and method parameters
				var callParams = $.extend(webService.globalParams, methodParams);
				var queryString = "";
				for (var paramName in callParams) {
					if (callParams.hasOwnProperty(paramName)) {
						queryString += paramName + "=" + callParams[paramName] + "&";
					}
				}
				return webService.baseUrl + queryString;
			}
		}
	};

	// Expose public variables and functions to be accessible outside of the module
    return {
        init: function () {
        	// Initialising the module consists in loading the photos from the Flickr API (on page load a default search string is used)
        	// and binding the form submit callback.
        	photoManager.getPhotos();
        	formManager.bindEvents();
        }
    };
    
}(jQuery, _));