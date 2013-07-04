describe('sudo.js Bindable Object', function() {
  beforeEach(function() {
    model = $.extend(new _.Model(), _.extensions.observable);

    b1 = $.extend(new _.View(null, {
      bindings: ['display','html','text','visibility']
    }), _.extensions.bindable);
    // a bindable must call this
    b1.setBindings();

    b2 = new _.View(null, {
      tagName: 'input',
      attributes: {type: 'text'},
      bindings: ['val', 'readOnly', 'disabled']
    });
    // can do it this way...
    $.extend(b2, _.extensions.bindable);
    b2.setBindings();

    b3 = new _.View(null, {
      tagName: 'input',
      attributes: {type: 'checkbox'},
      binding: 'checked'
    });
    $.extend(b3, _.extensions.bindable);
    b3.setBindings();

    b4 = new _.View(null, {
      tagName: 'img',
      bindings: ['alt', 'title']
    });
    $.extend(b4, _.extensions.bindable);
    b4.setBindings();

    b5 = $.extend(new _.View(null, {binding: 'data'}), _.extensions.bindable);
    b5.setBindings();

    model.observes([
      b1.display.bind(b1),
      b1.visibility.bind(b1),
      b1.text.bind(b1),
      b1.html.bind(b1),
      b2.val.bind(b2),
      b2.readOnly.bind(b2),
      b2.disabled.bind(b2),
      b3.checked.bind(b3),
      b4.alt.bind(b4),
      b5.data.bind(b5)
    ]);

  });

  afterEach(function(){
    model = void 0;
  });

  it('sets visibility to hidden', function() {
    model.set('visibility', 'hidden');
    expect(b1.$el.css('visibility')).toBe('hidden');
  });

  it('sets the visibility to visible', function() {
    model.set('visibility', 'visible');
    expect(b1.$el.css('visibility')).toBe('visible');
  });

  it('sets display to none', function() {
    model.set('display', 'none');
    expect(b1.$el.css('display')).toBe('none');
  });

  it('sets the display to block', function() {
    model.set('display', 'block');
    expect(b1.$el.css('display')).toBe('block');
  });

  it('hydrates inner text from the callback value', function() {
    model.set('text', '...a quest for the Holy Grail');
    expect(b1.$el.text()).toBe('...a quest for the Holy Grail');
  });

  it('hydrates inner html from the callback value', function() {
    model.set('html', "<b>What do you mean you've already got one?</b>");
    expect(b1.$el.html()).toBe("<b>What do you mean you've already got one?</b>");
  });

  it('hydrates value with callback value', function() {
    model.set('val', 'Are you suggesting coconuts migrate?');
    expect(b2.$el.val()).toBe('Are you suggesting coconuts migrate?');
  });

  it('sets the readOnly property', function() {
    model.set('readOnly', true);
    expect(b2.$el.prop('readOnly')).toBeTruthy();
  });

  it('removes the readOnly property', function() {
    model.set('readOnly', false);
    expect(b2.$el.prop('readOnly')).toBeFalsy();
  });

  it('sets the disabled property', function() {
    model.set('disabled', true);
    expect(b2.$el.prop('disabled')).toBeTruthy();
  });

  it('set the checked property', function() {
    model.set('checked', true);
    expect(b3.$el.prop('checked')).toBeTruthy();
  });

  it('removes the checked property', function() {
    model.set('checked', false);
    expect(b3.$el.prop('checked')).toBeFalsy();
  });

  it('adds the alt attribute', function() {
    model.set('alt', 'NI!');
    expect(b4.$el.attr('alt')).toBe('NI!');
  });

  it('properly handles a single data-*', function() {
    model.set('data', {key: 'science', value: 'A Duck!'});
    expect(b5.$el.data('science')).toBe('A Duck!');
  });
});
