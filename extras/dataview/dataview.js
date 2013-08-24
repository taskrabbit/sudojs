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
