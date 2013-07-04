describe 'sudo.js View Object', ->

  beforeEach ->
    v1 = new _.View()
    v2 = new _.View null, {
      tagName: 'span', 
      attributes: {
        id: 'spam', 
        'class': 'eggs',
        'data-foo': 'foo'
      }
    }
  
  it 'creates a default div as its "el"', ->
      expect(v1.$el[0].tagName).toBe 'DIV'

  it 'creates a specific tag', ->
      expect(v2.$el[0].tagName).toBe 'SPAN'

  it 'with a specific id', ->
      expect(v2.$el[0].id).toBe 'spam'

  it 'with a specific class', ->
      expect(v2.$el.hasClass 'eggs' ).toBe true

  it 'has the data object', ->
    expect(v2.$el.data().foo).toBe 'foo'

  it 'detects a non jquerified el passed to it', ->
    d = document.createElement 'div'
    v3 = new _.View d
    expect(v3.$el.length).toEqual 1
    expect(v3.$el[0].tagName).toBe 'P'

  it 'fetches its el from the DOM', ->
    d = document.createElement 'div'
    d.setAttribute 'id', 'fooDiv'
    document.body.appendChild d
    v4 = new _.View '#fooDiv'
    expect(v4.$el.length).toBe 1

  it 'becomes the premier', ->
    v1.becomePremier()
    expect(_.premier.get 'uid' ).toEqual(v1.get 'uid' )

  it 'resigns premier when another asks', ->
    v1.becomePremier()
    spy = spyOn(v1, 'resignPremier').andCallThrough()
    v2.becomePremier()
    expect(_.premier.get 'uid' ).toEqual(v2.get 'uid' )
    expect(spy).toHaveBeenCalled()
    expect(v1.get 'isPremier').toBeFalsy()

