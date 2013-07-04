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
