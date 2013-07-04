// ##Base Class Object
//
// All sudo.js objects inherit base, giving the ability
// to utilize delegation, the `base` function and the 
// `construct` convenience method.
//
// `constructor`
sudo.Base = function() {
  // can delegate
  this.delegates = [];
  // a beautiful and unique snowflake
  this.uid = sudo.unique();
};
// ###addDelegate
// Push an instance of a Class Object into this object's `_delegates_` list.
//
// `param` {Object} an instance of a sudo.delegates Class Object
// `returns` {Object} `this`
sudo.Base.prototype.addDelegate = function addDelegate(del) {
  del.delegator = this;
  this.delegates.push(del);
  if('addedAsDelegate' in del) del.addedAsDelegate(this);
  return this;
};
// ###base
// Lookup the function matching the name passed in  and call it with
// any passed in argumets scoped to the calling object.
// This method will avoid the recursive-loop problem by making sure
// that the first match is not the function that called `base`.
//
// `params` {*} any other number of arguments to be passed to the looked up method
// along with the initial method name
sudo.Base.prototype.base = function base() {
  var args = Array.prototype.slice.call(arguments),
    name = args.shift(), 
    found = false,
    obj = this,
    curr;
  // find method on the prototype, excluding the caller
  while(!found) {
    curr = Object.getPrototypeOf(obj);
    if(curr[name] && curr[name] !== this[name]) found = true;
    // keep digging
    else obj = curr;
  }
  return curr[name].apply(this, args);
};
// ###construct
// A convenience method that alleviates the need to place:
// `Object.getPrototypeOf(this).consturctor.apply(this, arguments)`
// in every constructor
sudo.Base.prototype.construct = function construct() {
  Object.getPrototypeOf(this).constructor.apply(this, arguments || []);
};
// ###delegate
// From this object's list of delegates find the object whose `_role_` matches
// the passed `name` and:
// 1. if `meth` is falsy return the delegate.
// 2 if `meth` is truthy bind its method (to the delegate) and return the method
//
// `param` {String} `role` The role property to match in this object's delegates list
// `param` {String} `meth` Optional method to bind to the action this delegate is being used for
// `returns`
sudo.Base.prototype.delegate = function delegate(role, meth) {
  var del = this.delegates, i;
  for(i = 0; i < del.length; i++) {
    if(del[i].role === role) {
      if(!meth) return del[i];
      return del[i][meth].bind(del[i]);
    }
  }
};
// ###getDelegate
// Fetch a delegate whose role property matches the passed in argument.
// Uses the `delegate` method in its 'single argument' form, included for 
// API consistency
//
// `param` {String} `role`
// 'returns' {Object|undefined}
sudo.Base.prototype.getDelegate = function getDelegate(role) {
  return this.delegate(role);
};
// ###removeDelegate
// From this objects `delegates` list remove the object (there should only ever be 1)
// whose role matches the passed in argument
//
// `param` {String} `role`
// `returns` {Object} `this`
sudo.Base.prototype.removeDelegate = function removeDelegate(role) {
  var del = this.delegates, i;
  for(i = 0; i < del.length; i++) {
    if(del[i].role === role) {
      // no _delegator_ for you
      del[i].delegator = void 0;
      del.splice(i, 1);
      return this;
    }
  }
  return this;
};
// `private`
sudo.Base.prototype.role = 'base';
