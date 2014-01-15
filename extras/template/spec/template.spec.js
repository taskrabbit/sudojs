describe('sudo micro template', function() {
  var tmpl = '<div>\
  {{{= knights.title }}} \
  <ul> \
    {{ for(var i = 0; i < knights.items.length; i++) { }} \
      {{ var knight = knights.items[i]; }} \
      <li> \
        <em>{{= knight.name }}</em>. favorite color: {{= knight.favoriteColor }} \
      </li> \
    {{ } }} \
  </ul> \
  </div>';


  it('compiles a string source and scope name into a function', function() {
      var compiled = _.template(tmpl, null, 'knights');
      expect(typeof compiled).toEqual('function');
  });

  it('contains the compiled source', function() {
    var compiled = _.template(tmpl, null, 'knights');
    expect(typeof compiled.source).toEqual('string');
  });

  it('returns the templated string', function() {
    var compiled = _.template(tmpl, null, 'knights');
    expect(compiled({"items": [{"name":"Lancelot", "favoriteColor":"blue"}]}).indexOf('blue')).toBeTruthy();
    expect(compiled({"items": [{"name":"Robin", "favoriteColor":""}]}).indexOf('capitalOfAssyria')).toEqual(-1);
    expect(compiled({"items": [{"name":"Galahad", "favoriteColor":"unsure"}]}).indexOf('Galahad')).toBeTruthy();
  });

  it('escapes unsavory characters', function() {
    var compiled = _.template(tmpl, {"items": [{"name":"<script>", "favoriteColor":"&/'"}]}, 'knights');
    expect(compiled.indexOf('&lt')).toBeTruthy();
    expect(compiled.indexOf('&rt')).toBeTruthy();
    expect(compiled.indexOf('&amp')).toBeTruthy();
    expect(compiled.indexOf('&#x2F')).toBeTruthy();
    expect(compiled.indexOf('&#x27')).toBeTruthy();
  });

  it('does not escape raw content', function() {
    var compiled = _.template(tmpl, {"title": "<h3>Knight Colors</h3>", "items": [{"name": "Lancelot", "favoriteColor": "aqua marine"}]}, 'knights');
    expect(compiled.indexOf("<h3>Knight Colors</h3>")).toBeTruthy();
  });
});
