//##Change Delegate

// Delegates, if present, can override or extend the behavior
// of objects. The change delegate is specifically designed to
// filter change records from an Observable instance and only forward
// the ones matching a given `filters` criteria (key or path).
// The forwarded messages will be sent to the specified method
// on the delegates `delegator` (bound to the _delegator_ scope)
//
// `param` {Object} data
sudo.delegates.Change = function(data) {
  this.construct(data);
};
// Delegates inherit from Model
sudo.delegates.Change.prototype = Object.create(sudo.Model.prototype);
// ###addFilter
// Place an entry into this object's hash of filters
//
// `param` {string} `key`
// `param` {string} `val`
// `returns` {object} this
sudo.delegates.Change.prototype.addFilter = function addFilter(key, val) {
  this.data.filters[key] = val;
  return this;
};
// ###filter
// Change records are delivered here and filtered, calling any matching
// methods specified in `this.get('filters').
//
// `returns` {Object} a call to the specified _delegator_ method, passing
// a hash containing:
// 1. the `type` of Change
// 2. the `name` of the changed property
// 3. the value located at the key/path
// 4. the `oldValue` of the key if present
sudo.delegates.Change.prototype.filter = function filter(change) {
  var filters = this.data.filters, name = change.name,
    type = change.type, obj = {};
  // does my delegator care about this?
  if(name in filters && filters.hasOwnProperty(name)) {
    // assemble the object to return to the method
    obj.type = type;
    obj.name = name;
    obj.oldValue = change.oldValue;
    // delete operations will not have any value so no need to look
    if(type !== 'deleted') {
      obj.value = name.indexOf('.') === -1 ? change.object[change.name] :
        sudo.getPath(name, change.object);
    }
    return this.delegator[filters[name]].call(this.delegator, obj);
  }
};
// ###removeFilter
// Remove an entry from this object's hash of filters
//
// `param` {string} `key`
// `returns` {object} this
sudo.delegates.Change.prototype.removeFilter = function removeFilter(key) {
  delete this.data.filters[key];
  return this;
};
// `private`
sudo.delegates.Change.prototype.role = 'change';
