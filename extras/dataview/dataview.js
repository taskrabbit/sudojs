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
	var d = data || {}, t;
	sudo.View.call(this, el, d);
	// implements the listener extension
	$.extend(this, sudo.extensions.listener);
	// dataview's models are observable, make it so if not already
	if(!this.model.observe) $.extend(this.model, sudo.extensions.observable);
	// dont autoRender on the setting of events,
	// add to this to prevent others if needed
	this.autoRenderBlacklist = {event: true, events: true};
	// if autorendering, observe your own model
	// use this ref to unobserve if desired
	if(d.autoRender) this.observer = this.model.observe(this.render.bind(this));
	// compile my template if not already done
	if((t = d.template)) {
		if(typeof t === 'string') this.model.data.template = sudo.template(t);
	}
	this.build();
	this.bindEvents();
	if(this.role === 'dataview') this.init();
};
// `private`
sudo.inherit(sudo.View, sudo.DataView);
// ###addedToParent
// Container's will check for the presence of this method and call it if it is present
// after adding a child - essentially, this will auto render the dataview when added to a parent
sudo.DataView.prototype.addedToParent = function(parent) {
	return this.render();
};
// ###build
// Construct the innerHTML of the $el here so that the behavior of the
// DataView, that the markup is ready after a subclass calls `this.construct`,
// is the same as other View classes
sudo.DataView.prototype.build = function build() {
	this.$el.html(this.model.data.template(this.model.data));
	this.built = true;
	return this;
};
// ###removeFromParent
// Remove this object from the DOM and its parent's list of children.
// Overrides `sudo.View.removeFromParent` to actually remove the DOM as well
//
// `returns` {Object} `this`
sudo.DataView.prototype.removeFromParent = function removeFromParent() {
	this.parent.removeChild(this);
	this.$el.remove();
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
	var d;
	// return early if a `blacklisted` key is set to my model
	if(change && this.autoRenderBlacklist[change.name]) return this;
	d = this.model.data;
	// has `build` been called already? If not: 
	if(!this.built) this.$el.html(d.template(d));
	// if so erase the flag
	else this.built = false;
	if(d.renderTarget) {
		this._normalizedEl_(d.renderTarget)[d.renderMethod || 'append'](this.$el);
		delete d.renderTarget;
	}
	return this;
};
// `private`
sudo.DataView.prototype.role = 'dataview';
