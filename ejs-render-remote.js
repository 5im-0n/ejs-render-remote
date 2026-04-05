(function() {
	var uuidv4 = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0;
			var v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var overwriteWithCacheOptions = function(options, cacheName) {
		var cacheOptions = {
			cache: true,
			filename: cacheName
		};

		var templateOptions = options || {};

		return Object.assign(templateOptions, cacheOptions);
	};

	ejs.rr = function(templateUrl, data, options) {
		var templateFn = ejs.cache.get(templateUrl);

		//if the template is already cached, return it and we are done
		if (templateFn) {
			return templateFn(data);

		} else { //if the template is not cached, we need to get it and render it later once we have it. remember: this happens only if the template is not already cached

			//is there a getFn for this template?
			var getTemplatePromise = ejs.cache.get('getFnFor' + templateUrl);
			if (!getTemplatePromise) {
				getTemplatePromise = fetch(templateUrl).then(response => {
					if (!response.ok) {
						throw new Error('Failed to fetch template: ' + response.statusText);
					}
					return response.text();
				});
				ejs.cache.set('getFnFor' + templateUrl, getTemplatePromise);
			}

			var r = uuidv4();
			getTemplatePromise.then(function(template) {
				var templateOptions = overwriteWithCacheOptions(options, templateUrl);

				try {
					var element = document.getElementById(r);
					if (element) {
						element.outerHTML = ejs.render(
							template,
							data,
							templateOptions
						);
					}
				} catch(ex) {
					console.error(ex);
					throw ex;
				}

				//clean up the getFnFor
				if (ejs.cache.remove && ejs.cache.get('getFnFor' + templateUrl)) {
					ejs.cache.remove('getFnFor' + templateUrl);
				}
			}).catch(function(ex) {
				console.error('Error loading template:', ex);
			});

			return '<span class="ejs-templateplaceholder" style="display: none;" id="' + r + '"></span>';
		}
	};

	ejs.preloadTemplate = function(templateUrl, options) {
		return new Promise(function(resolve, reject) {
			//if the template is already cached, just return.
			if (ejs.cache.get(templateUrl)) {
				resolve(templateUrl);
			} else {
				fetch(templateUrl)
				.then(function(response) {
					if (!response.ok) {
						throw new Error('Failed to fetch template: ' + response.statusText);
					}
					return response.text();
				})
				.then(function(template) {
					try {
						var templateOptions = overwriteWithCacheOptions(options, templateUrl);
						var templateFn = ejs.compile(template, templateOptions);
						ejs.cache.set(templateUrl, templateFn);
						resolve(templateUrl);
					} catch(ex) {
						console.error(ex);
						reject(ex);
					}
				})
				.catch(reject);
			}
		});
	};
})();
