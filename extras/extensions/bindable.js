// ##Bindable Extension Object

// Bindable methods allow various properties and attributes of
// a sudo Class Object to be synchronized with the data contained
// in a changeRecord recieved via observe().
//
// `namespace`
sudo.extensions.bindable = {
  // List of attributes - $.attr() to be used.
  //
  // `private`
  _attr_: {
    accesskey: true,
    align: true,
    alt: true,
    contenteditable: true,
    draggable: true,
    href: true,
    label: true,
    name: true,
    rel: true,
    src: true,
    tabindex: true,
    title: true
  },
  // Some bindings defer to jQuery.css() to be bound.
  //
  // `private`
  _css_: {
    display: true,
    visibility: true
  },
  // ###_handleAttr_
  // bind the jQuery prop() method to this object, now exposed
  // by this name, matching passed `bindings` arguments.
  //
  // `param` {string} `meth` The name of the method to be bound
  // `returns` {Object} `this`
  // `private`
  _handleAttr_: function _handleAttr_(meth) {
    this[meth] = function(obj) {
      if(obj.name === meth) this.$el.attr(meth, obj.object[obj.name]);
      return this;
    };
    return this;
  },
  // ###_handleCss_
  // bind the jQuery css() method to this object, now exposed
  // by this name, matching passed `bindings` arguments.
  //
  // `param` {string} `meth` The name of the method to be bound
  // `returns` {Object} `this`
  // `private`
  _handleCss_: function _handleCss_(meth) {
    this[meth] = function(obj) {
      if(obj.name === meth) this.$el.css(meth, obj.object[obj.name]);
      return this;
    };
    return this;
  },
  // ###_handleData_
  // bind the jQuery data() method to this object, now exposed
  // by this name, matching passed `bindings` arguments.
  //
  // `param` {string} `meth` The name of the method to be bound
  // `returns` {Object} `this`
  // `private`
  _handleData_: function _handleData_(meth) {
    this[meth] = function(obj) {
      if(obj.name === meth) {
        this.$el.data(obj.object[obj.name].key, obj.object[obj.name].value);
        return this;
      }
    };
    return this;
  },
  // ###_handleProp_
  // bind the jQuery attr() method to this object, now exposed
  // by this name, matching passed `bindings` arguments.
  //
  // NOTE: If more than 1 data-* attribute is desired you must
  // set those up manually as <obj>.data({..}) is what will be
  // constructed via this method.
  //
  // `param` {string} `meth` The name of the method to be bound.
  // `returns` {Object} `this`
  // `private`
  _handleProp_: function _handleProp_(meth) {
    this[meth] = function(obj) {
      if(obj.name === meth) this.$el.prop(meth, obj.object[obj.name]);
      return this;
    };
    return this;
  },
  // ###_handleSpec_
  // bind the jQuery shorthand methods to this object matching
  // passed `bindings` arguments.
  //
  // `param` {string} `meth` The name of the method to be bound.
  // `returns` {Object} `this`
  // `private`
  _handleSpec_: function _handleSpec_(meth) {
    this[meth] = function(obj) {
      if(obj.name === meth) this.$el[meth](obj.object[obj.name]);
      return this;
    };
    return this;
  },
  // List of properties - $.prop() to be used.
  //
  // `private`
  _prop_: {
    checked: true,
    defaultValue: true,
    disabled: true,
    location: true,
    multiple: true,
    readOnly: true,
    selected: true
  },
  // ###_setBinding_
  // Given a single explicit binding, create it. Called from
  // _setbindings_ as a convenience for normalizing the
  // single vs. multiple bindings scenario
  //
  // `param` {string} `b` The binding.
  // `private`
  _setBinding_: function _setBinding_(b) {
    if(b in this._spec_) return this[this._spec_[b]](b);
    if(b in this._css_) return this._handleCss_(b);
    if(b in this._attr_) return this._handleAttr_(b);
    if(b in this._prop_) return this._handleProp_(b);
  },
  // ###setBindings
  // Inspect the binding (in the single-bound use case), or the 
  // bindings Array in this Object's data store and
  // create the bound functions expected.
  //
  // `returns` {Object} `this`
  setBindings: function setBindings() {
    var d = this.model.data, b, i;
    // handle the single binding use case
    if((b = d.binding)) return this._setBinding_(b);
    if(!(b = d.bindings)) return this;
    for(i = 0; i < b.length; i++) {
      this._setBinding_(b[i]);
    }
    return this;
  },
  // `Special` binding cases. jQuery shorthand methods to be used.
  //
  // `private`
  _spec_: {
    data: '_handleData_',
    html: '_handleSpec_',
    text: '_handleSpec_',
    val: '_handleSpec_'
  }
};
