// ##Model Class Object
//
// Model Objects expose methods for setting and getting data, and
// can be observed if implementing the `Observable Extension`
//
// `param` {object} data. An initial state for this model.
//
// `constructor`
sudo.Model = function(data) {
  sudo.Base.call(this);
  this.data = data || {};
  // only models are `observable`
  this.callbacks = [];
  this.changeRecords = [];
};
// Model inherits from sudo.Base
// `private`
sudo.inherit(sudo.Base, sudo.Model);
// ###get
// Returns the value associated with a key.
//
// `param` {String} `key`. The name of the key
// `returns` {*}. The value associated with the key or false if not found.
sudo.Model.prototype.get = function get(key) {
  return this.data[key];
};
// ###getPath
//
// Uses the sudo namespace's getpath function operating on the model's
// data hash.
//
// `returns` {*|undefined}. The value at keypath or undefined if not found.
sudo.Model.prototype.getPath = function getPath(path) {
  return sudo.getPath(path, this.data);
};
// ###gets
// Assembles and returns an object of key:value pairs for each key
// contained in the passed in Array.
//
// `param` {array} `ary`. An array of keys.
// `returns` {object}
sudo.Model.prototype.gets = function gets(ary) {
  var i, obj = {};
  for (i = 0; i < ary.length; i++) {
    obj[ary[i]] = ary[i].indexOf('.') === -1 ? this.data[ary[i]] :
      this.getPath(ary[i]);
  }
  return obj;
};
// `private`
sudo.Model.prototype.role = 'model';
// ###set
// Set a key:value pair.
//
// `param` {String} `key`. The name of the key.
// `param` {*} `value`. The value associated with the key.
// `returns` {Object} `this`
sudo.Model.prototype.set = function set(key, value) {
  // _NOTE: intentional possibilty of setting a falsy value_
  this.data[key] = value;
  return this;
};
// ###setPath
//
// Uses the sudo namespace's setpath function operating on the model's
// data hash.
//
// `param` {String} `path`
// `param` {*} `value`
// `returns` {Object} this.
sudo.Model.prototype.setPath = function setPath(path, value) {
  sudo.setPath(path, value, this.data);
  return this;
};
// ###sets
// Invokes `set()` or `setPath()` for each key value pair in `obj`.
// Any listeners for those keys or paths will be called.
//
// `param` {Object} `obj`. The keys and values to set.
// `returns` {Object} `this`
sudo.Model.prototype.sets = function sets(obj) {
  var i, k = Object.keys(obj);
  for(i = 0; i < k.length; i++) {
    k[i].indexOf('.') === -1 ? this.set(k[i], obj[k[i]]) :
      this.setPath(k[i], obj[k[i]]);
  }
  return this;
};
// ###unset
// Remove a key:value pair from this object's data store
//
// `param` {String} key
// `returns` {Object} `this`
sudo.Model.prototype.unset = function unset(key) {
  delete this.data[key];
  return this;
};
// ###unsetPath
// Uses `sudo.unsetPath` operating on this models data hash
//
// `param` {String} path
// `returns` {Object} `this`
sudo.Model.prototype.unsetPath = function unsetPath(path) {
  sudo.unsetPath(path, this.data);
  return this;
};
// ###unsets
// Deletes a number of keys or paths from this object's data store
//
// `param` {array} `ary`. An array of keys or paths.
// `returns` {Objaect} `this`
sudo.Model.prototype.unsets = function unsets(ary) {
  var i;
  for(i = 0; i < ary.length; i++) {
    ary[i].indexOf('.') === -1 ? this.unset(ary[i]) :
      this.unsetPath(ary[i]);
  }
  return this;
};
