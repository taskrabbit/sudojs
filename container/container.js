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
	this.child = {};
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
		this.child[name] = child;
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
