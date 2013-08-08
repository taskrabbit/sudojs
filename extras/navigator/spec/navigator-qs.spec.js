describe('Sudo Navigator Class -- PushState', function() {
  var model = $.extend(new _.Model(), _.extensions.observable),
    nav = new _.Navigator({
      root: '/',
      observable: model
    });

  var anchor = $('<a></a>').attr('href', 'http://www.foo.com?query=someQuery');

  // override the go function so as not to actually go anywhere
  nav.go = function(fragment) {
    // normally this would be present in a hashchange scenario
    if(!this.started) return false;
    if(!this.urlChanged(fragment)) return;
    if(this.isPushState) {
      this.$a.attr('href', this.getUrl());
    } else if(this.isHashChange) {
      this.$a[0].hash =  '#' + this.data.fragment;
    }
    this.setData();
    return this.$a;
  };

  // override start so that the nav class does not try
  // to redirect the window
  nav.start = function start(a) {
    // operate on this passed in anchor rather than window.*
    this.$a = a;
    var aPath = a[0].pathname + a[0].search + a[0].hash,
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
      a.on('popstate', this.handleChange.bind(this));
    } else if (this.isHashChange) {
      a.on('hashchange', this.handleChange.bind(this));
    } else return;
    // Does the current URL need to changed? (hashchange vs popstate)
    atRoot = aPath.replace(/[^\/]$/, '$&/') === this.data['root'];
    // somehow a pushstate URL got here (and here is hashchange)
    if(this.isHashChange && !atRoot) {
      a.attr('href', this.data['root'] + a[0].search + '#' +
        this.data.fragment);
      return a;
      // the converse of the above
    } else if(this.isPushState && atRoot && a[0].hash) {
      tmp = this.getHash(a[0].hash).replace(this.leadingStripper, '');
      a.attr('href', this.data['root'] +
        tmp + a[0].search);
    }
    // TODO provide option to `go` from inital `start` state?
    return a;
  };

  it('should parse query string', function() {
    var $a = nav.start(anchor);
    expect(nav.get('query')).toEqual('query=someQuery');
  });

});

