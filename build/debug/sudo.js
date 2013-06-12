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
// itself be contained
//
// `constructor`
sudo.Container = function() {
	sudo.Base.call(this);
	this.children = [];
	this.childNames = {};
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
// ###bubble
// By default, `bubble` returns the current view's parent (if it has one)
//
// `returns` {Object|undefined}
sudo.Container.prototype.bubble = function bubble() {return this.parent;};
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
// `returns` {object} `this`
sudo.Container.prototype.removeChildren = function removeChildren() {
	while(this.children.length) {
		this.children.shift().removeFromParent();
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
		// passed as a jquery custom data attr bound in events
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
// The view object uses jquery for dom manipulation
// and event delegation etc... A jquerified `this` reference is located
// at `this.$el` and `this.$` scopes queries to this objects `el`, i.e it's
// a shortcut for `this.$el.find(selector)`
//
// `param` {string|element|jQuery} `el`. Otional el for the View instance.
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
		// Passed an already `jquerified` Element?
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
// Stores a jquerified object as `this.$el` the raw
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
// `param` {string} `sel`. A jQuery compatible selector
// `returns` {jQuery} A 'jquerified' result matching the selector
sudo.View.prototype.$ = function(sel) {
	return this.$el.find(sel);
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
sudo.version = "0.9.5";
window.sudo = sudo;
if(typeof window._ === "undefined") window._ = sudo;
}).call(this, this);