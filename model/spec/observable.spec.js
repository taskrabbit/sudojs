describe('Sudo Observable Model', function() {
  beforeEach(function() {
    model = $.extend(new _.Model(), _.extensions.observable);
  });

  it('registers a callback', function() {	
    model.observe(function(){});
    expect(model.callbacks.length).toBe(1);
  });	

  it('calls the cb with correct args when new', function() {
      var cb = jasmine.createSpy();
      model.observe(cb);
      model.set('Arthur', 'King of the Britians');
      expect(cb).toHaveBeenCalledWith({name: 'Arthur', object: model.data, type: 'new'});
      expect(model.get('Arthur')).toBe('King of the Britians');
  });

  it('calls the cb with correct args when updating', function() {
      var cb = jasmine.createSpy();
      model.set('Arthur', 'King of the Britians');
      model.observe(cb);
      model.set('Arthur', 'On a quest...');
      expect(cb).toHaveBeenCalledWith({name: 'Arthur', object: model.data, oldValue: 'King of the Britians', type: 'updated'});
      expect(model.get('Arthur')).toBe('On a quest...');
  });

  it('calls the cb with correct args when deleting', function() {
      var cb = jasmine.createSpy();
      model.set('Arthur', 'Must be a king');
      model.observe(cb);
      model.unset('Arthur');
      expect(cb).toHaveBeenCalledWith({name: 'Arthur', object: model.data, type: 'deleted'});
      expect(model.get('Arthur')).toBeFalsy();
  });

  it('can be unobserved', function() {
    var cb = model.observe(jasmine.createSpy());
    model.set('Patsy', 'dead');
    expect(cb).toHaveBeenCalledWith({name: 'Patsy', object: model.data, type: 'new'});
    expect(cb.callCount).toBe(1);
    model.unobserve(cb).set('Patsy', 'gravely injured');
    expect(cb.callCount).toBe(1);
  });

  it('calls the cb with correct args when new path', function() {
      var cb = model.observe(jasmine.createSpy());
      model.setPath('montyPython.holyGrail.Arthur', 'King of the Britians');
      expect(cb).toHaveBeenCalledWith({name: 'montyPython.holyGrail.Arthur', object: model.data, type: 'new'});
      expect(model.getPath('montyPython.holyGrail.Arthur')).toBe('King of the Britians');
  });

    it('calls the cb with correct args when updating path', function() {
    var cb = jasmine.createSpy();
    model.setPath('montyPython.holyGrail.Arthur', 'King of the Britians');
    model.observe(cb);
    model.setPath('montyPython.holyGrail.Arthur', 'On a quest...');
    expect(cb).toHaveBeenCalledWith({name: 'montyPython.holyGrail.Arthur', object: model.data, oldValue: 'King of the Britians', type: 'updated'});
    expect(model.getPath('montyPython.holyGrail.Arthur')).toBe('On a quest...');
  });

  it('calls the cb with correct args when deleting a path', function() {
    var cb = jasmine.createSpy();
    model.setPath('montyPython.holyGrail.Arthur', 'Must be a king');
    model.observe(cb);
    model.unsetPath('montyPython.holyGrail.Arthur');
    expect(cb).toHaveBeenCalledWith({name: 'montyPython.holyGrail.Arthur', object: model.data, type: 'deleted'});
    expect(model.getPath('montyPython.holyGrail.Arthur')).toBeFalsy();
  });

    it('can be unobserved path', function() {
    var cb = model.observe(jasmine.createSpy());
    model.setPath('montyPython.holyGrail.Patsy', 'dead');
    expect(cb).toHaveBeenCalledWith({name: 'montyPython.holyGrail.Patsy', object: model.data, type: 'new'});
    expect(cb.callCount).toBe(1);
    model.unobserve(cb).setPath('montyPython.holyGrail.Patsy', 'gravely injured');
    expect(cb.callCount).toBe(1);
  });
  
  it('delivers changeRecords after setting multiple items via sets', function() {
      // the foremost fact here is that any fetching of the `current value` reflects the last one set
      var cb = jasmine.createSpy();
      model.observe(cb);
      model.sets({Lancelot: 'The brave', Bedemir: 'The wise', Galahad: 'The pure'});
      expect(cb.callCount).toBe(3);
  });

  it('can have deliverChangeRecords overridden', function() {
    model.deliverChangeRecords = function deliverChangeRecords() {
      var cr = this.changeRecords, 
        obj = {
          names: [],
          values: []
        }, 
        rec;
      // instead of calling the observer 3x call it once with an aggregate of our own making
      // NOTE - when overriding be sure to clear out the _changeRecords_ array
      for( rec; cr.length && (rec = cr.shift()); ) {
        obj.names.push(rec.name);
        obj.values.push(rec.object[rec.name]);
      }
      this._deliver_(obj);
    };

    var cb = jasmine.createSpy();
    model.observe(cb);
    model.sets({Lancelot: 'The brave', Bedemir: 'The wise', Galahad: 'The pure'});
    expect(cb.callCount).toBe(1);
    expect(cb).toHaveBeenCalledWith({names:['Lancelot', 'Bedemir', 'Galahad'], values: ['The brave', 'The wise', 'The pure']});
  });

});
