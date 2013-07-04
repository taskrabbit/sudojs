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
// 2. ViewControllers also abstract away connecting UJS style events by allowing the developer to
// pass in the name(s) of any desired UJS events to observe: `ujsEvent: ajax:success` for example, 
// and expect that a method named onAjaxSuccess, if present on the ViewController, will be called
// with the arguments returned by the UJS plugin*
//
// `param` {string|element} `el`. Otional el for the View instance.
// `param` {object} `data`. Optional data object.
//
// `see` sudo.View.
//
// `constructor`
sudo.ViewController = function(el, data) {
  sudo.View.call(this, el, data);
  // map the names of events to methods we expect to proxy to
  this.eventMap = {
    'ajax:before': 'onAjaxBefore',
    'ajax:beforeSend': 'onAjaxBeforeSend',
    'ajax:success': 'onAjaxSuccess',
    'ajax:error': 'onAjaxError',
    'ajax:complete': 'onAjaxComplete',
    'ajax:aborted:required': 'onAjaxAbortedRequired',
    'ajax:aborted:file': 'onAjaxAbortedFile'
  };
  // can be called again if mapping changes... 
  if(data) {
    this.doMapping();
    if('descriptor' in data) this.instantiateChildren([data.descriptor]);
    else if('descriptors' in data) this.instantiateChildren();
  }
  if(this.role === 'viewController') this.init();
};
// ViewController inherits from View.
// `private`
sudo.inherit(sudo.View, sudo.ViewController);
// ###doMapping
//
// assign the proxy mapping for events. This can be called at any time
// if the listened for events change
//
// `returns` {Object} `this`
sudo.ViewController.prototype.doMapping = function() {
  // either a single event or an array of them
  var i,
    toMap = this.model.data.ujsEvent || this.model.data.ujsEvents;
  if(toMap) {
    if(typeof toMap === 'string') this._mapEvent_(toMap);
    else {
      for(i = 0; i < toMap.length; i++) {
        this._mapEvent_(toMap[i]);
      }
    }
  }
  return this;
};
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
// ###_mapEvent_
// Maps the ajax:event names to methods
// `private`
sudo.ViewController.prototype._mapEvent_ = function _mapEvent_(name) {
    // because the signatures vary we need specific methods
    this.$el.on(name, this[this.eventMap[name]].bind(this));
};
// ###_objectForPath_
// The objects used for callbacks and connections need to be
// looked-up via a key-path like address as they likely will not exist
// when viewController's are instantiated.
// `private`
sudo.ViewController.prototype._objectForPath_ = function _objectForPath_(path) {
  return sudo.getPath(path, window);
};
// Virtual methods to override in your child classes for
// any events you chose to listen for
sudo.ViewController.prototype.onAjaxAbortedFile = $.noop;
sudo.ViewController.prototype.onAjaxAbortedRequired = $.noop;
sudo.ViewController.prototype.onAjaxBefore = $.noop;
sudo.ViewController.prototype.onAjaxBeforeSend = $.noop;
sudo.ViewController.prototype.onAjaxComplete = $.noop;
sudo.ViewController.prototype.onAjaxSuccess = $.noop;
sudo.ViewController.prototype.onAjaxError = $.noop;
// `private`
sudo.ViewController.prototype.role = 'viewController';
