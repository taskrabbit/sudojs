describe('sudo micro template', function() {
  var tmpl = '<ul> \
    {{ for(var i = 0; i < knights.length; i++) { }} \
      {{ var knight = knights[i]; }} \
      <li> \
        <em>{{= knight.name }}</em>. favorite color: {{= knight.favoriteColor }} \
      </li> \
    {{ } }} \
  </ul>';	

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
    expect(compiled([{"name":"Lancelot", "favoriteColor":"blue"}]).indexOf('blue')).toBeTruthy();
    expect(compiled([{"name":"Robin", "favoriteColor":""}]).indexOf('capitalOfAssyria')).toEqual(-1);
    expect(compiled([{"name":"Galahad", "favoriteColor":"unsure"}]).indexOf('Galahad')).toBeTruthy();
  });

  it('escapes unsavory characters', function() {
    var compiled = _.template(tmpl, [{"name":"<script>", "favoriteColor":"&/'"}], 'knights');
    expect(compiled.indexOf('&lt')).toBeTruthy();
    expect(compiled.indexOf('&rt')).toBeTruthy();
    expect(compiled.indexOf('&amp')).toBeTruthy();
    expect(compiled.indexOf('&#x2F')).toBeTruthy();
    expect(compiled.indexOf('&#x27')).toBeTruthy();
  });
});
