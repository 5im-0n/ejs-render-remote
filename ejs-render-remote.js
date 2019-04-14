//this uses jQuery for now because ie11 support is needed (promises and fetch)

(function($) {
	var uuidv4 = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0;
			var v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	ejs.rr = function(templateUrl, data) {
		var templateFn = ejs.cache.get(templateUrl);

		//if the template is already cached, return it and we are done
		if (templateFn) {
			//but first check if there is still a getter function for this template in the cache
			//if yes, remove it so we clean up a bit
			if (ejs.cache.remove && ejs.cache.get('getFnFor' + templateUrl)) {
				ejs.cache.remove('getFnFor' + templateUrl);
			}

			return templateFn(data);

		} else { //if the template is not cached, we need to get it and render it later once we have it. remember: this happens only if the template is not already cached

			//is there a getFn for this template?
			var getTemplateFn = ejs.cache.get('getFnFor' + templateUrl);
			if (!getTemplateFn) {
				getTemplateFn = $.get(templateUrl);
				ejs.cache.set('getFnFor' + templateUrl, getTemplateFn);
			}

			var r = uuidv4();
			getTemplateFn.then(function(template) {
				document.getElementById(r).outerHTML = ejs.render(
					template,
					data,
					{
						cache: true,
						filename: templateUrl
					}
				);
			});

			return '<span class="ejs-templateplaceholder" style="display: none;" id="' + r + '"></span>';
		}
	};

	ejs.preloadTemplate = function(templateUrl) {
		var d = $.Deferred();

		//if the template is already cached, just return.
		if (ejs.cache.get(templateUrl)) {
			d.resolve();
		} else {
			$.get(templateUrl)
			.then(function(template) {
				var templateFn = ejs.compile(template,
				{
					cache: true,
					filename: templateUrl
				});

				ejs.cache.set(templateUrl, templateFn);

				d.resolve();
			});
		}

		return d;
	}
})(jQuery);
