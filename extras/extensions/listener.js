// ##Listener Extension Object

// Handles event binding/unbinding via an events hash in the form:
// event(s): {
//	type: 'methodName' (or function)
//	type2: {
//		sel: 'methodName',
//		otherSel: function
//	},
//	type3: {
//		sel: {
//			fn: 'methodName' (or function),
//			data: {...},
//			capture: true
//		}
//	}
// }
//	This hash will be searched for via `this.get('event(s)')`.
//	About the hash:
//
//	A. type -> Compatible DOM event type
//	B. event(s)[type] === {string} || {function} (no delegation or data)
//		1. If a {string}, name of a method on this object. Will be 
//				converted to a reference to that method with scope bound to `this`.
//		2. If a {function} left as is with no scope manipulation. 
//	C. event(s)[type] === {object}
//		1. sel -> Optional CSS selector used to delegate events
//		2. type[sel] -> 
//			a. If a {string}, name of a method on this object. Will be 
//					converted to a reference to that method with scope bound to `this`.
//			b. If a {function} left as is with no scope manipulation. 
//			c. If an object, 'fn' key located and treated as 1 or 2 above,
//					'data' key located and appended to the `Event` before being 
//					passed to the callback
sudo.extensions.listener = {
	// ###_addOrRemove_
	// All the relevant pieces have been accumulated, now either add or remove the 
	// Listener to/from the element
	//
	// `private`
	_addOrRemove_: function _addOrRemove_(which, type, handler, capture) {
		this.el[which ? 'addEventListener' : 'removeEventListener'](type, handler, capture);
	},
	// ###bindEvents
	// Bind the events in the data store to this object's el, observing the 
	// options there
	//
	// `returns` {Object} `this`
	bindEvents: function bindEvents() {
		var hash;
		// because you must pass the same ref to `unbind`
		if(!this._predicate_) this._predicate_ = this.predicate.bind(this);
		if((hash = this.model.data.event || this.model.data.events)) this._handleEvents_(hash, 1);
		return this;
	},
	// ###_getNodes_
	// Return an array of the nodes matching `this.querySelectorAll(selector)`.
	// Used during event binding to store the targets of a delegated event
	//
	// `private`
	_getNodes_: function _getNodes_(selector) {
		return Array.prototype.slice.call(this.$$(selector));
	},
	// ###_handleEvents_
	// Get each event type to be observed and pass them to _handleType_
	// with their options
	//
	// `private`
	_handleEvents_: function _handleEvents_(hash, which) {
		var types = Object.keys(hash), i;
		for(i = 0; i < types.length; i++) {
			this._handleType_(types[i], hash, which);
		}
	},
	// ###_handleType_
	// Normalizes the various forms that event data may be in. Works
	// in conjunction with `_addOrRemove_` and `predicate` to correctly
	// prepare methods for adding **and removing** event Listeners.
	//
	// `private`
	_handleType_: function _handleEvent_(type, hash, which) {
		var handler = hash[type], handlerType = typeof handler, 
		selectors, selector, i, nHandler, nHandlerType;
		// handler is already a function, (un)bind it
		if(handlerType === 'function') this._addOrRemove_(which, type, handler);
		else if(handlerType === 'string') {
			// morph the name into a bound reference
			hash[type] = this[handler].bind(this);
			// bind it
			this._addOrRemove_(which, type, hash[type]);
		} else { // nested object(s)
			selectors = Object.keys(handler);
			// the fn still needs to be bound for the predicate
			for (i = 0; i < selectors.length; i++) {
				selector = selectors[i];
				nHandler = handler[selector]; nHandlerType = typeof nHandler;
				// type3 above - may have sel, data and 'capture'
				if(nHandlerType === 'object') { 
					if(typeof nHandler.fn === 'string') {
						nHandler.fn = this[nHandler.fn].bind(this);
					}
					// set the list of possible targets
					nHandler._nodes_ = this._getNodes_(selector);
					this._addOrRemove_(which, type, this._predicate_, nHandler.capture);
				} else {
					// this form (type2 above) has a sel - but no data or 'capture'
					// we are going to morph this into an obj - as we will store the _nodes_
					if(nHandlerType === 'string') {
						hash[type][selector] = {
							fn: this[nHandler].bind(this),
							_nodes_: this._getNodes_(selector)
						};
					}
					// the predicate will call the fn if sel match is made
					this._addOrRemove_(which, type, this._predicate_);
				}
			}
		}
	},
	// ###predicate
	// When binding events, if a a `selector` (or `data`) is found, the Listener
	// will bind this method as the callback. Serving as the 'first step' in a process
	// that will:
	//   1. Appended the `data` to the `event` object if `data` is present. 
	//   2. If `sel` is indicated, Compare the `event.target` to the item(s) returned fom
	//      a querySelectorAll operation on this object's `el`, looking for a match.
	// When complete, pass the `event` to the desired callback (or don't), as per `bindEvents`.
	//
	// **Notes**
	// This method could be written (along with _handleType_)to create closures for the 
	// needed data in the event hash rather than looking it up. This would not be
	// without concerns however, such as memory leaks.
	//
	// `param` {event} `e`. The DOM event
	// `returns` {*} call to the indicated method/function
	predicate: function predicate(e) {
		var hash = this.model.data.event || this.model.data.events,
			type = hash[e.type], selectors, i, selector, handler;
		if(type) {
			selectors = Object.keys(type);
			for(i = 0; i < selectors.length; i++) {
				selector = selectors[i]; handler = type[selector];
				// _nodes_ should be in place 
				if(handler._nodes_.indexOf(e.target) !== -1) {
					// time to call the methods
					if(handler.data) e.data = handler.data;
					return handler.fn(e);
				}
			}
		}
	},
	// ###rebindEvents
	// Convenience method to `unbind`, then `bind` the events stored in
	// this object's model.
	//
	// `returns` {object} `this`
	rebindEvents: function rebindEvents() {
		this.unbindEvents().bindEvents();
	},
	// ###unbindEvents
	// Unbind the events in the data store from this object's $el
	//
	// `returns` {Object} `this`
	unbindEvents: function unbindEvents() {
		var hash;
		if((hash = this.model.data.event || this.model.data.events)) this._handleEvents_(hash);
		return this;
	}
};
