describe('Sudo Model Object', function() {

  var a = new _.Model({arrowToThe: 'knee'}),
  b = new _.Model(),
  // any setting of values in '2' will reflect in '3'
  // since they share a model.
  v = new _.View(),
  v2 = new _.View();
  v.model = a;
  v2.model = a;
  
  it('is an instance of the Model class', function() {
    expect(b instanceof _.Model).toBe(true);
  });

  it('sets and gets the value with the key', function(){
    b.set('spam', 'eggs');
    expect(b.get('spam')).toEqual('eggs');
  });

  it('should not share the key', function() {
    expect(v.model.get('spam')).toBeFalsy();
  });

  it('should return undefined for non-existant keys', function(){
    expect(a.get('aabbcc')).toBeFalsy();
  });

  it('should share model data', function() {
    expect(v.model.get('arrowToThe')).toEqual(v2.model.get('arrowToThe'));
  });

  it('should reflect changes in both models', function() {
    v.model.set('Fus-Ro','-Da');
    expect(v2.model.get('Fus-Ro')).toEqual('-Da');
  });

  it('should correctly use paths', function() {
    a.setPath('Skyrim.Whiterun.Companions', 'Jarrvaskr');
    expect(a.getPath('Skyrim.Whiterun.Companions')).toEqual('Jarrvaskr');
  });

  it('should correctly use existing path parts', function() {
    a.setPath('Skyrim.Whiterun.Palace', 'Dragonsreach');
    expect(a.getPath('Skyrim.Whiterun.Palace')).toEqual('Dragonsreach');
  });

  it('can set multiple keys and values via an object literal', function() {
    a.sets({
      Winterhold: 'magesCollege',
      Solitude: 'bluePalace',
      'Falkreath.tourism': 'cemetery'
    });
    expect(a.getPath('Falkreath.tourism')).toEqual('cemetery');
  });

  it('can fetch mutliple values for an array of keys', function() {
    expect(a.gets(['Winterhold','Falkreath.tourism'])).toEqual({
      Winterhold: 'magesCollege',
      'Falkreath.tourism': 'cemetery'
    });
  });
});
