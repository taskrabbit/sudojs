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
