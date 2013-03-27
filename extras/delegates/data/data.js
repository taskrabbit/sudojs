//##Data Delegate

// Delegates, if present, can extend the behavior
// of objects, lessening the need for subclassing. 
// The data delegate is specifically designed to
// filter through an object, looking for specified keys or paths
// and returning values for those if found
//
// `param` {Object} data
// `returns` {*} the value found at the specified key/path if found
sudo.delegates.Data = function(data) {
	this.construct(data);
};
// inherits from Model
sudo.delegates.Data.prototype = Object.create(sudo.Model.prototype);
// ###addFilter
// Place an entry into this object's hash of filters
//
// `param` {string} `key`
// `param` {string} `val`
// `returns` {object} this
sudo.delegates.Data.prototype.addFilter = function addFilter(key, val) {
	this.data.filters[key] = val;
	return this;
};
// ###filter
// iterates over a given object literal and returns a value (if present)
// located at a given key or path
//
// `param` {Object} `obj`
sudo.delegates.Data.prototype.filter = function(obj) {
	var filters = this.data.filters,
		ary = Object.keys(filters), key, i, o, k;
	for(i = 0; i < ary.length; i++) {
		key = ary[i];
		// keys and paths need different handling
		if(key.indexOf('.') === -1) {
			if(key in obj) this.delegator[filters[key]].call(
				this.delegator, obj[key]);	
		} else {
			// the chars after the last refinement are the key we need to check for
			k = key.slice(key.lastIndexOf('.') + 1);
			// and the ones prior are the object
			o = sudo.getPath(key.slice(0, key.lastIndexOf('.')), obj);
			if(o && k in o) this.delegator[filters[key]].call(
				this.delegator, o[k]);
		}
	}
};
// ###removeFilter
// Remove an entry from this object's hash of filters
//
// `param` {string} `key`
// `returns` {object} this
sudo.delegates.Data.prototype.removeFilter = function removeFilter(key) {
	delete this.data.filters[key];
	return this;
};
// `private`
sudo.delegates.Data.prototype.role = 'data';

