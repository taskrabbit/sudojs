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
