describe('Sudo ViewController', function() {

  beforeEach(function() {
    modelOne = $.extend(new _.Model(), _.extensions.observable);
    modelTwo = $.extend(new _.Model(), _.extensions.observable);

    VC = function(el, data) {
      this.construct(el, data);
    };

    VC.prototype = Object.create(_.ViewController.prototype);

    VC.prototype.parentMethodOne = function(sender, e) {
      console.log(sender.uid);
    };

    VC.prototype.parentMethodTwo = function(sender, e) {
      console.log(sender.uid);
    };

    vc = new VC(null, {descriptors: [{
        is_a: _.View,
        data: {sendMethod: 'parentMethodOne'},
        name: 'Arthur',
        observe: {object: 'modelOne', cb:'becomePremier'}
      },{
        is_a: _.View,
        data: {sendMethod: 'parentMethodTwo'},
        name: 'Lancelot',
        observes: [{
          object: 'modelOne', 
          cb: 'send'
        }, {
          object: 'modelTwo',
          cb: 'becomePremier'
        }]
      }]
    });

  });

  afterEach(function(){
    modelOne = void 0;
    modelTwo = void 0;
    VC = void 0;
    vc = void 0;
  });

  it('has two children', function() {
    expect(vc.children.length).toEqual(2);	
  });

  it('can fetch a child by name', function() {
    expect(vc.getChild('Arthur')).toBeTruthy();	
  });

  it('has set up the observers from the descriptors', function() {
    expect(modelOne.callbacks.length).toBe(2);
    expect(modelTwo.callbacks.length).toBe(1);
  });

  it('acts as a target for a child, even as the child has no explicit target', function() {
    var spyMethodOne = spyOn(vc, 'parentMethodOne').andCallThrough(),
      spyMethodTwo = spyOn(vc, 'parentMethodTwo').andCallThrough();

    vc.getChild('Arthur').send();
    vc.getChild('Lancelot').send();
    expect(spyMethodOne).toHaveBeenCalled();
    expect(spyMethodTwo).toHaveBeenCalled();
  });

});
