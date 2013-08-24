(function(window) {
// #Sudo Namespace
var sudo = {
  // Namespace for `Delegate` Class Objects used to delegate functionality
  // from a `delegator`
  //
  // `namespace`
  delegates: {},
  // The sudo.extensions namespace holds the objects that are stand alone `modules` which
  // can be `implemented` (mixed-in) in sudo Class Objects
  //
  // `namespace`
  extensions: {},
  // ###getPath
  // Extract a value located at `path` relative to the passed in object
  //
  // `param` {String} `path`. The key in the form of a dot-delimited path.
  // `param` {object} `obj`. An object literal to operate on.
  //
  // `returns` {*|undefined}. The value at keypath or undefined if not found.
  getPath: function getPath(path, obj) {
    var key, p;
    p = path.split('.');
    for (key; p.length && (key = p.shift());) {
      if(!p.length) {
        return obj[key];
      } else {
        obj = obj[key] || {};
      }
    }
    return obj;
  },
  // ###inherit
  // Inherit the prototype from a parent to a child.
  // Set the childs constructor for subclasses of child.
  // Subclasses of the library base classes will not 
  // want to use this function in *most* use-cases. Why? User Sudo Class Objects
  // possess their own constructors and any call back to a `superclass` constructor
  // will generally be looking for the library Object's constructor.
  //
  // `param` {function} `parent`
  // `param` {function} `child`
  inherit: function inherit(parent, child) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  },
  // ###makeMeASandwich
  // Notice there is no need to extrinsically instruct *how* to
  // make the sandwich, just the elegant single command.
  //
  // `returns` {string}
  makeMeASandwich: function makeMeASandwich() {return 'Okay.';},
  // ###namespace
  // Method for assuring a Namespace is defined.
  //
  // `param` {string} `path`. The path that leads to a blank Object.
  namespace: function namespace(path) {
    if (!this.getPath(path, window)) {
      this.setPath(path, {}, window);
    }
  },
  // ###premier
  // The premier object takes precedence over all others so define it at the topmost level.
  //
  // `type` {Object}
  premier: null,
  // ###setPath
  // Traverse the keypath and get each object 
  // (or make blank ones) eventually setting the value 
  // at the end of the path
  //
  // `param` {string} `path`. The path to traverse when setting a value.
  // `param` {*} `value`. What to set.
  // `param` {Object} `obj`. The object literal to operate on.
  setPath: function setPath(path, value, obj) {
    var p = path.split('.'), key;
    for (key; p.length && (key = p.shift());) {
      if(!p.length) {
        obj[key] = value;
      } else if (obj[key]) {
        obj = obj[key];
      } else {
        obj = obj[key] = {};
      }
    }
  },
  // ####uid
  // Some sudo Objects use a unique integer as a `tag` for identification.
  // (Views for example). This ensures they are indeed unique.
  uid: 0,
  // ####unique
  // An integer used as 'tags' by some sudo Objects as well
  // as a unique string for views when needed
  //
  // `param` {string} prefix. Optional string identifier
  unique: function unique(prefix) {
    return prefix ? prefix + this.uid++ : this.uid++;
  },
  // ###unsetPath
  // Remove a key:value pair from this object's data store
  // located at <path>
  //
  // `param` {String} `path`
  // `param` {Object} `obj` The object to operate on.
  unsetPath: function unsetPath(path, obj) {
    var p = path.split('.'), key;
    for (key; p.length && (key = p.shift());) {
      if(!p.length) {
        delete obj[key];
      } else {
        // this can fail if a faulty path is passed.
        // using getPath beforehand can prevent that
        obj = obj[key];
      }
    }
  }
};
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
// ##Container Class Object
//
// A container is any object that can both contain other objects and
// itself be contained.
//
// `param` {Array|Object} 'arg'. Optional array or hash
// of child objects which the Container will add as child objects
// via `addChildren`
//
// `constructor`
sudo.Container = function(arg) {
  sudo.Base.call(this);
  this.children = [];
  this.childNames = {};
  if(arg) this.addChildren(arg);
};
// Container is a subclass of sudo.Base
sudo.inherit(sudo.Base, sudo.Container);
// ###addChild
// Adds a View to this container's list of children.
// Also adds an 'index' property and an entry in the childNames hash.
// If `addedToParent` if found on the child, call it, sending `this` as an argument.
//
// `param` {Object} `child`. View (or View subclass) instance.
// `param` {String} `name`. An optional name for the child that will go in the childNames hash.
// `returns` {Object} `this`
sudo.Container.prototype.addChild = function addChild(child, name) {
  var c = this.children;
  child.parent = this;
  child.index = c.length;
  if(name) {
    child.name = name;
    this.childNames[name] = child.index;
  }
  c.push(child);
  if('addedToParent' in child) child.addedToParent(this);
  return this;
};
// ###addChildren
// Allows for multiple children to be added to this Container by passing
// either an Array or an Object literal.
//
// see `addChild`
//
// `param` {Array|Object} `arg`. An array of children to add or an
// Object literal in the form {name: child}
// `returns` {Object} `this` 
sudo.Container.prototype.addChildren = function addChildren(arg) {
  var i, keys;
  // Array?
  if(Array.isArray(arg)) {
    for (i = 0; i < arg.length; i++) {
      this.addChild(arg[i]);
    }
  } else {
    keys = Object.keys(arg);
    for (i = 0; i < keys.length; i++) {
      this.addChild(arg[keys[i]] , keys[i]);
    }
  }
  return this;
};
// ###bubble
// By default, `bubble` returns the current view's parent (if it has one)
//
// `returns` {Object|undefined}
sudo.Container.prototype.bubble = function bubble() {return this.parent;};
// ###eachChild
// Call a named method and pass any args to each child in a container's
// collection of children
//
// `param` {*} Any number of arguments the first of which must be
// The named method to look for and call. Other args are passed through
// `returns` {object} `this`
sudo.Container.prototype.eachChild = function eachChild(/*args*/) {
  var args = Array.prototype.slice.call(arguments), 
    which = args.shift(), i, len, curr;
  for (i = 0, len = this.children.length; i < len; i++) {
    curr = this.children[i];
    if(which in curr) curr[which].apply(curr, args);
  }
  return this;
};
// ###getChild
// If a child was added with a name, via `addChild`,
// that object can be fetched by name. This prevents us from having to reference a 
// containers children by index. That is possible however, though not preferred.
//
// `param` {String|Number} `id`. The string `name` or numeric `index` of the child to fetch.
// `returns` {Object|undefined} The found child
sudo.Container.prototype.getChild = function getChild(id) {
  return typeof id === 'string' ? this.children[this.childNames[id]] :
    this.children[id];
};
// ###_indexChildren_
// Method is called with the `index` property of a subview that is being removed.
// Beginning at <i> decrement subview indices.
// `param` {Number} `i`
// `private`
sudo.Container.prototype._indexChildren_ = function _indexChildren_(i) {
  var c = this.children, obj = this.childNames, len;
  for (len = c.length; i < len; i++) {
    c[i].index--;
    // adjust any entries in childNames
    if(c[i].name in obj) obj[c[i].name] = c[i].index; 
  }
};
// ###removeChild
// Find the intended child from my list of children and remove it, removing the name reference and re-indexing
// remaining children. This method does not remove the child's DOM.
// Override this method, doing whatever you want to the child's DOM, then call `base('removeChild')` to do so.
//
// `param` {String|Number|Object} `arg`. Children will always have an `index` number, and optionally a `name`.
// If passed a string `name` is assumed, so be sure to pass an actual number if expecting to use index.
// An object will be assumed to be an actual sudo Class Object.
// `returns` {Object} `this`
sudo.Container.prototype.removeChild = function removeChild(arg) {
  var i, t = typeof arg, c;
  // normalize the input
  if(t === 'object') c = arg; 
  else c = t === 'string' ? this.children[this.childNames[arg]] : this.children[arg];
  i = c.index;
  // remove from the children Array
  this.children.splice(i, 1);
  // remove from the named child hash if present
  delete this.childNames[c.name];
  // child is now an `orphan`
  delete c.parent;
  delete c.index;
  delete c.name;
  this._indexChildren_(i);
  return this;
};
// ###removeChildren
// Remove all children, name references and adjust indexes accordingly.
// This method calls removeFromParent as each child may have overridden logic there.
//
// see `removeChild`
//
// `param` {bool} `keep` Optional arg to instruct the parent to `detach` its $el
// rather than the default `remove` if truthy
// `returns` {object} `this`
sudo.Container.prototype.removeChildren = function removeChildren(keep) {
  while(this.children.length) {
    this.children.shift().removeFromParent(keep);
  }
  return this;
};
// ###removeFromParent
// Remove this object from its parents list of children.
// Does not alter the dom - do that yourself by overriding this method
// or chaining method calls
sudo.Container.prototype.removeFromParent = function removeFromParent() {
  // will error without a parent, but that would be your fault...
  this.parent.removeChild(this);
  return this;
};
sudo.Container.prototype.role = 'container';
// ###send
// The call to the specific method on a (un)specified target happens here.
// If this Object is part of a `sudo.Container` maintained hierarchy
// the 'target' may be left out, causing the `bubble()` method to be called.
// What this does is allow children of a `sudo.Container` to simply pass
// events  upward, delegating the responsibility of deciding what to do to the parent.
//
// TODO Currently, only the first target method found is called, then the
// bubbling is stopped. Should bubbling continue all the way up the 'chain'?
//
// `param` {*} Any number of arguments is supported, but the first is the only one searched for info. 
// A sendMethod will be located by:
//   1. using the first argument if it is a string
//   2. looking for a `sendMethod` property if it is an object
// In the case a specified target exists at `this.model.get('sendTarget')` it will be used
// Any other args will be passed to the sendMethod after `this`
// `returns` {Object} `this`
sudo.Container.prototype.send = function send(/*args*/) {
  var args = Array.prototype.slice.call(arguments),
    d = this.model && this.model.data, meth, targ, fn;
  // normalize the input, common use cases first
  if(d && 'sendMethod' in d) meth = d.sendMethod;
  else if(typeof args[0] === 'string') meth = args.shift();
  // less common but viable options
  if(!meth) {
    // passed as a custom data attr bound in events
    meth = 'data' in args[0] ? args[0].data.sendMethod :
      // passed in a hash from something or not passed at all
      args[0].sendMethod || void 0;
  }
  // target is either specified or my parent
  targ = d && d.sendTarget || this.bubble();
  // obvious chance for errors here, don't be dumb
  fn = targ[meth];
  while(!fn && (targ = targ.bubble())) {
    fn = targ[meth];
  }
  // sendMethods expect a signature (sender, ...)
  if(fn) {
    args.unshift(this);
    fn.apply(targ, args);
  }
  return this;
};
// ##View Class Object

// Create an instance of a sudo.View object. A view is any object
// that maintains its own `el`, that being some type of DOM element.
// Pass in a string selector or an actual dom node reference to have the object
// set that as its `el`. If no `el` is specified one will be created upon instantiation
// based on the `tagName` (`div` by default). Specify `className`, `id` (or other attributes if desired)
// as an (optional) `attributes` object literal on the `data` arg.
//
// The view object uses zepto for dom manipulation
// and event delegation etc... A querified `this` reference is located
// at `this.$el` and `this.$` scopes queries to this objects `el`, i.e it's
// a shortcut for `this.$el.find(selector)`
//
// `param` {string|element|Query} `el`. Otional el for the View instance.
// `param` {Object} `data`. Optional data object-literal which becomes the initial state
// of a new model located at `this.model`. Also can be a reference to an existing sudo.Model instance
//
// `constructor`
sudo.View = function(el, data) {
  sudo.Container.call(this);
  // allow model instance to be passed in as well
  if(data) {
    this.model = data.role === 'model' ? data :
      this.model = new sudo.Model(data);
  } 
  this.setEl(el);
  if(this.role === 'view') this.init();
};
// View inherits from Container
// `private`
sudo.inherit(sudo.Container, sudo.View);
// ###becomePremier
// Premier functionality provides hooks for behavioral differentiation
// among elements or class objects.
//
// `returns` {Object} `this`
sudo.View.prototype.becomePremier = function becomePremier() {
  var p, f = function() {
      this.isPremier = true;
      sudo.premier = this;
    }.bind(this);
  // is there an existing premier that isn't me?
  if((p = sudo.premier) && p.uid !== this.uid) {
    // ask it to resign and call the cb
    p.resignPremier(f);
  } else f(); // no existing premier
  return this;
};
// ###init
// A 'contruction-time' hook to call for further initialization needs in 
// View objects (and their subclasses). A noop by default child classes should override.
sudo.View.prototype.init = $.noop;
// the el needs to be normalized before use
// `private`
sudo.View.prototype._normalizedEl_ = function _normalizedEl_(el) {
  if(typeof el === 'string') {
    return $(el);
  } else {
    // Passed an already `querified` Element?
    // It will have a length of 1 if so.
    return el.length ? el : $(el);
  }	
};
// ### resignPremier
// Resign premier status
//
// `param` {Function} `cb`. An optional callback to execute
// after resigning premier status.
// `returns` {Object} `this`
sudo.View.prototype.resignPremier = function resignPremier(cb) {
  var p;
  this.isPremier = false;
  // only remove the global premier if it is me
  if((p = sudo.premier) && p.uid === this.uid) {
    sudo.premier = null;
  }
  // fire the cb if passed
  if(cb) cb();
  return this;
};
// `private`
sudo.View.prototype.role = 'view';
// ###setEl
// A view must have an element, set that here.
// Stores a querified object as `this.$el` the raw
// node is always then available as `this.$el[0]`.
//
// `param` {string=|element} `el`
// `returns` {Object} `this`
sudo.View.prototype.setEl = function setEl(el) {
  var d = this.model && this.model.data, a, t;
  if(!el) {
    // normalize any relevant data
    t = d ? d.tagName || 'div': 'div';
    this.$el = $(document.createElement(t));
    if(d && (a = d.attributes)) this.$el.attr(a);
  } else {
    this.$el = this._normalizedEl_(el);
  }
  return this;
};
// ###this.$
// Return a single Element matching `sel` scoped to this View's el.
// This is an alias to `this.$el.find(sel)`.
//
// `param` {string} `sel`. A Query compatible selector
// `returns` {Query} A 'querified' result matching the selector
sudo.View.prototype.$ = function(sel) {
  return this.$el.find(sel);
};
// ###Templating

// Allow the default {{ js code }}, {{= key }}, and {{- escape stuff }} 
// micro templating delimiters to be overridden if desired
//
// `type` {Object}
sudo.templateSettings = {
  evaluate: /\{\{([\s\S]+?)\}\}/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  escape: /\{\{-([\s\S]+?)\}\}/g
};
// Certain characters need to be escaped so that they can be put 
// into a string literal when templating.
//
// `type` {Object}
sudo.escapes = {};
(function(s) {
  var e = {
    '\\': '\\',
    "'": "'",
    r: '\r',
    n: '\n',
    t: '\t',
    u2028: '\u2028',
    u2029: '\u2029'
  };
  for (var key in e) s.escapes[e[key]] = key;
}(sudo));
// lookup hash for `escape`
//
// `type` {Object}
sudo.htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};
// Escapes certain characters for templating
//
// `type` {regexp}
sudo.escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
// Escape unsafe HTML
//
// `type` {regexp}
sudo.htmlEscaper = /[&<>"'\/]/g;
// Unescapes certain characters for templating
//
// `type` {regexp}
sudo.unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
// ###escape
// Remove unsafe characters from a string
//
// `param` {String} str
sudo.escape = function(str) {
  return str.replace(sudo.htmlEscaper, function(match) {
    return sudo.htmlEscapes[match];
  });
};
// ###unescape
// Within an interpolation, evaluation, or escaping,
// remove HTML escaping that had been previously added.
//
// `param` {string} str
sudo.unescape = function unescape(str) {
  return str.replace(sudo.unescaper, function(match, escape) {
    return sudo.escapes[escape];
  });
};
// ###template
// JavaScript micro-templating, similar to John Resig's (and it's offspring) implementation.
// sudo templating preserves whitespace, and correctly escapes quotes within interpolated code.
// Unlike others sudo.template requires a scope name (to avoid the use of `with`) and will spit at you
// if it is not present.
//
// `param` {string} `str`. The 'templated' string.
// `param` {Object} `data`. Optional hash of key:value pairs.
// `param` {string} `scope`. Optional context name of your `data object`, set to 'data' if falsy.
sudo.template = function template(str, data, scope) {
  scope || (scope = 'data');
  var settings = sudo.templateSettings, render, template,
  // Compile the template source, taking care to escape characters that
  // cannot be included in a string literal and then unescape them in code blocks.
  source = "_p+='" + str.replace(sudo.escaper, function(match) {
    return '\\' + sudo.escapes[match];
  }).replace(settings.escape, function(match, code) {
    return "'+\n((_t=(" + sudo.unescape(code) + "))==null?'':sudo.escape(_t))+\n'";
  }).replace(settings.interpolate, function(match, code) {
    return "'+\n((_t=(" + sudo.unescape(code) + "))==null?'':_t)+\n'";
  }).replace(settings.evaluate, function(match, code) {
    return "';\n" + sudo.unescape(code) + "\n_p+='";
  }) + "';\n";
  source = "var _t,_p='';" + source + "return _p;\n";
  render = new Function(scope, source);
  if (data) return render(data);
  template = function(data) {
    return render.call(this, data);
  };
  // Provide the compiled function source as a convenience for reflection/compilation
  template.source = 'function(' + scope + '){\n' + source + '}';
  return template;
};
// ##DataView Class Object

// Create an instance of an Object, inheriting from sudo.View that:
// 1. Expects to have a template located in its internal data Store accessible via `this.get('template')`.
// 2. Can have a `renderTarget` property in its data store. If so this will be the location
//		the child injects itself into (if not already in) the DOM
// 3. Can have a 'renderMethod' property in its data store. If so this is the jQuery method
//		that the child will use to place itself in it's `renderTarget`.
// 4. Has a `render` method that when called re-hydrates it's $el by passing its
//		internal data store to its template
// 5. Handles event binding/unbinding by implementing the sudo.extensions.listener
//		extension object
//
//`constructor`
sudo.DataView = function(el, data) {
  sudo.View.call(this, el, data);
  // implements the listener extension
  $.extend(this, sudo.extensions.listener);
  if(this.model.data.autoRender) {
    // dont autoRender on the setting of events,
    this.autoRenderBlacklist = {event: true, events: true};
    // autoRender types observe their own model
    if(!this.model.observe) $.extend(this.model, sudo.extensions.observable);
    // you may need to override `build` if you provide a template and the data
    // isnt hydrated (as that is the expectation)
  } else this.build();
  if(this.role === 'dataview') this.init();
};
// `private`
sudo.inherit(sudo.View, sudo.DataView);
// ###addedToParent
// Container's will check for the presence of this method and call it if it is present
// after adding a child - essentially, this will auto render the dataview when added to a parent
// if not an autoRender (which will render on model change), as well as setup the events (in children too)
sudo.DataView.prototype.addedToParent = function(parent) {
  this.bindEvents();
  // non-autoRender types should render now
  if(!this.model.data.autoRender) return this.render();
  // autoRender Dataviews should only render on model change
  else this.observer = this.model.observe(this.render.bind(this));
  return this;
};
// ###build
// Construct the innerHTML of the $el here so that the behavior of the
// DataView, that the markup is ready after a subclass calls `this.construct`,
// is the same as other View classes -- IF there is a template available
// there may not be yet as some get added later by a ViewController
sudo.DataView.prototype.build = function build() {
  var t;
  if(!(t = this.model.data.template)) return this;
  if(typeof t === 'string') t = sudo.template(t);
  this.$el.html(t(this.model.data));
  this.built = true;
  return this;
};

// ###removeFromParent
// Remove this object from the DOM and its parent's list of children.
// Overrides `sudo.View.removeFromParent` to unbind events and `remove` its $el 
// as well if not passed a truthy value as 'keep', will `detach` its $el in that case
//
// `param` {bool} `keep` Optional arg to Call `detach` if truthy, `remove` by default
// (if omitted or falsy)
// `returns` {Object} `this`
sudo.DataView.prototype.removeFromParent = function removeFromParent(keep) {
  this.parent.removeChild(this);
  this.unbindEvents().$el[keep ? 'detach' : 'remove']();
  // in the case that this.model is 'foreign'
  if(this.observer) this.model.unobserve(this.observer);
  return this;
};
// ###render
// (Re)hydrate the innerHTML of this object via its template and internal data store.
// If a `renderTarget` is present this Object will inject itself into the target via
// `this.get('renderMethod')` or defualt to `$.append`. After injection, the `renderTarget`
// is deleted from this Objects data store.
// Event unbinding/rebinding is generally not necessary for the Objects innerHTML as all events from the
// Object's list of events (`this.get('event(s)'))` are delegated to the $el on instantiation.
//
// `param` {object} `change` dataviews may be observing their model if `autoRender: true`
//
// `returns` {Object} `this`
sudo.DataView.prototype.render = function render(change) {
  // return early if a `blacklisted` key is set to my model
  if(change && this.autoRenderBlacklist[change.name]) return this;
  // has `build` been executed already? If not call it again
  if(!this.built) this.build();
  // if there is no template by this point *you are doing it wrong*
  // erase the flag
  else this.built = false;
  d = this.model.data;
  if(d.renderTarget) {
    this._normalizedEl_(d.renderTarget)[d.renderMethod || 'append'](this.$el);
    delete d.renderTarget;
  }
  return this;
};
// `private`
sudo.DataView.prototype.role = 'dataview';
// ##Navigator Class Object

// Abstracts location and history events, parsing their information into a 
// normalized object that is then set to an Observable class instance
//
// `constructor`
sudo.Navigator = function(data) {
  this.started = false;
  this.slashStripper = /^\/+|\/+$/g;
  this.leadingStripper = /^[#\/]|\s+$/g;
  this.trailingStripper = /\/$/;
  this.construct(data);
};
// Navigator inherits from `sudo.Model`
sudo.Navigator.prototype = Object.create(sudo.Model.prototype);
// ###getFragment
// 'Fragment' is defined as any URL information after the 'root' path
// including the `search` or `hash`
//
// `returns` {String} `fragment`
// `returns` {String} the normalized current fragment
sudo.Navigator.prototype.getFragment = function getFragment(fragment) {
  var root = this.data.root;
  if(!fragment) {
    // intentional use of coersion
    if (this.isPushState) {
      fragment = window.location.pathname;
      root = root.replace(this.trailingStripper, '');
      if(!fragment.indexOf(root)) fragment = fragment.substr(root.length);
    } else {
      fragment = this.getHash();
    }
  }
  return decodeURIComponent(fragment.replace(this.leadingStripper, ''));
};
// ###getHash
// Check either the passed in fragment, or the full location.href
// for a `hash` value
//
// `param` {string} `fragment` Optional fragment to check
// `returns` {String} the normalized current `hash`
sudo.Navigator.prototype.getHash = function getHash(fragment) {
  fragment || (fragment = window.location.href);
  var match = fragment.match(/#(.*)$/);
  return match ? match[1] : '';
};
// ###getSearch
// Check either the passed in fragment, or the full location.href
// for a `search` value
//
// `param` {string} `fragment` Optional fragment to check
// `returns` {String} the normalized current `search`
sudo.Navigator.prototype.getSearch = function getSearch(fragment) {
  fragment || (fragment = window.location.href);
  var match = fragment.match(/\?(.*)$/);
  return match ? match[1] : '';
};
// ###getUrl
// fetch the URL in the form <root + fragment>
//
// `returns` {String}
sudo.Navigator.prototype.getUrl = function getUrl() {
  // note that delegate(_role_) returns the deleagte
  return this.data.root + this.data.fragment;
};
// ###go
// If the passed in 'fragment' is different than the currently stored one,
// push a new state entry / hash event and set the data where specified
//
// `param` {string} `fragment`
// `returns` {*} call to `setData`
sudo.Navigator.prototype.go = function go(fragment) {
  if(!this.started) return false;
  if(!this.urlChanged(fragment)) return;
  // TODO ever use replaceState?
  if(this.isPushState) {
    window.history.pushState({}, document.title, this.getUrl());
  } else if(this.isHashChange) {
    window.location.hash = '#' + this.data.fragment;
  }
  return this.setData();
};
// ###handleChange
// Bound to either the `popstate` or `hashchange` events, if the
// URL has indeed changed then parse the relevant data and set it -
// triggering change observers
//
// `returns` {*} call to `setData` or undefined
sudo.Navigator.prototype.handleChange = function handleChange(e) {
  if(this.urlChanged()) {
    return this.setData();
  }
};
// ###parseQuery
// Parse and return a hash of the key value pairs contained in 
// the current `query`
//
// `returns` {object}
sudo.Navigator.prototype.parseQuery = function parseQuery() {
  var obj = {}, seg = this.data.query,
    i, s;
  if(seg) {
    seg = seg.split('&');
    for(i = 0; i < seg.length; i++) {
      if(!seg[i]) continue;
      s = seg[i].split('=');
      obj[s[0]] = s[1];
    }
    return obj;
  }
};
// ###setData
// Using the current `fragment` (minus any search or hash data) as a key,
// use `parseQuery` as the value for the key, setting it into the specified
// model (a stated `Observable` or `this.data`)
//
// `returns` {object} `this`
sudo.Navigator.prototype.setData = function setData() {
  var frag = this.data.fragment,
    // data is set in a specified model or in self
    observable = this.data.observable || this;
  if(this.data.query) {
    // we want to set the key minus any search/hash
    frag = frag.indexOf('?') !== -1 ? frag.split('?')[0] : frag.split('#')[0];
  }
  observable.set(frag, this.parseQuery());
  return this;
};
// ###start
// Gather the necessary information about the current environment and 
// bind to either (push|pop)state or hashchange.
// Also, if given an imcorrect URL for the current environment (hashchange 
// vs pushState) normalize it and set accordingly (or don't).
//
// `returns` {object} `this`
sudo.Navigator.prototype.start = function start() {
  var hasPushState, atRoot, loc, tmp;
  if(this.started) return;
  hasPushState = window.history && window.history.pushState;
  this.started = true;
  // setup the initial configuration
  this.isHashChange = this.data.useHashChange && 'onhashchange' in window || 
    (!hasPushState && 'onhashchange' in window);
  this.isPushState = !this.isHashChange && !!hasPushState;
  // normalize the root to always contain a leading and trailing slash
  this.data['root'] = ('/' + this.data['root'] + '/').replace(this.slashStripper, '/');
  // Get a snapshot of the current fragment
  this.urlChanged();
  // monitor URL changes via popState or hashchange
  if (this.isPushState) {
    $(window).on('popstate', this.handleChange.bind(this));
  } else if (this.isHashChange) {
    $(window).on('hashchange', this.handleChange.bind(this));
  } else return;
  atRoot = window.location.pathname.replace(/[^\/]$/, '$&/') === this.data['root'];
  // somehow a URL got here not in my 'format', unless explicitly told not too, correct this
  if(!this.data.stay) {
   if(this.isHashChange && !atRoot) {
      window.location.replace(this.data['root'] + window.location.search + '#' + 
        this.data.fragment);
      // return early as browser will redirect
      return true;
      // the converse of the above
    } else if(this.isPushState && atRoot && window.location.hash) {
      tmp = this.getHash().replace(this.leadingStripper, '');
      window.history.replaceState({}, document.title, this.data['root'] + 
        tmp + window.location.search);
    } 
  }
  // TODO provide option to `go` from inital `start` state?
  return this;
};
// ###urlChanged
// Is a passed in fragment different from the one currently set at `this.get('fragment')`?
// If so set the fragment to the passed fragment passed in (as well as any 'query' data), else
// simply return false
//
// `param` {String} `fragment`
// `returns` {bool} 
sudo.Navigator.prototype.urlChanged = function urlChanged(fragment) {
  var current = this.getFragment(fragment);
  // nothing has changed
  if (current === this.data.fragment) return false;
  this.data.fragment = current;
  // the fragment and the href need to checked here, optimized for the 'go' scenario
  this.data.query = (this.getSearch(current) || this.getSearch()) || 
    (this.getHash(current) || this.getHash());
  return true;
};
// ## Observable Extension Object
//
// Implementaion of the ES6 Harmony Observer pattern.
// Extend a `sudo.Model` class with this object if
// data-mutation-observation is required
sudo.extensions.observable = {
  // ###_deliver_
  // Called from deliverChangeRecords when ready to send
  // changeRecords to observers.
  //
  // `private`
  _deliver_: function _deliver_(obj) {
    var i, cb = this.callbacks;
    for(i = 0; i < cb.length; i++) {
      cb[i](obj);
    }
  },
  // ###deliverChangeRecords
  // Iterate through the changeRecords array(emptying it as you go), delivering them to the
  // observers. You can override this method to change the standard delivery behavior.
  //
  // `returns` {Object} `this`
  deliverChangeRecords: function deliverChangeRecords() {
    var rec, cr = this.changeRecords;
    // FIFO
    for(rec; cr.length && (rec = cr.shift());) {
      this._deliver_(rec);
    }
    return this;
  },
  // ###observe
  // In a quasi-ES6 Object.observe pattern, calling observe on an `observable` and 
  // passing a callback will cause that callback to be called whenever any
  // property on the observable's data store is set, changed or deleted 
  // via set, unset, setPath or unsetPath with an object containing:
  //     {
  //	     type: <new, updated, deleted>,
  //	     object: <the object being observed>,
  //	     name: <the key that was modified>,
  //	     oldValue: <if a previous value existed for this key>
  //     }
  // For ease of 'unobserving' the same Function passed in is returned.
  //
  // `param` {Function} `fn` The callback to be called with changeRecord(s)
  // `returns` {Function} the Function passed in as an argument
  observe: function observe(fn) {
    // this will fail if mixed-in and no `callbacks` created so don't do that.
    // Per the spec, do not allow the same callback to be added
    var d = this.callbacks;
    if(d.indexOf(fn) === -1) d.push(fn);
    return fn;
  },
  // ###observes
  // Allow an array of callbacks to be registered as changeRecord recipients
  //
  // `param` {Array} ary
  // `returns` {Array} the Array passed in to observe
  observes: function observes(ary) {
    var i;
    for(i = 0; i < ary.length; i++) {
      this.observe(ary[i]);
    }
    return ary;
  },
  // ###set
  // Overrides sudo.Base.set to check for observers
  //
  // `param` {String} `key`. The name of the key
  // `param` {*} `value`
  // `param` {Bool} `hold` Call _deliver_ (falsy) or store the change notification
  // to be delivered upon a call to deliverChangeRecords (truthy)
  //
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  set: function set(key, value, hold) {
    var obj = {name: key, object: this.data};
    // did this key exist already
    if(key in this.data) {
      obj.type = 'updated';
      // then there is an oldValue
      obj.oldValue = this.data[key];
    } else obj.type = 'new';
    // now actually set the value
    this.data[key] = value;
    this.changeRecords.push(obj);
    // call the observers or not
    if(hold) return this;
    return this.deliverChangeRecords();
  },
  // ###setPath
  // Overrides sudo.Base.setPath to check for observers.
  // Change records originating from a `setPath` operation
  // send back the passed in `path` as `name` as well as the
  // top level object being observed (this observable's data).
  // this allows for easy filtering either manually or via a 
  // `change delegate`
  //
  // `param` {String} `path`
  // `param` {*} `value`
  // `param` {Bool} `hold` Call _deliver_ (falsy) or store the change notification
  // to be delivered upon a call to deliverChangeRecords (truthy)
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  setPath: function setPath(path, value, hold) {
    var curr = this.data, obj = {name: path, object: this.data},
      p = path.split('.'), key;
    for (key; p.length && (key = p.shift());) {
      if(!p.length) {
        // reached the last refinement, pre-existing?
        if (key in curr) {
          obj.type = 'updated';
          obj.oldValue = curr[key];
        } else obj.type = 'new';
        curr[key] = value;
      } else if (curr[key]) {
        curr = curr[key];
      } else {
        curr = curr[key] = {};
      }
    }
    this.changeRecords.push(obj);
    // call all observers or not
    if(hold) return this;
    return this.deliverChangeRecords();
  }, 
  // ###sets
  // Overrides Base.sets to hold the call to _deliver_ until
  // all operations are done
  //
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  sets: function sets(obj, hold) {
    var i, k = Object.keys(obj);
    for(i = 0; i < k.length; i++) {
      k[i].indexOf('.') === -1 ? this.set(k[i], obj[k[i]], true) :
        this.setPath(k[i], obj[k[i]], true);
    }
    if(hold) return this;
    return this.deliverChangeRecords();
  },
  // ###unobserve
  // Remove a particular callback from this observable
  //
  // `param` {Function} the function passed in to `observe`
  // `returns` {Object} `this`
  unobserve: function unobserve(fn) {
    var cb = this.callbacks, i = cb.indexOf(fn);
    if(i !== -1) cb.splice(i, 1);
    return this;
  },
  // ###unobserves
  // Allow an array of callbacks to be unregistered as changeRecord recipients
  //
  // `param` {Array} ary
  // `returns` {Object} `this`
  unobserves: function unobserves(ary) {
    var i;
    for(i = 0; i < ary.length; i++) {
      this.unobserve(ary[i]);
    }
    return this;
  },
  // ###unset
  // Overrides sudo.Base.unset to check for observers
  //
  // `param` {String} `key`. The name of the key
  // `param` {Bool} `hold`
  //
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  unset: function unset(key, hold) {
    var obj = {name: key, object: this.data, type: 'deleted'}, 
      val = !!this.data[key];
    delete this.data[key];
    // call the observers if there was a val to delete
    return this._unset_(obj, val, hold);
  },
  // ###_unset_
  // Helper for the unset functions
  //
  // `private`
  _unset_: function _unset_(o, v, h) {
    if(v) {
      this.changeRecords.push(o);
      if(h) return this;
      return this.deliverChangeRecords();
    }
    return this;
  },
  // ###setPath
  // Overrides sudo.Base.unsetPath to check for observers
  //
  // `param` {String} `path`
  // `param` {*} `value`
  // `param` {bool} `hold`
  //
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  unsetPath: function unsetPath(path, hold) {
    var obj = {name: path, object: this.data, type: 'deleted'}, 
      curr = this.data, p = path.split('.'), 
      key, val;
    for (key; p.length && (key = p.shift());) {
      if(!p.length) {
        // reached the last refinement
        val = !!curr[key];
        delete curr[key];
      } else {
        // this can obviously fail, but can be prevented by checking
        // with `getPath` first.
        curr = curr[key];
      }
    }
    return this._unset_(obj, val, hold);
  },
  // ###unsets
  // Override of Base.unsets to hold the call to _deliver_ until done
  //
  // `param` ary 
  // `param` hold
  // `returns` {Object|*} `this` or calls deliverChangeRecords
  unsets: function unsets(ary, hold) {
    var i;
    for(i = 0; i < ary.length; i++) {
      ary[i].indexOf('.') === -1 ? this.unset(k[i], true) :
        this.unsetPath(k[i], true);
    }
    if(hold) return this;
    return this.deliverChangeRecords();	
  }
};
// ##Listener Extension Object

// Handles event binding/unbinding via an events array in the form:
// events: [{
//	name: `eventName`,
//	sel: `an_optional_delegator`,
//	data: an_optional_hash_of_data
//	fn: `function name`
// }, {...
//	This array will be searched for via `this.get('events')`. There is a 
//	single-event use case as well, pass a single object literal in the above form.
//	with the key `event`:
//	event: {...same as above}
//	Details about the hashes in the array:
//	A. name -> jQuery compatible event name
//	B. sel -> Optional jQuery compatible selector used to delegate events
//	C. data: A hash that will be passed as the custom jQuery Event.data object
//	D. fn -> If a {String} bound to the named function on this object, if a 
//		function assumed to be anonymous and called with no scope manipulation
sudo.extensions.listener = {
  // ###bindEvents
  // Bind the events in the data store to this object's $el
  //
  // `returns` {Object} `this`
  bindEvents: function bindEvents() {
    var e;
    if((e = this.model.data.event || this.model.data.events)) this._handleEvents_(e, 1);
    return this;
  },
  // Use the jQuery `on` or 'off' method, optionally delegating to a selector if present
  // `private`
  _handleEvents_: function _handleEvents_(e, which) {
    var i;
    if(Array.isArray(e)) {
      for(i = 0; i < e.length; i++) {
        this._handleEvent_(e[i], which);
      }
    } else {
      this._handleEvent_(e, which);
    }
  },
  // helper for binding and unbinding an individual event
  // `param` {Object} e. An event descriptor
  // `param` {String} which. `on` or `off`
  // `private`
  _handleEvent_: function _handleEvent_(e, which) {
    if(which) {
      this.$el.on(e.name, e.sel, e.data, typeof e.fn === 'string' ? this[e.fn].bind(this) : e.fn);
    } else {
      // do not re-bind the fn going to off otherwise the unbind will fail
      this.$el.off(e.name, e.sel);
    }
  },
  // ###rebindEvents
  // Convenience method for `this.unbindEvents().bindEvents()`
  //
  // 'returns' {object} 'this'
  rebindEvents: function rebindEvents() {
    return this.unbindEvents().bindEvents();
  },
  // ###unbindEvents
  // Unbind the events in the data store from this object's $el
  //
  // `returns` {Object} `this`
  unbindEvents: function unbindEvents() {
    var e;
    if((e = this.model.data.event || this.model.data.events)) this._handleEvents_(e);
    return this;
  }
};
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

sudo.version = "0.9.6";
window.sudo = sudo;
if(typeof window._ === "undefined") window._ = sudo;
}).call(this, this);