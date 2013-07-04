// responder chain type stuff
// view classes used here as they have a model

describe('Sudo Container Send Functionality', function() {

  var Z = function(el, data) {
    this.construct(el, data);
  };
  Z.prototype = Object.create(_.View.prototype);

  Z.prototype.sendersName = function(sender, whatevs) {
    console.log('sender\'s name: ' + sender.model.get('name') + ' sent ' + whatevs);
    console.log('my name: ' + this.model.get('name'));
  };

  var a = new Z(null, {name: 'A'});
  var b = new Z(null, {name: 'B'}); 
  var c = new Z(null, {name: 'C'});
  var d = new Z(null, {name: 'D'});

  it('sets a method and gets it', function() {
    b.model.set('sendMethod', 'sendersName');
    expect(b.model.get('sendMethod')).toEqual('sendersName');
  });

  it('should not have the action set', function() {
    expect(c.model.get('sendMethod')).toBeFalsy();
  });

  it('sets a target and gets it', function() {
    b.model.set('sendTarget', c);
    expect(b.model.get('sendTarget')).toEqual(c);
  });

  it('successfully sends its message to its target with (self) arg', function() {
    var spy = spyOn(c, 'sendersName').andCallThrough();
    b.send('Ni!');
    expect(spy).toHaveBeenCalledWith(b, 'Ni!');
  });

  it('sucessfully sends a message to a different target', function() {
    // actions and targets can be declared 'on-the-fly'
    var spy = spyOn(a, 'sendersName').andCallThrough();
    d.model.set('sendTarget', a);
    d.send('sendersName', ' Go boil your bottoms...');
    expect(spy).toHaveBeenCalledWith(d, ' Go boil your bottoms...');
  });

  it('sends messages on the fly', function() {
    var spy = spyOn(b, 'sendersName').andCallThrough();
    a.parent = b;
    a.send('sendersName', ' Found Them? In Mercia?');
    expect(spy).toHaveBeenCalledWith(a, ' Found Them? In Mercia?');
  });
});

