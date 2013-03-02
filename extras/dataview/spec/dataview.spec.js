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

	it('exists but without the inner content yet', function() {
		expect(dv.el.innerHTML).toBeFalsy();
	});

	it('renders correctly', function() {
		dv.model.sets({
			sayingOne:"Let's not bicker and argue over who killed who.",
			buttonOneValue: "I'm not worthy",
			sayingTwo: "You were in terrible peril.",
			buttonTwoValue: "I bet you're gay"
		});

		expect(dv.$('#one span').textContent).toBe("Let's not bicker and argue over who killed who.");
		expect(dv.$('#one button').textContent).toBe("I'm not worthy");
		expect(dv.$('#two span').textContent).toBe("You were in terrible peril.");
		expect(dv.$('#two button').textContent).toBe("I bet you're gay");
	});

	it('deleted the renderTarget', function() {
			expect(dv.model.get('renderTarget')).toBeFalsy();
	});

	it('has not yet bound the click event', function() {
		var evt = document.createEvent('MouseEvent');
		evt.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		var spy = spyOn(dv, 'buttonClicked');
		dv.$('button').dispatchEvent(evt);
		expect(spy.callCount).toBe(0);
	});

	it('has delegated the event, maintaining it even when html is refreshed', function() {
		var ary, evt = document.createEvent('MouseEvent');
		evt.initMouseEvent("click", true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);

		var spy = spyOn(dv, 'buttonClicked').andCallThrough();
		// set and bind after spy declaration or jasmine won't see it
		dv.model.set('event', {
			click: {
				button: 'buttonClicked'
			}
		});
		dv.bindEvents();
		
		ary = Array.prototype.slice.call(dv.$$('button'));

		ary.forEach(function(el) {
			el.dispatchEvent(evt);
		});

		expect(spy.callCount).toBe(2);

		dv.el.innerHTML = '';
		expect(dv.el.innerHTML).toBeFalsy();

		dv.model.sets({
			sayingOne:"You've got no arms left.",
			buttonOneValue: "Yes I have",
			sayingTwo: "Look!",
			buttonTwoValue: "It's just a flesh wound"
		});

		expect(dv.$('#one span').textContent).toBe("You've got no arms left.");
		expect(dv.$('#one button').textContent).toBe("Yes I have");
		expect(dv.$('#two span').textContent).toBe("Look!");
		expect(dv.$('#two button').textContent).toBe("It's just a flesh wound");

		ary = Array.prototype.slice.call(dv.$$('button'));

		ary.forEach(function(el) {
			el.dispatchEvent(evt);
		});

		expect(spy.callCount).toBe(4);

		// can unbind events as well
		dv.unbindEvents();

		ary.forEach(function(el) {
			el.dispatchEvent(evt);
		});

		expect(spy.callCount).toBe(4);
	});

	it('can remove itself from a parent ViewController', function() {
		// reset dv
		var t = document.getElementById('testTarget');
		t.innerHTML = '';
		dv.el.innerHTML = '';

		expect(t.innerHTML).toBeFalsy();

		var vc = new sudo.ViewController(t);

		dv.model.set('renderTarget', vc.el);
		vc.addChild(dv);
		expect(vc.el.innerHTML).toBeTruthy();

		dv.removeFromParent();
		expect(vc.el.innerHTML).toBeFalsy();
	});
	
});

