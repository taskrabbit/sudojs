describe('Sudo Data Delegate', function() {

  beforeEach(function() {
    model = $.extend(new _.Model(), _.extensions.observable);
    view = new _.View();
    view.tellFollowers = function() {};
    view.thinkingAbout = function() {};
    view.addDelegate(new _.delegates.Data({
      filters: {
        'to.f*ck': 'tellFollowers',
        nose: 'thinkingAbout'
      }
    }));
  });

  it('establishes a delegate', function() {
    expect(view.delegates[0]).toBeTruthy();
    expect(view.delegates[0].delegator).toBeTruthy();
  });
  
  it('filters only the desired path', function() {
    var spy = spyOn(view, 'tellFollowers');
    view.delegate('data').filter({
      to: {
        stand: 'around',
        'f*ck': 'off'
      }
    });
    expect(spy).toHaveBeenCalledWith('off');
  });

  it('filters only the desired key', function() {
    var spy = spyOn(view, 'thinkingAbout');
    view.delegate('data').filter({
      nose: 'size?',
      sex: false
    });
    expect(spy).toHaveBeenCalledWith('size?');
  });

});

