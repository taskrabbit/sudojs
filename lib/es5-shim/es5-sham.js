// Polyfills for non-std browsers that, while not attaining ES5 spec
// (hence `sham`), function correctly on a limited scope.
(function() {
  if(!Object.create) {
    Object.create = function(obj) {
      var ret;
      if (arguments.length > 1 ) {
        // cannot support the multiple argument scenario for legacy browsers
        throw new Error('This Object.create implementation only accepts a single argument');
      }
      function F(){}
      F.prototype = obj;
      ret = new F();
      // Allows Object.getPrototypeOf to work in non-std browsers
      ret.__proto__ = obj;
      return ret;
    };
  }
  // Will return the expected Object for all Objects created using the above `create` method
  if(!Object.getPrototypeOf) {
    Object.getPrototypeOf = function(object) {
      return object.__proto__;
    };
  }
}());
