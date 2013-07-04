describe('Sudo Base Object', function() {
  beforeEach(function() {
    b = new _.Base();
    d = new _.Base();
    d.role = 'encyclopediaSalesman';
    d.burgle = function() {
      return this.role;
    };
    d.addedAsDelegate = function() {
      this.added = true;
    };
  });

  it('is an instance of the Base class', function() {
    expect(b instanceof _.Base).toBe(true);
  });

  it('has a unique id', function() {
    expect(b.uid).toBeTruthy();
  });

  it('has an empty delegates Array', function() {
    expect(Array.isArray(b.delegates)).toBe(true);
  });

  it('can add a delegate', function() {
    b.addDelegate(d);
    expect(b.delegates.length).toBe(1);
  });

  it('calls addedAsDelegate if present', function() {
    var spy = spyOn(d, 'addedAsDelegate').andCallThrough();
    b.addDelegate(d);
    expect(spy).toHaveBeenCalled();
    expect(d.added).toBe(true);
  });

  it('can fetch a delegate by role', function() {
    b.addDelegate(d);
    expect(b.delegate('encyclopediaSalesman')).toBe(d);
  });

  it('returns a function when passed a matching name', function() {
    b.addDelegate(d);
    expect(typeof b.delegate('encyclopediaSalesman', 'burgle')).toBe('function');
  });

  it('returns a function, bound to the delegate, if delegated to', function() {
    b.addDelegate(d);
    expect(b.delegate('encyclopediaSalesman', 'burgle')()).toBe('encyclopediaSalesman');
  });

  it('can remove a delegate', function() {
    e = new _.Base();
    e.role = 'suspiciousHomeOwner';
    b.addDelegate(d);
    b.addDelegate(e);
    expect(b.delegates.length).toBe(2);
    b.removeDelegate('encyclopediaSalesman');
    expect(b.delegates.length).toBe(1);
  });
});
