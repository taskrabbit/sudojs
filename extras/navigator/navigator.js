// ##Navigator Class Object

// Abstracts location and history events, parsing their information into a 
// normalized object that is then set to an Observable class instance
//
// `constructor`
sudo.Navigator = function(data) {
  this.started = false;
  this.slashStripper = /^\/+|\/+$/g;
  this.leadingStripper = /^[#\/]|\s+$/g;
  this.trailingStripper = /\/$/;
  this.construct(data);
};
// Navigator inherits from `sudo.Model`
sudo.Navigator.prototype = Object.create(sudo.Model.prototype);
// ###getFragment
// 'Fragment' is defined as any URL information after the 'root' path
// including the `search` or `hash`
//
// `returns` {String} `fragment`
// `returns` {String} the normalized current fragment
sudo.Navigator.prototype.getFragment = function getFragment(fragment) {
  var root = this.data.root;
  if(!fragment) {
    // intentional use of coersion
    if (this.isPushState) {
      fragment = window.location.pathname;
      root = root.replace(this.trailingStripper, '');
      if(!fragment.indexOf(root)) fragment = fragment.substr(root.length);
    } else {
      fragment = this.getHash();
    }
  }
  return decodeURIComponent(fragment.replace(this.leadingStripper, ''));
};
// ###getHash
// Check either the passed in fragment, or the full location.href
// for a `hash` value
//
// `param` {string} `fragment` Optional fragment to check
// `returns` {String} the normalized current `hash`
sudo.Navigator.prototype.getHash = function getHash(fragment) {
  fragment || (fragment = window.location.href);
  var match = fragment.match(/#(.*)$/);
  return match ? match[1] : '';
};
// ###getSearch
// Check either the passed in fragment, or the full location.href
// for a `search` value
//
// `param` {string} `fragment` Optional fragment to check
// `returns` {String} the normalized current `search`
sudo.Navigator.prototype.getSearch = function getSearch(fragment) {
  fragment || (fragment = window.location.href);
  var match = fragment.match(/\?(.*)$/);
  return match ? match[1] : '';
};
// ###getUrl
// fetch the URL in the form <root + fragment>
//
// `returns` {String}
sudo.Navigator.prototype.getUrl = function getUrl() {
  // note that delegate(_role_) returns the deleagte
  return this.data.root + this.data.fragment;
};
// ###go
// If the passed in 'fragment' is different than the currently stored one,
// push a new state entry / hash event and set the data where specified
//
// `param` {string} `fragment`
// `returns` {*} call to `setData`
sudo.Navigator.prototype.go = function go(fragment) {
  if(!this.started) return false;
  if(!this.urlChanged(fragment)) return;
  // TODO ever use replaceState?
  if(this.isPushState) {
    window.history.pushState({}, document.title, this.getUrl());
  } else if(this.isHashChange) {
    window.location.hash = '#' + this.data.fragment;
  }
  return this.setData();
};
// ###handleChange
// Bound to either the `popstate` or `hashchange` events, if the
// URL has indeed changed then parse the relevant data and set it -
// triggering change observers
//
// `returns` {*} call to `setData` or undefined
sudo.Navigator.prototype.handleChange = function handleChange(e) {
  if(this.urlChanged()) {
    return this.setData();
  }
};
// ###parseQuery
// Parse and return a hash of the key value pairs contained in 
// the current `query`
//
// `returns` {object}
sudo.Navigator.prototype.parseQuery = function parseQuery() {
  var obj = {}, seg = this.data.query,
    i, s;
  if(seg) {
    seg = seg.split('&');
    for(i = 0; i < seg.length; i++) {
      if(!seg[i]) continue;
      s = seg[i].split('=');
      obj[s[0]] = s[1];
    }
    return obj;
  }
};
// ###setData
// Using the current `fragment` (minus any search or hash data) as a key,
// use `parseQuery` as the value for the key, setting it into the specified
// model (a stated `Observable` or `this.data`)
//
// `returns` {object} `this`
sudo.Navigator.prototype.setData = function setData() {
  var frag = this.data.fragment,
    // data is set in a specified model or in self
    observable = this.data.observable || this;
  if(this.data.query) {
    // we want to set the key minus any search/hash
    frag = frag.indexOf('?') !== -1 ? frag.split('?')[0] : frag.split('#')[0];
  }
  observable.set(frag, this.parseQuery());
  return this;
};
// ###start
// Gather the necessary information about the current environment and 
// bind to either (push|pop)state or hashchange.
// Also, if given an imcorrect URL for the current environment (hashchange 
// vs pushState) normalize it and set accordingly (or don't).
//
// `returns` {object} `this`
sudo.Navigator.prototype.start = function start() {
  var hasPushState, atRoot, loc, tmp;
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
  this.urlChanged();
  // monitor URL changes via popState or hashchange
  if (this.isPushState) {
    $(window).on('popstate', this.handleChange.bind(this));
  } else if (this.isHashChange) {
    $(window).on('hashchange', this.handleChange.bind(this));
  } else return;
  atRoot = window.location.pathname.replace(/[^\/]$/, '$&/') === this.data['root'];
  // somehow a URL got here not in my 'format', unless explicitly told not too, correct this
  if(!this.data.stay) {
   if(this.isHashChange && !atRoot) {
      window.location.replace(this.data['root'] + window.location.search + '#' + 
        this.data.fragment);
      // return early as browser will redirect
      return true;
      // the converse of the above
    } else if(this.isPushState && atRoot && window.location.hash) {
      tmp = this.getHash().replace(this.leadingStripper, '');
      window.history.replaceState({}, document.title, this.data['root'] + 
        tmp + window.location.search);
    } 
  }
  // TODO provide option to `go` from inital `start` state?
  return this;
};
// ###urlChanged
// Is a passed in fragment different from the one currently set at `this.get('fragment')`?
// If so set the fragment to the passed fragment passed in (as well as any 'query' data), else
// simply return false
//
// `param` {String} `fragment`
// `returns` {bool} 
sudo.Navigator.prototype.urlChanged = function urlChanged(fragment) {
  var current = this.getFragment(fragment);
  // nothing has changed
  if (current === this.data.fragment) return false;
  this.data.fragment = current;
  // the fragment and the href need to checked here, optimized for the 'go' scenario
  this.data.query = (this.getSearch(current) || this.getSearch()) || 
    (this.getHash(current) || this.getHash());
  return true;
};
