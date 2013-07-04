describe('Sudo Change Delegate', function() {

  beforeEach(function(){
    model = $.extend(new _.Model(), _.extensions.observable);
    view = new _.View();
    view.denyDivinity = function(obj) {};
    view.addDelegate(new _.delegates.Change({
      filters: {
        isMessiah: 'denyDivinity',
        'is.messiah': 'denyDivinity'
      }
    }));
    model.observe(view.delegate('change', 'filter'));
  });

  it('establishes a delegate', function() {
    expect(view.delegates[0]).toBeTruthy();
    expect(view.delegates[0].delegator).toBeTruthy();
  });

  it('filters the changerecord', function() {
    var spy = spyOn(view, 'denyDivinity');
    model.set('isMessiah', 'I am not the messiah');
    expect(spy).toHaveBeenCalled();
  });

  it('does not respond to change records not listed in its filters', function() {
    var spy = spyOn(view, 'denyDivinity');
    model.set('hatesTheRomans', 'Alot!');
    expect(spy).not.toHaveBeenCalled();
  });

  it('filters by path', function() {
    var spy = spyOn(view, 'denyDivinity');
    model.set('is.messiah', false);
    expect(spy).toHaveBeenCalled();
  });

  it('filters by path, ignoring paths not stated', function() {
    var spy = spyOn(view, 'denyDivinity');
    model.set('is.naughty', true);
    expect(spy).not.toHaveBeenCalled();
  });

  it('observes unset', function() {
    model.setPath('is.messiah', true);
    var spy = spyOn(view, 'denyDivinity');
    model.unsetPath('is.messiah');
    expect(spy).toHaveBeenCalled();
  });

  it('can add a filter', function() {
    var del = view.delegate('change');
    del.addFilter('isNaughty', 'acceptIt');
    expect(del.get('filters').isNaughty).toBe('acceptIt');
  });

  it('can remove a filter', function() {
    var del = view.delegate('change');
    del.removeFilter('isNaughty');
    expect(del.get('filters').isNaughty).toBeFalsy();
  });

  it('removes a delegate', function() {
    var del = view.delegate('change');
    view.removeDelegate('change');
    expect(view.delegates.length).toBe(0);
    expect(del.delegator).toBeFalsy();
  });
});
