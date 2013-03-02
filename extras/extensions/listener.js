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
//		 1. If a {string}, name of a method on this object. Will be 
//				converted to a reference to that method with scope bound to `this`.
//		 2. If a {function} left as is with no scope manipulation. 
//	C. event(s)[type] === {object}
//		1. sel -> Optional CSS selector used to delegate events
//		2. type[sel] -> 
//			a. If a {string}, name of a method on this object. Will be 
//				 converted to a reference to that method with scope bound to `this`.
//			b. If a {function} left as is with no scope manipulation. 
//			c. If an object, 'fn' key located and treated as 1 or 2 above,
//				 'data' key located and appended to the `Event` before being 
//				 passed to the callback
sudo.extensions.listener = {
	// `private`
	_addOrRemove_: function _addOrRemove_(which, type, handler, capture) {
		this.el[which ? 'addEventListener' : 'removeEventListener'](type, handler, capture);
	},
	// ###bindEvents
	// Bind the events in the data store to this object's $el
	//
	// `returns` {Object} `this`
	bindEvents: function bindEvents() {
		var hash;
		// because you must pass the same ref to `unbind`
		if(!this._predicate_) this._predicate_ = this.predicate.bind(this);
		if((hash = this.model.data.event || this.model.data.events)) this._handleEvents_(hash, 1);
		return this;
	},
	// `private`
	_handleEvents_: function _handleEvents_(hash, which) {
		var types = Object.keys(hash), i;
		for(i = 0; i < types.length; i++) {
			this._handleType_(types[i], hash, which);
		}
	},
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
				// check if the val is a methodName or fn, this form (2) has a sel 
				// - but no data or 'capture'
				if(nHandlerType === 'object') { // final form - may have sel, data and 'capture'
					if(typeof nHandler.fn === 'string') {
						nHandler.fn = this[nHandler.fn].bind(this);
					}
					this._addOrRemove_(which, type, this._predicate_, nHandler.capture);
				} else {
					if(nHandlerType === 'string') hash[type][selector] = this[nHandler].bind(this);
					// the predicate will call the fn if sel match is made
					this._addOrRemove_(which, type, this._predicate_);
				}
			}
		}
	},
	// ###predicate
	//
	predicate: function predicate(e) {
		var hash = this.model.data.event || this.model.data.events,
			type = hash[e.type], selectors, ary, i, selector, handler;
		if(type) { //{click}
			selectors = Object.keys(type);
			for(i = 0; i < selectors.length; i++) {
				selector = selectors[i]; handler = type[selector];
				// TODO in the future this could be done at `bindEvents` and stashed
				// in the hash - if we observe changes to `event(s)`
				ary = Array.prototype.slice.call(this.$$(selector)); //{click: {'button'}}
				if(ary.indexOf(e.target) !== -1) {
					// time to call the methods
					if(typeof handler === 'object') {
						if(handler.data) e.data = handler.data;
						handler.fn(e);
					} else handler(e); 
				}
			}
		}
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
