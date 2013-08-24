describe('sudo.js Dataview Object', function() {
  
  var DV = function(el, data) {
    this.construct(el, data);
  };

  DV.prototype = Object.create(sudo.DataView.prototype);

  DV.prototype.buttonClicked = function(e) {
    console.log('my button ' + e.target.className + ' wuz clicked');
  };

  var dv = new DV(null, {
    attributes: {
      id: 'spam', 
      'class': 'eggs'
    },
    renderTarget: '#testTarget',
    autoRender: true, 
    template: '' +
      '<div id="one">' +
        '<span>{{= data.sayingOne }}</span>' +
        '<button class="first">{{= data.buttonOneValue }}</button>' +
      '</div>' +
      '<div id="two">' +
        '<span>{{= data.sayingTwo }}</span>' +
        '<button class="second">{{= data.buttonTwoValue }}</button>' +
      '</div>'
  });

  // autoRender Dataview wont do much til added
  dv.addedToParent();

  it('!exists with the inner content', function() {
    expect(dv.$el.html()).toBeFalsy();
  });

  it('renders correctly', function() {
    dv.model.sets({
      sayingOne:"Let's not bicker and argue over who killed who.",
      buttonOneValue: "I'm not worthy",
      sayingTwo: "You were in terrible peril.",
      buttonTwoValue: "I bet you're gay"
    });

    expect(dv.$('#one span').text()).toBe("Let's not bicker and argue over who killed who.");
    expect(dv.$('#one button').text()).toBe("I'm not worthy");
    expect(dv.$('#two span').text()).toBe("You were in terrible peril.");
    expect(dv.$('#two button').text()).toBe("I bet you're gay");
  });

  it('deleted the renderTarget', function() {
      expect(dv.model.get('renderTarget')).toBeFalsy();
  });

  it('has not yet bound the click event', function() {
    var spy = spyOn(dv, 'buttonClicked');
    dv.$('button').trigger('click');
    expect(spy.callCount).toBe(0);	
  });

  it('has delegated the event, maintaining it even when html is refreshed', function() {
    var spy = spyOn(dv, 'buttonClicked').andCallThrough();
    // set and bind after spy declaration or jasmine won't see it
    dv.model.set('event', {
      name: 'click',
      sel: 'button',
      fn: 'buttonClicked'
    });
    dv.bindEvents();

    dv.$('button').trigger('click');
    expect(spy.callCount).toBe(2);

    dv.$el.empty();
    expect(dv.$el.html()).toBeFalsy();

    dv.model.sets({
      sayingOne:"You've got no arms left.",
      buttonOneValue: "Yes I have",
      sayingTwo: "Look!",
      buttonTwoValue: "It's just a flesh wound"
    });

    expect(dv.$('#one span').text()).toBe("You've got no arms left.");
    expect(dv.$('#one button').text()).toBe("Yes I have");
    expect(dv.$('#two span').text()).toBe("Look!");
    expect(dv.$('#two button').text()).toBe("It's just a flesh wound");

    dv.$('button').trigger('click');
    expect(spy.callCount).toBe(4);

    // can unbind events as well
    dv.unbindEvents();
    dv.$('button').trigger('click');
    expect(spy.callCount).toBe(4);
  });

  it('can remove itself from a parent ViewController', function() {
    // reset dv	
    dv.$el.empty().remove();
    expect($('#testTarget').html()).toBeFalsy();

    var vc = new sudo.View('#testTarget');

    dv.model.set('renderTarget', vc.$el);
    vc.addChild(dv);
    expect($('#testTarget').html()).toBeTruthy();

    dv.removeFromParent();
    expect($('#testTarget').html()).toBeFalsy();
  });
  
});

