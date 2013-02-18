describe('Sudo Navigator Class -- PushState', function() {
	var model = _.extend(new _.Model(), _.extensions.observable),
		nav = new _.Navigator({
			root: '/',
			observable: model
		});

	var anchor = document.createElement('a');
	anchor.setAttribute('href', 'http://www.foo.com/#wtf');
	// override the go function so as not to actually go anywhere
	nav.go = function(fragment) {
		// normally this would be present in a hashchange scenario
		if(!this.started) return false;
		if(!this.urlChanged(fragment)) return;
		if(this.isPushState) {
			this.a.setAttribute('href', this.getUrl());
		} else if(this.isHashChange) {
			this.a.hash =  '#' + this.data.fragment;
		}
		this.setData();
		return this.a;
	};

	// override start so that the nav class does not try
	// to redirect the window
	nav.start = function start(a) {
		// operate on this passed in anchor rather than window.*
		this.a = a;
		var aPath = a.pathname,
			hasPushState, atRoot, tmp;
		// fix for windows a.pathname
		if(!(/^\//.test(aPath))) aPath = '/' + aPath;

		if(this.started) return;
		hasPushState = window.history && window.history.pushState;
		this.started = true;
		// setup the initial configuration
		this.isHashChange = this.data.useHashChange && 'onhashchange' in window || 
			(!hasPushState && 'onhashchange' in window);
		this.isPushState = !this.isHashChange && !!hasPushState;
		// normalize the root to always contain a leading and trailing slash
		this.data['root'] = ('/' + this.data['root'] + '/').replace(this.slashStripper, '/');
		// Get a snapshot of the current fragment
		this.urlChanged(aPath);
		// monitor URL changes via popState or hashchange
		if (this.isPushState) {
			a.addEventListener('popstate', this.handleChange.bind(this));
		} else if (this.isHashChange) {
			a.addEventListener('hashchange', this.handleChange.bind(this));
		} else return;
		// Does the current URL need to changed? (hashchange vs popstate)
		atRoot = aPath.replace(/[^\/]$/, '$&/') === this.data['root'];
		// somehow a pushstate URL got here (and here is hashchange)
		if(this.isHashChange && !atRoot) { 
			a.setAttribute('href', this.data['root'] + a.search + '#' + this.data.fragment);
			return a;
			// the converse of the above
		} else if(this.isPushState && atRoot && a.hash) {
			tmp = this.getHash(a.hash).replace(this.leadingStripper, '');
			a.setAttribute('href', this.data['root'] + tmp + a.search);
		}
		// TODO provide option to `go` from inital `start` state?
		return a;
	};

	it('begins in an unstarted state', function() {
		expect(nav.started).toBe(false);
	});

	it('is started, and normailzes the root for an erroneous hashchange url', function() {
		var a = nav.start(anchor);
		expect(nav.started).toBe(true);
		expect(a.pathname).toBe('/wtf');
	});

	it('is !monitoring hashchange', function() {
		expect(nav.isHashChange).toBe(false);
	});

	it('sets model entries for changes', function() {
		var a = nav.go('bar');
		expect(a.pathname).toBe('/bar');
		expect('bar' in model.data).toBe(true);
	});

	it('sets another with a query', function() {
		var a = nav.go('bar?baz=quux');
		expect(a.pathname).toBe('/bar');
		expect(model.get('bar')).toEqual({baz: 'quux'});
	});

	it('does not call setData on identical urls', function() {
		var spy = spyOn(nav, 'setData');
		nav.go('bar?baz=quux');
		expect(spy).not.toHaveBeenCalled();
	});
	
});

