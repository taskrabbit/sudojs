describe('sudo.js View Object', function() {
  var v1, v2;

  beforeEach(function() {
    v1 = new _.View();
    v2 = new _.View(null, {
      tagName: 'span', 
      attributes: {
        id: 'spam', 
        'class': 'eggs',
        'data-foo': 'bar'
      }
    });
  });

  it('is an instance of the view class', function() {
    expect(v1 instanceof _.View).toBe(true);
  });

  it('creates a default div as its "el"', function() {
    expect(v1.$el[0].tagName).toEqual('DIV');
  });

  it('creates a specific tag', function() {
    expect(v2.$el[0].tagName).toEqual('SPAN');
  });

  it('with a specific id', function() {
    expect(v2.$el[0].id).toEqual('spam');
  });

  it('with a specific class', function() {
    expect(v2.$el.hasClass('eggs')).toBe(true);
  });

  it('has the data object', function() {
    expect(v2.$el.data('foo')).toBe('bar');
  });

  it('detects a non querified el passed to it', function() {
    var d = document.createElement('p');
    var v3 = new _.View(d);
    expect(v3.$el.length).toEqual(1);
    expect(v3.$el[0].tagName).toEqual('P');
  });

  it('fetches its el from the DOM', function() {
    var d = document.createElement('div');
    d.setAttribute('id', 'fooDiv');
    document.body.appendChild(d);
    var v4 = new _.View('#fooDiv');
    expect(v4.$el.length).toEqual(1);
  });

  it('becomes the premier', function() {
    v1.becomePremier();
    expect(_.premier.uid).toEqual(v1.uid);
  });

  it('resigns premier when another asks', function() {
    v1.becomePremier();
    var spy = spyOn(v1, 'resignPremier').andCallThrough();
    v2.becomePremier();
    expect(_.premier.uid).toEqual(v2.uid);
    expect(spy).toHaveBeenCalled();
    expect(v1.isPremier).toBeFalsy();
  });

  it('has an addedToParent method that is called if present when added', function() {
    var vc = new _.View();
    v1.addedToParent = function(p) {console.log(v1.role + ' added to ' + p.role);};
    var spy = spyOn(v1, 'addedToParent').andCallThrough();
    vc.addChild(v1);
    expect(spy).toHaveBeenCalled();
  });

  it('can remove itself from a parent', function() {
    var vc = new _.View();
    v2.addedToParent = function(parent) {parent.$el.append(this.$el);};
    vc.addChild(v2);
    expect(vc.children.length).toBe(1);
    expect(vc.$('#spam').length).toBe(1);

    v2.removeFromParent().$el.remove();

    expect(vc.children.length).toBe(0);
    expect(vc.$('#spam').length).toBe(0);
  });

  it('allows a Model instance to be passed in', function() {
      var m = new _.Model({tagName: 'ul'}),
        v = new _.View(null, m);
      expect(v.$el[0].tagName).toBe('UL');
  });

});
