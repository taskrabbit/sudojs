describe('Sudo Model persistance', function() {
  // stub the $.ajax fn to simply return the passed `data`
  // to the passed `success`, or call `error` etc...
  $.ajax = function(opts) {
    // by this point all the data has been stringified
    if(opts.data && (typeof opts.data === 'string')) opts.data = JSON.parse(opts.data);

    switch(opts.type) {
      case 'POST':
        opts.data.id = 42;
        opts.data.message = 'POST to ' + opts.url;
        opts.success(opts.data, '200 OK', {});
        break;
      case 'PUT':
        opts.data.message = 'PUT to ' + opts.url;
        opts.success(opts.data, '200 OK', {});
        break;
      case 'PATCH':
        opts.data.message = 'PATCH to ' + opts.url;
        opts.success(opts.data, '200 OK', {});
        break;
      case 'GET':
        opts.data = {};
        opts.data.message = 'GET to ' + opts.url;
        opts.data.isKing = true;
        opts.success(opts.data, '200 OK', {});
        break;
      case 'DELETE':
        opts.success(null, 'DELETE sent to ' + opts.url, {});
        break;
      default:
        // code
      break;
    }
  };

  beforeEach(function() {
    model = new _.Model({
      ajax: {baseUrl: '/camelot'},
      name: 'Arthur',
      occupation: 'King of the Brittons'
    });

    $.extend(model, _.extensions.persistable);
  });

  it('Uses POST for create', function() {
    model.set('onQuest', true).create();
    expect(model.gets(['id', 'message'])).toEqual({
      id: 42, 
      message:'POST to /camelot'
    });
  });

  it('Will POST the passed in data vs the model itself', function() {
    model.set('onQuest', true).create({
      data: model.data,
      success: function(data, status, xhr) {
        this.sets({
          ajaxStatus: status,
          json: data
        });
      }.bind(model)
    });
      
    expect(typeof (model.get('json'))).toBe('object');
    expect(model.get('ajaxStatus')).toBe('200 OK');
  });

  it('Uses PUT for update by default, and adjusts the url', function() {
    model.sets({id: 43, squire: 'Patsy'}).update();
    expect(model.get('message')).toBe('PUT to /camelot/43');
  });

  it('Uses PATCH for update if set, and adjusts the url', function() {
    model.sets({'ajax.patch': true, id: 44, squire: 'Patsy'}).update();
    expect(model.get('message')).toBe('PATCH to /camelot/44');
  });

  it('Uses PATCH for update if passed, and adjusts the url', function() {
    model.sets({id: 45, squire: 'Patsy'}).update({patch:true});
    expect(model.get('message')).toBe('PATCH to /camelot/45');
  });

  it('Uses POST for a "new" model when "saved"', function() {
    // should behave as a `new` model (there is no `id` yet)
    model.save();
    expect(model.gets(['id', 'message'])).toEqual({
      id: 42, 
      message:'POST to /camelot'
    });
  });

  it('Uses PUT for a "persisted" model when "saved"', function() {
    // should behave as a `new` model (there is no `id` yet)
    model.set('id', 47).save();
    expect(model.get('message')).toBe('PUT to /camelot/47');
  });

  it('Uses PATCH for a "persisted" model when "saved" if patch set', function() {
    // should behave as a `new` model (there is no `id` yet)
    model.sets({id: 48, 'ajax.patch': true}).save();
    expect(model.get('message')).toBe('PATCH to /camelot/48');
  });

  it('Uses GET for read', function() {
    model.set('id', 46).read();
    expect(model.gets(['isKing', 'message'])).toEqual({
      isKing: true,
      message: 'GET to /camelot/46'
    });
  });

  it('Uses DELETE for destroy', function() {
    model.set('id', 47).destroy();
    expect(model.get('ajaxStatus')).toBe('DELETE sent to /camelot/47');
  });

});
