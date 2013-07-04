describe 'Sudo ViewController', ->
  class VC extends _.ViewController
    constructor: (el, data) ->	
      # descriptors must be set pre call to `super`
      @descriptors = [{
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
      super el, data

    parentMethodOne: (sender, e) ->
      console.log( sender._uid_ )

    parentMethodTwo: (sender, e) ->
      console.log( sender._uid_ )

  beforeEach ->
    vc = new VC()

  it 'has two children', ->
    expect(vc._children_.length).toBe 2	

  it 'can fetch a child by name', ->
    expect(vc.getChild 'Arthur' ).toBeTruthy()	

  it 'acts as a target for a child, even as the child has no explicit target', ->
    spyMethodOne = spyOn(vc, 'parentMethodOne').andCallThrough()
    spyMethodTwo = spyOn(vc, 'parentMethodTwo').andCallThrough()
    vc.getChild('Arthur').send()
    vc.getChild('Lancelot').send()
    expect(spyMethodOne).toHaveBeenCalled()
    expect(spyMethodTwo).toHaveBeenCalled()
