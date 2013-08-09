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
// that you would want sent to a $.ajax({...}) call. Again, you can also override those
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
  // `returns` {object} The XHR object
  create: function create(params) {
    return this._sendData_('POST', params);
  },
  // ###destroy
  //
  // Delete this model on the server
  //
  // `param` {object} `params` Optional hash of options for the XHR
  // `returns` {object} Xhr
  destroy: function destroy(params) {
    return this._sendData_('DELETE', params);
  },
  // ###_normalizeParams_
  // Abstracted logic for preparing the options object. This looks at 
  // the set `ajax` property, allowing any passed in params to override.
  //
  // Sets defaults: JSON dataType and a success callback that simply `sets()` the 
  // data returned from the server
  //
  // `returns` {object} A normalized params object for the XHR call
  _normalizeParams_: function _normalizeParams_(meth, opts, params) {
    opts || (opts = $.extend({}, this.data.ajax));
    opts.url || (opts.url = this.url(opts.baseUrl));
    opts.type || (opts.type = meth);
    opts.dataType || (opts.dataType = 'json');
    var isJson = opts.dataType === 'json';
    // by default turn off the global ajax triggers as all data
    // should flow thru the models to their observers
    opts.global || (opts.global = false);
    // the default success callback is to set the data returned from the server
    // or just the status as `ajaxStatus` if no data was returned
    opts.success || (opts.success = function(data, status, xhr) {
      data ? this.sets((isJson && typeof data === 'string') ? JSON.parse(data) : data) : 
        this.set('ajaxStatus', status);
    }.bind(this));
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
  read: function read(params) {
    return $.ajax(this._normalizeParams_('GET', null, params));
  },
  // ###save
  //
  // Convenience method removing the need to know if a model is new (not yet persisted)
  // or has been loaded/refreshed from the server. 
  //
  // `param` {object} `params` Hash of options for the XHR call
  // `returns` {object} The XHR object
  save: function save(params) {
    return ('id' in this.data) ? this.update(params) : this.create(params);
  },
  // ###_sendData_
  // The Create, Update and Patch methods all send data to the server,
  // varying only in their HTTP method. Abstracted logic is here.
  //
  // `returns` {object} Xhr
  _sendData_: function _sendData_(meth, params) {
    opts = $.extend({}, this.data.ajax);
    opts.contentType || (opts.contentType = 'application/json');
    opts.data || (opts.data = this.data);
    // assure that, in the default json case, opts.data is json
    if(opts.contentType === 'application/json' && (typeof opts.data !== 'string')) {
      opts.data = JSON.stringify(opts.data); 
    }
    // non GET requests do not 'processData'
    if(!('processData' in opts)) opts.processData = false;
    return $.ajax(this._normalizeParams_(meth, opts, params));
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
  // `returns` {object|bool} the Xhr if called false if not
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
    if(!base) return void 0;
    // could possibly be 0...
    if('id' in this.data) {
      return base + (base.charAt(base.length - 1) === '/' ? 
        '' : '/') + encodeURIComponent(this.data.id);
    } else return base;
  }
};
