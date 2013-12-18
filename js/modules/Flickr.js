/** Filename: Module1.js
    Abstract: JavaScript Module
**/

App.Flickr = (function ($, _) {
	"use strict";

	// Keep a reference to each DOM element we'll be working with
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
		}
	};

	// Keep a reference to each of the DOM templates
	var uiTemplates = {
		photoThumb: $(".js-template-photo-thumb").html(),
		pageLink: $(".js-template-page-link").html()
	}

	// SearchForm Object: all methods related to the search form go here
	var searchForm = {
		bindCallbacks: function () {
			uiElements.form.container.submit(function () {
				var searchString = uiElements.form.searchString.val();
				// Basic form validation: accept if form is not empty
				if (searchString.trim().length > 0) {
					searchForm.resetFields();
					pageManager.resetPagination();
					webService.methods.searchPhotos(searchString);
				} else {
					console.error("Cannot submit an empty search form");
				}
				return false;
			});
		},
		resetFields: function () {
			uiElements.form.container.trigger("reset");
		}
	};

	// PhotoManager Object: all methods related to the photos go here
	var photoManager = {
		photos: [],
		addPhoto: function (photoObject) {
			// This method will add a new photo to the array
			// Or, if the photo is already in the array, add a new property to that photo
			//console.log("Add Photo");
			var photoWasFound = false;
			var photoIndex = 0;
			for (var i = 0, total = photoManager.photos.length; i < total; i++) {
				if (photoManager.photos[i].id === photoObject.id) {
					photoWasFound = true;
					photoIndex = i;
					break;
				}
			}
			if (photoWasFound) {
				$.extend(photoManager.photos[photoIndex], photoObject);
			} else {
				photoManager.photos.push(photoObject);
			}
		}
	}

	// PageManager Object: all methods related to pagination through results go here
	var pageManager = {
		currentPage: 1,
		totalPages: 1,
		setTotalPages: function (numPages) {
			// We'll limit the number of pages to a maximum of 8
			this.totalPages = (numPages < 8) ? numPages : 8;
		},
		addPaginationLinks: function () {

			// We'll use Underscore as a templating system
			// As a personal preference, set it to use Mustache-style synthax
			_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

			var container = uiElements.browser.pagination;
			var template = uiTemplates.pageLink;

			var output = "";

			// FIRST PAGE
			output += _.template(template, { label: "&lt;&lt;", number: 1, className: "is-current" });

			// OTHER PAGES
			for (var number = 0; number < this.totalPages; number++) {
				var label, className = "";
				output += _.template(template, { 
					label: number + 1, 
					number: number + 1, 
					className: className 
				});
			}

			// LAST PAGE
			output += _.template(template, { label: "&gt;&gt;", number: pageManager.totalPages, className: "" });
			
			// INJECT OUTPUT IN THE DOM AND BIND CLICK EVENTS
			if (this.totalPages > 1) {
				container.html(output);
				this.bindPaginationEvents();
			}
			
		},
		bindPaginationEvents: function () {
			var pageLinks = uiElements.browser.pagination.children();
			pageLinks.click(function () {
				
			});
		},
		resetPagination: function () {
			this.currentPage = 1;
			console.log("Reset Pages");
		}
	}

	// UIManager: building the UI components go here
	// var uiManager = {
	// 	build: function () {
	// 		console.log("Building UI");
	// 		pageManager.addPaginationLinks();
	// 	}
	// }

	// WebService Object: all methods related to the Flickr API and parsing of data go here
	var webService = {
		baseUrl: "http://api.flickr.com/services/rest/?",
		globalParams: {
			api_key: "399df825dce9f5c78319836b6e53d3a9",
			format: "json",
			nojsoncallback: 1
		},
		methods: {
			searchPhotos: function (searchString) {
				var methodParams = {
					method: "flickr.photos.search",
					text: encodeURIComponent(searchString),
					per_page: 15,
					page: pageManager.currentPage
				};
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {

					console.log(results);

					// Set pagination by passing number of pages from the API
					var numPages = results.photos.pages;
					pageManager.setTotalPages(numPages);
					pageManager.addPaginationLinks();

					// Add each photo to the photos array
					var photoArray = results.photos.photo;
					for (var i = 0, total = photoArray.length; i < total; i++) {
						var photoId = photoArray[i].id;
						photoManager.addPhoto({ id: photoId });
						webService.methods.getPhotoInfo(photoId);
					}

				});
			},
			getPhotoInfo: function (photoId) {
				var methodParams = {
					method: "flickr.photos.getInfo",
					photo_id: photoId
				};
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {
					var photoId = results.photo.id;
					var photoAuthor = results.photo.owner.username;
					photoManager.addPhoto({ id: photoId, author: photoAuthor });
					webService.methods.getPhotoSizes(photoId);
				});
			},
			getPhotoSizes: function (photoId) {
				var methodParams = {
					method: "flickr.photos.getSizes",
					photo_id: photoId
				};
				var callUrl = webService.helpers.composeUrl(methodParams);
				$.getJSON(callUrl, function (results) {
					var photoThumb = results.sizes.size[1].source; // Large square (150 x 150)
					var photoMain = results.sizes.size[7].source; // Medium (800 x 600)
					photoManager.addPhoto({ id: photoId, sizes: { thumb: photoThumb, main: photoMain} });
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
        	searchForm.bindCallbacks();
        }
    };
    
}(jQuery, _));