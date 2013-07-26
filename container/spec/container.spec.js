describe('Sudo Container Class', function() {
  beforeEach(function() {
    container = new _.View();
    child1 = new _.View(null, {attributes: {id: 'theChaste'}});
    child2 = new _.View(null, {attributes: {id: 'theBrave'}});
    cid1 = child1.uid;
    cid2 = child2.uid;
  });

  it('Is an instance of Container', function() {
    expect(container instanceof _.Container).toBe(true);
  });

  it('has a children array', function() {
    expect(Array.isArray(container.children)).toBe(true);
  });

  it('has a childnames hash', function() {
    expect(typeof container.childNames).toBe('object');
  });

  it('Adds a child view, not appending the DOM', function() {
    container.addChild(child1, 'Galahad');
    expect(container.children.length).toBe(1);
    expect(container.$el.html()).toBeFalsy();
  });

  it('Adds many children via an array', function() {
    var ary = [child1 , child2];
    container.addChildren(ary);
    expect(container.children.length).toBe(2);
  });
  
  it('Adds many children via an object literal', function() {
    var obj = {'Galahad': child1, 'Robin': child2};
    container.addChildren(obj);
    expect(container.children.length).toBe(2);
    expect(container.getChild('Galahad')).toBeTruthy();
    expect(container.getChild('Robin')).toBeTruthy();
  });

  it('Adds children passed to the constructor', function() {
    var c = new _.Container([child1, child2]);
    expect(c.children.length).toBe(2);
  });

  it('Can fetch a child by index or name', function() {
    container.addChild(child1, 'Galahad').addChild(child2, 'Robin');
    expect(container.getChild(0).uid).toBe(cid1);
    expect(container.getChild('Galahad').uid).toBe(cid1);
    expect(container.getChild(1).uid).toBe(cid2);
    expect(container.getChild('Robin').uid).toBe(cid2);
  });

  it('Removes children by name or Index', function() {
    // works because of pass-by-ref
    var c = container.children;
    container.addChild(child1, 'Galahad').addChild(child2, 'Robin');
    expect(c.length).toBe(2);
    container.removeChild(1);
    expect(container.getChild('Robin')).toBeFalsy();
    expect(c.length).toBe(1);
    container.removeChild('Galahad');
    expect(c.length).toBe(0);
  });

  it('Removes all children', function() {
    container.addChild(child1, 'Galahad').addChild(child2, 'Robin');
    expect(container.children.length).toBe(2);
    container.removeChildren();
    expect(container.children.length).toBe(0);
  });

  it('Indexes children correctly, maintaining when adjusted', function() {
    container.addChild(child1, 'Galahad').addChild(child2, 'Robin');
    expect(child1.index).toBe(0);
    expect(child2.index).toBe(1);
    container.removeChild(0);
    expect(child2.index).toBe(0);
  });

  it('Can override methods and use `base` to call super', function() {
    container.addChild = function addChild(child, name) {
      this.base('addChild', child, name);
      this.$el.append(child.$el);
      return this;
    };
    container.removeChild = function removeChild(id) {
      this.getChild(id).$el.remove();
      this.base('removeChild', id);
      return this;
    };
    container.addChild(child1, 'Galahad').addChild(child2, 'Robin');
    expect(container.children.length).toBe(2);
    expect(container.$('#theChaste')).toBeTruthy();
    expect(container.$('#theBrave')).toBeTruthy();

    container.removeChild('Galahad').removeChild('Robin');
    expect(container.children.length).toBe(0);
    expect(container.$('#theChaste').length).toBeFalsy();
    expect(container.$('#theBrave').length).toBeFalsy();
  });

  it('uses the eachChild method correctly', function() {
      var foo = function(arg) {}, spy1, spy2;
      child1.bar = foo;
      child2.bar = foo;

      spy1 = spyOn(child1, 'bar');
      spy2 = spyOn(child2, 'bar');

      container.addChildren([child1, child2]);
      container.eachChild('bar', 'baz');

      expect(spy1).toHaveBeenCalledWith('baz');
      expect(spy2).toHaveBeenCalledWith('baz');
  });
  
});
