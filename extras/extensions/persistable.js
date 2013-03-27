// ##sudo persistable extension
//
// A mixin providing restful CRUD operations for a sudo.Model instance.
//
//	create : POST
//	read : GET
//	update : PUT or PATCH (configurable)
//	destroy : DELETE
//
// Before use be sure to set an `ajax` property {object} with at least
// a `baseUrl: ...` key. The model's id (if present -- indicating a persisted model)
// is appended to the baseUrl (baseUrl/id) by default. You can override this behavior
// by simply setting a `url: ...` in the `ajax` options hash or pass in the same when 
// calling any of the methods (or override the model.url() method).
//
// Place any other default options in the `ajax` hash
// that you would want sent to an ajax call. Again, you can also override those
// defaults by passing in a hash of options to any method:
//	`this.model.update({patch: true})` etc...
sudo.extensions.persistable = {
	// ###create 
	//
	// Save this model on the server. If a subset of this model's attributes
	// have not been stated (ajax:{data:{...}}) send all of the model's data.
	// Anticipate that the server response will send back the 
	// state of the model on the server and set it here (via a success callback).
	//
	// `param` {object} `params` Hash of options for the XHR call
	// `returns` {object} The jQuery XHR object
	create: function create(params) {
		return this._sendData_('POST', params);
	},
	// ###destroy
	//
	// Delete this model on the server
	//
	// `param` {object} `params` Optional hash of options for the XHR
	// `returns` {object} jqXhr
	destroy: function _delete(params) {
		return this._sendData_('DELETE', params);
	},
	// XHRs are not reusable, therefore we never store them
	// `params` {object} attributes for the request
	// `returns` {object} the xhr object
	// `private`
	_getXhr_: function _getXhr_(params) {
		var xhr =  new XMLHttpRequest();
		xhr.open(params.verb, params.url, true);
		xhr.responseType = params.responseType;
		xhr.onload = params.onload;
		return xhr;
	},
	// ###_normalizeParams_
	// Abstracted logic for preparing the options object. This looks at 
	// the set `ajax` property, allowing any passed in params to override.
	//
	// Sets defaults: JSON responseType and an onload callback that simply `sets()` the 
	// parsed response returned from the server
	//
	// `returns` {object} A normalized params object for the XHR call
	_normalizeParams_: function _normalizeParams_(verb, opts, params) {
		var self = this;
		opts || (opts = this.data.ajax);
		opts.url || (opts.url = this.url(opts.baseUrl));
		opts.verb || (opts.verb = verb);
		opts.responseType || (opts.responseType = 'json');
		// the default success callback is to set the data returned from the server
		// or just the status as `ajaxStatus` if no data was returned
		opts.onload || (opts.onload = function(e) {
			if(this.status == 200) {
				this.response ? self.sets(this.response) : self.set('ajaxStatus', 200);
			} else {
				self.set('ajaxStatus', this.status);
			}
		});
		// allow the passed in params to override any set in this model's `ajax` options
		return params ? $.extend(opts, params) : opts;
	},
	// ###read
	//
	// Fetch this models state from the server and set it here. The 
	// `Model.sets()` method is used with the returned data (we are 
	// asssuming the default json dataType). Pass in (via the params arg)
	// a success function to override this default.
	//
	// Maps to the http GET method.
	//
	// `param` {object} `params`. Optional info for the XHR call. If
	// present will override any set in this model's `ajax` options object.
	// `returns` {object} The XHR object
	read: function post(params) {
		var opts = this._normalizeParams_('GET', null, params),
			xhr = this._getXhr_(opts);
		xhr.send();
		return xhr;	
	},
	// ###save
	//
	// Convenience method removing the need to know if a model is new (not yet persisted)
	// or has been loaded/refreshed from the server. 
	//
	// `param` {object} `params` Hash of options for the XHR call
	// `returns` {object} The jQuery XHR object
	save: function save(params) {
		return ('id' in this.data) ? this.update(params) : this.create(params);
	},
	// ###_sendData_
	// The Create, Update and Patch methods all send data to the server,
	// varying only in their HTTP method. Abstracted logic is here.
	//
	// `returns` {object} jqXhr
	_sendData_: function _sendData_(verb, params) {
		var opts = this._normalizeParams_(verb, null, params),
			xhr = this._getXhr_(opts);
		// TODO does this work
		xhr.send(ops.data || JSON.stringify(this.data));
		return xhr;
	},
	// ###update
	//
	// If this model has been persisted to/from the server (it has an `id` attribute)
	// send the specified data (or all the model's data) to the server at `url` via
	// the `PUT` http verb or `PATCH` if {patch: true} is in the ajax options (or the
	// passed in params)
	//
	// NOTE: update does not check is this is a new model or not, do that yourself
	// or use the `save()` method (that does check).
	//
	// `param` {object} `params` Optional hash of options for the XHR
	// `returns` {object|bool} the jqXhr if called false if not
	update: function update(params) {
		return this._sendData_((this.data.ajax.patch || params && params.patch) ? 
			'PATCH' : 'PUT', params);
	},
	// ###url
	//
	// Takes the base url and appends this models id if present
	// (narmalizing the trailong slash if needed).
	// Override if you need to change the format of the calculated url.
	//
	// `param` {string} `base` the baseUrl set in this models ajax options
	url: function url(base) {
		// could possibly be 0...
		if('id' in this.data) {
			return base + (base.charAt(base.length - 1) === '/' ? 
				'' : '/') + encodeURIComponent(this.data.id);
		} else return base;
	}
};
