// ##ViewController Class Object

// ViewControllers were designed for Rails projects for 2 specific use-cases:
//
// 1. ViewControllers can instantiate any `descriptors` found in their model
// when constructing, adding them as `child` objects. Why? Sometimes a 'partial' will
// need to define a javascript object that should, by design, be the child of a parent View
// that is itself defined on the Rails view that owns the 'partial'. Since any JS introduced
// by a partial will be parsed before the JS on its parent Rails View this usually isn't possible.
// Our solution? Pushing `Descriptor objects` (see docs) into an array (somewhere in your namespace) from a 
// 'partial' and then passing a reference to that array into the ViewController as 'descriptors'
// in its optional data argument when instantiated. The ViewController will then iterate over those 
// and instantiate them, adding them as children as it goes (also setting up any stated observers)
//
// `param` {string|element} `el`. Otional el for the View instance.
// `param` {object} `data`. Optional data object.
//
// `see` sudo.View.
//
// `constructor`
sudo.ViewController = function(el, data) {
	sudo.View.call(this, el, data);
	if(data) {
		if('descriptor' in data) this.instantiateChildren([data.descriptor]);
		else if('descriptors' in data) this.instantiateChildren();
	}
	if(this.role === 'viewController') this.init();
};
// ViewController inherits from View.
// `private`
sudo.inherit(sudo.View, sudo.ViewController);
// ###_handleObserve_
// Helper for instantiateChildren
// `private`
sudo.ViewController.prototype._handleObserve_ = function _handleObserve_(obs, c) {
	var obj = obs.object ? this._objectForPath_(obs.object) : this.model;
	obj.observe(c[obs.cb].bind(c));
};
// ###instantiateChildren
// instantiate the children described in the passed in array or the `descriptors` array
// set in this object's data store
//
// `returns` {object} `this`
sudo.ViewController.prototype.instantiateChildren = function instantiateChildren(ary) {
	var i, j, curr, c, d = ary || this.model.data.descriptors;
	for(i = 0; i < d.length; i++) {
		curr = d[i]; 
		c = new curr.is_a(curr.el, curr.data);
		this.addChild(c, curr.name);
		// handle any observe(s)
		if('observe' in curr) {
			this._handleObserve_(curr.observe, c);
		}
		else if('observes' in curr) {
			for(j = 0; j < curr.observes.length; j++) {
				this._handleObserve_(curr.observes[j], c);
			}
		}
	}
	return this;
};
// ###_objectForPath_
// The objects used for callbacks and connections need to be
// looked-up via a key-path like address as they likely will not exist
// when viewController's are instantiated.
// `private`
sudo.ViewController.prototype._objectForPath_ = function _objectForPath_(path) {
	return sudo.getPath(path, window);
};
// `private`
sudo.ViewController.prototype.role = 'viewController';
