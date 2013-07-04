describe 'Sudo Control', ->

  class Z extends _.Base
    sendersName: (sender) ->
      console.log('sender\'s name: ' + sender.get('name'))
      console.log('my name: ' + @get('name'))

  A = new Z {name: 'A'}
  B = new Z {name: 'B'} 
  C = new Z {name: 'C'}
  D = new Z {name: 'D'}

  it 'sets a method and gets it', ->
    B.set 'sendMethod', 'sendersName'
    expect(B.get 'sendMethod' ).toBe  'sendersName'

  it 'should not have the action set', ->
    expect(C.get 'sendMethod' ).toBeFalsy()

  it 'sets a target and gets it', ->
    B.set 'sendTarget', C
    expect(B.get 'sendTarget' ).toEqual C

  it 'successfully sends its message to its target with (self) arg', ->
    spy = spyOn(C, 'sendersName').andCallThrough()
    B.send 'Ni!'
    expect(spy).toHaveBeenCalledWith B, 'Ni!'

  it 'sucessfully sends a message to a different target', ->
    # actions and targets can be declared 'on-the-fly'
    spy = spyOn(A, 'sendersName').andCallThrough()
    D.set 'sendTarget', A
    D.send 'sendersName', ' Go boil your bottoms...'
    expect(spy).toHaveBeenCalledWith D, ' Go boil your bottoms...'

  it 'sends messages on the fly', ->
    A.set 'parent', B
    A.send 'sendersName', ' Found Them? In Mercia?'
